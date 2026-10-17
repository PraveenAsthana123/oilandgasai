export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const DDL = `CREATE TABLE IF NOT EXISTS ogo_document (
  id SERIAL PRIMARY KEY,
  name TEXT,
  category TEXT,
  dept TEXT,
  description TEXT,
  size_kb INT DEFAULT 0,
  uploaded_by TEXT DEFAULT 'system',
  status TEXT DEFAULT 'active',
  ai_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
)`;

const SEEDS = [
  { name: 'Well Completion Report — Cardium Formation 14-22', category: 'Well Report', dept: 'Upstream', description: 'Detailed completion report for the Cardium horizontal well including perforation intervals, stimulation data, and initial production rates from the Pembina area.', size_kb: 2840, uploaded_by: 'J. Mackenzie', status: 'active' },
  { name: 'Pipeline Integrity Assessment — Line 47 Crossfield', category: 'Technical', dept: 'Midstream', description: 'ILI run results and remaining life analysis for the 12-inch NPS pipeline segment from Crossfield to Airdrie, including dent and metal-loss anomalies.', size_kb: 5120, uploaded_by: 'R. Tanner', status: 'active' },
  { name: 'AER Directive 056 Compliance Filing Q3 2026', category: 'Regulatory', dept: 'Regulatory Affairs', description: 'Quarterly AER Directive 056 compliance submission covering upstream oil and gas production volumes, flaring and venting totals, and spill incident disclosures.', size_kb: 980, uploaded_by: 'S. Okafor', status: 'active' },
  { name: 'H2S Safety Manual — Field Operations 2026', category: 'Safety', dept: 'HSE', description: 'Updated H2S awareness and emergency response manual for all field personnel, including detector calibration procedures, evacuation protocols, and SCBA maintenance schedules.', size_kb: 3350, uploaded_by: 'L. Gagnon', status: 'active' },
  { name: 'Gas Purchase Agreement — Plains Midstream 2026-2029', category: 'Commercial', dept: 'Commercial', description: 'Natural gas purchase and sale agreement with Plains Midstream covering volumes, pricing index (AECO), transportation responsibilities, and force majeure clauses.', size_kb: 1760, uploaded_by: 'M. Patel', status: 'under review' },
  { name: 'ECCC Methane Reporting — Annual Submission 2025', category: 'Regulatory', dept: 'Environmental', description: 'Environment and Climate Change Canada annual greenhouse gas reporting submission including methane emissions by source category, measurement methodology, and reduction targets.', size_kb: 2200, uploaded_by: 'S. Okafor', status: 'active' },
  { name: 'Seismic Interpretation Report — Duvernay Play', category: 'Technical', dept: 'Geoscience', description: 'Post-stack seismic interpretation covering 3D survey over Duvernay shale fairway in the Fox Creek area, including structure maps, attribute analysis, and prospective resource estimates.', size_kb: 18400, uploaded_by: 'D. Horowitz', status: 'archived' },
  { name: 'Emergency Response Plan — Whitecourt Battery Site', category: 'Safety', dept: 'HSE', description: 'Site-specific emergency response plan for Whitecourt battery including spill response procedures, fire suppression, regulatory notification requirements, and stakeholder contact list.', size_kb: 890, uploaded_by: 'L. Gagnon', status: 'active' },
];

export async function GET() {
  try {
    const client = await pool.connect();
    try {
      await client.query(DDL);
      const countRes = await client.query('SELECT COUNT(*) FROM ogo_document');
      if (parseInt(countRes.rows[0].count) === 0) {
        for (const s of SEEDS) {
          await client.query(
            `INSERT INTO ogo_document (name, category, dept, description, size_kb, uploaded_by, status)
             VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [s.name, s.category, s.dept, s.description, s.size_kb, s.uploaded_by, s.status]
          );
        }
      }
      const { rows } = await client.query('SELECT * FROM ogo_document ORDER BY created_at DESC');
      const kpiRes = await client.query(`
        SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE created_at >= date_trunc('month', NOW())) AS added_this_month,
          COUNT(*) FILTER (WHERE status = 'under review') AS pending_review,
          COUNT(*) FILTER (WHERE category = 'Technical') AS technical,
          COUNT(*) FILTER (WHERE category = 'Regulatory') AS regulatory,
          COUNT(*) FILTER (WHERE category = 'Safety') AS safety,
          COUNT(*) FILTER (WHERE category = 'Commercial') AS commercial,
          COUNT(*) FILTER (WHERE category = 'Well Report') AS well_report
        FROM ogo_document
      `);
      return NextResponse.json({ data: rows, kpis: kpiRes.rows[0] });
    } finally {
      client.release();
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('ECONNREFUSED') || msg.includes('connect')) {
      return NextResponse.json({ data: [], kpis: { total: 0, added_this_month: 0, pending_review: 0 }, _mock: true, _reason: 'DB unavailable' });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, category, dept, description, size_kb, uploaded_by, status } = body;
    const client = await pool.connect();
    try {
      await client.query(DDL);
      const { rows } = await client.query(
        `INSERT INTO ogo_document (name, category, dept, description, size_kb, uploaded_by, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [name, category || 'Technical', dept || 'Operations', description || '', size_kb || 0, uploaded_by || 'system', status || 'active']
      );
      return NextResponse.json({ data: rows[0] }, { status: 201 });
    } finally {
      client.release();
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('ECONNREFUSED') || msg.includes('connect')) {
      return NextResponse.json({ data: null, _mock: true, _reason: 'DB unavailable' });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
