"""Attach exact local dataset/source snapshots to each demo engine."""

import hashlib
import json
from app.analytics.catalog import DATA, ROOT, TITLES

MAPPING = {
    "clusters": ["pipeline-operations"],
    "production": ["volve-production"],
    "iot": ["environmental-telemetry"],
    "gis": ["pipeline-accidents"],
    "drone": ["aerial-scenes"],
    "segmentation": ["aerial-segmentation"],
    "corrosion": ["corrosion-segmentation"],
    "detection": ["ppe-images"],
    "logistics": ["logistics"],
    "security": ["iot-security"],
    "robot": ["robot-navigation"],
    "rag": ["equinor-volve", "epa-methane"],
}


def evidence(engine):
    if engine in ["twin", "rl", "route"]:
        path = ROOT / "app" / "agency" / "simulations.py"
        return [
            {
                "id": f"agency-{engine}-simulation-v1",
                "mode": "synthetic sandbox",
                "source": "app/agency/simulations.py",
                "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
                "rights": "Generated demo; not downloaded field observations",
            }
        ]
    inventory = json.loads((DATA / "manifest.json").read_text())["datasets"]
    public = ROOT / "data" / "public" / "manifest.json"
    if public.exists():
        inventory += json.loads(public.read_text())["datasets"]
    keys = MAPPING.get(engine, [engine] if engine in TITLES else [])
    if engine == "governance":
        keys = [r["id"] for r in inventory]
    sources = []
    for row in inventory:
        if row["id"] not in keys or row.get("status") == "download_blocked":
            continue
        path = DATA / row["id"] / "manifest.json"
        if not path.exists():
            path = public
        sources.append(
            {
                "id": row["id"],
                "source": row.get("url", row.get("source")),
                "license": row.get(
                    "license_reported_by_kaggle",
                    row.get("license", "Source terms apply"),
                ),
                "manifest_sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
                "file_count": len(row.get("files", [])),
            }
        )
    return sources
