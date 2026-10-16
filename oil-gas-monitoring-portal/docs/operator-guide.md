# Operator UI and real-time workflow

## Launch locally

```bash
source /home/praveen/venv-ardupilot/bin/activate
cd /mnt/deepa/IoT/code/oil-gas-monitoring
python -m scripts.local_server
```

Open http://127.0.0.1:8805. Read the locally generated `.runtime/reviewer.token` and paste it into Reviewer credential. The browser retains the credential only in JavaScript memory; reload/disconnect clears it. Local credentials and SQLite data are excluded from Git. This launcher is for evaluation, not a production service manager.

## Live operations

The queue refreshes every three seconds while connected. This is authenticated HTTP polling, not video streaming or a guaranteed real-time latency SLA. Data persists in the database and reloads after reconnect. Global state counts cover all API records. Filters apply to the queue, not global counts. Latest observation means latest **received** record, not a camera heartbeat. Background tabs and slow connections may delay refresh. A failed refresh marks the displayed data stale; a 401 clears the connection.

Select a status and optionally an exact camera ID. Newest received events appear first, with distinct capture/receive timestamps. Previous/Next pages contain 25 observations; arrivals can shift offset pages. A low confidence score does not establish safety or compliance. The current model only records reported missing items and cannot calculate a workforce compliance percentage.

## Review

Choose Review, inspect independent evidence, select confirm or dismiss, and provide a meaningful reason. The present version has no image evidence viewer; obtain evidence through the approved site process. A committed review cannot be overwritten. Conflicting concurrent decisions return an error and the next refresh loads the persisted decision. Review attribution currently names the service role; individual reviewer identities remain a release gate.

## Use-case library

The second tab contains 26 searchable scenarios with actors, trigger, inputs, workflow, expected result, exceptions and acceptance criteria. Filter by domain. Specified entries describe intended integrations and do not produce live plant data. Integration readiness explicitly identifies missing camera, model, identity and plant analytics capabilities.

## Supply observations

An authorized producer posts the documented event schema using `.runtime/ingest.token`. Do not put tokens in URLs, screenshots, source control or logs. Keep a source event ID stable across retries. Use a distinct ID for each new observation. The UI contains no button that fabricates camera detections.
