export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import pool from '@/lib/db';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS ogv_vendor (
  id SERIAL PRIMARY KEY,
  company TEXT,
  business_number TEXT,
  hst_number TEXT,
  service_categories JSONB,
  safety_trif NUMERIC,
  wsib_status TEXT DEFAULT 'pending',
  approval_status TEXT DEFAULT 'pending',
  performance_score NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ogv_rfq (
  id SERIAL PRIMARY KEY,
  rfq_number TEXT UNIQUE,
  title TEXT,
  description TEXT,
  service_category TEXT,
  estimated_value_cad NUMERIC,
  due_date DATE,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ogv_bid (
  id SERIAL PRIMARY KEY,
  rfq_id INT,
  vendor_id INT,
  amount_cad NUMERIC,
  hst_cad NUMERIC,
  delivery_days INT,
  validity_days INT,
  status TEXT DEFAULT 'submitted',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ogv_purchase_order (
  id SERIAL PRIMARY KEY,
  vendor_id INT,
  po_number TEXT UNIQUE,
  title TEXT,
  amount_cad NUMERIC,
  delivery_date DATE,
  status TEXT DEFAULT 'issued',
  on_time BOOL,
  quality_accepted BOOL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ogv_invoice (
  id SERIAL PRIMARY KEY,
  vendor_id INT,
  po_id INT,
  invoice_number TEXT,
  amount_cad NUMERIC,
  hst_cad NUMERIC,
  total_cad NUMERIC,
  status TEXT DEFAULT 'submitted',
  disputed BOOL DEFAULT false,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ogv_compliance_doc (
  id SERIAL PRIMARY KEY,
  vendor_id INT,
  doc_type TEXT,
  valid_from DATE,
  valid_to DATE,
  status TEXT DEFAULT 'current',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ogv_milestone (
  id SERIAL PRIMARY KEY,
  vendor_id INT,
  contract_id INT,
  milestone_name TEXT,
  due_date DATE,
  completion_pct INT DEFAULT 0,
  status TEXT DEFAULT 'pending',
  payment_amount_cad NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ogv_dispute (
  id SERIAL PRIMARY KEY,
  vendor_id INT,
  dispute_type TEXT,
  related_id INT,
  description TEXT,
  status TEXT DEFAULT 'open',
  resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ogv_role (
  id SERIAL PRIMARY KEY,
  name TEXT,
  permissions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ogv_audit_log (
  id SERIAL PRIMARY KEY,
  user_id TEXT,
  action TEXT,
  record_type TEXT,
  record_id TEXT,
  details JSONB,
  ts TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ogv_support_ticket (
  id SERIAL PRIMARY KEY,
  user_id TEXT,
  subject TEXT,
  body TEXT,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ogv_lead (
  id SERIAL PRIMARY KEY,
  name TEXT,
  company TEXT,
  email TEXT,
  source TEXT,
  score INT DEFAULT 0,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ogv_opportunity (
  id SERIAL PRIMARY KEY,
  title TEXT,
  value NUMERIC,
  stage TEXT DEFAULT 'prospect',
  probability INT DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ogv_feature_flag (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE,
  enabled BOOL DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ogv_contract (
  id SERIAL PRIMARY KEY,
  vendor_id INT,
  contract_type TEXT,
  title TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'active',
  value_cad NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ogv_safety_stat (
  id SERIAL PRIMARY KEY,
  vendor_id INT,
  year INT,
  trif NUMERIC,
  lti_rate NUMERIC,
  last_audit_date DATE,
  sms_status TEXT DEFAULT 'compliant',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
`;

const SEED = `
INSERT INTO ogv_vendor (company, business_number, hst_number, service_categories, safety_trif, wsib_status, approval_status, performance_score)
VALUES
  ('Northern Energy Services', 'BN123456789', 'HST123456789', '["Drilling Services","Pipeline Services"]', 0.8, 'clear', 'approved', 4.5),
  ('Prairie Pipeline Corp', 'BN987654321', 'HST987654321', '["Pipeline Services","Inspection & NDT"]', 1.2, 'clear', 'approved', 4.2),
  ('Apex Inspection Ltd', 'BN456789123', 'HST456789123', '["Inspection & NDT","Safety Services"]', 0.5, 'clear', 'approved', 4.8),
  ('Rocky Mountain Maintenance', 'BN321654987', 'HST321654987', '["Maintenance & Repair","Instrumentation & Controls"]', 1.5, 'pending', 'under review', 3.9),
  ('EnviroSafe Solutions', 'BN654321789', 'HST654321789', '["Environmental Services","Safety Services"]', 0.3, 'clear', 'approved', 4.7)
ON CONFLICT DO NOTHING;

INSERT INTO ogv_rfq (rfq_number, title, description, service_category, estimated_value_cad, due_date, status)
VALUES
  ('RFQ-2026-001', 'Pipeline Integrity Assessment', 'Comprehensive pipeline inspection using ILI technology', 'Inspection & NDT', 250000, '2026-11-15', 'open'),
  ('RFQ-2026-002', 'Wellsite Maintenance Contract', 'Preventive maintenance for 12 wellsites in AB', 'Maintenance & Repair', 480000, '2026-11-20', 'open'),
  ('RFQ-2026-003', 'Environmental Impact Study', 'Phase II environmental assessment for new facility', 'Environmental Services', 125000, '2026-11-10', 'open'),
  ('RFQ-2026-004', 'SCADA System Upgrade', 'Upgrade instrumentation and SCADA at 3 compressor stations', 'Instrumentation & Controls', 750000, '2026-12-01', 'open'),
  ('RFQ-2026-005', 'Safety Training Program', 'H2S Alive, Fall Protection, and WHMIS training for 200 workers', 'Safety Services', 85000, '2026-11-05', 'closed'),
  ('RFQ-2026-006', 'Drilling Fluid Services', 'Drilling fluid supply and technical support for 3 wells', 'Drilling Services', 320000, '2026-12-15', 'open'),
  ('RFQ-2026-007', 'Cathodic Protection Survey', 'Annual cathodic protection survey on 450 km pipeline', 'Inspection & NDT', 175000, '2026-11-30', 'open'),
  ('RFQ-2026-008', 'Waste Management Services', 'Oilfield waste disposal and remediation services', 'Environmental Services', 210000, '2026-12-10', 'open')
ON CONFLICT DO NOTHING;

INSERT INTO ogv_purchase_order (vendor_id, po_number, title, amount_cad, delivery_date, status, on_time, quality_accepted)
VALUES
  (1, 'PO-2026-0101', 'Directional Drilling Services - Well 14-22', 580000, '2026-10-30', 'in-progress', NULL, NULL),
  (1, 'PO-2026-0102', 'Casing Running Services - Well 8-15', 145000, '2026-09-30', 'complete', true, true),
  (2, 'PO-2026-0103', 'Pipeline Tie-In Work - Peace River', 320000, '2026-10-15', 'complete', true, true),
  (2, 'PO-2026-0104', 'Pipeline Hydrostatic Test', 95000, '2026-11-30', 'issued', NULL, NULL),
  (3, 'PO-2026-0105', 'UT Inspection - Facility Piping', 78000, '2026-10-01', 'complete', false, true),
  (3, 'PO-2026-0106', 'Magnetic Particle Testing', 42000, '2026-10-20', 'in-progress', NULL, NULL),
  (4, 'PO-2026-0107', 'Compressor Station Maintenance', 215000, '2026-11-15', 'issued', NULL, NULL),
  (5, 'PO-2026-0108', 'Spill Response Plan Update', 38000, '2026-09-15', 'complete', true, true),
  (5, 'PO-2026-0109', 'Phase I ESA Assessment', 62000, '2026-10-31', 'in-progress', NULL, NULL),
  (1, 'PO-2026-0110', 'Mud Logging Services', 95000, '2026-10-25', 'complete', true, false)
ON CONFLICT DO NOTHING;

INSERT INTO ogv_invoice (vendor_id, po_id, invoice_number, amount_cad, hst_cad, total_cad, status, disputed)
VALUES
  (1, 2, 'INV-2026-001', 145000, 18850, 163850, 'paid', false),
  (2, 3, 'INV-2026-002', 320000, 41600, 361600, 'paid', false),
  (3, 5, 'INV-2026-003', 78000, 10140, 88140, 'approved', false),
  (5, 8, 'INV-2026-004', 38000, 4940, 42940, 'paid', false),
  (1, 10, 'INV-2026-005', 95000, 12350, 107350, 'submitted', false),
  (4, 7, 'INV-2026-006', 107500, 13975, 121475, 'disputed', true)
ON CONFLICT DO NOTHING;

INSERT INTO ogv_compliance_doc (vendor_id, doc_type, valid_from, valid_to, status)
VALUES
  (1, 'Liability Insurance ($10M)', '2026-01-01', '2026-12-31', 'current'),
  (1, 'WSIB Clearance', '2026-10-01', '2026-12-31', 'current'),
  (1, 'COR Certificate', '2025-07-01', '2027-06-30', 'current'),
  (2, 'Liability Insurance ($5M)', '2026-01-01', '2026-06-30', 'expired'),
  (2, 'ISO 9001', '2024-03-15', '2027-03-14', 'current'),
  (3, 'ISO 14001', '2025-01-01', '2027-12-31', 'current'),
  (3, 'ISO 45001', '2025-06-01', '2026-05-31', 'expiring_soon'),
  (5, 'Environmental Professional License', '2026-01-01', '2026-12-31', 'current')
ON CONFLICT DO NOTHING;

INSERT INTO ogv_milestone (vendor_id, contract_id, milestone_name, due_date, completion_pct, status, payment_amount_cad)
VALUES
  (1, 1, 'Mobilization Complete', '2026-09-01', 100, 'complete', 58000),
  (1, 1, 'Rig-up and Spud', '2026-09-15', 100, 'complete', 116000),
  (1, 1, 'Intermediate Casing', '2026-10-15', 75, 'in-progress', 145000),
  (1, 1, 'Final TD and Completion', '2026-11-30', 0, 'pending', 261000),
  (2, 2, 'Pipeline Design Approval', '2026-10-01', 100, 'complete', 32000),
  (2, 2, 'Construction Complete', '2026-10-31', 60, 'in-progress', 160000),
  (2, 2, 'Commissioning and Handover', '2026-11-30', 0, 'pending', 128000)
ON CONFLICT DO NOTHING;

INSERT INTO ogv_role (name, permissions)
VALUES
  ('vendor', '["view_rfq","submit_bid","manage_invoices","view_po","upload_compliance"]'),
  ('procurement', '["manage_rfq","award_bid","issue_po","approve_invoice","manage_vendors"]'),
  ('admin', '["full_access"]')
ON CONFLICT DO NOTHING;

INSERT INTO ogv_lead (name, company, email, source, score, status)
VALUES
  ('Sarah Chen', 'WestCoast Drilling', 'schen@westcoast.ca', 'LinkedIn', 85, 'qualified'),
  ('Mike Trevino', 'Prairieland Pipelines', 'mtrevino@prairieland.ca', 'Trade Show', 70, 'contacted'),
  ('Amanda Walsh', 'Northern Safety Group', 'awalsh@nsg.ca', 'Website', 55, 'new'),
  ('Raj Patel', 'TechOil Solutions', 'rpatel@techoil.ca', 'Referral', 90, 'proposal'),
  ('Carol Brown', 'Maple Energy Corp', 'cbrown@maple.ca', 'Cold Outreach', 40, 'new')
ON CONFLICT DO NOTHING;

INSERT INTO ogv_opportunity (title, value, stage, probability)
VALUES
  ('3-Year Inspection Frame Agreement', 2500000, 'proposal', 60),
  ('Emergency Response Retainer', 750000, 'negotiation', 80),
  ('Digital Twin Implementation', 1200000, 'qualify', 30),
  ('Annual Maintenance Bundle', 950000, 'prospect', 20)
ON CONFLICT DO NOTHING;

INSERT INTO ogv_feature_flag (name, enabled, description)
VALUES
  ('ai_assistant', true, 'Ollama-powered vendor AI assistant'),
  ('market_benchmarking', true, 'Market rate benchmarking feature'),
  ('advanced_analytics', true, 'Advanced performance analytics'),
  ('dispute_automation', false, 'Automated dispute resolution workflow')
ON CONFLICT DO NOTHING;

INSERT INTO ogv_contract (vendor_id, contract_type, title, start_date, end_date, status, value_cad)
VALUES
  (1, 'MSA', 'Master Service Agreement - Northern Energy', '2025-01-01', '2027-12-31', 'active', 5000000),
  (2, 'Frame', 'Pipeline Services Frame Agreement', '2026-01-01', '2026-12-31', 'active', 1500000),
  (3, 'MSA', 'Master Inspection Services Agreement', '2024-07-01', '2026-06-30', 'active', 3000000),
  (1, 'NDA', 'Non-Disclosure Agreement', '2025-01-01', '2030-01-01', 'active', 0)
ON CONFLICT DO NOTHING;

INSERT INTO ogv_safety_stat (vendor_id, year, trif, lti_rate, last_audit_date, sms_status)
VALUES
  (1, 2026, 0.8, 0.2, '2026-06-15', 'compliant'),
  (2, 2026, 1.2, 0.4, '2026-04-20', 'compliant'),
  (3, 2026, 0.5, 0.0, '2026-08-10', 'compliant'),
  (4, 2026, 1.5, 0.6, '2026-03-05', 'requires_action'),
  (5, 2026, 0.3, 0.0, '2026-09-01', 'compliant')
ON CONFLICT DO NOTHING;
`;

export async function GET() {
  try {
    const stmts = SCHEMA.split(';').map((s) => s.trim()).filter(Boolean);
    for (const stmt of stmts) {
      await pool.query(stmt);
    }
    const seedStmts = SEED.split(';').map((s) => s.trim()).filter(Boolean);
    let seeded = 0;
    for (const stmt of seedStmts) {
      try {
        await pool.query(stmt);
        seeded++;
      } catch {
        // skip dupe
      }
    }
    return NextResponse.json({ status: 'ok', message: 'Tables created, seed inserted', seeded });
  } catch (err) {
    return NextResponse.json({ status: 'error', error: String(err) }, { status: 500 });
  }
}

export async function POST() {
  return GET();
}
