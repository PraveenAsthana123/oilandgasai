import json
import pandas as pd
from app.analytics import catalog as registry
from app.analytics.data import numeric_features
from app.analytics.retrieval import search
from tests.test_api import REVIEW, client  # noqa: F401


def test_features_exclude_targets_and_identifiers():
    frame = pd.DataFrame({'UDI': [1, 2], 'Target': [0, 1], 'Failure Type': ['none', 'heat'],
                          'temperature': [10, 12], 'constant': [1, 1]})
    assert list(numeric_features(frame, 'Failure Type').columns) == ['temperature']


def test_module_auth_and_report_path(client, tmp_path, monkeypatch):  # noqa: F811
    monkeypatch.setattr(registry, 'ARTIFACTS', tmp_path)
    auth = {'Authorization': f'Bearer {REVIEW}'}
    assert client.get('/v1/modules').status_code == 401
    result = client.get('/v1/modules', headers=auth).json()['items']
    assert len(result) == 18
    assert all(x['run_status'] == 'not_run' for x in result)
    assert client.get('/v1/modules/unknown/report', headers=auth).status_code == 404
    assert client.get('/v1/modules/well-facies/report', headers=auth).status_code == 404
    (tmp_path / 'well-facies').mkdir()
    report = {'id': 'well-facies', 'status': 'completed_experimental'}
    (tmp_path / 'well-facies' / 'report.json').write_text(json.dumps(report))
    assert client.get('/v1/modules/well-facies/report', headers=auth).json() == report


def test_knowledge_retrieves_sources_and_abstains():
    result = search('Volve water cut')
    assert result['items']
    assert all(x['source'] and x['score'] > 0 for x in result['items'])
    assert search('zzzznonexistenttokenzzzz')['items'] == []


def test_knowledge_endpoint_validation(client):  # noqa: F811
    auth = {'Authorization': f'Bearer {REVIEW}'}
    assert client.get('/v1/knowledge/search?q=water').status_code == 401
    assert client.get('/v1/knowledge/search?q=x', headers=auth).status_code == 422
    response = client.get('/v1/knowledge/search?q=methane', headers=auth)
    assert response.status_code == 200
    assert response.json()['items']


def test_spill_tonnage_cleaning_preserves_missing(tmp_path, monkeypatch):
    from app.analytics import data
    folder = tmp_path / 'oil-spill-incidents' / 'content'
    folder.mkdir(parents=True)
    (folder / 'spills.csv').write_text('Min Tonnes,Max Tonnes\n"1,200.5","2,000"\nunknown,\n')
    monkeypatch.setattr(data, 'DATA', tmp_path)
    frame, notes = data.load_dataset('oil-spill-incidents')
    assert frame.iloc[0]['Min Tonnes'] == 1200.5
    assert frame.iloc[0]['Max Tonnes'] == 2000
    assert pd.isna(frame.iloc[1]['Min Tonnes'])
    assert notes
