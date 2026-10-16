"""Authenticated client-demo lifecycle; no model training or device writes."""

import json
from datetime import datetime, timezone
from pathlib import Path
import re
import threading
from uuid import UUID, uuid4
from fastapi import Depends, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import Column, Table, String, Text, insert, select, update
from app.analytics.catalog import ARTIFACTS

CLIENT = ARTIFACTS / "client"
RAG_SLOT = threading.BoundedSemaphore(1)


class DemoRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    scenario_id: str = Field(pattern=r"^AG-\d{3}$")
    inflow: float = Field(default=2, ge=0, le=5, allow_inf_nan=False)
    outflow: float = Field(default=1.8, ge=0, le=5, allow_inf_nan=False)
    blocked: bool = False
    inject_gap: bool = False
    question: str | None = Field(default=None, min_length=2, max_length=500)


class DemoReview(BaseModel):
    model_config = ConfigDict(extra="forbid")
    decision: str = Field(pattern=r"^(confirmed|dismissed)$")
    reason: str = Field(min_length=3, max_length=2000)


def portfolio():
    data = json.loads((Path(__file__).parent / "catalog.json").read_text())
    for item in data["items"]:
        item["available"] = (CLIENT / "baselines" / (item["engine"] + ".json")).exists()
    return data


def define_table(metadata):
    return Table(
        "client_demo_runs",
        metadata,
        Column("id", String(36), primary_key=True),
        Column("scenario_id", String(12), nullable=False),
        Column("created_at", String(40), nullable=False),
        Column("state", String(20), nullable=False),
        Column("payload", Text, nullable=False),
        Column("review", Text),
    )


def markdown(run):
    p = run["payload"]
    s = p["scenario"]
    result = p["result"]
    lines = [
        f"# {p['agency_name']} — Client demonstration report",
        "",
        f"Run: {run['id']}",
        f"Created: {run['created_at']}",
        f"Review state: {run['state']}",
        "",
        f"## {s['id']} — {s['title']}",
        f"Department: {s['department']}",
        f"Technologies: {', '.join(s['technologies'])}",
        f"Mode: {result.get('mode',s['mode'])}",
        "",
        "## Business objective",
        s["objective"],
        f"Pilot KPI to validate: {s['business_kpi']}",
        "",
        "## Pipeline",
        *[f"{i+1}. {step}" for i, step in enumerate(s["workflow"])],
        "",
        "## Actual demo metrics",
        "```json",
        json.dumps(result.get("metrics", {}), indent=2),
        "```",
        "",
        "## Evidence and assumptions",
        f"Engine: {s['engine']}",
        f"Collection manifest SHA-256: {result.get('collection_manifest_sha256','not applicable')}",
        "```json",
        json.dumps(result.get("sources", []), indent=2),
        "```",
        "",
        "```json",
        json.dumps(result.get("assumptions", {}), indent=2),
        "```",
        "",
        "## Limitations",
        *[f"- {x}" for x in result.get("limitations", [])],
        "",
        "## Risks and required controls",
        *[
            f"- {r['id']} [{r['severity']}]: {r['risk']} Owner: {r['owner']}. Control: {r['control']}"
            for r in p["risks"]
        ],
        "",
        "## Agency deliverables",
        *[f"- {x}" for x in s["agency_deliverables"]],
        "",
        "## Human review",
        "```json",
        json.dumps(run.get("review"), indent=2),
        "```",
        "",
        "Demonstration review does not certify operational safety, model accuracy, commercial rights or field readiness. No measured client ROI is claimed.",
    ]
    if result.get("answer"):
        lines += [
            "",
            "## Source-grounded draft",
            result["answer"],
            "",
            "## Retrieved evidence",
            *[
                f"- [{e['id']}] {e['source']} at character {e['offset']}: {e['text'][:500]}"
                for e in result.get("evidence", [])
            ],
        ]
    return "\n".join(lines) + "\n"


def mount(app, engine, runs, reviewer):
    def load(run_id):
        with engine.connect() as conn:
            row = (
                conn.execute(select(runs).where(runs.c.id == str(run_id)))
                .mappings()
                .first()
            )
        if not row:
            raise HTTPException(404, "Demo run not found")
        return dict(row) | {
            "payload": json.loads(row["payload"]),
            "review": json.loads(row["review"]) if row["review"] else None,
        }

    @app.get("/v1/agency/portfolio", dependencies=[Depends(reviewer)])
    def listing():
        return portfolio()

    @app.post("/v1/agency/runs", dependencies=[Depends(reviewer)], status_code=201)
    def execute(body: DemoRequest):
        data = portfolio()
        scenario = next((s for s in data["items"] if s["id"] == body.scenario_id), None)
        if not scenario:
            raise HTTPException(404, "Unknown scenario")
        key = scenario["engine"]
        path = CLIENT / "baselines" / (key + ".json")
        if not path.exists():
            raise HTTPException(503, "Demo evidence has not been built")
        result = json.loads(path.read_text())
        try:
            if key == "twin":
                from app.agency.simulations import tank

                result = result | tank(body.inflow, body.outflow)
            elif key == "route":
                from app.agency.simulations import route

                result = result | route(body.blocked)
            elif key == "iot":
                result["metrics"]["synthetic_missing_readings"] = (
                    10 if body.inject_gap else 0
                )
                for point in result["chart"]["points"]:
                    if body.inject_gap and 40 <= point["x"] < 50:
                        point["y"] = None
                        point["label"] = "Synthetic missing interval"
                result["replay_events"] = [
                    dict(e, quality="recorded" if not body.inject_gap else e["quality"])
                    for e in result["replay_events"]
                ]
            elif key == "rag" and body.question:
                if not RAG_SLOT.acquire(blocking=False):
                    raise HTTPException(
                        429, "A RAG demo is already running; retry shortly"
                    )
                try:
                    from app.agency.rag import answer

                    result = result | answer(body.question)
                finally:
                    RAG_SLOT.release()
        except ImportError:
            raise HTTPException(503, "Optional demo dependencies unavailable") from None
        run_id = str(uuid4())
        created = datetime.now(timezone.utc).isoformat()
        risks = [r for r in data["risks"] if r["id"] in scenario["risk_ids"]]
        payload = {
            "agency_name": data["agency_name"],
            "scenario": scenario,
            "result": result,
            "risks": risks,
            "parameters": body.model_dump(),
            "review_scope": "Review of a demonstration, not operational certification",
        }
        with engine.begin() as conn:
            conn.execute(
                insert(runs).values(
                    id=run_id,
                    scenario_id=scenario["id"],
                    created_at=created,
                    state="draft",
                    payload=json.dumps(payload, allow_nan=False),
                )
            )
        return load(UUID(run_id))

    @app.get("/v1/agency/runs", dependencies=[Depends(reviewer)])
    def history():
        with engine.connect() as conn:
            rows = (
                conn.execute(
                    select(
                        runs.c.id, runs.c.scenario_id, runs.c.created_at, runs.c.state
                    )
                    .order_by(runs.c.created_at.desc())
                    .limit(50)
                )
                .mappings()
                .all()
            )
        return {"items": [dict(row) for row in rows]}

    @app.get("/v1/agency/runs/{run_id}", dependencies=[Depends(reviewer)])
    def get_run(run_id: UUID):
        return load(run_id)

    @app.post("/v1/agency/runs/{run_id}/review", dependencies=[Depends(reviewer)])
    def review(run_id: UUID, body: DemoReview):
        audit = body.model_dump() | {
            "reviewed_at": datetime.now(timezone.utc).isoformat(),
            "actor": "reviewer-service",
        }
        with engine.begin() as conn:
            result = conn.execute(
                update(runs)
                .where(runs.c.id == str(run_id), runs.c.state == "draft")
                .values(state=body.decision, review=json.dumps(audit))
            )
            if result.rowcount != 1:
                exists = conn.execute(
                    select(runs.c.id).where(runs.c.id == str(run_id))
                ).first()
                raise HTTPException(
                    409 if exists else 404,
                    "Already reviewed" if exists else "Demo run not found",
                )
        return load(run_id)

    @app.get("/v1/agency/runs/{run_id}/report", dependencies=[Depends(reviewer)])
    def report(run_id: UUID):
        return {"markdown": markdown(load(run_id))}

    @app.get("/v1/agency/media/{filename}", dependencies=[Depends(reviewer)])
    def media(filename: str):
        if not re.fullmatch(r"[a-zA-Z0-9_-]{1,80}\.png", filename):
            raise HTTPException(404, "Media not found")
        path = CLIENT / "media" / filename
        if not path.is_file():
            raise HTTPException(404, "Media not found")
        return FileResponse(path)
