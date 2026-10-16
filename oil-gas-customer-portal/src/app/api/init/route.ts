export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS ogcu_customer (
  id SERIAL PRIMARY KEY,
  company TEXT,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  billing_address TEXT,
  payment_method TEXT DEFAULT 'bank_transfer',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ogcu_contract (
  id SERIAL PRIMARY KEY,
  customer_id INT,
  contract_type TEXT,
  product TEXT,
  volume_annual NUMERIC,
  price_cad NUMERIC,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ogcu_delivery (
  id SERIAL PRIMARY KEY,
  customer_id INT,
  product TEXT,
  volume NUMERIC,
  unit TEXT,
  delivery_date DATE,
  status TEXT DEFAULT 'scheduled',
  certificate_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ogcu_invoice (
  id SERIAL PRIMARY KEY,
  customer_id INT,
  delivery_id INT,
  amount_cad NUMERIC,
  hst_cad NUMERIC,
  total_cad NUMERIC,
  due_date DATE,
  status TEXT DEFAULT 'outstanding',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ogcu_quality_cert (
  id SERIAL PRIMARY KEY,
  delivery_id INT,
  product TEXT,
  api_gravity NUMERIC,
  sulphur_pct NUMERIC,
  btu_content NUMERIC,
  h2s_ppm NUMERIC,
  water_pct NUMERIC,
  spec_status TEXT DEFAULT 'within_spec',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ogcu_service_request (
  id SERIAL PRIMARY KEY,
  customer_id INT,
  request_type TEXT,
  subject TEXT,
  description TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ogcu_support_ticket (
  id SERIAL PRIMARY KEY,
  customer_id INT,
  subject TEXT,
  body TEXT,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ogcu_notification_pref (
  id SERIAL PRIMARY KEY,
  customer_id INT,
  event_type TEXT,
  email BOOL DEFAULT true,
  sms BOOL DEFAULT false,
  in_app BOOL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ogcu_role (
  id SERIAL PRIMARY KEY,
  name TEXT,
  permissions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ogcu_audit_log (
  id SERIAL PRIMARY KEY,
  user_id TEXT,
  action TEXT,
  record_type TEXT,
  record_id TEXT,
  details JSONB,
  ts TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ogcu_lead (
  id SERIAL PRIMARY KEY,
  name TEXT,
  company TEXT,
  email TEXT,
  source TEXT,
  score INT DEFAULT 0,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ogcu_opportunity (
  id SERIAL PRIMARY KEY,
  title TEXT,
  value NUMERIC,
  stage TEXT DEFAULT 'prospect',
  probability INT DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ogcu_document (
  id SERIAL PRIMARY KEY,
  customer_id INT,
  name TEXT,
  doc_type TEXT,
  url TEXT,
  uploaded_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ogcu_payment_intent (
  id SERIAL PRIMARY KEY,
  invoice_id INT,
  customer_id INT,
  amount_cad NUMERIC,
  method TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ogcu_feature_flag (
  id SERIAL PRIMARY KEY,
  flag_name TEXT UNIQUE,
  enabled BOOL DEFAULT true,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ogcu_asset_monitoring (
  id SERIAL PRIMARY KEY,
  customer_id INT,
  asset_type TEXT,
  asset_name TEXT,
  health_score INT DEFAULT 85,
  alert_count INT DEFAULT 0,
  last_scan TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'operational',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
`;

async function seedData() {
  const custCheck = await pool.query('SELECT COUNT(*) FROM ogcu_customer');
  if (parseInt(custCheck.rows[0].count) > 0) return { seeded: false, reason: 'already_seeded' };

  // Customers
  await pool.query(`
    INSERT INTO ogcu_customer (company, contact_name, email, phone, billing_address, payment_method) VALUES
    ('Suncor Energy Inc.', 'James Whitfield', 'j.whitfield@suncor-demo.ca', '+1-403-555-0100', '150 6th Ave SW, Calgary, AB T2P 3Y7', 'wire'),
    ('Imperial Oil Ltd.', 'Sandra Kowalski', 's.kowalski@imperialoil-demo.ca', '+1-780-555-0200', '505 Quarry Park Blvd SE, Calgary, AB T2C 5N1', 'ach'),
    ('Canadian Natural Resources', 'Raj Mehta', 'r.mehta@cnr-demo.ca', '+1-403-555-0300', '2100 855 2nd St SW, Calgary, AB T2P 4J8', 'bank_transfer')
  `);

  const custs = await pool.query('SELECT id FROM ogcu_customer ORDER BY id');
  const [c1, c2, c3] = custs.rows.map((r: { id: number }) => r.id);

  // Contracts
  await pool.query(`
    INSERT INTO ogcu_contract (customer_id, contract_type, product, volume_annual, price_cad, start_date, end_date, status) VALUES
    (${c1}, 'MSA', 'Light Sweet Crude', 500000, 98.50, '2024-01-01', '2026-12-31', 'active'),
    (${c1}, 'Supply Agreement', 'Natural Gas', 1200000, 4.85, '2024-06-01', '2025-05-31', 'active'),
    (${c2}, 'Service Contract', 'Pipeline Transport', 300000, 2.10, '2024-03-01', '2025-02-28', 'active'),
    (${c2}, 'MSA', 'Heavy Oil Blend', 750000, 72.30, '2023-07-01', '2025-06-30', 'active'),
    (${c3}, 'Supply Agreement', 'Premium Diesel', 200000, 1.89, '2025-01-01', '2025-12-31', 'active')
  `);

  // Deliveries
  await pool.query(`
    INSERT INTO ogcu_delivery (customer_id, product, volume, unit, delivery_date, status) VALUES
    (${c1}, 'Light Sweet Crude', 25000, 'bbl', CURRENT_DATE - 2, 'delivered'),
    (${c1}, 'Natural Gas', 50000, 'GJ', CURRENT_DATE + 5, 'scheduled'),
    (${c2}, 'Pipeline Transport', 15000, 'bbl', CURRENT_DATE - 1, 'delivered'),
    (${c2}, 'Heavy Oil Blend', 40000, 'bbl', CURRENT_DATE + 3, 'in_transit'),
    (${c3}, 'Premium Diesel', 8000, 'bbl', CURRENT_DATE - 3, 'delivered'),
    (${c3}, 'Premium Diesel', 10000, 'bbl', CURRENT_DATE + 7, 'scheduled'),
    (${c1}, 'Light Sweet Crude', 30000, 'bbl', CURRENT_DATE - 10, 'delivered'),
    (${c2}, 'Heavy Oil Blend', 35000, 'bbl', CURRENT_DATE - 5, 'delivered')
  `);

  const dels = await pool.query('SELECT id, customer_id FROM ogcu_delivery ORDER BY id');

  // Invoices
  for (const d of dels.rows) {
    const amt = Math.round(Math.random() * 200000 + 50000);
    const hst = Math.round(amt * 0.13);
    const daysAgo = Math.floor(Math.random() * 30);
    const due = daysAgo > 15 ? `CURRENT_DATE - ${daysAgo - 15}` : `CURRENT_DATE + ${15 - daysAgo}`;
    const isPaid = daysAgo > 20;
    await pool.query(`
      INSERT INTO ogcu_invoice (customer_id, delivery_id, amount_cad, hst_cad, total_cad, due_date, status, paid_at) VALUES
      (${d.customer_id}, ${d.id}, ${amt}, ${hst}, ${amt + hst}, ${due}, '${isPaid ? 'paid' : daysAgo > 15 ? 'overdue' : 'outstanding'}', ${isPaid ? 'NOW()' : 'NULL'})
    `);
  }

  // Quality certs
  await pool.query(`
    INSERT INTO ogcu_quality_cert (delivery_id, product, api_gravity, sulphur_pct, btu_content, h2s_ppm, water_pct, spec_status)
    SELECT d.id, d.product,
      CASE WHEN d.product LIKE '%Crude%' THEN 38.5 WHEN d.product LIKE '%Heavy%' THEN 22.1 ELSE NULL END,
      CASE WHEN d.product LIKE '%Crude%' THEN 0.32 WHEN d.product LIKE '%Heavy%' THEN 2.8 ELSE NULL END,
      CASE WHEN d.product LIKE '%Gas%' THEN 1035 ELSE NULL END,
      CASE WHEN d.product LIKE '%Gas%' THEN 4 ELSE 0 END,
      0.5, 'within_spec'
    FROM ogcu_delivery d WHERE d.status = 'delivered'
  `);

  // Asset monitoring
  await pool.query(`
    INSERT INTO ogcu_asset_monitoring (customer_id, asset_type, asset_name, health_score, alert_count, status) VALUES
    (${c1}, 'well', 'Well Pad Alpha-7', 92, 1, 'operational'),
    (${c1}, 'pipeline', 'Pipeline Section P-12', 87, 2, 'operational'),
    (${c1}, 'equipment', 'Compressor Station CS-3', 78, 3, 'maintenance_due'),
    (${c2}, 'well', 'Well Pad Beta-4', 95, 0, 'operational'),
    (${c2}, 'pipeline', 'Pipeline Trunk T-7', 88, 1, 'operational'),
    (${c3}, 'equipment', 'Separator Unit SEP-2', 91, 0, 'operational')
  `);

  // Feature flags
  await pool.query(`
    INSERT INTO ogcu_feature_flag (flag_name, enabled, description) VALUES
    ('ai_monitoring', true, 'Enable AI asset monitoring integration'),
    ('ollama_faq', true, 'Enable Ollama-powered FAQ chatbot'),
    ('payment_gateway', false, 'Enable live payment processing'),
    ('doc_upload', true, 'Enable document uploads')
    ON CONFLICT (flag_name) DO NOTHING
  `);

  // Roles
  await pool.query(`
    INSERT INTO ogcu_role (name, permissions) VALUES
    ('customer', '{"view_contracts": true, "view_invoices": true, "submit_requests": true}'),
    ('admin', '{"all": true}'),
    ('sales', '{"view_leads": true, "view_pipeline": true, "manage_quotes": true}')
    ON CONFLICT DO NOTHING
  `);

  // Leads
  await pool.query(`
    INSERT INTO ogcu_lead (name, company, email, source, score, status) VALUES
    ('Alex Drummond', 'Husky Energy', 'a.drummond@husky-demo.ca', 'trade_show', 75, 'qualified'),
    ('Maria Santos', 'Cenovus Energy', 'm.santos@cenovus-demo.ca', 'referral', 90, 'opportunity'),
    ('Kevin Tran', 'Encana Corp', 'k.tran@encana-demo.ca', 'website', 45, 'new')
  `);

  await pool.query(`
    INSERT INTO ogcu_opportunity (title, value, stage, probability) VALUES
    ('Suncor Pipeline Expansion', 2500000, 'proposal', 60),
    ('Imperial Heavy Oil MSA Renewal', 4800000, 'negotiation', 80),
    ('CNR Refinery Services', 1200000, 'qualification', 30)
  `);

  return { seeded: true };
}

export async function GET() {
  try {
    await pool.query(SCHEMA);
    const result = await seedData();
    return Response.json({ status: 'ok', schema: 'created', ...result });
  } catch (e: unknown) {
    return Response.json({ status: 'error', error: String(e) }, { status: 500 });
  }
}

export async function POST() {
  return GET();
}
