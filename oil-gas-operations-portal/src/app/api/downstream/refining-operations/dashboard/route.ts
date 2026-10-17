export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS ogo_refine_metric (
      id SERIAL PRIMARY KEY, production_date DATE, commodity TEXT,
      volume NUMERIC, state TEXT, imported_at TIMESTAMPTZ DEFAULT NOW()
    )`);

    const [totalRes, yieldRes, trendRes, stateRes] = await Promise.all([
      pool.query(`SELECT COALESCE(SUM(volume)/1e6,0) AS total_mmbbl FROM ogo_refine_metric`),
      pool.query(`SELECT commodity, COALESCE(SUM(volume),0) AS vol FROM ogo_refine_metric GROUP BY commodity ORDER BY vol DESC LIMIT 8`),
      pool.query(`SELECT TO_CHAR(production_date,'YYYY-MM') AS month, COALESCE(SUM(volume),0) AS vol
        FROM ogo_refine_metric WHERE production_date IS NOT NULL GROUP BY month ORDER BY month DESC LIMIT 12`),
      pool.query(`SELECT state, COALESCE(SUM(volume),0) AS vol FROM ogo_refine_metric WHERE state IS NOT NULL GROUP BY state ORDER BY vol DESC LIMIT 8`),
    ]);

    return NextResponse.json({
      kpis: {
        total_mmbbl: Number(totalRes.rows[0]?.total_mmbbl || 0).toFixed(2),
        commodity_count: yieldRes.rows.length,
        states_count: stateRes.rows.length,
        avg_monthly_vol: trendRes.rows.length
          ? (trendRes.rows.reduce((s: number, r: { vol: string }) => s + Number(r.vol), 0) / trendRes.rows.length / 1e6).toFixed(2)
          : '0',
      },
      yield_by_commodity: yieldRes.rows,
      monthly_trend: trendRes.rows.reverse(),
      top_states: stateRes.rows,
    });
  } catch (err: unknown) {
    const msg = String(err);
    if (msg.includes('ECONNREFUSED') || msg.includes('connect') || msg.includes('DATABASE_URL')) {
      return NextResponse.json({ empty: true, message: 'Database not configured. Set DATABASE_URL to enable.', _mock: true });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}