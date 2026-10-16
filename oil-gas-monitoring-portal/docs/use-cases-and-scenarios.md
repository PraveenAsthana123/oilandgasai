# Oil & Gas use cases and scenario acceptance catalog

These 26 scenarios cover the initial operating scope, not every possible site hazard. Implemented means the stated software boundary exists; it does not imply trained inference or field acceptance. The same catalog is shown in the operator UI.

## UC-001 — Missing helmet

**Domain:** PPE

**Status:** Implemented intake/review

**Actor:** Safety operator

**Trigger:** A producer reports a worker without a helmet.

**Input:** Timestamp, camera, source event UUID, model version, missing helmet and confidence.

**Workflow:** Persist pending observation; operator independently verifies then confirms or dismisses.

**Expected:** One attributable review record; no automatic equipment control.

**Exceptions:** Occlusion or an uncertain image must be dismissed or held pending.

**Acceptance:** Authenticated event appears on the next successful UI refresh; review reason and time persist.

## UC-002 — Missing visibility vest

**Domain:** PPE

**Status:** Implemented intake/review

**Actor:** Safety operator

**Trigger:** A camera producer reports a missing visibility vest.

**Input:** PPE observation with missing_items containing vest.

**Workflow:** Review camera context using an independently available evidence source; record decision.

**Expected:** Observation retains its model provenance and final review.

**Exceptions:** Reflective lighting can produce false positives; confidence is not proof.

**Acceptance:** Vest observation is accepted; duplicate delivery does not increase counts.

## UC-003 — Task-specific gloves, boots and goggles

**Domain:** PPE

**Status:** Implemented intake/review

**Actor:** Area supervisor

**Trigger:** An upstream producer reports task-specific PPE absent.

**Input:** One or more supported missing items, plus camera and model identifiers.

**Workflow:** Review against the work permit and task requirements before confirming.

**Expected:** Decision explains the applicable task requirement.

**Exceptions:** Zone/task policy evaluation is not implemented in the current API.

**Acceptance:** Multiple items remain attached to one event and one final review.

## UC-004 — Respirator requirement in controlled area

**Domain:** PPE

**Status:** Specified

**Actor:** HSE supervisor

**Trigger:** A worker enters a zone where respiratory protection is required.

**Input:** Approved zone policy, permit, person track and validated respirator detector.

**Workflow:** Associate person with required protection; request human verification and follow local HSE SOP.

**Expected:** An advisory reaches the supervisor without altering safety interlocks.

**Exceptions:** Vision cannot establish respirator seal, rating or fit.

**Acceptance:** Site-approved tests distinguish visible equipment from certified protection checks.

## UC-005 — Compliant person and denominator

**Domain:** PPE

**Status:** Specified

**Actor:** HSE analyst

**Trigger:** A valid observation detects all zone-required equipment.

**Input:** Qualified person track, zone rule and known camera coverage.

**Workflow:** Track eligible observation windows and compliant outcomes separately.

**Expected:** A defensible compliance denominator is available.

**Exceptions:** No detections or camera outages must not count as compliant.

**Acceptance:** Compliance reports state coverage, exclusions and independently measured error.

## UC-006 — Multiple people and PPE association

**Domain:** PPE

**Status:** Specified

**Actor:** ML engineer

**Trigger:** Several workers overlap in one frame.

**Input:** Bounding boxes, person tracks, equipment assignments and frame timestamps.

**Workflow:** Associate equipment per person; debounce stable violations; flag ambiguous assignments.

**Expected:** A helmet on one worker never satisfies another worker.

**Exceptions:** Crowds, crossing tracks and small distant objects.

**Acceptance:** Annotated multi-person test set meets approved association error limits.

## UC-007 — Night, glare and occlusion

**Domain:** PPE

**Status:** Specified

**Actor:** ML engineer

**Trigger:** Visibility drops or PPE is partially obscured.

**Input:** Quality signals, illumination and confidence distributions.

**Workflow:** Mark visibility uncertainty and route ambiguous cases for inspection.

**Expected:** Operators see unknown coverage rather than an assertion of compliance.

**Exceptions:** Glare, rain, smoke, shadows and camera vibration.

**Acceptance:** Per-condition validation reports recall and false alarms per hour.

## UC-008 — Human confirmation and dismissal

**Domain:** Workflow

**Status:** Implemented

**Actor:** Reviewer

**Trigger:** A pending event is investigated.

**Input:** Event UUID, decision and reason.

**Workflow:** Submit one authenticated review; persist reason, time and service actor atomically.

**Expected:** The event moves to confirmed or dismissed and leaves the pending queue.

**Exceptions:** A second reviewer racing to decide receives conflict.

**Acceptance:** Exactly one final review wins; attempts to overwrite return 409.

## UC-009 — Historical queue filtering

**Domain:** Workflow

**Status:** Implemented

**Actor:** Reviewer

**Trigger:** An operator investigates a particular camera or status.

**Input:** Status, exact camera ID, page size and offset.

**Workflow:** Query filtered events, newest received first, using bounded pagination.

**Expected:** Counts and event list reflect persisted observations.

**Exceptions:** New arrivals can move offset pages; use a fixed reporting export for formal audit.

**Acceptance:** Filters exclude other cameras; limit and offset are validated.

## UC-010 — Shift handover and escalation

**Domain:** Workflow

**Status:** Specified

**Actor:** Shift lead

**Trigger:** Pending reviews survive a shift change or exceed agreed SLA.

**Input:** Assignments, identity, due time and escalation contact policy.

**Workflow:** Hand over pending items; notify the next responsible supervisor and record acknowledgment.

**Expected:** Open events have a clear owner and escalation history.

**Exceptions:** Unavailable contact, repeated alert or failed notification delivery.

**Acceptance:** Test routing, acknowledgment, retry and handover without dropping events.

## UC-011 — Duplicate replay after network recovery

**Domain:** Edge

**Status:** Implemented API boundary

**Actor:** Edge integrator

**Trigger:** An edge producer retries the same event after uncertain delivery.

**Input:** Stable source/event ID with identical normalized payload.

**Workflow:** Retry intake; database uniqueness returns the existing event.

**Expected:** One persisted event regardless of delivery retries.

**Exceptions:** Offline spool and retries themselves must be implemented at the edge.

**Acceptance:** Concurrent retries create exactly one event; conflicting reuse returns 409.

## UC-012 — Camera offline or frozen frame

**Domain:** Edge

**Status:** Specified

**Actor:** OT technician

**Trigger:** Camera heartbeats stop or image timestamps no longer advance.

**Input:** Heartbeat, stream timestamp, frame hash and last successful capture.

**Workflow:** Mark coverage unavailable; notify operations; recover with a fresh observation window.

**Expected:** Outage duration is visible independently of PPE events.

**Exceptions:** A static scene is not necessarily a frozen stream; require time/heartbeat evidence.

**Acceptance:** Disconnected and frozen camera tests never display healthy coverage.

## UC-013 — Offline spool and replay

**Domain:** Edge

**Status:** Specified

**Actor:** Edge integrator

**Trigger:** Network access fails while observations continue.

**Input:** Durable bounded queue, source IDs, capture times and disk watermark.

**Workflow:** Persist locally, retry with backoff, and acknowledge only after durable server receipt.

**Expected:** Delayed records preserve capture time and retry identity.

**Exceptions:** Disk full, power loss, queue overflow and reordered delivery.

**Acceptance:** Power-cycle and reconnect tests recover accepted records without silent loss.

## UC-014 — Clock skew and delayed events

**Domain:** Edge

**Status:** Implemented validation

**Actor:** Edge integrator

**Trigger:** A producer clock is ahead or a buffered event is old.

**Input:** Timezone-aware capture timestamp.

**Workflow:** Reject observations more than five minutes in the future; accept delayed replay.

**Expected:** Observed time and received time remain distinct.

**Exceptions:** Naive timestamps are rejected; upstream clock monitoring remains required.

**Acceptance:** Future/naive timestamps fail validation; valid delayed records are accepted.

## UC-015 — Database outage

**Domain:** Reliability

**Status:** Implemented readiness

**Actor:** Service operator

**Trigger:** The database cannot be reached or schema is absent.

**Input:** Database connectivity and schema query.

**Workflow:** Readiness returns 503; producer must retain unacknowledged events.

**Expected:** Infrastructure can distinguish a living process from ready storage.

**Exceptions:** Automated failover, operator paging and spool are not implemented.

**Acceptance:** Missing schema returns 503 without leaking database credentials.

## UC-016 — UI disconnect and stale data

**Domain:** Reliability

**Status:** Implemented

**Actor:** Reviewer

**Trigger:** A live refresh fails or credentials expire.

**Input:** Authenticated polling response and last successful update.

**Workflow:** Display stale-data warning; retry transient failures; clear credentials and data on 401/disconnect.

**Expected:** Stale data never presents as a fresh update.

**Exceptions:** Background tabs may throttle polling; three seconds is not a guaranteed latency SLA.

**Acceptance:** Failure banner appears and successful reconnect refreshes persisted state.

## UC-017 — Backup restore and disaster recovery

**Domain:** Reliability

**Status:** Specified

**Actor:** Database operator

**Trigger:** Primary storage is lost or corrupted.

**Input:** Encrypted off-host backup, recovery point and approved RTO/RPO.

**Workflow:** Restore in isolation; reconcile event IDs, review records and retained edge spool.

**Expected:** Recovered records satisfy approved recovery objectives.

**Exceptions:** A Docker volume or successful backup command is not restore evidence.

**Acceptance:** A timed restore drill verifies record counts and uniqueness constraints.

## UC-018 — Unauthorized role and invalid payload

**Domain:** Security

**Status:** Implemented

**Actor:** Security reviewer

**Trigger:** A request lacks credentials, uses the wrong role or malformed data.

**Input:** Authorization header and validated event/review body.

**Workflow:** Reject role violations; reject unsupported fields and invalid values.

**Expected:** No unauthorized event access or review change.

**Exceptions:** Shared role tokens do not provide individual identity or site scoping.

**Acceptance:** Wrong roles return 401; invalid payloads return 422; existing rows remain unchanged.

## UC-019 — Individual identity and site isolation

**Domain:** Security

**Status:** Specified

**Actor:** Security administrator

**Trigger:** Several users or sites share one deployment.

**Input:** OIDC claims, site grants, role mapping and immutable audit identity.

**Workflow:** Enforce site scope on every query and write; apply token expiry and rotation.

**Expected:** A reviewer sees only authorized sites and decisions name the individual.

**Exceptions:** Current service credentials are global roles and are insufficient for this workflow.

**Acceptance:** Cross-site read/write and revoked/expired identity tests are rejected.

## UC-020 — Evidence privacy and retention

**Domain:** Security

**Status:** Specified

**Actor:** Privacy administrator

**Trigger:** Images contain identifiable workers or sensitive plant details.

**Input:** Approved retention, consent/legal basis, object storage ACL and deletion policy.

**Workflow:** Minimize stored evidence, restrict access, audit retrieval and enforce deletion.

**Expected:** Evidence access and retention meet the approved site policy.

**Exceptions:** No image/video upload or evidence store exists in this version.

**Acceptance:** Retention and denied-access drills verify deletion and access boundaries.

## UC-021 — Predictive maintenance

**Domain:** Plant analytics

**Status:** Specified

**Actor:** Reliability engineer

**Trigger:** A compressor or pump develops abnormal vibration.

**Input:** Calibrated vibration, temperature, load, operating state and maintenance history.

**Workflow:** Validate sensor quality; compute baseline deviation; review maintenance recommendation.

**Expected:** A traceable advisory links to an engineer-reviewed maintenance work order.

**Exceptions:** Startup transients, sensor drift, load changes and unseen asset types.

**Acceptance:** Backtests and field trials measure lead time, precision and avoided false alarms.

## UC-022 — Gas leak advisory

**Domain:** Plant analytics

**Status:** Specified

**Actor:** HSE operator

**Trigger:** An independent instrument or validated imaging system reports a potential leak.

**Input:** Instrument quality, calibration, sensor position and approved alarm rules.

**Workflow:** Route an advisory to a trained operator while certified gas alarms operate independently.

**Expected:** Operator follows the existing site emergency procedure.

**Exceptions:** AI must not replace certified detection or initiate shutdown controls.

**Acceptance:** Approved instrument integration and failure tests preserve independent safety operation.

## UC-023 — Corrosion inspection

**Domain:** Plant analytics

**Status:** Specified

**Actor:** Inspection engineer

**Trigger:** Inspection imagery suggests coating loss or corrosion.

**Input:** Calibrated imagery, asset location, inspection history and qualified labels.

**Workflow:** Flag candidate regions; engineer verifies and schedules approved inspection/NDT.

**Expected:** An inspection finding includes evidence and engineering sign-off.

**Exceptions:** Visible surface changes do not prove remaining wall thickness.

**Acceptance:** Compare against approved inspection ground truth across materials and lighting.

## UC-024 — Pipeline pressure/flow anomaly

**Domain:** Plant analytics

**Status:** Specified

**Actor:** Pipeline operator

**Trigger:** Pressure and flow deviate from the expected operating envelope.

**Input:** Synchronized calibrated sensors, valve states and operating mode.

**Workflow:** Check quality, correlate sensor trends and ask operator to verify.

**Expected:** Advisory retains contributing signals and approved response procedure.

**Exceptions:** Pump changes, maintenance, communications loss and bad sensor readings.

**Acceptance:** Mode-aware replay tests discriminate normal transients from known anomalies.

## UC-025 — Grounded procedure assistance

**Domain:** Knowledge

**Status:** Specified

**Actor:** Operations engineer

**Trigger:** An engineer asks for the applicable inspection or maintenance procedure.

**Input:** Approved versioned manuals, access permissions and retrieved passages.

**Workflow:** Retrieve authorized sources; answer with citations and revision; abstain without evidence.

**Expected:** The operator can inspect the governing document and confirm applicability.

**Exceptions:** Outdated manuals, prompt injection, missing source and conflicting instructions.

**Acceptance:** Answers cite approved revisions and never invent emergency operating instructions.

## UC-026 — Model rollout and drift

**Domain:** Model operations

**Status:** Specified

**Actor:** ML platform owner

**Trigger:** A new detector is proposed or live data shifts.

**Input:** Signed model digest, model card, validation dataset and monitored error metrics.

**Workflow:** Run shadow comparison, obtain approval, deploy gradually and preserve rollback.

**Expected:** Every observation identifies the model used.

**Exceptions:** No model loader, shadow deployment or drift measurement currently exists.

**Acceptance:** Rollback and cohort tests retain provenance and satisfy approved error limits.
