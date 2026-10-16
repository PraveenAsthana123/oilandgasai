"""Run bounded offline baselines; each module persists its own report."""
import argparse
import json
from datetime import datetime, timezone
from app.analytics.catalog import ARTIFACTS, TITLES
from app.analytics.runner import run_module


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--module', choices=list(TITLES), action='append')
    args = parser.parse_args()
    previous_path = ARTIFACTS / 'run-summary.json'
    previous = json.loads(previous_path.read_text())['modules'] if previous_path.exists() else []
    selected = args.module or list(TITLES)
    summary = [item for item in previous if item['id'] not in selected]
    for key in selected:
        print(f'Running {key}', flush=True)
        try:
            report = run_module(key)
            summary.append({'id': key, 'status': report['status']})
            print(f'Completed {key}', flush=True)
        except Exception as exc:
            summary.append({'id': key, 'status': 'failed', 'error_type': type(exc).__name__, 'error': str(exc)[:400]})
            print(f'Failed {key}: {type(exc).__name__}: {str(exc)[:200]}', flush=True)
    ARTIFACTS.mkdir(exist_ok=True)
    (ARTIFACTS / 'run-summary.json').write_text(json.dumps({'created_at': datetime.now(timezone.utc).isoformat(), 'modules': summary}, indent=2))
    if any(item['status'] == 'failed' for item in summary):
        raise SystemExit(1)


if __name__ == '__main__':
    main()
