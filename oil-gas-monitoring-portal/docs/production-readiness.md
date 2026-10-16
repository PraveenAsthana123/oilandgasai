# Production readiness and operations

## Release gates

The current API is an initial vertical slice. Deployment is blocked on the following evidence:

| Area | Required evidence | Current status |
|---|---|---|
| Vision | Licensed site-representative data; validated model digest; per-class precision/recall, false alarms/hour, occlusion/night tests and approved thresholds | Not supplied |
| Edge | Camera authentication, person-to-PPE association, tracking/debounce, durable offline spool and retry recovery | Not implemented |
| Identity | Individual OIDC identities, roles, site scope, credential rotation and attribution | Shared role credentials only |
| Data | PostgreSQL integration/concurrency tests, migrations with version history, retention policy and encrypted backup restore drill | Initial schema bootstrap only |
| Network | TLS termination, body/rate limits, allowlists and deployment security review | Loopback deployment template only |
| Operations | Structured redacted logs, metrics, alert routing, load/soak tests, SLOs, incident drills | Health endpoints and request IDs only |
| Supply chain | Container build, dependency/security scans, SBOM, reviewed image digests | Not verified |
| Field acceptance | Human-review SOP, worker privacy review, site sign-off, agreed operating envelope | Not performed |

## Operating boundaries

The AI service advises operators. It must not control emergency shutdown, interlocks, valves, machinery or certified gas alarms. Keep the independent site safety systems operational. A camera outage or low-confidence detection must never imply compliance.

## Initial incident procedure

1. Check `/health/live` and `/health/ready`, then `docker compose ps`.
2. If readiness fails, inspect database availability, disk space and database logs. Avoid exposing credentials in diagnostic output.
3. Stop affected edge producers if ingestion cannot persist, retaining their local replay queues. Never silently discard pending observations.
4. Record the outage interval, affected cameras and operator notifications outside the application until an incident ledger is implemented.

## Backup and recovery acceptance

Use PostgreSQL-native encrypted backups with access controls and off-host retention. Define RPO/RTO with the site owner. Restore a backup to an isolated database and verify event counts, pending queue, review records and source-event uniqueness before approving recovery. A volume is not a backup.

## Deployment and rollback acceptance

Build and scan an immutable image, run the schema bootstrap once, verify readiness and a complete synthetic ingestion/review cycle, then obtain site acceptance. For rollback, use the previous reviewed image only if it is compatible with the deployed schema. Do not delete the database volume. Establish versioned migrations before evolving the schema beyond this initial release.
