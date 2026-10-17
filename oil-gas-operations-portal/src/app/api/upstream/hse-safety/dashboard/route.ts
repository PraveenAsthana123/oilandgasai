import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET(_req: NextRequest) {
  try {
    const tc = await pool.query(`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ogo_hse_metric') AS exists`);
    if (!tc.rows[0].exists) return NextResponse.json({ empty: true, message: 'Run import job to populate' });
    const count = await pool.query(`SELECT COUNT(*) AS total FROM ogo_hse_metric`);
    if (parseInt(count.rows[0].total) === 0) return NextResponse.json({ empty: true, message: 'Run import job to populate' });

    const [kpis, severityDist, yearTrend, causeDist] = await Promise.all([
      pool.query(`SELECT COUNT(*) AS total_incidents, SUM(CASE WHEN severity IN ('CRITICAL','HIGH') THEN 1 ELSE 0 END) AS high_severity_count, ROUND(SUM(all_costs)/1000000::numeric,2) AS total_cost_million, SUM(all_fatalities) AS total_fatalities FROM ogo_hse_metric`),
      pool.query(`SELECT severity, COUNT(*) AS cnt FROM ogo_hse_metric GROUP BY severity ORDER BY CASE severity WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 ELSE 4 END`),
      pool.query(`SELECT accident_year, COUNT(*) AS incidents, SUM(all_injuries) AS injuries, SUM(all_fatalities) AS fatalities FROM ogo_hse_metric WHERE accident_year IS NOT NULL GROUP BY accident_year ORDER BY accident_year`),
      pool.query(`SELECT cause_category, COUNT(*) AS cnt FROM ogo_hse_metric WHERE cause_category IS NOT NULL GROUP BY cause_category ORDER BY cnt DESC LIMIT 6`),
    ]);

    return NextResponse.json({ kpis: kpis.rows[0], severityDistribution: severityDist.rows, incidentTrend: yearTrend.rows, causeDistribution: causeDist.rows });
  } catch (err: unknown) {
    const msg = String(err);
    if (msg.includes('ECONNREFUSED') || msg.includes('connect') || msg.includes('DATABASE_URL')) {
      return NextResponse.json({ empty: true, message: 'Database not configured. Set DATABASE_URL to enable.', _mock: true });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}