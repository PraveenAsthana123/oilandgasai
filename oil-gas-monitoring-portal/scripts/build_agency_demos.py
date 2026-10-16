"""Precompute all agency demo engines. Browser runs do not train models."""

import argparse
import hashlib
import json
from datetime import datetime, timezone
from app.agency import pipelines, simulations
from app.agency.sources import evidence
from app.analytics.catalog import DATA, ROOT, TITLES


def governance():
    kaggle = json.loads((DATA / "manifest.json").read_text())["datasets"]
    public_path = ROOT / "data" / "public" / "manifest.json"
    public = (
        json.loads(public_path.read_text())["datasets"] if public_path.exists() else []
    )
    return {
        "title": "Data, model and release governance",
        "mode": "local evidence inventory",
        "metrics": {
            "kaggle_datasets": len(kaggle),
            "public_datasets": sum("archives" in r for r in public),
            "reference_documents": sum(
                r.get("type") == "reference document snapshot" for r in public
            ),
            "blocked_sources": sum(
                r.get("status") == "download_blocked" for r in public
            ),
        },
        "inventory": [
            {
                "id": d["id"],
                "license": d.get(
                    "license_reported_by_kaggle", d.get("license", "source terms apply")
                ),
                "source": d.get("url", d.get("source")),
                "status": d.get("status", "downloaded"),
            }
            for d in kaggle + public
        ],
        "limitations": [
            "Public publisher metadata is not independent rights/provenance verification.",
            "Shared role identity, TLS, backup/restore and site acceptance remain release gates.",
        ],
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--engine", action="append")
    args = parser.parse_args()
    portfolio = json.loads((ROOT / "app/agency/catalog.json").read_text())
    keys = sorted({r["engine"] for r in portfolio["items"]})
    destination = pipelines.CLIENT / "baselines"
    destination.mkdir(parents=True, exist_ok=True)
    functions = {
        "security": pipelines.security,
        "robot": pipelines.robot,
        "clusters": pipelines.clusters,
        "gis": pipelines.gis,
        "iot": pipelines.iot,
        "production": pipelines.production,
        "logistics": pipelines.logistics,
        "twin": simulations.tank,
        "rl": simulations.reinforcement,
        "route": simulations.route,
        "governance": governance,
    }

    def vision(key):
        if key == "detection":
            from app.agency.person_detection import run_person_detection

            return run_person_detection()
        from app.agency.vision import drone, segmentation

        return drone() if key == "drone" else segmentation(key)

    summary = []
    for key in args.engine or keys:
        print("Building " + key, flush=True)
        try:
            if key in functions:
                result = functions[key]()
            elif key in ["drone", "segmentation", "corrosion", "detection"]:
                result = vision(key)
            elif key == "rag":
                from app.agency.rag import answer

                result = answer(
                    "What is the Volve field dataset and what production years does it cover?"
                )
            elif key in TITLES:
                result = pipelines.existing(key)
            else:
                raise ValueError("No engine configured")
            result["sources"] = evidence(key)
            result.update(
                engine=key,
                created_at=datetime.now(timezone.utc).isoformat(),
                release_status="Client demonstration only; human review required",
            )
            source_manifest = DATA / "manifest.json"
            result["collection_manifest_sha256"] = hashlib.sha256(
                source_manifest.read_bytes()
            ).hexdigest()
            output = destination / (key + ".json")
            output.write_text(json.dumps(result, indent=2, allow_nan=False) + "\n")
            summary.append({"engine": key, "status": "built"})
            print("Built " + key, flush=True)
        except Exception as exc:
            summary.append({"engine": key, "status": "failed", "error": str(exc)[:300]})
            print(f"Failed {key}: {type(exc).__name__}: {str(exc)[:200]}", flush=True)
    (pipelines.CLIENT / "build-summary.json").write_text(
        json.dumps({"engines": summary}, indent=2) + "\n"
    )
    if any(r["status"] == "failed" for r in summary):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
