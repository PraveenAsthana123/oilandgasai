import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const TABLES = [
  `CREATE TABLE IF NOT EXISTS oga_user (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE,
    name TEXT,
    role TEXT DEFAULT 'viewer',
    mfa_enabled BOOL DEFAULT false,
    last_login TIMESTAMPTZ,
    active BOOL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS oga_role (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE,
    permissions JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS oga_audit_log (
    id SERIAL PRIMARY KEY,
    user_id TEXT,
    action TEXT,
    module TEXT,
    record_type TEXT,
    record_id TEXT,
    details JSONB,
    ip TEXT,
    ts TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS oga_feature_flag (
    id SERIAL PRIMARY KEY,
    feature_name TEXT UNIQUE,
    enabled BOOL DEFAULT true,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS oga_incident (
    id SERIAL PRIMARY KEY,
    incident_type TEXT,
    stream TEXT,
    location TEXT,
    severity TEXT,
    status TEXT DEFAULT 'open',
    hours_worked NUMERIC,
    reported_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
  )`,
  `CREATE TABLE IF NOT EXISTS oga_permit (
    id SERIAL PRIMARY KEY,
    permit_type TEXT,
    regulator TEXT,
    permit_number TEXT,
    asset TEXT,
    valid_from DATE,
    valid_to DATE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS oga_compliance (
    id SERIAL PRIMARY KEY,
    regulator TEXT,
    requirement TEXT,
    status TEXT DEFAULT 'pending',
    last_checked TIMESTAMPTZ,
    next_due TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS oga_ai_model (
    id SERIAL PRIMARY KEY,
    model_name TEXT,
    purpose TEXT,
    ai_type TEXT,
    version TEXT,
    accuracy NUMERIC,
    data_drift_pct NUMERIC DEFAULT 0,
    approval_status TEXT DEFAULT 'pending',
    owner TEXT,
    last_validated TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS oga_integration (
    id SERIAL PRIMARY KEY,
    service_name TEXT,
    service_type TEXT,
    status TEXT DEFAULT 'disconnected',
    last_connected TIMESTAMPTZ,
    error_log JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS oga_support_ticket (
    id SERIAL PRIMARY KEY,
    user_id TEXT,
    subject TEXT,
    body TEXT,
    status TEXT DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS oga_session (
    id SERIAL PRIMARY KEY,
    user_id TEXT,
    user_name TEXT,
    user_role TEXT,
    current_page TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_active TIMESTAMPTZ DEFAULT NOW(),
    ip TEXT,
    active BOOL DEFAULT true
  )`,
  `CREATE TABLE IF NOT EXISTS oga_approval (
    id SERIAL PRIMARY KEY,
    approval_type TEXT,
    requested_by TEXT,
    description TEXT,
    payload JSONB,
    status TEXT DEFAULT 'pending',
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS oga_inspection (
    id SERIAL PRIMARY KEY,
    inspection_type TEXT,
    location TEXT,
    scheduled_date DATE,
    completed_date DATE,
    inspector TEXT,
    status TEXT DEFAULT 'scheduled',
    findings TEXT,
    corrective_actions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS oga_ems_record (
    id SERIAL PRIMARY KEY,
    record_type TEXT,
    category TEXT,
    value NUMERIC,
    unit TEXT,
    quota NUMERIC,
    period_start DATE,
    period_end DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS oga_standard (
    id SERIAL PRIMARY KEY,
    standard_name TEXT,
    standard_code TEXT,
    category TEXT,
    version TEXT,
    effective_date DATE,
    description TEXT,
    document_url TEXT,
    acknowledgment_required BOOL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS oga_ai_risk (
    id SERIAL PRIMARY KEY,
    model_id INTEGER,
    risk_type TEXT,
    description TEXT,
    severity TEXT DEFAULT 'medium',
    mitigation TEXT,
    status TEXT DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS oga_data_classification (
    id SERIAL PRIMARY KEY,
    asset_type TEXT,
    classification TEXT,
    data_owner TEXT,
    retention_days INTEGER,
    pipeda_applicable BOOL DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS oga_lead (
    id SERIAL PRIMARY KEY,
    company_name TEXT,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    status TEXT DEFAULT 'new',
    value NUMERIC,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS oga_opportunity (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER,
    title TEXT,
    stage TEXT DEFAULT 'discovery',
    value NUMERIC,
    probability INTEGER DEFAULT 50,
    close_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS oga_quote (
    id SERIAL PRIMARY KEY,
    opportunity_id INTEGER,
    quote_number TEXT,
    total_value NUMERIC,
    status TEXT DEFAULT 'draft',
    valid_until DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS oga_activity (
    id SERIAL PRIMARY KEY,
    activity_type TEXT,
    subject TEXT,
    related_to TEXT,
    related_id INTEGER,
    assigned_to TEXT,
    due_date DATE,
    completed BOOL DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`
];

async function seedData() {
  // Feature flags
  const flags = [
    { name: 'upstream', desc: 'Upstream operations module' },
    { name: 'midstream', desc: 'Midstream pipeline module' },
    { name: 'downstream', desc: 'Downstream refinery module' },
    { name: 'ai_models', desc: 'AI/ML models integration' },
    { name: 'digital_twin', desc: 'Digital twin simulation' },
    { name: 'rag', desc: 'RAG knowledge retrieval' },
    { name: 'regulatory', desc: 'Regulatory compliance module' },
    { name: 'safety', desc: 'Safety incident management' },
  ];
  for (const f of flags) {
    await query(
      `INSERT INTO oga_feature_flag (feature_name, enabled, description) VALUES ($1, true, $2) ON CONFLICT (feature_name) DO NOTHING`,
      [f.name, f.desc]
    );
  }

  // Compliance records
  const compliance = [
    { reg: 'CER', req: 'Pipeline Safety Regulations', status: 'compliant', next_due: '2025-03-01' },
    { reg: 'CER', req: 'NEB Act Compliance', status: 'compliant', next_due: '2025-06-15' },
    { reg: 'AER', req: 'Directive 060 Production Accounting', status: 'attention_required', next_due: '2025-01-15' },
    { reg: 'AER', req: 'Directive 083 Climate Change', status: 'compliant', next_due: '2025-04-30' },
    { reg: 'AER', req: 'Well License Compliance', status: 'compliant', next_due: '2025-02-28' },
    { reg: 'ECCC', req: 'GHGRP Emissions Reporting', status: 'compliant', next_due: '2025-06-01' },
    { reg: 'ECCC', req: 'Carbon Price Compliance', status: 'non_compliant', next_due: '2025-01-01' },
    { reg: 'ECCC', req: 'Clean Fuel Standard', status: 'compliant', next_due: '2025-12-31' },
    { reg: 'CAPP', req: 'Responsible Development Metrics', status: 'compliant', next_due: '2025-12-31' },
    { reg: 'OSHA', req: 'Safety Statistics Reporting', status: 'compliant', next_due: '2025-02-15' },
    { reg: 'OSHA', req: 'Hazard Communication Standard', status: 'attention_required', next_due: '2025-03-31' },
    { reg: 'OGC', req: 'BC Oil and Gas Activities Act', status: 'compliant', next_due: '2025-09-30' },
  ];
  for (const c of compliance) {
    await query(
      `INSERT INTO oga_compliance (regulator, requirement, status, last_checked, next_due) VALUES ($1,$2,$3,NOW(),$4) ON CONFLICT DO NOTHING`,
      [c.reg, c.req, c.status, c.next_due]
    );
  }

  // AI Models
  const models = [
    { name: 'PPE Detector', purpose: 'Personal Protective Equipment detection from camera feeds', type: 'Computer Vision', version: '2.1.0', accuracy: 94.5, drift: 1.2, status: 'approved', owner: 'Safety Dept' },
    { name: 'Corrosion Classifier', purpose: 'Classify corrosion severity from pipeline inspection images', type: 'Computer Vision', version: '1.3.2', accuracy: 91.8, drift: 2.8, status: 'approved', owner: 'Integrity Dept' },
    { name: 'Compressor Anomaly Detector', purpose: 'Detect anomalous compressor vibration patterns', type: 'Time-Series Anomaly', version: '3.0.1', accuracy: 88.3, drift: 4.1, status: 'approved', owner: 'Operations' },
    { name: 'Production Forecaster', purpose: 'Forecast well production rates using decline curve analysis', type: 'Regression/Forecast', version: '1.8.0', accuracy: 86.7, drift: 3.5, status: 'approved', owner: 'Reservoir Eng' },
    { name: 'Leak Detector', purpose: 'Detect pipeline leaks from pressure/flow sensor anomalies', type: 'Anomaly Detection', version: '2.4.0', accuracy: 97.2, drift: 0.8, status: 'approved', owner: 'Pipeline Ops' },
    { name: 'Crude Blending Optimizer', purpose: 'Optimize crude blend ratios for refinery throughput', type: 'Optimization ML', version: '1.1.0', accuracy: 89.4, drift: 5.2, status: 'pending', owner: 'Downstream Ops' },
    { name: 'Seismic Interpreter', purpose: 'Auto-interpret seismic data for reservoir characterization', type: 'Deep Learning', version: '0.9.0', accuracy: 82.1, drift: 7.3, status: 'pending', owner: 'Geoscience' },
    { name: 'SCADA Anomaly Detector', purpose: 'Detect SCADA control system anomalies and cyber threats', type: 'Anomaly Detection', version: '2.0.3', accuracy: 95.6, drift: 1.1, status: 'approved', owner: 'SCADA Ops' },
    { name: 'Pipeline Integrity Predictor', purpose: 'Predict pipeline integrity risk from ILI inspection data', type: 'Predictive Analytics', version: '1.6.1', accuracy: 90.2, drift: 2.4, status: 'approved', owner: 'Pipeline Integrity' },
    { name: 'Flare Analyzer', purpose: 'Analyze flare combustion efficiency and GHG emissions', type: 'Computer Vision', version: '1.2.0', accuracy: 87.9, drift: 3.8, status: 'pending', owner: 'Environmental' },
  ];
  for (const m of models) {
    await query(
      `INSERT INTO oga_ai_model (model_name, purpose, ai_type, version, accuracy, data_drift_pct, approval_status, owner, last_validated) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW()-INTERVAL '30 days') ON CONFLICT DO NOTHING`,
      [m.name, m.purpose, m.type, m.version, m.accuracy, m.drift, m.status, m.owner]
    );
  }

  // Integrations
  const integrations = [
    { name: 'OSIsoft PI Historian', type: 'Historian', status: 'connected' },
    { name: 'SAP ERP', type: 'ERP', status: 'connected' },
    { name: 'SCADA Broker (MQTT)', type: 'IoT Broker', status: 'connected' },
    { name: 'Lab LIMS (LabVantage)', type: 'LIMS', status: 'disconnected' },
    { name: 'Esri ArcGIS', type: 'GIS', status: 'connected' },
    { name: 'ChromaDB Vector Store', type: 'Vector DB', status: 'disconnected' },
    { name: 'Ollama LLM', type: 'AI Runtime', status: 'connected' },
    { name: 'SMTP (Nodemailer)', type: 'Email', status: 'disconnected' },
  ];
  for (const i of integrations) {
    await query(
      `INSERT INTO oga_integration (service_name, service_type, status, last_connected) VALUES ($1,$2,$3,NOW()-INTERVAL '1 hour') ON CONFLICT DO NOTHING`,
      [i.name, i.type, i.status]
    );
  }

  // Seed users
  const users = [
    { email: 'admin@oilgas.com', name: 'Sarah Mitchell', role: 'admin' },
    { email: 'ops@oilgas.com', name: 'James Petrova', role: 'operator' },
    { email: 'analyst@oilgas.com', name: 'Emily Chen', role: 'analyst' },
    { email: 'safety@oilgas.com', name: 'Marcus Wilson', role: 'safety_officer' },
    { email: 'viewer@oilgas.com', name: 'Tom Baker', role: 'viewer' },
  ];
  for (const u of users) {
    await query(
      `INSERT INTO oga_user (email, name, role, mfa_enabled, last_login, active) VALUES ($1,$2,$3,true,NOW()-INTERVAL '2 hours',true) ON CONFLICT (email) DO NOTHING`,
      [u.email, u.name, u.role]
    );
  }

  // Seed roles
  const roles = [
    { name: 'admin', permissions: { users: ['read','write','delete'], compliance: ['read','write'], incidents: ['read','write','approve'], ai_models: ['read','write','deploy'], audit: ['read'], settings: ['read','write'] } },
    { name: 'operator', permissions: { compliance: ['read'], incidents: ['read','write'], permits: ['read'], integrations: ['read'] } },
    { name: 'analyst', permissions: { compliance: ['read'], incidents: ['read'], ai_models: ['read'], reports: ['read','write'] } },
    { name: 'safety_officer', permissions: { incidents: ['read','write','approve'], inspections: ['read','write'], permits: ['read'], compliance: ['read','write'] } },
    { name: 'viewer', permissions: { compliance: ['read'], incidents: ['read'], reports: ['read'] } },
  ];
  for (const r of roles) {
    await query(
      `INSERT INTO oga_role (name, permissions) VALUES ($1,$2) ON CONFLICT (name) DO NOTHING`,
      [r.name, JSON.stringify(r.permissions)]
    );
  }

  // Seed incidents
  const incidents = [
    { type: 'near_miss', stream: 'upstream', location: 'Wellpad A-12', severity: 'low', hours: 45000 },
    { type: 'recordable', stream: 'midstream', location: 'Compressor Station 3', severity: 'medium', hours: 120000 },
    { type: 'near_miss', stream: 'downstream', location: 'Refinery Unit 2', severity: 'low', hours: 89000 },
    { type: 'lti', stream: 'upstream', location: 'Drilling Rig 7', severity: 'high', hours: 200000 },
    { type: 'near_miss', stream: 'midstream', location: 'Pipeline KP 145', severity: 'low', hours: 67000 },
  ];
  for (const i of incidents) {
    await query(
      `INSERT INTO oga_incident (incident_type, stream, location, severity, status, hours_worked) VALUES ($1,$2,$3,$4,'open',$5)`,
      [i.type, i.stream, i.location, i.severity, i.hours]
    );
  }

  // Seed permits
  const permits = [
    { type: 'drilling_permit', reg: 'AER', num: 'AER-DP-2024-0451', asset: 'Well 12-34-05', from: '2024-01-15', to: '2025-01-14' },
    { type: 'operating_license', reg: 'CER', num: 'CER-OL-2023-0892', asset: 'Pipeline Segment A', from: '2023-06-01', to: '2026-05-31' },
    { type: 'environmental_approval', reg: 'ECCC', num: 'ECCC-EA-2024-0117', asset: 'Processing Plant 1', from: '2024-03-01', to: '2026-02-28' },
    { type: 'safety_certification', reg: 'OSHA', num: 'OHS-SC-2024-0223', asset: 'Compressor Station 3', from: '2024-02-15', to: '2025-02-14' },
  ];
  for (const p of permits) {
    await query(
      `INSERT INTO oga_permit (permit_type, regulator, permit_number, asset, valid_from, valid_to, status) VALUES ($1,$2,$3,$4,$5,$6,'active') ON CONFLICT DO NOTHING`,
      [p.type, p.reg, p.num, p.asset, p.from, p.to]
    );
  }

  // Seed approvals
  const approvals = [
    { type: 'price_discount', by: 'sales@oilgas.com', desc: 'Request 15% discount for Q4 contract with EnergyCorp' },
    { type: 'ai_model_deploy', by: 'analyst@oilgas.com', desc: 'Deploy Crude Blending Optimizer v1.1.0 to production' },
    { type: 'role_escalation', by: 'viewer@oilgas.com', desc: 'Request upgrade to analyst role for project work' },
    { type: 'contract_change', by: 'ops@oilgas.com', desc: 'Amend pipeline transport agreement to extend term by 2 years' },
  ];
  for (const a of approvals) {
    await query(
      `INSERT INTO oga_approval (approval_type, requested_by, description, status) VALUES ($1,$2,$3,'pending')`,
      [a.type, a.by, a.desc]
    );
  }

  // Seed inspections
  const inspections = [
    { type: 'pipeline_integrity', loc: 'Pipeline Segment A KP 0-50', scheduled: '2025-01-20', inspector: 'J. Thompson', status: 'scheduled' },
    { type: 'safety_audit', loc: 'Compressor Station 3', scheduled: '2025-01-10', inspector: 'M. Wilson', status: 'overdue' },
    { type: 'environmental', loc: 'Processing Plant 1', scheduled: '2025-02-05', inspector: 'L. Green', status: 'scheduled' },
    { type: 'electrical', loc: 'Wellpad A-12', scheduled: '2024-12-15', completed: '2024-12-15', inspector: 'R. Patel', status: 'completed', findings: 'Minor grounding issue found. Corrective action completed.' },
  ];
  for (const i of inspections) {
    await query(
      `INSERT INTO oga_inspection (inspection_type, location, scheduled_date, completed_date, inspector, status, findings) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [i.type, i.loc, i.scheduled, (i as { completed?: string }).completed ?? null, i.inspector, i.status, (i as { findings?: string }).findings ?? null]
    );
  }

  // Seed EMS records
  const ems = [
    { type: 'ghg_emission', cat: 'CO2', value: 45000, unit: 'tonnes CO2e', quota: 50000, start: '2024-01-01', end: '2024-12-31' },
    { type: 'ghg_emission', cat: 'CH4', value: 1200, unit: 'tonnes CO2e', quota: 1000, start: '2024-01-01', end: '2024-12-31' },
    { type: 'water_usage', cat: 'Freshwater', value: 3200, unit: 'm³/day', quota: 4000, start: '2024-01-01', end: '2024-12-31' },
    { type: 'waste', cat: 'Hazardous Waste', value: 85, unit: 'tonnes', quota: 100, start: '2024-01-01', end: '2024-12-31' },
    { type: 'spill', cat: 'Hydrocarbon Spill', value: 2, unit: 'incidents', quota: 0, start: '2024-01-01', end: '2024-12-31' },
  ];
  for (const e of ems) {
    await query(
      `INSERT INTO oga_ems_record (record_type, category, value, unit, quota, period_start, period_end) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [e.type, e.cat, e.value, e.unit, e.quota, e.start, e.end]
    );
  }

  // Seed standards
  const standards = [
    { name: 'Asset Management', code: 'ISO 55001', cat: 'International', ver: '2014', date: '2014-01-15' },
    { name: 'Pressure Vessel Inspection', code: 'API RP 574', cat: 'Industry', ver: '4th Ed', date: '2016-05-01' },
    { name: 'Oil and Gas Pipeline Systems', code: 'Z662-19', cat: 'Canadian', ver: '2019', date: '2019-07-01' },
    { name: 'Aboveground Storage Tanks', code: 'API 653', cat: 'Industry', ver: '5th Ed', date: '2014-11-01' },
    { name: 'Process Hazard Analysis', code: 'API RP 14C', cat: 'Industry', ver: '8th Ed', date: '2017-08-01' },
  ];
  for (const s of standards) {
    await query(
      `INSERT INTO oga_standard (standard_name, standard_code, category, version, effective_date) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`,
      [s.name, s.code, s.cat, s.ver, s.date]
    );
  }

  // Seed data classifications
  const dataClasses = [
    { asset: 'Well Production Data', cls: 'confidential', owner: 'Reservoir Engineering', days: 2555, pipeda: false },
    { asset: 'Employee Records', cls: 'restricted', owner: 'HR', days: 2555, pipeda: true },
    { asset: 'Safety Incident Reports', cls: 'internal', owner: 'Safety', days: 3650, pipeda: false },
    { asset: 'Financial Reports', cls: 'confidential', owner: 'Finance', days: 2555, pipeda: false },
    { asset: 'Environmental Data', cls: 'internal', owner: 'Environmental', days: 3650, pipeda: false },
    { asset: 'Customer Contracts', cls: 'confidential', owner: 'Legal', days: 3650, pipeda: true },
  ];
  for (const d of dataClasses) {
    await query(
      `INSERT INTO oga_data_classification (asset_type, classification, data_owner, retention_days, pipeda_applicable) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`,
      [d.asset, d.cls, d.owner, d.days, d.pipeda]
    );
  }

  // Seed sessions
  await query(`INSERT INTO oga_session (user_id, user_name, user_role, current_page, started_at, last_active, ip, active) VALUES
    ('1','Sarah Mitchell','admin','/regulatory',NOW()-INTERVAL '45 minutes',NOW()-INTERVAL '2 minutes','192.168.1.101',true),
    ('2','James Petrova','operator','/incidents',NOW()-INTERVAL '2 hours',NOW()-INTERVAL '10 minutes','192.168.1.102',true),
    ('3','Emily Chen','analyst','/ai-governance',NOW()-INTERVAL '30 minutes',NOW()-INTERVAL '1 minute','192.168.1.103',true)
    ON CONFLICT DO NOTHING`);

  // Seed AI risks
  await query(`INSERT INTO oga_ai_risk (model_id, risk_type, description, severity, mitigation, status) VALUES
    (1,'bias','PPE detection accuracy varies by skin tone and lighting conditions','high','Retrain with diverse dataset, add demographic parity monitoring','open'),
    (3,'safety_critical','Compressor anomaly detector may miss novel failure modes not in training data','high','Human review required for all alerts above threshold 0.85','open'),
    (5,'data_quality','Leak detector relies on sensor calibration; sensor drift degrades accuracy','medium','Monthly sensor calibration check, drift alerting','mitigated'),
    (7,'explainability','Seismic interpreter decisions not explainable to geoscientists','medium','Implement SHAP/LIME explanations, add confidence scores','in_progress')
    ON CONFLICT DO NOTHING`);

  // Seed leads and sales data
  await query(`INSERT INTO oga_lead (company_name, contact_name, email, phone, status, value, notes) VALUES
    ('Suncor Energy','David Park','d.park@suncor.com','+1-403-555-0101','qualified',250000,'Interest in AI safety monitoring suite'),
    ('Imperial Oil','Jennifer Walsh','j.walsh@imperial.com','+1-780-555-0202','new',180000,'Regulatory compliance automation inquiry'),
    ('TC Energy','Robert Kim','r.kim@tcenergy.com','+1-403-555-0303','negotiation',420000,'Pipeline integrity AI platform'),
    ('Pembina Pipeline','Lisa Torres','l.torres@pembina.com','+1-403-555-0404','proposal',95000,'Environmental monitoring dashboard')
    ON CONFLICT DO NOTHING`);

  await query(`INSERT INTO oga_activity (activity_type, subject, related_to, related_id, assigned_to, due_date, completed) VALUES
    ('call','Discovery call for AI safety suite','lead',1,'Sarah Mitchell','2025-01-15',false),
    ('email','Send compliance demo materials','lead',2,'Emily Chen','2025-01-10',false),
    ('meeting','Contract negotiation meeting','lead',3,'James Petrova','2025-01-20',false)
    ON CONFLICT DO NOTHING`);

  // Audit log seed
  await query(`INSERT INTO oga_audit_log (user_id, action, module, record_type, record_id, details, ip) VALUES
    ('admin@oilgas.com','LOGIN','auth','session','1','{}','192.168.1.101'),
    ('admin@oilgas.com','VIEW','compliance','regulator','CER','{}','192.168.1.101'),
    ('ops@oilgas.com','CREATE','incidents','incident','5','{"type":"near_miss"}','192.168.1.102'),
    ('analyst@oilgas.com','VIEW','ai-governance','model','5','{}','192.168.1.103'),
    ('safety@oilgas.com','UPDATE','inspections','inspection','2','{"status":"overdue"}','192.168.1.104')
    ON CONFLICT DO NOTHING`);
}

export async function GET() {
  try {
    for (const sql of TABLES) {
      await query(sql);
    }
    await seedData();
    return NextResponse.json({ ok: true, message: 'Tables created and seeded successfully', tables: TABLES.length });
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function POST() {
  return GET();
}
