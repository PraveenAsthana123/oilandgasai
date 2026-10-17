import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET(_req: NextRequest) {
  try {
    const tc = await pool.query(`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ogo_wi_metric') AS exists`);
    if (!tc.rows[0].exists) return NextResponse.json({ empty: true, message: 'Run import job to populate' });
    const count = await pool.query(`SELECT COUNT(*) AS total FROM ogo_wi_metric`);
    if (parseInt(count.rows[0].total) === 0) return NextResponse.json({ empty: true, message: 'Run import job to populate' });

    const [kpis, causeDist, topStates, yearTrend] = await Promise.all([
      pool.query(`SELECT COUNT(*) AS total_incidents, ROUND(AVG(unintentional_release)::numeric,2) AS avg_barrels_spilled, SUM(all_fatalities) AS total_fatalities, ROUND(SUM(all_costs)/1000000::numeric,2) AS total_costs_million FROM ogo_wi_metric`),
      pool.query(`SELECT cause_category, COUNT(*) AS cnt FROM ogo_wi_metric WHERE cause_category IS NOT NULL GROUP BY cause_category ORDER BY cnt DESC LIMIT 8`),
      pool.query(`SELECT accident_state, COUNT(*) AS incidents FROM ogo_wi_metric WHERE accident_state IS NOT NULL AND accident_state != '' GROUP BY accident_state ORDER BY incidents DESC LIMIT 5`),
      pool.query(`SELECT accident_year, COUNT(*) AS incidents FROM ogo_wi_metric WHERE accident_year IS NOT NULL GROUP BY accident_year ORDER BY accident_year`),
    ]);

    return NextResponse.json({ kpis: kpis.rows[0], causeDistribution: causeDist.rows, topStates: topStates.rows, yearTrend: yearTrend.rows });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
