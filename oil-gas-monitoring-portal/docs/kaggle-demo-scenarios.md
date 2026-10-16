# Kaggle data and oil & gas demo scenarios

Downloaded collection: `data/kaggle/`. Each dataset has its own `content/` directory, source metadata, archive and manifest. Root `manifest.json` records file sizes, SHA-256 hashes, CSV columns/row counts, Kaggle-reported licenses and retrieval metadata. Raw downloads are excluded from Git. The collection contains historical, lab and proxy data; it is not a live plant connection.

## Available data

| Folder | Data | Verified contents | Kaggle-reported license |
|---|---|---|---|
| pipeline-maintenance | Pipeline thickness/material/pressure/condition | 1,000 CSV rows | MIT |
| pipeline-operations | Pipe ID, dimensions, corrosion/thickness loss, operating conditions | 1,000 CSV rows | CC0 |
| pipeline-accidents | Historical release, cause, geography, injury and cost records | 2,795 CSV rows | CC0 |
| production-trends | US production/disposition by date, commodity and region | 470,830 rows in each of original and cleaned CSVs; these are alternate versions, not distinct observations | CC BY-SA 4.0 |
| ppe-images | Construction PPE images and YOLO annotations | 2,801 images in css-data; extra examples, videos and training artifacts also supplied | CC BY 4.0 |
| environmental-telemetry | Timestamp/device, temperature, humidity, CO, LPG, smoke and motion | 405,184 CSV rows | CC0 |
| machine-maintenance | Generic manufacturing operating features and failure types | 10,000 CSV rows | CC0 |
| gas-sensor-drift | Laboratory gas sensor batches | 10 .dat batch files | CC BY 4.0 |

Source URLs and exact attribution metadata are in [dataset sources](kaggle-dataset-sources.md). Licenses above are publisher metadata, not independent provenance verification. Preserve attribution and applicable share-alike obligations for derived redistribution. Source bundles include upstream executable model/notebook artifacts; none were loaded or executed.

## Demo scenario plan

The data is downloaded and integrity-checked. The following is a demo plan; downloading data does not implement or validate these analytics.

| Demo | Dataset | Input and workflow | Expected output and exception cases |
|---|---|---|---|
| D01 Helmet absent | ppe-images | Use NO-Hardhat labels; compare held-out images and detector predictions | Annotated missing-helmet example; distinguish occlusion and class confusion |
| D02 Vest absent | ppe-images | Use NO-Safety Vest labels; preserve train/validation/test split | Vest alert example with independent human review |
| D03 PPE present | ppe-images | Compare Hardhat and Safety Vest examples | Presence examples; do not infer site compliance or use absence of detections as compliance |
| D04 Multiple workers | ppe-images | Inspect Person and PPE boxes in crowded images | Association challenge cases; labels alone do not establish person tracks |
| D05 Worker/machinery proximity | ppe-images | Inspect Person, machinery and vehicle boxes | Visual proximity example; pixel distance is not calibrated physical distance |
| D06 Poor visibility | ppe-images | Curate available dim/obscured images; optionally add labeled synthetic transformations separately | Uncertainty review examples; preserve original split and provenance |
| D07 Thickness-loss exploration | pipeline-maintenance | Compare material, age, thickness loss and condition | Condition distribution and grouped corrosion-loss plots; no time-series assumption |
| D08 Operating envelope | pipeline-operations | Compare pressure, temperature, grade and condition | Engineering review candidate; publisher values do not establish safe thresholds |
| D09 Corrosion advisory | pipeline-operations | Examine Corrosion_Impact_Percent, Thickness_Loss_mm and Material_Loss_Percent | Tabular condition example; not a corrosion image detector or NDT result |
| D10 Incident map | pipeline-accidents | Plot valid latitude/longitude and cause category | Historical incident map; exclude/report missing coordinates |
| D11 Spill severity | pipeline-accidents | Analyze barrels released, recovered, net loss and costs | Severity distribution with missing-data handling; retrospective only |
| D12 Shutdown/restoration | pipeline-accidents | Compare available shutdown and restart timestamps | Historical duration distribution; reject invalid/reversed timestamps |
| D13 Production trends | production-trends | Group date, commodity, state and disposition; select original OR cleaned file | Historical trend charts; respect commodity units and avoid double-counting |
| D14 Historical telemetry replay | environmental-telemetry | Replay ts-ordered readings by device at chosen speed | Changing sensor charts labeled historical replay, never live plant telemetry |
| D15 Environmental excursion | environmental-telemetry | Compare temperature/humidity/CO/LPG/smoke to configurable demo rules | Demo advisory only; no certified gas limits or emergency action claims |
| D16 Telemetry gaps and silence | environmental-telemetry | Measure timestamp gaps per device | Historical missing-window examples; inferred gaps are not proven network outages |
| D17 Failure classification | machine-maintenance | Split before preprocessing; compare imbalance-aware baselines | Precision/recall/confusion matrix; exclude Target and Failure Type from predictive inputs |
| D18 Wear and operating conditions | machine-maintenance | Explore torque, speed, wear and temperatures against failure type | Generic manufacturing risk exploration; no oil/gas RUL or failure lead-time claim |
| D19 Gas class separation | gas-sensor-drift | Parse labels and sparse feature values; train/test by batch | Lab classification benchmark; verify label mapping against source metadata |
| D20 Drift evaluation | gas-sensor-drift | Compare earlier and later batches without random mixing | Cross-batch performance change; not proof of field leak sensitivity |
| D21 Operator review lifecycle | PPE examples + existing API | A reviewed demo runner may translate a chosen annotation to an explicitly labeled test observation | Pending → confirmed/dismissed trace; no observations were automatically injected by download |
| D22 Recovery and duplicates | Any explicit test event | Re-deliver the same stable source/event ID; simulate temporary disconnection in an isolated test instance | One persisted event after retries; historical dataset rows are not automatically sent to production |

## Scope gaps

These datasets do not supply validated oil/gas respirator fit, flame-resistant clothing, real plant gas leak video, calibrated proximity distance, a multi-camera identity benchmark, site permits, individual reviewer identity or a comprehensive operational hazard inventory. Pipeline CSVs have no established real-time sensor feed. Do not label historical replay as live camera inference.

## Reproduce and verify

Activate `/home/praveen/venv-ardupilot` in the same shell, then from the project directory run:

```bash
python -m scripts.download_demo_data
python -m scripts.verify_demo_data
```

Downloads use the existing Kaggle configuration. They fetch the current public dataset revision; manifests/hashes identify the downloaded snapshot. A future re-download may differ. Keep the saved archives for exact snapshot reuse. No competition rule acceptance is performed.
