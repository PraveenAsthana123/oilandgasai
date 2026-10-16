"""Download a bounded Kaggle demo collection; preserve provenance and hashes.

Uses the existing Kaggle configuration. Never prints or writes credentials.
Archives are checked before extraction; remote content is treated as data.
"""
import csv
import hashlib
import json
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path, PurePosixPath
import zipfile

from kaggle.api.kaggle_api_extended import KaggleApi

ROOT = Path(__file__).resolve().parents[1] / 'data' / 'kaggle'
SOURCES = [
    ('pipeline-maintenance', 'muhammadwaqas023/predictive-maintenance-oil-and-gas-pipeline-data', 'oil gas pipeline', 'Pipeline maintenance risk classification and sensor exploration', 'Oil/gas labeled tabular data; provenance and field validity require independent review.'),
    ('pipeline-operations', 'muhammadwaqas023/pipeline-dataset-in-oil-and-gas-sector', 'oil gas pipeline', 'Pipeline operating-condition exploration and advisory rules', 'Publisher-labeled oil/gas/fertilizer data; do not assume temporal ordering or real operational provenance.'),
    ('pipeline-accidents', 'usdot/pipeline-accidents', 'pipeline accidents', 'Incident severity, spill volume, cause and historical geographic analysis', 'Historical incidents support retrospective analysis, not live leak detection.'),
    ('production-trends', 'pinuto/us-oil-and-gas-production-and-disposition-20152025', 'oil gas production', 'Production trends, regional comparisons and historical replay', 'Historical aggregate production is not live well telemetry.'),
    ('ppe-images', 'snehilsanyal/construction-site-safety-image-dataset-roboflow', 'construction site safety', 'Helmet/vest presence and absence, people and machinery image demos', 'Construction imagery is a proxy for oil/gas PPE; masks are not certified respirators. Site-domain validation required.'),
    ('environmental-telemetry', 'garystafford/environmental-sensor-data-132k', 'environmental sensor', 'Timestamped telemetry replay, missing values and sensor trend demos', 'Environmental measurements are not certified combustible-gas alarms.'),
    ('machine-maintenance', 'shivamb/machine-predictive-maintenance-classification', 'machine predictive maintenance', 'Equipment failure classification, feature exploration and class imbalance', 'Generic synthetic manufacturing data is a proxy, not measured oil/gas equipment failures.'),
    ('gas-sensor-drift', 'orvile/gas-sensor-array-drift-dataset', 'gas sensor array drift', 'Gas-class separation and sensor drift across batches', 'Laboratory gas-sensor data; not an oil/gas field leak benchmark.'),
]


def sha256(path):
    digest = hashlib.sha256()
    with path.open('rb') as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def profile(path):
    result = {}
    if path.suffix.lower() == '.csv':
        try:
            with path.open(encoding='utf-8-sig', errors='strict', newline='') as handle:
                reader = csv.reader(handle)
                header = next(reader, [])
                count = sum(1 for _ in reader)
            result = {'csv_columns': header, 'csv_data_rows': count}
        except (UnicodeError, csv.Error) as exc:
            result = {'profile_error': type(exc).__name__}
    return result


def download(source):
    name, ref, search, scenario, limitation = source
    target = ROOT / name
    target.mkdir(parents=True, exist_ok=True)
    api = KaggleApi()
    api.authenticate()
    matches = [x for x in api.dataset_list(search=search) if x.ref == ref]
    if not matches:
        raise RuntimeError(f'Dataset no longer found in search: {ref}')
    dataset = matches[0]
    if dataset.total_bytes > 350 * 1024 * 1024:
        raise RuntimeError(f'Dataset exceeds download budget: {ref}')
    record = {'id': name, 'ref': ref, 'url': f'https://www.kaggle.com/datasets/{ref}',
              'title': dataset.title, 'license_reported_by_kaggle': dataset.license_name,
              'version_reported_at_search': dataset.current_version_number,
              'last_updated': str(dataset.last_updated), 'listed_bytes': dataset.total_bytes,
              'demo_scenario': scenario, 'limitations': limitation,
              'retrieved_at': datetime.now(timezone.utc).isoformat()}
    (target / 'source-metadata.json').write_text(json.dumps(record | {'description': dataset.description}, indent=2, default=str))
    api.dataset_metadata(ref, str(target))
    api.dataset_download_files(ref, path=str(target), quiet=True, unzip=False)
    archives = list(target.glob('*.zip'))
    if not archives:
        raise RuntimeError(f'No ZIP downloaded for {ref}')
    content = target / 'content'
    content.mkdir(exist_ok=True)
    for archive in archives:
        with zipfile.ZipFile(archive) as zipped:
            infos = zipped.infolist()
            if sum(info.file_size for info in infos) > 1024 * 1024 * 1024:
                raise RuntimeError('Expanded archive exceeds 1 GiB budget')
            for info in infos:
                relative = PurePosixPath(info.filename)
                if (relative.is_absolute() or '..' in relative.parts or '\\' in info.filename
                        or (info.external_attr >> 16) & 0o170000 == 0o120000):
                    raise RuntimeError('Unsafe archive entry')
            zipped.extractall(content)
    record['archives'] = [{'path': str(a.relative_to(ROOT)), 'bytes': a.stat().st_size,
                           'sha256': sha256(a)} for a in archives]
    record['files'] = [{'path': str(p.relative_to(ROOT)), 'bytes': p.stat().st_size,
                        'sha256': sha256(p), **profile(p)} for p in sorted(content.rglob('*')) if p.is_file()]
    record['file_count'] = len(record['files'])
    record['expanded_bytes'] = sum(p['bytes'] for p in record['files'])
    record['status'] = 'downloaded_and_hashed'
    (target / 'manifest.json').write_text(json.dumps(record, indent=2) + '\n')
    print(f"Downloaded {name}: {record['file_count']} files; {record['expanded_bytes']} expanded bytes", flush=True)
    return record


def main():
    ROOT.mkdir(parents=True, exist_ok=True)
    manifest_path = ROOT / 'manifest.json'
    previous = json.loads(manifest_path.read_text()) if manifest_path.exists() else {'datasets': []}
    updated_ids = {source[0] for source in SOURCES}
    records = [row for row in previous['datasets'] if row['id'] not in updated_ids]
    with ThreadPoolExecutor(max_workers=3) as pool:
        futures = [(source, pool.submit(download, source)) for source in SOURCES]
        for source, future in futures:
            try:
                records.append(future.result())
            except Exception as exc:
                # Do not serialize arbitrary exception messages which could contain credentials.
                records.append({'id': source[0], 'ref': source[1], 'status': 'failed',
                                'error_type': type(exc).__name__})
                print(f'Download failed: {source[0]} ({type(exc).__name__})', flush=True)
    (ROOT / 'manifest.json').write_text(json.dumps({'retrieved_at': datetime.now(timezone.utc).isoformat(),
                                                  'datasets': records}, indent=2) + '\n')
    if any(x['status'] == 'failed' for x in records):
        raise SystemExit(1)


if __name__ == '__main__':
    main()
