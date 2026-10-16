"""PPE observation intake. Inference observations always require human interpretation."""
import hashlib
import hmac
import json
import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal
from uuid import UUID, uuid4

from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi import Depends, FastAPI, Header, HTTPException, Query, Response
from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy import Column, MetaData, String, Table, Text, UniqueConstraint, create_engine, func, insert, select, update
from sqlalchemy.exc import IntegrityError

from app.agency.api import define_table, mount as mount_agency

metadata = MetaData()
events = Table("ppe_events", metadata,
    Column("id", String(36), primary_key=True),
    Column("source_id", String(80), nullable=False),
    Column("source_event_id", String(36), nullable=False),
    Column("payload_hash", String(64), nullable=False),
    Column("payload", Text, nullable=False),
    Column("received_at", String(40), nullable=False),
    Column("state", String(20), nullable=False),
    Column("review", Text),
)
UniqueConstraint(events.c.source_id, events.c.source_event_id)

agency_runs = define_table(metadata)

class Observation(BaseModel):
    model_config = ConfigDict(extra="forbid", protected_namespaces=())
    source_id: str = Field(pattern=r"^[a-zA-Z0-9_-]{1,80}$")
    source_event_id: UUID
    observed_at: datetime
    model_version: str = Field(min_length=1, max_length=120)
    camera_id: str = Field(pattern=r"^[a-zA-Z0-9_-]{1,80}$")
    missing_items: list[Literal["helmet", "vest", "gloves", "goggles", "boots", "respirator"]] = Field(min_length=1, max_length=6)
    confidence: float = Field(ge=0, le=1, allow_inf_nan=False)

    @field_validator("observed_at")
    @classmethod
    def timestamp(cls, value):
        if value.tzinfo is None or value.utcoffset() is None:
            raise ValueError("Timezone is required")
        if (value - datetime.now(timezone.utc)).total_seconds() > 300:
            raise ValueError("Observation is in the future")
        return value.astimezone(timezone.utc)

    @field_validator("missing_items")
    @classmethod
    def unique_items(cls, value):
        if len(value) != len(set(value)):
            raise ValueError("Duplicate PPE items")
        return sorted(value)

class Review(BaseModel):
    model_config = ConfigDict(extra="forbid")
    decision: Literal["confirmed", "dismissed"]
    reason: str = Field(min_length=3, max_length=2000)


def create_app(database_url=None, ingest_token=None, reviewer_token=None, initialize=False):
    database_url = database_url or os.environ.get("DATABASE_URL")
    ingest_token = ingest_token or os.environ.get("INGEST_TOKEN")
    reviewer_token = reviewer_token or os.environ.get("REVIEWER_TOKEN")
    if not database_url or not ingest_token or not reviewer_token:
        raise RuntimeError("DATABASE_URL, INGEST_TOKEN and REVIEWER_TOKEN are required")
    if (min(len(ingest_token), len(reviewer_token)) < 32 or ingest_token == reviewer_token
            or any(t.startswith("replace-") for t in (ingest_token, reviewer_token))):
        raise RuntimeError("Use distinct tokens of at least 32 characters")
    engine = create_engine(database_url, pool_pre_ping=True)
    if initialize:
        metadata.create_all(engine)

    @asynccontextmanager
    async def lifespan(app):
        yield
        engine.dispose()

    app = FastAPI(title="Oil & Gas PPE Observations", version="0.1.0", lifespan=lifespan,
                  docs_url=None, redoc_url=None, openapi_url=None)

    def authorize(token):
        def check(authorization: str = Header(default="", max_length=512)):
            if not hmac.compare_digest(authorization, "Bearer " + token):
                raise HTTPException(401, "Invalid credentials", headers={"WWW-Authenticate": "Bearer"})
        return check

    static = Path(__file__).parent / "static"
    app.mount("/static", StaticFiles(directory=static), name="static")

    @app.get("/")
    def dashboard():
        return FileResponse(static / "index.html")

    ingest = authorize(ingest_token)
    reviewer = authorize(reviewer_token)
    mount_agency(app, engine, agency_runs, reviewer)

    @app.middleware("http")
    async def headers(request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' blob:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["Cache-Control"] = "no-store"
        response.headers["X-Request-ID"] = str(uuid4())
        return response

    @app.get("/health/live")
    def live():
        return {"status": "alive"}

    @app.get("/health/ready")
    def ready():
        try:
            with engine.connect() as conn:
                conn.execute(select(events.c.id).limit(1))
        except Exception:
            raise HTTPException(503, "Storage unavailable") from None
        return {"status": "ready"}

    @app.get("/v1/overview", dependencies=[Depends(reviewer)])
    def overview():
        with engine.connect() as conn:
            counts = dict(conn.execute(select(events.c.state, func.count()).group_by(events.c.state)).all())
            latest = conn.execute(select(func.max(events.c.received_at))).scalar()
        return {"counts": {k: counts.get(k, 0) for k in ("pending", "confirmed", "dismissed")},
                "latest_received_at": latest, "server_time": datetime.now(timezone.utc).isoformat(),
                "camera_connection": "not_integrated", "inference": "not_integrated"}

    @app.get("/v1/modules", dependencies=[Depends(reviewer)])
    def modules():
        from app.analytics.catalog import ARTIFACTS, catalog
        items = catalog()
        for item in items:
            path = ARTIFACTS / item['id'] / 'report.json'
            item['run_status'] = 'not_run'
            if path.exists():
                report = json.loads(path.read_text())
                item['run_status'] = report.get('status', 'unknown')
                item['created_at'] = report.get('created_at')
        return {'items': items}

    @app.get("/v1/modules/{module_id}/report", dependencies=[Depends(reviewer)])
    def module_report(module_id: str):
        from app.analytics.catalog import ARTIFACTS, TITLES
        if module_id not in TITLES:
            raise HTTPException(404, 'Unknown module')
        path = ARTIFACTS / module_id / 'report.json'
        if not path.exists():
            raise HTTPException(404, 'Module has not been run')
        return json.loads(path.read_text())

    @app.get("/v1/knowledge/search", dependencies=[Depends(reviewer)])
    def knowledge(q: str = Query(min_length=2, max_length=500)):
        try:
            from app.analytics.retrieval import search
        except ImportError:
            raise HTTPException(503, 'Analytics dependencies unavailable') from None
        return search(q)

    @app.get("/v1/scenarios", dependencies=[Depends(reviewer)])
    def scenarios():
        return json.loads((Path(__file__).parent / "scenarios.json").read_text())

    @app.post("/v1/ppe/events", dependencies=[Depends(ingest)], status_code=201)
    def record(observation: Observation, response: Response):
        payload = observation.model_dump_json()
        digest = hashlib.sha256(payload.encode()).hexdigest()
        event_id = str(uuid4())
        try:
            with engine.begin() as conn:
                conn.execute(insert(events).values(id=event_id, source_id=observation.source_id,
                    source_event_id=str(observation.source_event_id), payload_hash=digest,
                    payload=payload, received_at=datetime.now(timezone.utc).isoformat(), state="pending"))
        except IntegrityError:
            with engine.connect() as conn:
                row = conn.execute(select(events).where(events.c.source_id == observation.source_id,
                    events.c.source_event_id == str(observation.source_event_id))).mappings().first()
            if row is None:
                raise HTTPException(503, "Storage conflict") from None
            if row["payload_hash"] != digest:
                raise HTTPException(409, "Source event ID already used for a different observation") from None
            response.status_code = 200
            return {"id": row["id"], "state": row["state"], "duplicate": True}
        return {"id": event_id, "state": "pending", "duplicate": False}

    @app.get("/v1/ppe/events", dependencies=[Depends(reviewer)])
    def listing(state: Literal["pending", "confirmed", "dismissed"] = "pending",
                camera_id: str | None = Query(default=None, pattern=r"^[a-zA-Z0-9_-]{1,80}$"),
                limit: int = Query(default=50, ge=1, le=200), offset: int = Query(default=0, ge=0, le=100000)):
        with engine.connect() as conn:
            query = select(events).where(events.c.state == state)
            # Camera ID is in the validated payload; JSON extraction supports SQLite and PostgreSQL.
            if camera_id:
                from sqlalchemy import JSON, cast
                camera = (func.json_extract(events.c.payload, "$.camera_id") if engine.dialect.name == "sqlite"
                          else cast(events.c.payload, JSON)["camera_id"].as_string())
                query = query.where(camera == camera_id)
            total = conn.execute(select(func.count()).select_from(query.subquery())).scalar_one()
            rows = conn.execute(query.order_by(events.c.received_at.desc(), events.c.id.desc())
                .limit(limit).offset(offset)).mappings().all()
        return {"total": total, "limit": limit, "offset": offset, "items": [{"id": r["id"], "state": r["state"], "received_at": r["received_at"],
                           "observation": json.loads(r["payload"]),
                           "review": json.loads(r["review"]) if r["review"] else None} for r in rows]}

    @app.post("/v1/ppe/events/{event_id}/review", dependencies=[Depends(reviewer)])
    def review(event_id: UUID, body: Review):
        audit = body.model_dump() | {"reviewed_at": datetime.now(timezone.utc).isoformat(), "actor": "reviewer-service"}
        with engine.begin() as conn:
            result = conn.execute(update(events).where(events.c.id == str(event_id), events.c.state == "pending")
                .values(state=body.decision, review=json.dumps(audit)))
            if result.rowcount != 1:
                exists = conn.execute(select(events.c.id).where(events.c.id == str(event_id))).first()
                raise HTTPException(409 if exists else 404, "Already reviewed" if exists else "Event not found")
        return {"id": str(event_id), "state": body.decision}

    return app
