"""Dataset-specific cleaning; no executable upstream artifacts loaded."""
import io
import numpy as np
import pandas as pd
from sklearn.datasets import load_svmlight_file
from app.analytics.catalog import DATA


def load_dataset(key):
    base = DATA / key / 'content'
    notes = []
    if key == 'well-logs':
        frames = []
        for path in sorted(base.iterdir()):
            if path.suffix or path.name == 'Wellheader':
                continue
            curves, section, lines = [], '', []
            for line in path.read_text().splitlines():
                if line.startswith('~'):
                    section = line[1:].split()[0].lower()
                    continue
                if line.startswith('#') or not line.strip():
                    continue
                if section == 'curve':
                    curves.append(line.split('.')[0].strip())
                if section in ('ascii', 'a'):
                    lines.append(line)
            if lines:
                df = pd.read_csv(io.StringIO('\n'.join(lines)), sep=r'\s+', header=None)
                df.columns = curves if len(curves) == len(df.columns) else [f'curve_{i}' for i in df.columns]
                df['well'] = path.name
                frames.append(df)
        if not frames:
            raise ValueError('No readable LAS measurement sections')
        frame = pd.concat(frames, ignore_index=True).replace(-999.25, np.nan)
        notes.append('LAS NULL -999.25 replaced with missing; deviation files excluded.')
    elif key == 'gas-sensor-drift':
        frames = []
        for path in sorted(base.rglob('*.dat')):
            x, y = load_svmlight_file(str(path), n_features=128)
            df = pd.DataFrame(x.toarray(), columns=[f'sensor_{i}' for i in range(128)])
            df['gas_class'], df['batch'] = y, path.stem
            frames.append(df)
        frame = pd.concat(frames, ignore_index=True)
        notes.append('Sparse batch features expanded; gas-class IDs retain publisher semantics.')
    elif key == 'volve-production':
        frame = pd.read_excel(next(base.glob('*.xlsx')), sheet_name='Daily Production Data')
        frame = frame.sort_values('DATEPRD')
        notes.append('Daily production sheet only; monthly rows are not double-counted.')
    elif key == 'drilling-gas-peaks':
        frame = pd.read_csv(next(base.glob('*.csv')), header=1)
        frame = frame.loc[:, ~frame.columns.str.startswith('Unnamed')]
        frame['Depth'] = pd.to_numeric(frame['Depth'], errors='coerce')
        frame = frame[frame['Depth'].notna()].copy()
        for col in frame.columns:
            if col != 'Gas':
                frame[col] = pd.to_numeric(frame[col], errors='coerce')
        notes.append('Title/units/section rows removed using numeric depth; retain original raw file for row traceability.')
    else:
        paths = sorted(base.glob('*.csv'))
        if key == 'production-trends':
            paths = [base / 'OGORBcsv_cleaned.csv']
        frame = pd.read_csv(paths[0], low_memory=False)
        if key == 'environmental-telemetry':
            frame = frame.sort_values('ts')
        elif key == 'energy-market-prices':
            frame = frame.sort_values('Date')
        elif key == 'natural-gas-demand':
            frame = frame.sort_values(['year', 'month'])
        elif key == 'oil-spill-incidents':
            for col in ['Min Tonnes', 'Max Tonnes']:
                frame[col] = pd.to_numeric(frame[col].astype(str).str.replace(',', '', regex=False), errors='coerce')
            notes.append('Thousands separators removed from min/max tonnes; malformed/missing values remain missing.')
        notes.append('Original CSV field names retained.')
    return frame, notes


def numeric_features(frame, target=None):
    excluded = {target, 'Target', 'Failure Type', 'UDI', 'Product ID', 'Pipe_ID',
                'Report Number', 'Supplemental Number', 'Operator ID', 'NPD_WELL_BORE_CODE',
                'NPD_FIELD_CODE', 'NPD_FACILITY_CODE', 'ts', 'gas_class'}
    numeric = frame.select_dtypes(include=[np.number, 'bool']).drop(columns=list(excluded), errors='ignore')
    numeric = numeric.replace([np.inf, -np.inf], np.nan).astype(float)
    return numeric.loc[:, numeric.notna().any() & (numeric.nunique() > 1)]
