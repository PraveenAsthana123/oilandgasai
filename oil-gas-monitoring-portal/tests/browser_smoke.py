"""Run manually against a disposable isolated service; no sample data enters local runtime."""
import os
import secrets
import subprocess
import sys
import tempfile
import time
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

import httpx
from playwright.sync_api import expect, sync_playwright
from app.main import metadata
from sqlalchemy import create_engine


def main():
    with tempfile.TemporaryDirectory() as directory:
        url = f'sqlite:///{directory}/browser.db'
        engine = create_engine(url)
        metadata.create_all(engine)
        engine.dispose()
        ingest, reviewer = secrets.token_urlsafe(40), secrets.token_urlsafe(40)
        env = dict(os.environ, DATABASE_URL=url, INGEST_TOKEN=ingest, REVIEWER_TOKEN=reviewer)
        server = subprocess.Popen([sys.executable, '-m', 'uvicorn', 'app.main:create_app', '--factory',
                                   '--host', '127.0.0.1', '--port', '8806', '--no-access-log'], env=env,
                                  stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        try:
            base = 'http://127.0.0.1:8806'
            for _ in range(60):
                try:
                    if httpx.get(base + '/health/ready').status_code == 200:
                        break
                except httpx.TransportError:
                    pass
                time.sleep(.2)
            else:
                raise RuntimeError('Isolated server did not start')
            with sync_playwright() as pw:
                browser = pw.chromium.launch(headless=True)
                page = browser.new_page(viewport={'width': 1440, 'height': 1000})
                errors = []
                page.on('pageerror', lambda err: errors.append(str(err)))
                page.goto(base)
                page.locator('#token').fill(reviewer)
                page.locator('#connect button').first.click()
                page.locator('#connection').filter(has_text='Connected').wait_for()
                body = dict(source_id='browser-test', source_event_id=str(uuid4()),
                            observed_at=datetime.now(timezone.utc).isoformat(), model_version='test-only',
                            camera_id='test-camera', missing_items=['helmet'], confidence=.9)
                response = httpx.post(base + '/v1/ppe/events', json=body,
                                      headers={'Authorization': f'Bearer {ingest}'})
                assert response.status_code == 201
                page.get_by_role('button', name='Review', exact=True).wait_for(timeout=10000)
                assert page.locator('#pending').inner_text() == '1'
                page.get_by_role('button', name='Review', exact=True).click()
                page.locator('#reason').fill('Synthetic browser verification')
                page.locator('#submit-review').click()
                page.locator('#review-dialog').wait_for(state='hidden')
                expect(page.locator('#confirmed')).to_have_text('1')
                page.locator('[data-view="scenarios"]').click()
                expect(page.locator('#scenario-list article')).to_have_count(26)
                page.locator('#scenario-search').fill('corrosion')
                assert page.locator('#scenario-list article').count() == 1
                page.locator('[data-view="operations"]').click()
                page.locator('#state').select_option('confirmed')
                page.get_by_text('Synthetic browser verification', exact=True).wait_for()
                page.locator('[data-view="modules"]').click()
                page.locator('#load-modules').click()
                expect(page.locator('#module-list article')).to_have_count(18, timeout=15000)
                page.locator('#module-list button').first.click()
                expect(page.locator('#model-report')).to_contain_text('source_manifest_sha256')
                page.locator('#knowledge-query').fill('methane emissions')
                page.locator('#knowledge-form button').click()
                page.locator('#knowledge-results article').first.wait_for()
                screenshot = Path('/mnt/deepa/IoT/code/oil-gas-monitoring/docs/model-workbench.png')
                page.screenshot(path=str(screenshot), full_page=True)
                page.set_viewport_size({'width': 390, 'height': 844})
                assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
                page.locator('#disconnect').click()
                assert page.locator('#confirmed').inner_text() == '—'
                assert not errors, errors
                browser.close()
            print('Browser smoke passed: live arrival, review, scenarios, responsive layout, disconnect; no page errors.')
        finally:
            server.terminate()
            server.wait(timeout=10)


if __name__ == '__main__':
    main()
