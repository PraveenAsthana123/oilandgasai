"""Train offline bounded experiments and save provenance/metrics per module."""
import hashlib
import json
from datetime import datetime, timezone
import joblib
import numpy as np
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.dummy import DummyClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import balanced_accuracy_score, f1_score, confusion_matrix
from sklearn.model_selection import GroupShuffleSplit, train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from app.analytics.catalog import ARTIFACTS, DATA, TARGETS, TITLES
from app.analytics.data import load_dataset, numeric_features
from app.analytics.transformer import train_reconstruction
from app.analytics.vision import run_vision


def split_rows(frame, target):
    indexes = np.arange(len(frame))
    group_column = next((c for c in ['Well Name', 'well', 'batch'] if c in frame), None)
    if group_column and frame[group_column].nunique() > 1:
        train, test = next(GroupShuffleSplit(n_splits=1, test_size=.25, random_state=42)
                           .split(frame, groups=frame[group_column].fillna('unknown')))
        return train, test, f'Held-out groups: {group_column}'
    if target:
        y = frame[target].astype(str)
        if y.value_counts().min() >= 2:
            train, test = train_test_split(indexes, test_size=.25, stratify=y, random_state=42)
            return train, test, 'Stratified random holdout; not a temporal failure prediction evaluation'
    cut = max(1, int(len(frame) * .75))
    return indexes[:cut], indexes[cut:], 'Ordered 75/25 holdout; multiseries pooling is exploratory'


def run_module(key):
    if key not in TITLES:
        raise ValueError('Unknown module')
    output = ARTIFACTS / key
    output.mkdir(parents=True, exist_ok=True)
    manifest = DATA / key / 'manifest.json'
    report = {'id': key, 'title': TITLES[key], 'created_at': datetime.now(timezone.utc).isoformat(),
              'source_manifest_sha256': hashlib.sha256(manifest.read_bytes()).hexdigest(),
              'release_status': 'Experimental; human review and site validation required',
              'nlp': {'status': 'available', 'method': 'Local documentation TF-IDF retrieval'}}
    if key == 'ppe-images':
        report.update(run_vision(output))
    else:
        frame, notes = load_dataset(key)
        full_rows = len(frame)
        if len(frame) > 5000:
            frame = frame.iloc[np.linspace(0, len(frame)-1, 5000, dtype=int)].copy()
            notes.append('Evenly spaced bounded subset of at most 5,000 rows; original order preserved.')
        frame = frame.reset_index(drop=True)
        target = TARGETS.get(key)
        if target:
            frame = frame[frame[target].notna()].reset_index(drop=True)
        numeric = numeric_features(frame, target)
        if numeric.empty or len(frame) < 8:
            raise ValueError('Insufficient numeric features/rows')
        train, test, split = split_rows(frame, target)
        xtrain, xtest = numeric.iloc[train], numeric.iloc[test]
        preprocessing = make_pipeline(SimpleImputer(strategy='median', keep_empty_features=True), StandardScaler())
        a = np.clip(preprocessing.fit_transform(xtrain), -20, 20)
        b = np.clip(preprocessing.transform(xtest), -20, 20)
        medians = xtrain.median()
        mad = (xtrain-medians).abs().median().replace(0, np.nan)
        deviation = ((xtest-medians).abs() / (1.4826 * mad)).replace([np.inf, -np.inf], np.nan)
        profile = numeric.describe().replace([np.inf, -np.inf], np.nan).astype(object)
        profile = profile.where(profile.notna(), None).to_dict()
        report.update(status='completed_experimental', total_source_rows=full_rows, sampled_rows=len(frame),
            features=list(numeric.columns), split=split, train_rows=len(train), test_rows=len(test),
            statistical={'method': 'Training-median/MAD robust deviation',
                         'held_out_rows_over_3_robust_sigma': int((deviation > 3).any(axis=1).sum()),
                         'missing_cells': int(numeric.isna().sum().sum()), 'profile': profile},
            cv={'status': 'not_applicable', 'reason': 'This module has no raw image inputs.'},
            limitations=notes + ['Offline historical/proxy exploration, not streaming plant inference.',
                                 'Numeric inputs only; identifiers/targets excluded; categorical encodings are future work.',
                                 'Full-data descriptive statistics are not model evaluation statistics.',
                                 'Anomaly flags are not verified failures; no operational threshold is approved.'])
        if target:
            y = frame[target].astype(str)
            model = RandomForestClassifier(n_estimators=60, max_depth=8, class_weight='balanced', random_state=42, n_jobs=2)
            model.fit(a, y.iloc[train])
            prediction = model.predict(b)
            baseline = DummyClassifier(strategy='most_frequent').fit(a, y.iloc[train]).predict(b)
            labels = sorted(set(y))
            report['ml'] = {'method': 'RandomForestClassifier', 'target': target,
                'balanced_accuracy': float(balanced_accuracy_score(y.iloc[test], prediction)),
                'macro_f1': float(f1_score(y.iloc[test], prediction, average='macro', zero_division=0)),
                'majority_baseline_balanced_accuracy': float(balanced_accuracy_score(y.iloc[test], baseline)),
                'labels': labels, 'confusion_matrix': confusion_matrix(y.iloc[test], prediction, labels=labels).tolist()}
            report['limitations'].append('Condition classification may reflect contemporaneous derived features; not early failure prediction.')
        else:
            model = IsolationForest(n_estimators=60, contamination='auto', random_state=42, n_jobs=2)
            model.fit(a)
            prediction = model.predict(b)
            report['ml'] = {'method': 'IsolationForest', 'held_out_anomaly_count': int((prediction == -1).sum()),
                            'evaluation': 'Unsupervised anomaly exploration; no ground-truth accuracy available'}
        joblib.dump({'preprocessor': preprocessing, 'model': model, 'features': list(numeric.columns)}, output / 'baseline.joblib')
        report['transformer'] = train_reconstruction(a, b, output / 'transformer.weights.pt')
    tmp = output / 'report.tmp'
    tmp.write_text(json.dumps(report, indent=2, allow_nan=False) + '\n')
    tmp.replace(output / 'report.json')
    return report
