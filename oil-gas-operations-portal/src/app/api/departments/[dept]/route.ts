export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';

const DEPT_DATA: Record<string, {
  name: string; stream: string; team_size: number; reports_to: string;
  kpis: { label: string; value: string; unit: string }[];
  pain_points: { title: string; description: string; cost: string; priority: string }[];
  brd: { section: string; content: string; priority: string }[];
  use_cases: { name: string; ai_type: string; features: string; expected_output: string; status: string }[];
  data_sources: { name: string; type: string; columns: string; frequency: string }[];
}> = {
  'drilling-engineering': {
    name: 'Drilling Engineering',
    stream: 'upstream',
    team_size: 45,
    reports_to: 'VP Upstream Operations',
    kpis: [
      { label: 'NPT Rate', value: '12', unit: '%' },
      { label: 'ROP (ft/hr)', value: '85', unit: 'ft/hr' },
      { label: 'Wells Drilled YTD', value: '24', unit: 'wells' },
      { label: 'Cost per Foot', value: '320', unit: '$/ft' },
    ],
    pain_points: [
      { title: 'Stuck Pipe', description: 'Stuck pipe events cause NPT averaging $500K/day in lost rig time. Currently detected only after occurrence with no predictive capability.', cost: '$500K/day NPT', priority: 'critical' },
      { title: 'Bit Wear Detection', description: 'No real-time bit wear estimation; bit changes scheduled by hours/meters rather than actual condition leading to either premature change or PDC damage.', cost: '$80K per event', priority: 'high' },
      { title: 'Formation Kick Identification', description: 'Delayed identification of kicks increases well control risk; current method relies on manual pit gain monitoring.', cost: 'Safety critical', priority: 'critical' },
      { title: 'Hole Cleaning', description: 'Inefficient hole cleaning in highly deviated wells causes tight spots and pack-off events.', cost: '$150K/event', priority: 'high' },
      { title: 'Lost Circulation', description: 'Losses into natural/induced fractures cause mud cost overruns and formation damage.', cost: '$200K avg', priority: 'high' },
    ],
    brd: [
      { section: 'Objective', content: 'Reduce drilling NPT by 40% through AI-powered real-time monitoring and predictive analytics for stuck pipe, bit wear, and formation kick detection.', priority: 'must_have' },
      { section: 'Scope In', content: '1) Real-time drilling parameter monitoring (WOB, RPM, torque, ECD) 2) Stuck pipe prediction model 3) ROP optimization 4) Formation kick early warning 5) Bit wear estimation', priority: 'must_have' },
      { section: 'Scope Out', content: 'Well design optimization, casing design, cement evaluation — handled by Reservoir Engineering.', priority: 'must_have' },
      { section: 'Requirements', content: 'WITSML 1.4.1 data feed at 1Hz, latency <5s, integration with rig SCADA, mobile alert push to driller, historian integration for post-well analysis.', priority: 'must_have' },
      { section: 'Acceptance Criteria', content: 'Stuck pipe prediction AUC >0.85, NPT reduction measurable after 3-well trial, ROP improvement >8% verified vs baseline.', priority: 'must_have' },
    ],
    use_cases: [
      { name: 'Stuck Pipe Prediction', ai_type: 'ML', features: 'WOB, RPM, torque, drag, ECD, diff_pressure, ROP', expected_output: 'Binary risk score (0-1), alert if >0.75', status: 'planned' },
      { name: 'ROP Optimization', ai_type: 'ML', features: 'WOB, RPM, mud_weight, bit_size, formation_type, ECD', expected_output: 'Optimal WOB/RPM setpoints for max ROP', status: 'planned' },
      { name: 'Formation Kick Detection', ai_type: 'Statistical ML', features: 'pit_gain, flow_in, flow_out, SPP, ECD trend', expected_output: 'Kick confidence %, estimated influx volume', status: 'planned' },
      { name: 'Bit Wear Estimation', ai_type: 'ML', features: 'vibration_lateral, vibration_axial, torque_trend, delta_ROP', expected_output: 'Bit wear grade (0-8 IADC), recommended pull depth', status: 'planned' },
      { name: 'Drilling RAG Assistant', ai_type: 'Conversational AI', features: 'User query + drilling reports corpus', expected_output: 'Contextualized answer from well program, BHA records, mud logs', status: 'planned' },
    ],
    data_sources: [
      { name: 'Drilling Parameters (WITSML)', type: 'Real-time SCADA', columns: 'WOB, RPM, torque, hookload, ECD, SPP, flow_rate, ROP, bit_depth', frequency: '1 Hz' },
      { name: 'Well Logs', type: 'Kaggle: well-logs', columns: 'GR, RHOB, NPHI, DT, CALI, RT, depth, formation', frequency: 'Per-run LWD' },
      { name: 'Drilling Events Log', type: 'Manual / QDRILL', columns: 'event_type, depth, duration, cost, NPT_category, root_cause', frequency: 'Per-event' },
    ],
  },
  'pipeline-integrity': {
    name: 'Pipeline Integrity',
    stream: 'midstream',
    team_size: 38,
    reports_to: 'VP Midstream Operations',
    kpis: [
      { label: 'Pipeline Length (km)', value: '4,200', unit: 'km' },
      { label: 'ILI Coverage', value: '89', unit: '%' },
      { label: 'Corrosion Rate (mm/yr)', value: '0.32', unit: 'mm/yr' },
      { label: 'Unplanned Outages', value: '3', unit: 'YTD' },
    ],
    pain_points: [
      { title: 'Corrosion Under Insulation (CUI)', description: 'CUI is invisible without inspection. External corrosion on insulated pipelines goes undetected until failure.', cost: '$1.2M remediation avg', priority: 'critical' },
      { title: 'ILI Data Interpretation Backlog', description: 'ILI run generates terabytes of data; manual analysis takes 6-8 weeks creating regulatory compliance risk.', cost: '6-8 weeks delay', priority: 'high' },
      { title: 'Cathodic Protection Monitoring', description: 'Manual CP readings taken quarterly miss seasonal variations; impressed current failures undetected for months.', cost: 'Regulatory risk', priority: 'high' },
      { title: 'Third-Party Damage', description: 'Ground disturbance activities not coordinated with pipeline location; near-miss incidents from excavation damage.', cost: '$500K avg incident', priority: 'high' },
    ],
    brd: [
      { section: 'Objective', content: 'Reduce pipeline corrosion-related incidents by 60% through continuous monitoring, AI-assisted ILI interpretation, and predictive integrity management.', priority: 'must_have' },
      { section: 'Scope In', content: '1) Corrosion rate ML prediction from wall thickness trends 2) ILI feature classification (corrosion vs. dent vs. crack) 3) CP system anomaly detection 4) Third-party encroachment detection via vibration', priority: 'must_have' },
      { section: 'Requirements', content: 'ASME B31.8S compliance, integration with GIS for geospatial risk scoring, API 1160 reporting, P&ID integration.', priority: 'must_have' },
      { section: 'Acceptance Criteria', content: 'ILI interpretation time reduced from 6wks to 2wks, corrosion prediction MAPE <10%, zero missed critical defects in validation dataset.', priority: 'must_have' },
    ],
    use_cases: [
      { name: 'Corrosion Rate Prediction', ai_type: 'ML', features: 'wall_thickness_trend, operating_pressure, temperature, pH, flow_velocity, material_grade', expected_output: 'Predicted corrosion rate (mm/yr), remaining life (years)', status: 'planned' },
      { name: 'ILI Anomaly Classification', ai_type: 'ML', features: 'signal_amplitude, signal_width, clock_position, depth, length', expected_output: 'Defect type (corrosion/dent/crack/mill-spec), severity class', status: 'planned' },
      { name: 'Leak Detection via SCADA', ai_type: 'Statistical ML', features: 'inlet_flow, outlet_flow, pressure_gradient, temperature', expected_output: 'Leak probability, estimated location (km marker)', status: 'planned' },
      { name: 'Pipeline RAG Assistant', ai_type: 'Conversational AI', features: 'Query + pipeline inspection reports corpus', expected_output: 'Cited answers from inspection history, standards (ASME, API)', status: 'planned' },
    ],
    data_sources: [
      { name: 'ILI Inspection Data', type: 'Kaggle: pipeline-maintenance', columns: 'pipe_id, material, thickness_mm, time_years, pressure_psi, corrosion_pct, condition', frequency: '5-year ILI cycles' },
      { name: 'SCADA Flow/Pressure', type: 'Real-time SCADA', columns: 'timestamp, station_id, inlet_pressure, outlet_pressure, flow_rate, temperature', frequency: '1 min' },
    ],
  },
  'refinery-operations': {
    name: 'Refinery Operations',
    stream: 'downstream',
    team_size: 120,
    reports_to: 'VP Downstream Operations',
    kpis: [
      { label: 'Crude Throughput (bpd)', value: '95,000', unit: 'bpd' },
      { label: 'Nelson Complexity Index', value: '10.2', unit: 'NCI' },
      { label: 'Energy Intensity (MJ/bbl)', value: '312', unit: 'MJ/bbl' },
      { label: 'Utilization Rate', value: '92', unit: '%' },
    ],
    pain_points: [
      { title: 'FCC Catalyst Deactivation', description: 'Catalyst deactivation in FCC units not predicted; regeneration cycles scheduled by time not actual coke levels.', cost: '$2M/year over-processing', priority: 'critical' },
      { title: 'Crude Blend Optimization', description: 'Linear programming models run overnight; opportunity crudes cannot be evaluated in real-time causing missed margin.', cost: '$5M/year opportunity loss', priority: 'high' },
      { title: 'Furnace Fouling', description: 'Crude preheat train fouling reduces efficiency by 15%; no predictive cleaning schedule exists.', cost: '$1.5M/year', priority: 'high' },
    ],
    brd: [
      { section: 'Objective', content: 'Increase refinery margin by $3/bbl through AI-driven crude blend optimization, FCC regeneration prediction, and furnace fouling management.', priority: 'must_have' },
      { section: 'Scope In', content: '1) Crude blend LP real-time 2) FCC regeneration predictor 3) Preheat train fouling model 4) Distillation column optimization 5) Energy intensity forecasting', priority: 'must_have' },
      { section: 'Requirements', content: 'OSIsoft PI historian integration, AspenTech integration, real-time lab LIMS feed, ISO 14001 environmental limits as hard constraints.', priority: 'must_have' },
      { section: 'Acceptance Criteria', content: 'Blend LP convergence time <5min, FCC regeneration prediction MAPE <5%, energy intensity reduction >8%.', priority: 'must_have' },
    ],
    use_cases: [
      { name: 'Crude Blend LP Optimization', ai_type: 'Statistical ML', features: 'crude_assay, tank_inventory, unit_constraints, margin_targets', expected_output: 'Optimal blend ratio per crude type', status: 'planned' },
      { name: 'FCC Coke Burn Prediction', ai_type: 'ML', features: 'feed_rate, feed_CCR, riser_temp, reactor_dp, catalyst_activity', expected_output: 'Coke burn rate, regeneration start time', status: 'planned' },
      { name: 'Refinery Generative Reports', ai_type: 'Generative AI', features: 'Daily production KPIs, incident log', expected_output: 'Auto-generated shift report, management summary', status: 'planned' },
    ],
    data_sources: [
      { name: 'Historian (OSIsoft PI)', type: 'Real-time process historian', columns: 'tag_name, timestamp, value, quality, unit', frequency: '1-30 sec per tag' },
      { name: 'LIMS Lab Results', type: 'Laboratory LIMS', columns: 'sample_id, stream, property, value, method, datetime', frequency: 'Per-sample (4-8h)' },
    ],
  },
  'hse-safety': {
    name: 'HSE & Safety',
    stream: 'upstream',
    team_size: 28,
    reports_to: 'Chief HSE Officer',
    kpis: [
      { label: 'TRIR', value: '0.42', unit: 'per 200K hrs' },
      { label: 'Near Miss Reports', value: '156', unit: 'YTD' },
      { label: 'Safety Observations', value: '2,840', unit: 'YTD' },
      { label: 'Days Since Last LTI', value: '287', unit: 'days' },
    ],
    pain_points: [
      { title: 'PPE Compliance Detection', description: 'Manual PPE spot checks cover <5% of exposure hours. Non-compliance events go undetected in remote/unmanned areas.', cost: 'Regulatory + liability', priority: 'critical' },
      { title: 'Leading Indicator Identification', description: 'Safety teams analyze lagging indicators (incidents). Leading indicators (unsafe conditions, near-misses) not automatically extracted from reports.', cost: 'Lost prevention opportunity', priority: 'high' },
      { title: 'Permit-to-Work Compliance', description: 'PTW paperwork errors and missing simultaneous operations conflicts cause unsafe work conditions.', cost: 'Safety critical', priority: 'critical' },
    ],
    brd: [
      { section: 'Objective', content: 'Achieve zero LTI through AI-powered PPE detection, automated leading indicator analysis, and PTW conflict detection.', priority: 'must_have' },
      { section: 'Scope In', content: '1) PPE compliance CV model (hardhat/vest/gloves detection) 2) NLP extraction of leading indicators from safety observations 3) PTW conflict detection 4) AI-generated safety briefings', priority: 'must_have' },
      { section: 'Requirements', content: 'Integration with site CCTV, IVMS vehicle telematics, incident management system, PTW workflow system.', priority: 'must_have' },
      { section: 'Acceptance Criteria', content: 'PPE detection mAP >0.88, false positive rate <2%, safety briefing generation <30s, PTW conflict detection coverage 100% of simultaneous ops.', priority: 'must_have' },
    ],
    use_cases: [
      { name: 'PPE Compliance Detection', ai_type: 'AI', features: 'CCTV frame, worker region crop', expected_output: 'Binary per item: hardhat/vest/gloves/glasses present/absent + bounding box', status: 'planned' },
      { name: 'Safety Leading Indicator NLP', ai_type: 'ML', features: 'Safety observation text, near-miss description', expected_output: 'Incident category, risk factor tags, urgency score', status: 'planned' },
      { name: 'AI Safety Briefing Generator', ai_type: 'Generative AI', features: 'Last 7d incidents, weather, ongoing PTWs', expected_output: 'Structured daily safety brief with key risks and mitigations', status: 'planned' },
      { name: 'HSE RAG Assistant', ai_type: 'Conversational AI', features: 'Query + HSE standards corpus (ISO 45001, API RP 75)', expected_output: 'Cited procedure, checklist, regulatory requirement', status: 'planned' },
    ],
    data_sources: [
      { name: 'PPE Detection Images', type: 'Kaggle: ppe-images', columns: 'image_path, label (PPE/no_PPE), annotations', frequency: 'Per-frame (video)' },
      { name: 'Incident Database', type: 'Incident Management System', columns: 'incident_id, type, severity, location, root_cause, lessons_learned', frequency: 'Per-incident' },
    ],
  },
  'data-science-ai': {
    name: 'Data Science & AI',
    stream: 'cross-cutting',
    team_size: 22,
    reports_to: 'Chief Digital Officer',
    kpis: [
      { label: 'Models in Production', value: '18', unit: 'models' },
      { label: 'Models in Development', value: '12', unit: 'models' },
      { label: 'Avg Model Accuracy', value: '87', unit: '%' },
      { label: 'Data Pipelines Active', value: '34', unit: 'pipelines' },
    ],
    pain_points: [
      { title: 'Model Governance Gap', description: 'No centralized model registry. Models deployed without documented training data, version control, or performance monitoring.', cost: 'Regulatory and audit risk', priority: 'critical' },
      { title: 'Data Quality in Production', description: 'Sensor data arrives with missing values, drift, and label errors. Models degrade silently in production without drift detection.', cost: '15-25% accuracy loss over 6mo', priority: 'high' },
      { title: 'Explainability for Operations', description: 'Black-box model outputs rejected by operations teams. No explainability layer to show WHY a prediction was made.', cost: 'Model adoption <30%', priority: 'high' },
    ],
    brd: [
      { section: 'Objective', content: 'Build enterprise-grade AI governance: model registry, drift monitoring, explainability layer, and responsible AI framework for all 30+ O&G AI use cases.', priority: 'must_have' },
      { section: 'Scope In', content: '1) MLflow model registry 2) Feature store with lineage 3) SHAP-based explainability API 4) Bias audit framework 5) Model performance dashboards 6) RAG knowledge base', priority: 'must_have' },
      { section: 'Requirements', content: 'MLOps pipeline on Kubernetes, Ollama local LLM integration, ChromaDB vector store, PostgreSQL metadata store.', priority: 'must_have' },
      { section: 'Acceptance Criteria', content: '100% of production models in registry, drift alerts <24h latency, explainability available for all safety-critical models.', priority: 'must_have' },
    ],
    use_cases: [
      { name: 'Model Performance Monitoring', ai_type: 'Statistical ML', features: 'Prediction distribution, feature drift (KS test), label distribution', expected_output: 'Drift score, alert if PSI >0.2', status: 'planned' },
      { name: 'AutoML Pipeline', ai_type: 'ML', features: 'Feature matrix, target variable, dataset metadata', expected_output: 'Best model configuration, cross-val score, deployment package', status: 'planned' },
      { name: 'RAG Knowledge Search', ai_type: 'Conversational AI', features: 'Query + indexed O&G technical documents', expected_output: 'Relevant passages with source citation', status: 'planned' },
      { name: 'AI Governance Reporting', ai_type: 'Generative AI', features: 'Model registry, audit logs, fairness metrics', expected_output: 'Auto-generated AI governance report for regulatory submission', status: 'planned' },
    ],
    data_sources: [
      { name: 'All Kaggle Datasets', type: 'Kaggle multi-domain', columns: 'Cross-domain: sensor, maintenance, pipeline, production, environmental', frequency: 'Static + periodic refresh' },
      { name: 'Model Telemetry', type: 'MLflow / internal', columns: 'model_id, version, prediction, confidence, input_features, timestamp', frequency: 'Per-prediction' },
    ],
  },
};

// Default template for other departments
function buildDefaultDept(slug: string) {
  const nameMap: Record<string, { name: string; stream: string }> = {
    'exploration-geology': { name: 'Exploration & Geology', stream: 'upstream' },
    'reservoir-engineering': { name: 'Reservoir Engineering', stream: 'upstream' },
    'production-engineering': { name: 'Production Engineering', stream: 'upstream' },
    'well-completion': { name: 'Well Completion', stream: 'upstream' },
    'well-integrity': { name: 'Well Integrity', stream: 'upstream' },
    'pipeline-operations': { name: 'Pipeline Operations', stream: 'midstream' },
    'compression': { name: 'Compression Management', stream: 'midstream' },
    'gas-processing': { name: 'Gas Processing', stream: 'midstream' },
    'storage': { name: 'Storage Operations', stream: 'midstream' },
    'scada-control': { name: 'SCADA & Control', stream: 'midstream' },
    'metering': { name: 'Custody Transfer Metering', stream: 'midstream' },
    'process-engineering': { name: 'Process Engineering', stream: 'downstream' },
    'product-quality': { name: 'Product Quality', stream: 'downstream' },
    'maintenance': { name: 'Maintenance', stream: 'downstream' },
    'distribution': { name: 'Distribution & Logistics', stream: 'downstream' },
    'commercial-trading': { name: 'Commercial & Trading', stream: 'downstream' },
    'environmental': { name: 'Environmental Compliance', stream: 'downstream' },
    'procurement': { name: 'Procurement', stream: 'cross-cutting' },
    'it-digital': { name: 'IT & Digital', stream: 'cross-cutting' },
  };
  const meta = nameMap[slug] || { name: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), stream: 'cross-cutting' };
  return {
    name: meta.name,
    stream: meta.stream,
    team_size: 20 + Math.floor(Math.random() * 60),
    reports_to: 'Operations Director',
    kpis: [
      { label: 'Efficiency Score', value: '82', unit: '%' },
      { label: 'Open Work Orders', value: '14', unit: 'WOs' },
      { label: 'Cost YTD vs Budget', value: '-3.2', unit: '%' },
    ],
    pain_points: [
      { title: 'Manual Process Overhead', description: `${meta.name} currently relies on manual data collection and reporting, consuming 30% of team capacity on non-value activities.`, cost: '30% team capacity', priority: 'high' },
      { title: 'Data Silos', description: 'Information fragmented across multiple systems (SAP, PI, spreadsheets) with no unified view.', cost: 'Decision delay 24-48h', priority: 'high' },
    ],
    brd: [
      { section: 'Objective', content: `Improve ${meta.name} operational efficiency by 25% through integrated AI-powered monitoring and automation.`, priority: 'must_have' },
      { section: 'Scope In', content: 'Real-time KPI dashboards, AI-powered anomaly detection, automated reporting, RAG knowledge assistant.', priority: 'must_have' },
      { section: 'Acceptance Criteria', content: 'KPI refresh <5min, anomaly detection precision >80%, report generation <2min.', priority: 'must_have' },
    ],
    use_cases: [
      { name: 'Anomaly Detection', ai_type: 'Statistical ML', features: 'Operating parameters, historical baselines', expected_output: 'Anomaly score, severity, recommended action', status: 'planned' },
      { name: 'RAG Knowledge Assistant', ai_type: 'Conversational AI', features: 'Technical query + procedures corpus', expected_output: 'Cited procedure, standard, or best practice', status: 'planned' },
      { name: 'Automated Report Generation', ai_type: 'Generative AI', features: 'KPIs, incident log, maintenance records', expected_output: 'Formatted management report', status: 'planned' },
    ],
    data_sources: [
      { name: 'Operational Historian', type: 'SCADA/PI', columns: 'tag, timestamp, value, quality', frequency: '1-60 min' },
      { name: 'Maintenance Records', type: 'CMMS (SAP PM)', columns: 'work_order, equipment, failure_mode, action_taken, cost', frequency: 'Per-WO' },
    ],
  };
}

export async function GET(req: Request, { params }: { params: { dept: string } }) {
  const { dept } = params;
  const deptData = DEPT_DATA[dept] ?? buildDefaultDept(dept);

  try {
    // Try to enrich from DB if available
    const ucResult = await pool.query(
      'SELECT * FROM ogo_dept_use_case WHERE dept_slug = $1 ORDER BY id',
      [dept]
    ).catch(() => ({ rows: [] as Record<string, unknown>[] }));

    const brdResult = await pool.query(
      'SELECT * FROM ogo_dept_brd WHERE dept_slug = $1 ORDER BY id',
      [dept]
    ).catch(() => ({ rows: [] as Record<string, unknown>[] }));

    return Response.json({
      dept,
      ...deptData,
      db_use_cases: ucResult.rows,
      db_brd: brdResult.rows,
    });
  } catch {
    return Response.json({ dept, ...deptData, db_use_cases: [], db_brd: [] });
  }
}
