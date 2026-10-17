import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET(_req: NextRequest) {
  try {
    const tc = await pool.query(`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ogo_prod_metric') AS exists`);
    if (!tc.rows[0].exists) return NextResponse.json({ empty: true, message: 'Run import job to populate' });
    const count = await pool.query(`SELECT COUNT(*) AS total FROM ogo_prod_metric`);
    if (parseInt(count.rows[0].total) === 0) return NextResponse.json({ empty: true, message: 'Run import job to populate' });

    const [kpis, commodities, topStates, trend] = await Promise.all([
      pool.query(`SELECT ROUND(SUM(volume)/1000000::numeric,2) AS total_volume_mmcfe, COUNT(DISTINCT state) AS total_states, COUNT(DISTINCT commodity) AS commodity_count, COUNT(*) AS total_records FROM ogo_prod_metric`),
      pool.query(`SELECT commodity, ROUND(SUM(volume)/1000000::numeric,2) AS total_volume_mm FROM ogo_prod_metric WHERE commodity IS NOT NULL GROUP BY commodity ORDER BY total_volume_mm DESC LIMIT 6`),
      pool.query(`SELECT state, ROUND(SUM(volume)/1000000::numeric,2) AS total_volume_mm FROM ogo_prod_metric WHERE state IS NOT NULL AND state NOT IN ('Offshore') GROUP BY state ORDER BY total_volume_mm DESC LIMIT 5`),
      pool.query(`SELECT TO_CHAR(production_date,'YYYY-MM') AS month, ROUND(SUM(volume)/1000000::numeric,2) AS volume_mm FROM ogo_prod_metric WHERE production_date IS NOT NULL GROUP BY month ORDER BY month LIMIT 24`),
    ]);

    return NextResponse.json({ kpis: kpis.rows[0], commodities: commodities.rows, topStates: topStates.rows, productionTrend: trend.rows });
  } catch (err: unknown) {
    const msg = String(err);
    if (msg.includes('ECONNREFUSED') || msg.includes('connect') || msg.includes('DATABASE_URL')) {
      return NextResponse.json({ empty: true, message: 'Database not configured. Set DATABASE_URL to enable.', _mock: true });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}