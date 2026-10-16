export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { initDb } from '@/lib/db';
import pool from '@/lib/db';

export async function GET() {
  try {
    await initDb();
    // Check if already seeded
    const check = await pool.query('SELECT COUNT(*) as cnt FROM ogs_lead');
    if (parseInt(check.rows[0].cnt) > 0) {
      return Response.json({ status: 'already_seeded', message: 'Tables exist and data already seeded' });
    }
    await seed();
    return Response.json({ status: 'ok', message: 'Tables created and data seeded' });
  } catch (e: any) {
    return Response.json({ status: 'error', error: e.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    await initDb();
    await seed();
    return Response.json({ status: 'ok', message: 'Tables created and data seeded' });
  } catch (e: any) {
    return Response.json({ status: 'error', error: e.message }, { status: 500 });
  }
}

async function seed() {
  const client = await pool.connect();
  try {
    // Seed accounts
    await client.query(`INSERT INTO ogs_account (company, stream, revenue_cad, credit_limit_cad, payment_terms, health_score) VALUES
      ('Suncor Energy', 'upstream', 4500000, 10000000, 'Net 30', 85),
      ('CNRL', 'upstream', 3200000, 8000000, 'Net 30', 78),
      ('Cenovus Energy', 'upstream', 2800000, 7000000, 'Net 45', 82),
      ('TC Energy', 'midstream', 1900000, 5000000, 'Net 30', 90),
      ('Enbridge', 'midstream', 2100000, 6000000, 'Net 30', 88)
    ON CONFLICT DO NOTHING`);

    // Seed leads
    await client.query(`INSERT INTO ogs_lead (company, contact_name, email, phone, stream, source, score, status, owner) VALUES
      ('Husky Energy', 'Jennifer Walsh', 'j.walsh@husky.ca', '403-555-0101', 'upstream', 'referral', 85, 'qualified', 'Alice Chen'),
      ('Pembina Pipeline', 'Marcus Reed', 'm.reed@pembina.com', '403-555-0102', 'midstream', 'conference', 72, 'new', 'Bob Martin'),
      ('Imperial Oil', 'Sarah Thompson', 's.thompson@imperialoil.ca', '403-555-0103', 'downstream', 'website', 65, 'contacted', 'Carol Lee'),
      ('MEG Energy', 'David Patel', 'd.patel@megenergy.com', '587-555-0104', 'upstream', 'cold_call', 45, 'new', 'Alice Chen'),
      ('Gibson Energy', 'Linda Park', 'l.park@gibsonenergy.com', '403-555-0105', 'midstream', 'linkedin', 60, 'qualified', 'Bob Martin'),
      ('Keyera Corp', 'Chris Mueller', 'c.mueller@keyera.com', '403-555-0106', 'midstream', 'referral', 78, 'proposal', 'Carol Lee'),
      ('Prairiesky Royalty', 'Emily Brown', 'e.brown@prairiesky.com', '403-555-0107', 'upstream', 'event', 55, 'new', 'Alice Chen'),
      ('Precision Drilling', 'James Wilson', 'j.wilson@precisiondrilling.com', '403-555-0108', 'upstream', 'website', 40, 'new', 'Bob Martin'),
      ('ShawCor', 'Angela Davis', 'a.davis@shawcor.com', '416-555-0109', 'midstream', 'partnership', 70, 'contacted', 'Carol Lee'),
      ('Tesco Corp', 'Ryan Anderson', 'r.anderson@tescocorp.com', '403-555-0110', 'upstream', 'cold_call', 35, 'new', 'Alice Chen')
    ON CONFLICT DO NOTHING`);

    // Seed opportunities
    await client.query(`INSERT INTO ogs_opportunity (lead_id, title, value_cad, stream, product, stage, probability, close_date, notes) VALUES
      (1, 'Husky Reservoir Monitoring SaaS', 2500000, 'upstream', 'AI Reservoir Monitoring', 'technical_eval', 60, '2026-12-31', 'Strong technical fit, budget approved'),
      (2, 'Pembina Pipeline Leak Detection', 1800000, 'midstream', 'Pipeline Leak Detection AI', 'qualified', 40, '2027-01-31', 'Pilot project discussion ongoing'),
      (3, 'Imperial Refinery Optimization', 3200000, 'downstream', 'Refinery Optimization AI', 'proposal', 70, '2026-11-30', 'Proposal submitted, awaiting review'),
      (4, 'MEG Well Integrity Monitoring', 950000, 'upstream', 'Well Integrity Monitoring', 'prospect', 20, '2027-02-28', 'Initial contact made'),
      (5, 'Gibson SCADA AI Analytics', 1200000, 'midstream', 'SCADA AI Analytics', 'qualified', 45, '2027-01-15', 'Demo scheduled for next week'),
      (6, 'Keyera Compressor Predictive Maintenance', 1600000, 'midstream', 'Compressor Predictive Maintenance', 'negotiation', 80, '2026-10-31', 'Final terms negotiation'),
      (7, 'Prairiesky Production Optimization', 780000, 'upstream', 'Production Optimization AI', 'prospect', 15, '2027-03-31', 'Needs executive sponsor'),
      (8, 'Precision Drilling Advisory AI', 1100000, 'upstream', 'Drilling Advisory AI', 'prospect', 25, '2027-02-15', 'Technical evaluation pending')
    ON CONFLICT DO NOTHING`);

    // Seed contracts
    await client.query(`INSERT INTO ogs_contract (company, contract_type, value_cad, start_date, end_date, status) VALUES
      ('Suncor Energy', 'MSA', 4500000, '2026-01-01', '2028-12-31', 'active'),
      ('TC Energy', 'Service Agreement', 1900000, '2026-03-01', '2027-02-28', 'active'),
      ('Enbridge', 'PSA', 2100000, '2025-09-01', '2026-08-31', 'expired'),
      ('CNRL', 'Supply Agreement', 3200000, '2026-06-01', '2028-05-31', 'active'),
      ('Keyera Corp', 'Service Agreement', 1600000, '2026-07-01', '2027-06-30', 'draft')
    ON CONFLICT DO NOTHING`);

    // Seed roles
    await client.query(`INSERT INTO ogs_role (name, permissions) VALUES
      ('admin', '{"all": true}'::jsonb),
      ('sales_rep', '{"leads": true, "opportunities": true, "quotes": true, "activities": true}'::jsonb),
      ('sales_manager', '{"leads": true, "opportunities": true, "quotes": true, "contracts": true, "reports": true}'::jsonb),
      ('viewer', '{"reports": true, "dashboard": true}'::jsonb)
    ON CONFLICT DO NOTHING`);

    // Seed activities
    await client.query(`INSERT INTO ogs_activity (type, subject, notes, related_id, related_type, user_id) VALUES
      ('call', 'Initial discovery call with Husky Energy', 'Discussed reservoir monitoring challenges. Strong interest in AI-powered solution.', 1, 'lead', 'alice.chen'),
      ('site_visit', 'Technical site visit to Pembina Pipeline facility', 'Observed existing SCADA setup. Identified 3 critical monitoring gaps.', 2, 'lead', 'bob.martin'),
      ('demo', 'Product demo for Imperial Oil refinery team', 'Demonstrated real-time optimization. Positive feedback on ML accuracy.', 3, 'opportunity', 'carol.lee'),
      ('email', 'Proposal follow-up email to Keyera Corp', 'Sent revised commercial terms with volume discount.', 6, 'opportunity', 'carol.lee'),
      ('presentation', 'Executive presentation at CNRL head office', 'C-suite presentation on 5-year digital transformation roadmap.', 4, 'account', 'alice.chen')
    ON CONFLICT DO NOTHING`);

    // Seed feature flags
    await client.query(`INSERT INTO ogs_feature_flag (name, enabled, description) VALUES
      ('ai_proposals', true, 'AI-powered proposal generation via Ollama'),
      ('roi_calculator', true, 'ROI Calculator tool'),
      ('competitive_intel', true, 'Competitive intelligence module'),
      ('advanced_pricing', true, 'Advanced commodity pricing engine')
    ON CONFLICT (name) DO NOTHING`);
  } finally {
    client.release();
  }
}
