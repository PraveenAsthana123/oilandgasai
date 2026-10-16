# Oil & Gas PPE Monitoring

An implemented PPE observation API, based on the project documents in ../../journal-papers. This is a production foundation, not a field-certified safety system or trained vision detector. No camera feeds or OT controls are connected. Observations enter a human-review queue; confidence is never treated as proof of a violation.

## Implemented

- Separate ingestion and review credentials; mandatory configuration and constant-time token checks.
- Validated, timezone-aware observations with model provenance and explicit missing equipment.
- SQL persistence, database-enforced source event uniqueness, retry deduplication, conflicting retry rejection.
- Atomic one-time review with reason and timestamp. Current reviewer identity is the service credential, not an individual user.
- Bounded list queries, readiness against the actual schema, request IDs, no-store responses.
- PostgreSQL Compose deployment, explicit schema bootstrap, non-root API, read-only filesystem and loopback binding.

## Local verification

Use the canonical environment:

```bash
source /home/praveen/venv-ardupilot/bin/activate
cd /mnt/deepa/IoT/code/oil-gas-monitoring
python -m pytest -q
ruff check app tests
```

Tests use temporary SQLite files; this is not evidence of PostgreSQL integration or performance acceptance.

## Deployment candidate

Create `.env` from `.env.example`, using three distinct randomly generated values. The database password must also match DATABASE_URL and be URL-safe. Replace every example value. Protect `.env` with mode 600. Secrets must never be committed.

```bash
source /home/praveen/venv-ardupilot/bin/activate
cd /mnt/deepa/IoT/code/oil-gas-monitoring
docker compose config --quiet
docker compose up --build -d
curl --fail http://127.0.0.1:8805/health/ready
```

Do not expose the loopback port directly. Before remote access, place a TLS reverse proxy with request-size limits, rate limits, timeout limits and trusted network rules in front of it. Replace shared reviewer credentials with individual identities before multi-user operations. Docker idle monitoring applies to this stack; explicitly configure protection before promising continuous availability.

## API

Ingest: `POST /v1/ppe/events` with `Authorization: Bearer <INGEST_TOKEN>`.

```json
{"source_id":"edge-1","source_event_id":"690018e9-20df-462b-874a-adf122b891f0","observed_at":"2026-10-16T14:00:00Z","model_version":"validated-model-digest","camera_id":"cam-1","missing_items":["helmet"],"confidence":0.92}
```

Source event IDs must remain stable across retries. Repeating the same normalized payload returns the original event; reusing its ID with different data returns 409. Delayed observations are accepted to support offline edge replay. Future observations beyond five minutes are rejected.

Review: `GET /v1/ppe/events?state=pending&limit=50&offset=0` and `POST /v1/ppe/events/{id}/review`, authenticated with REVIEWER_TOKEN. Review body: `{"decision":"dismissed","reason":"Helmet obscured by camera angle"}`. Reviews cannot be overwritten through the API.

## Release requirements

See [production readiness and operations](docs/production-readiness.md). Predictive maintenance, corrosion, gas leaks and RAG remain documented future modules. No infrastructure or production deployment has been performed by this implementation.

## Operator workspace

A responsive UI is served at `/` with a live observation queue, state counts, camera/status filters, pagination, one-time review dialog, connection/stale-data indicators, integration readiness and 26 searchable use cases. See [operator guide](docs/operator-guide.md) and [scenario acceptance catalog](docs/use-cases-and-scenarios.md). Updates use authenticated polling every three seconds. No camera video or inference is simulated.

For local evaluation, run `python -m scripts.local_server` from this directory after activating the canonical environment. Open http://127.0.0.1:8805 and use the generated `.runtime/reviewer.token`. SQLite evaluation mode is separate from the PostgreSQL deployment candidate.

## Downloaded Kaggle demo data

Eight datasets are stored under `data/kaggle/` with source/license metadata, extracted contents, SHA-256 manifests and CSV schema/row profiles. See [22 demo scenarios and limitations](docs/kaggle-demo-scenarios.md) and [dataset sources](docs/kaggle-dataset-sources.md). These historical/proxy datasets are not automatically ingested into the observation API. Run `python -m scripts.verify_demo_data` to check the local snapshot.

The collection now includes ten [additional oil and gas datasets and 16 more demo scenarios](docs/extended-oil-gas-datasets.md): well logs/facies, drilling gas peaks, reservoir inventory, spills, methane, energy prices, gas demand and Volve production. Run `python -m scripts.download_extended_data` to refresh this extension without replacing the initial collection.

## Model modules

[Statistical, ML, CV, NLP and transformer setup](docs/model-modules.md) covers all 18 registered dataset modules, offline training, held-out evaluation, saved reports and limitations. Run `python -m scripts.train_modules` in the canonical environment, then open **Model workbench** in the UI. Models and reports are local experimental artifacts, separate from the observation API.
