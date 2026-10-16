from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from app.main import create_app

INGEST = 'i' * 40
REVIEW = 'r' * 40

@pytest.fixture
def client(tmp_path):
    app = create_app(f'sqlite:///{tmp_path}/test.db', INGEST, REVIEW, initialize=True)
    with TestClient(app) as client:
        yield client

def observation():
    return dict(source_id='edge-1', source_event_id=str(uuid4()),
                observed_at=datetime.now(timezone.utc).isoformat(), model_version='ppe-v1',
                camera_id='cam-1', missing_items=['helmet'], confidence=0.92)

def send(client, payload):
    return client.post('/v1/ppe/events', json=payload, headers={'Authorization': f'Bearer {INGEST}'})

def test_fail_closed():
    with pytest.raises(RuntimeError):
        create_app('sqlite://', 'short', REVIEW)
    with pytest.raises(RuntimeError):
        create_app('sqlite://', INGEST, INGEST)

def test_roles(client):
    assert client.post('/v1/ppe/events', json=observation()).status_code == 401
    assert client.get('/v1/ppe/events', headers={'Authorization': f'Bearer {INGEST}'}).status_code == 401
    assert client.post('/v1/ppe/events', json=observation(), headers={'Authorization': f'Bearer {REVIEW}'}).status_code == 401

def test_idempotency_and_conflict(client):
    payload = observation()
    first = send(client, payload)
    assert first.status_code == 201
    retry = send(client, payload)
    assert retry.status_code == 200
    assert retry.json()['id'] == first.json()['id']
    payload['confidence'] = .5
    assert send(client, payload).status_code == 409

def test_parallel_retry(client):
    payload = observation()
    with ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(lambda _: send(client, payload), range(8)))
    assert sum(r.status_code == 201 for r in results) == 1
    assert all(r.status_code in (200, 201) for r in results)
    assert len({r.json()['id'] for r in results}) == 1

def test_review_is_final(client):
    event = send(client, observation()).json()['id']
    auth = {'Authorization': f'Bearer {REVIEW}'}
    body = {'decision': 'confirmed', 'reason': 'Verified by operator'}
    assert client.post(f'/v1/ppe/events/{event}/review', json=body, headers=auth).status_code == 200
    assert client.post(f'/v1/ppe/events/{event}/review', json=body, headers=auth).status_code == 409
    rows = client.get('/v1/ppe/events?state=confirmed', headers=auth).json()['items']
    assert rows[0]['review']['reason'] == body['reason']
    assert client.get('/v1/ppe/events?limit=999', headers=auth).status_code == 422

@pytest.mark.parametrize('field,value', [('confidence', 2), ('observed_at', '2026-01-01T00:00:00'),
    ('missing_items', ['helmet', 'helmet']), ('missing_items', ['unknown']), ('source_id', '../bad')])
def test_validation(client, field, value):
    body = observation()
    body[field] = value
    assert send(client, body).status_code == 422

def test_health_and_security_headers(client):
    response = client.get('/health/ready')
    assert response.status_code == 200
    assert response.headers['Cache-Control'] == 'no-store'
    assert response.headers['X-Request-ID']
    assert client.get('/health/live').status_code == 200

def test_uninitialized_storage(tmp_path):
    with TestClient(create_app(f'sqlite:///{tmp_path}/empty.db', INGEST, REVIEW)) as client:
        assert client.get('/health/ready').status_code == 503

def test_ui_and_catalog(client):
    response = client.get('/')
    assert response.status_code == 200
    assert 'Live operations' in response.text
    assert "script-src 'self'" in response.headers['Content-Security-Policy']
    assert client.get('/static/app.js').status_code == 200
    assert client.get('/v1/scenarios').status_code == 401
    catalog = client.get('/v1/scenarios', headers={'Authorization': f'Bearer {REVIEW}'}).json()['items']
    assert len(catalog) == 26
    assert all(x['acceptance'] and x['exceptions'] for x in catalog)

def test_overview_filter_and_pagination(client):
    auth = {'Authorization': f'Bearer {REVIEW}'}
    body = observation()
    send(client, body)
    body = observation()
    body['camera_id'] = 'cam-2'
    send(client, body)
    summary = client.get('/v1/overview', headers=auth).json()
    assert summary['counts'] == {'pending': 2, 'confirmed': 0, 'dismissed': 0}
    assert summary['inference'] == 'not_integrated'
    page = client.get('/v1/ppe/events?camera_id=cam-2&limit=1', headers=auth).json()
    assert page['total'] == 1
    assert page['items'][0]['observation']['camera_id'] == 'cam-2'
    assert client.get('/v1/ppe/events?offset=2', headers=auth).json()['items'] == []
    assert client.get('/v1/overview').status_code == 401

def test_persistence_across_restart(tmp_path):
    url = f'sqlite:///{tmp_path}/restart.db'
    with TestClient(create_app(url, INGEST, REVIEW, initialize=True)) as first:
        event_id = send(first, observation()).json()['id']
    with TestClient(create_app(url, INGEST, REVIEW)) as restarted:
        page = restarted.get('/v1/ppe/events', headers={'Authorization': f'Bearer {REVIEW}'}).json()
        assert page['items'][0]['id'] == event_id
