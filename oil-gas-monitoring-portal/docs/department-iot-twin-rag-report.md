# Oil and gas departments, IoT, digital twins, RAG and reporting

Prepared 2026-10-16. This is a proposed departmental scope and data acquisition report, not a claim that the workflows below are implemented. Department names and responsibilities vary by operator, asset and upstream/midstream/downstream business. Existing local inventory: 18 datasets with experimental offline baselines; no live plant telemetry or operational digital twin.

## Department and use-case matrix

| Department/function | IoT and operational inputs | Digital-twin or analytics use cases | RAG documents and questions | Reports | Existing local demo data / missing data |
|---|---|---|---|---|---|
| Exploration and geophysics | Seismic, survey coordinates, well logs | Seismic interpretation, geology/facies model, uncertainty comparison | Geological reports: which evidence supports this interpretation? | Prospect assessment, interpretation uncertainty | Well logs/facies available; seismic and interpretation evidence needed |
| Reservoir engineering | Pressure surveys, PVT, well tests, injection, production | Material-balance/flow model, depletion and injection scenarios | Reservoir studies and test reports: what assumptions changed? | Reservoir surveillance, forecast assumptions, water-cut | Volve production and inventory available; PVT, reservoir grid and calibrated simulator missing |
| Drilling and completions | WOB, RPM, torque, ROP, mud flow/density, standpipe pressure, gas, depth | Drilling advisory, torque/drag, hydraulics, nonproductive-time analysis | Daily drilling reports, BHA, mud programs, approved procedures | Daily drilling, NPT, gas-peak review | Gas-peak data available; full rig telemetry and drilling document corpus missing |
| Well integrity and interventions | Annulus/tubing pressure, temperature, barrier tests | Barrier state, leak indicators, intervention planning | Completion diagrams, barrier verification, intervention history | Well-integrity exceptions, barrier-test history | Volve has some pressure data; barrier records and site thresholds needed |
| Production operations | Oil/gas/water rates, choke, pressure, temperature, well state | Well/separator/network state, deferment and operating-scenario review | Operating procedures and shift logs: what changed before the event? | Daily production, deferment, water-cut, shift handover | Volve and production trends available; live tags/topology/operating rules needed |
| Process engineering and refining | P&IDs, flows, composition, pressure, temperature, utilities, quality | Separator/process mass-energy balance, bottleneck and heat-exchanger fouling | Process design basis, operating envelopes, approved manuals | Mass-balance closure, quality deviation, energy intensity | No calibrated refinery/process dataset; acquire process historian and design data |
| Mechanical maintenance and reliability | Vibration, bearing temperature, motor current, lubricant, run hours | Asset health, maintenance scenarios, failure-mode review | OEM manuals, work orders, RCA: what failures recur? | Reliability, downtime, maintenance backlog, RCA | Generic maintenance data available; oil/gas asset failure labels and CMMS history missing |
| Inspection and asset integrity | Thickness readings, ultrasonic/eddy-current inspections, corrosion probes, images | Corrosion/thickness-loss tracking, inspection coverage, engineering assessment | Inspection reports, material records and engineering-approved criteria | Corrosion trend, inspection due list, defect disposition | Pipeline condition data available; actual NDT evidence and component geometry missing |
| Pipeline and midstream operations | SCADA pressure/flow, valve state, compressor power, route/GIS | Hydraulic/linepack model, imbalance advisory, capacity scenarios | Pipeline procedures, integrity plans, incident history | Flow balance, capacity, leak-advisory investigation | Pipeline and incident tables available; synchronized live telemetry and network model missing |
| LNG, terminal and storage operations | Tank level, temperature/pressure, composition, loading, boil-off | Tank inventory, boil-off scenarios, transfer reconciliation | Cargo certificates, terminal SOPs, tank inspection records | Inventory reconciliation, loading, product-quality exceptions | No LNG tank/cargo dataset downloaded; acquire terminal historian and custody records |
| HSE and occupational safety | PPE imagery, gas alarms, permits, occupancy, weather | Work-zone exposure context, evacuation planning and permit conflicts | Permit requirements, incident lessons and current approved safety procedures | PPE review, near misses, permit exceptions, incident follow-up | Construction PPE and incidents available; task/zone policy and plant evidence missing |
| Environment, methane and sustainability | Methane instruments, flare flow/composition, water discharge, weather | Emissions reconciliation, flare-efficiency analysis and leak-repair tracking | Environmental permits, measurement methodology and evidence | Methane inventory, LDAR follow-up, flaring and water reports | Aggregate methane/environmental data available; facility measurement evidence missing |
| Energy and utilities | Electrical meters, steam, fuel gas, compressed air, cooling water | Utility balance, energy intensity, load planning | Utility manuals, energy audit and meter calibration records | Energy intensity, losses, meter health | Environmental proxy data available; utility meters/production alignment needed |
| Instrumentation, automation and OT | Sensor quality, calibration, PLC/DCS alarms, gateway status, network events | Sensor/actuator state representation, calibration drift, alarm diagnostics | Loop diagrams, instrument datasheets and change records | Calibration due list, alarm bad actors, sensor/gateway availability | Environmental/gas drift data available; instrument registry and approved OT access missing |
| Supply chain, procurement and logistics | Stock, lead times, RFID, delivery status, asset/BOM relationships | Spare-parts availability, replenishment and logistics scenarios | Purchase orders, supplier manuals, warranties, contract clauses | Critical-spares shortage, lead-time and supplier quality | No procurement/logistics data downloaded; obtain governed ERP sample |
| Commercial, planning and finance | Prices, volumes, nominations, transport costs, contract terms | Production/price sensitivity, demand planning and revenue scenarios | Contracts and pricing formulas: which clause governs this calculation? | Volume reconciliation, forecast variance, revenue sensitivity | Price/demand data available; contracts, costs and finance records missing |
| IT, data platform and cybersecurity | Identity, service logs, inventories, access grants, backup state | Data lineage, service dependency and operational resilience views | Architecture, incident playbooks, approved change procedures | Access audit, pipeline failures, restore drills, data-quality SLA | Application health exists; production identity/SIEM/CMDB integrations missing |
| Technical documentation and training | Controlled manuals, engineering revisions, training records | Asset-linked knowledge context and operator training scenarios | Revision-aware retrieval and cited answers across approved sources | Document currency, unanswered questions, training gaps | Local project-document search exists; approved plant corpus and generated-answer evaluation missing |

## Additional public data sources to acquire

These sources were researched but not downloaded in this task. Availability, access requirements, scope and licenses must be checked per dataset.

1. **Equinor full Volve release**: approximately 40,000 subsurface/operating files, including reports suitable for grounded document retrieval. The current Kaggle production workbook is only a small slice. Source: https://www.equinor.com/energy/volve-data-sharing . Equinor's Ask Volve example explicitly combines production questions with source-cited drilling, well and geology report questions: https://github.com/equinor/industrial-hackathon-2026/blob/main/ask-volve/README.md .
2. **Equinor Huldra Plant 3D models**: geometry candidates for a plant visualization/twin demo. Geometry needs approved asset-ID mapping, live/historical signals and validated behavior models before claiming an operational twin. Source: https://www.equinor.com/energy/data-sharing .
3. **BSEE platform and production data**: offshore structures, equipment/status and reported production. Candidates for platform/asset registries and historical production reconciliation. Sources: https://www.data.bsee.gov/Main/Platform.aspx and https://www.data.bsee.gov/Production/ProdbyPlatform/Default.aspx .
4. **PHMSA incident downloads**: gas distribution/transmission/gathering, LNG and hazardous-liquid incidents, with field descriptions. Broader coverage than the downloaded Kaggle liquid-pipeline snapshot. Source: https://www.phmsa.dot.gov/data-and-statistics/pipeline/distribution-transmission-gathering-lng-and-liquid-accident-and-incident-data .
5. **EPA GHGRP/FLIGHT**: reported facility emissions and oil/gas sector data; suitable for inventory/reporting comparisons, not second-by-second methane localization. Sources: https://www.epa.gov/natural-gas-star-program/methane-emissions-data and https://www.epa.gov/ghgreporting/ghgrp-reported-data .
6. **NETL Energy Data eXchange**: discovery portal for energy research data; select and inspect actual datasets before asserting they fit a task. Source: https://netl.doe.gov/edx .
7. **DOE FORGE/GDR**: well logs, drilling, stimulation and microseismic data. It is geothermal and must be labeled a proxy for transferable drilling/subsurface demos, not oil/gas field evidence. Source: https://www.energy.gov/hgeo/geothermal/forge .
8. **OSDU**: data schemas, search and domain data services for subsurface interoperability; this is an integration/data-management foundation, not a free dataset by itself. Source: https://osdu.pages.opengroup.org/platform/system/search-service/api/ .

## IoT data contracts

Every observation should include site, asset, device and tag IDs; event and receive timestamps; value and engineering unit; quality/status; sequence number; calibration reference; source protocol; and provenance. Missing, stale and bad-quality states must remain explicit. Keep raw high-rate vibration separately from low-rate summary features. Device authentication, bounded durable edge queues and retry deduplication must precede live claims.

Example proposed telemetry shape (not an implemented endpoint):

```json
{"site_id":"demo-site","asset_id":"pump-101","device_id":"sensor-7","tag":"bearing_temperature","observed_at":"2026-10-16T12:00:00Z","received_at":"2026-10-16T12:00:01Z","value":72.4,"unit":"degC","quality":"good","sequence":1234,"calibration_ref":"demo-calibration","source_mode":"historical_replay"}
```

Candidate ingestion paths include MQTT for edge messages and OPC UA for governed industrial tag access. Protocol choice alone does not establish security, time synchronization or data quality. Do not issue OT writes or control actions through the demo analytics layer.

## Digital-twin minimum requirements and scenario set

A useful twin requires asset identity/topology, geometry where relevant, units and engineering parameters, state synchronization, a fit-for-purpose behavior model, calibration and uncertainty, and versioned scenario assumptions. A 3D viewer or historical chart alone does not establish these capabilities. NIST describes twins as synchronized virtual models and emphasizes verification, validation and uncertainty: https://www.nist.gov/programs-projects/digital-twins-advanced-manufacturing .

| Twin demo | Data needed beyond current collection | Scenario | Report |
|---|---|---|---|
| Producing well | Well configuration, fluid properties and operating mode | Change choke/injection assumptions in simulation | Measured-vs-simulated rates, residuals and scenario assumptions |
| Pump/compressor | Equipment curve, speed/load, vibration and maintenance state | Compare degraded efficiency or planned maintenance | Health trend, model residual and availability impact |
| Pipeline network | Pipe/valve topology, dimensions, fluid properties, synchronized boundary flows | Simulate demand or valve configuration changes offline | Pressure/flow residual, capacity and scenario comparison |
| Separator/process | P&ID, vessel parameters, streams, composition and calibrated model | Simulate inlet composition/rate change | Mass/energy balance and constraint violations |
| Storage tank | Geometry, density/composition, levels and transfer records | Simulate transfers or thermal expansion | Inventory reconciliation and uncertainty |
| Plant geometry | 3D geometry, asset IDs, approved event mapping | Show asset alarms and inspection context | Coverage and state freshness, not simulated physics unless separately modeled |

## RAG data requirements and scenarios

Collect approved revision-controlled OEM manuals, SOPs, P&IDs, inspection reports, shift logs, work orders, incident RCAs and permits. Attach asset/site, document type, revision, effective/superseded dates, page/section, access grants and source checksum. Enforce permissions before retrieval, and propagate them to outputs.

Useful questions include: Which approved procedure applies to this pump? What previous failures involved this component? What changed in the current revision? Which inspection evidence supports this recommendation? What did the last shift report? Answers must cite the actual document/page, show the governing revision, distinguish measured facts from proposed actions and abstain when evidence is absent or conflicting. Current application NLP is lexical source retrieval, not a generative plant RAG assistant.

Use structured database queries for production totals and calculations; use retrieval for narrative evidence; combine only after units, date filters, asset IDs and access are resolved. The reference Ask Volve project makes this distinction explicit.

## Report templates

1. **Shift operations**: period/timezone, wells/assets, volumes/rates/units, operating state, deferment, exceptions, handover actions and owner.
2. **IoT health**: last-good timestamp, freshness, missing sequence windows, bad-quality rate, calibration due date, edge queue depth and recovery status.
3. **Reliability and maintenance**: asset, work-order/failure history, verified downtime, model advisory/evidence, inspection recommendation, owner and approval.
4. **Integrity and corrosion**: measurement method/date/location, thickness history, uncertainty, approved assessment reference and disposition.
5. **HSE/PPE review**: coverage, observations, human-confirmed/dismissed outcomes, evidence availability, review time and task/zone context. No compliance percentage without a validated denominator.
6. **Environment and emissions**: boundary/period, measured-versus-estimated values, gas/units, method, source quality, uncertainty, reconciliation and review status.
7. **Digital-twin validation**: asset/model version, calibration data, synchronization lag, residual metrics, uncertainty and scenario assumptions.
8. **RAG answer audit**: question, resolved site/asset, retrieved source/revision/pages, permission outcome, answer/abstention, citations and reviewer feedback.
9. **Model monitoring**: dataset/model version, split, baseline comparison, class/condition coverage, error metrics, drift and promotion status.
10. **Executive dashboard**: approved operational KPIs with source periods, trends, open risks and assigned actions. Clearly separate verified results, estimates and experiments.

## Suggested delivery order

A. Historical well/production replay plus IoT-quality display using current Volve/environmental data.
B. Revision-aware document retrieval with selected official Volve reports and approved local manuals.
C. One small calibrated well/pump twin with explicit assumptions and residual reporting.
D. Department dashboards and report exports linked to actual source evidence.
E. Governed live telemetry integration and site validation before operational deployment.
