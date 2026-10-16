"""Bounded recorded-data demos; models are local, reports are explicit."""

import json
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import balanced_accuracy_score, confusion_matrix, silhouette_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from app.analytics.catalog import ROOT, DATA, ARTIFACTS
from app.analytics.data import load_dataset, numeric_features

PUBLIC = ROOT / "data" / "public"
CLIENT = ARTIFACTS / "client"


def classification(frame, target, title, ordered=False):
    frame = frame[frame[target].notna()].copy()
    if len(frame) > 6000:
        frame = frame.sample(6000, random_state=42).sort_index()
    x = frame.select_dtypes(include="number").drop(
        columns=[target, "Unnamed: 0"], errors="ignore"
    )
    x = x.replace([np.inf, -np.inf], np.nan)
    x = x.loc[:, x.notna().any() & (x.nunique() > 1)]
    y = frame[target].astype(str)
    ids = np.arange(len(frame))
    if ordered:
        cut = int(len(frame) * 0.75)
        train, test = ids[:cut], ids[cut:]
    else:
        counts = y.value_counts()
        eligible = y.isin(counts[counts >= 2].index)
        x, y = x[eligible], y[eligible]
        ids = np.arange(len(y))
        train, test = train_test_split(ids, test_size=0.25, stratify=y, random_state=42)
    model = make_pipeline(
        SimpleImputer(strategy="median", keep_empty_features=True),
        RandomForestClassifier(
            n_estimators=50,
            max_depth=10,
            class_weight="balanced",
            random_state=42,
            n_jobs=2,
        ),
    )
    model.fit(x.iloc[train], y.iloc[train])
    prediction = model.predict(x.iloc[test])
    majority = y.iloc[train].value_counts().idxmax()
    labels = sorted(set(y))
    return {
        "mode": "recorded-data experiment",
        "title": title,
        "metrics": {
            "train_rows": len(train),
            "test_rows": len(test),
            "balanced_accuracy": float(
                balanced_accuracy_score(y.iloc[test], prediction)
            ),
            "majority_balanced_accuracy": float(
                balanced_accuracy_score(y.iloc[test], [majority] * len(test))
            ),
        },
        "chart": {
            "kind": "bars",
            "points": [
                {"label": str(k), "y": int(v)} for k, v in y.value_counts().items()
            ],
            "y_label": "Sampled records",
            "x_label": "Source class",
        },
        "labels": labels,
        "confusion_matrix": confusion_matrix(
            y.iloc[test], prediction, labels=labels
        ).tolist(),
        "examples": [
            {"actual": str(y.iloc[i]), "predicted": str(p)}
            for i, p in zip(test[:20], prediction[:20])
        ],
        "features": list(x.columns),
        "split": "ordered holdout" if ordered else "stratified random holdout",
        "limitations": [
            "Recorded proxy only; no live device/traffic control.",
            "Random/ordered holdout alone does not establish cross-site generalization.",
            "Numeric features only; class imbalance and capture/sequence leakage require further review.",
        ],
    }


def security():
    files = list((PUBLIC / "iot-security" / "content").rglob("*"))
    path = next(
        p
        for p in files
        if p.is_file() and (p.suffix.lower() == ".csv" or p.name == "RT_IOT2022")
    )
    frame = pd.read_csv(path)
    target = next(
        c for c in frame if c.lower() in ["attack_type", "label", "class", "attack"]
    )
    return classification(
        frame, target, "Defensive recorded IoT network classification"
    )


def robot():
    path = next(
        (PUBLIC / "robot-navigation" / "content").rglob("sensor_readings_24.data")
    )
    frame = pd.read_csv(path, header=None)
    frame.columns = [f"ultrasound_{i}" for i in range(24)] + ["action"]
    return classification(
        frame, "action", "Recorded robot navigation-action classification", ordered=True
    )


def clusters():
    frame, _ = load_dataset("pipeline-operations")
    numeric = numeric_features(frame)
    x = make_pipeline(SimpleImputer(), StandardScaler()).fit_transform(numeric)
    model = KMeans(n_clusters=4, n_init=10, random_state=42).fit(x)
    labels = model.labels_
    return {
        "mode": "recorded-data experiment",
        "title": "Pipeline operating-condition clusters",
        "metrics": {
            "records": len(frame),
            "clusters": 4,
            "silhouette": float(
                silhouette_score(x, labels, sample_size=300, random_state=42)
            ),
        },
        "chart": {
            "kind": "scatter",
            "x_label": numeric.columns[0],
            "y_label": numeric.columns[1],
            "points": [
                {"x": float(a), "y": float(b), "label": f"cluster {c}", "group": int(c)}
                for a, b, c in zip(
                    numeric.iloc[:300, 0], numeric.iloc[:300, 1], labels[:300]
                )
            ],
        },
        "cluster_profiles": [
            {
                "cluster": int(k),
                "records": int((labels == k).sum()),
                "means": numeric[labels == k].mean().round(3).to_dict(),
            }
            for k in range(4)
        ],
        "limitations": [
            "Clusters are mathematical groups, not verified asset-risk categories.",
            "No client criticality, maintenance cost or consequence model is supplied.",
        ],
    }


def gis():
    frame, _ = load_dataset("pipeline-accidents")
    lat = pd.to_numeric(frame["Accident Latitude"], errors="coerce")
    lon = pd.to_numeric(frame["Accident Longitude"], errors="coerce")
    valid = lat.between(-90, 90) & lon.between(-180, 180)
    rows = frame[valid].copy()
    points = [
        {
            "x": float(r["Accident Longitude"]),
            "y": float(r["Accident Latitude"]),
            "label": str(r["Cause Category"]),
        }
        for _, r in rows.head(800).iterrows()
    ]
    return {
        "mode": "historical GIS",
        "title": "Historical pipeline incident coordinates",
        "metrics": {
            "source_records": len(frame),
            "valid_coordinates": int(valid.sum()),
            "excluded_coordinates": int((~valid).sum()),
            "displayed_points": len(points),
        },
        "chart": {
            "kind": "map",
            "x_label": "Longitude (WGS84 assumed; verify source)",
            "y_label": "Latitude",
            "points": points,
        },
        "geojson": {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": {"type": "Point", "coordinates": [p["x"], p["y"]]},
                    "properties": {"cause": p["label"]},
                }
                for p in points
            ],
        },
        "limitations": [
            "Point plot without basemap; no current pipeline geometry or population exposure model.",
            "Valid numeric bounds alone do not prove coordinate or datum accuracy.",
        ],
    }


def iot():
    frame, _ = load_dataset("environmental-telemetry")
    device = str(frame["device"].iloc[0])
    sample = frame[frame["device"].astype(str) == device].head(160)
    values = pd.to_numeric(sample["temp"], errors="coerce")
    median = float(values.median())
    mad = float((values - median).abs().median())
    flags = (values - median).abs() > max(3 * 1.4826 * mad, 0.01)
    return {
        "mode": "historical replay",
        "title": "Recorded temperature replay with quality scenarios",
        "metrics": {
            "readings": len(sample),
            "device": device,
            "median_temperature": median,
            "robust_deviation_flags": int(flags.sum()),
        },
        "chart": {
            "kind": "line",
            "x_label": "Replay sample (recorded timestamps in labels)",
            "y_label": "Source temperature units; verify source",
            "points": [
                {
                    "x": i,
                    "y": float(v),
                    "label": f"{pd.to_datetime(t,unit='s',utc=True).isoformat()} · recorded",
                }
                for i, (v, t) in enumerate(zip(values, sample["ts"]))
                if pd.notna(v)
            ],
        },
        "replay_events": [
            {
                "index": i,
                "quality": "simulated_missing" if 40 <= i < 50 else "recorded",
                "value": None if 40 <= i < 50 else float(v),
            }
            for i, v in enumerate(values)
        ],
        "limitations": [
            "Historical data; display pacing is a replay clock, not a live sensor connection.",
            "Missing samples 40..49 are a clearly labeled synthetic outage scenario.",
            "Statistical deviations are not certified temperature or gas alarm thresholds.",
        ],
    }


def production():
    frame, _ = load_dataset("volve-production")
    producing = frame[pd.to_numeric(frame["BORE_OIL_VOL"], errors="coerce") > 0]
    well = str(producing["NPD_WELL_BORE_NAME"].iloc[0])
    sample = producing[producing["NPD_WELL_BORE_NAME"].astype(str) == well].head(120)
    oil = pd.to_numeric(sample["BORE_OIL_VOL"], errors="coerce")
    water = pd.to_numeric(sample["BORE_WAT_VOL"], errors="coerce")
    cut = water / (oil + water).where((oil + water) > 0)
    return {
        "mode": "historical replay",
        "title": "Volve daily well water-cut surveillance",
        "metrics": {
            "well": well,
            "periods": len(sample),
            "valid_water_cut_periods": int(cut.notna().sum()),
            "mean_water_cut": float(cut.mean()),
        },
        "chart": {
            "kind": "line",
            "x_label": "Recorded producing-day index",
            "y_label": "Water / (oil + water)",
            "points": [
                {"x": i, "y": float(v), "label": str(d)}
                for i, (v, d) in enumerate(zip(cut, sample["DATEPRD"]))
                if pd.notna(v)
            ],
        },
        "limitations": [
            "Historical producing intervals only; filtered shut-in periods must not imply uninterrupted production.",
            "Confirm oil/water volume unit compatibility before engineering use.",
            "Volve custom source terms require review for client redistribution.",
        ],
    }


def logistics():
    frame = pd.read_csv(next((DATA / "logistics" / "content").glob("*.csv")))
    numeric = numeric_features(frame)
    missing = int(frame.isna().sum().sum())
    col = next((c for c in numeric if "delay" in c.lower()), numeric.columns[0])
    return {
        "mode": "recorded-data proxy",
        "title": "Logistics exposure and data-quality review",
        "metrics": {
            "records": len(frame),
            "missing_cells": missing,
            "profiled_field": col,
            "mean_value": float(numeric[col].mean()),
        },
        "chart": {
            "kind": "line",
            "x_label": "Record index (not time)",
            "y_label": col,
            "points": [
                {"x": i, "y": float(v), "label": str(i)}
                for i, v in enumerate(numeric[col].head(120))
                if pd.notna(v)
            ],
        },
        "fields": list(frame.columns),
        "limitations": [
            "Generic publisher logistics data, not a client spare-parts system.",
            "No asset BOM, criticality or validated delivery-failure labels have been supplied.",
        ],
    }


def existing(key):
    report = json.loads((ARTIFACTS / key / "report.json").read_text())
    metrics = {}
    for family in ["ml", "cv", "transformer", "statistical"]:
        for k, v in report.get(family, {}).items():
            if isinstance(v, (int, float, str)) and not isinstance(v, bool):
                metrics[f"{family}.{k}"] = v
    return {
        "mode": "recorded-data experiment",
        "title": report["title"],
        "metrics": metrics,
        "model_report": report,
        "limitations": report.get("limitations", []),
        "source_manifest_sha256": report.get("source_manifest_sha256"),
    }
