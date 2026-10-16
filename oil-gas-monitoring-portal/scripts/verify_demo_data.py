"""Verify local dataset integrity without loading models or notebooks."""
import json
from pathlib import Path
from scripts.download_demo_data import ROOT, sha256


def main():
    manifest = json.loads((ROOT / 'manifest.json').read_text())
    checked = 0
    for dataset in manifest['datasets']:
        if dataset['status'] != 'downloaded_and_hashed':
            raise RuntimeError('Collection has incomplete downloads')
        for item in dataset['archives'] + dataset['files']:
            relative = Path(item['path'])
            path = (ROOT / relative).resolve()
            if relative.is_absolute() or not path.is_relative_to(ROOT.resolve()):
                raise RuntimeError('Manifest path escapes dataset root')
            if path.stat().st_size != item['bytes'] or sha256(path) != item['sha256']:
                raise RuntimeError(f'Integrity mismatch: {relative}')
            checked += 1
    report = {'verified_files_and_archives': checked, 'datasets': len(manifest['datasets'])}
    (ROOT / 'verification.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report))


if __name__ == '__main__':
    main()
