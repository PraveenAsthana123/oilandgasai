export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS ogo_logistics_metric (
      id SERIAL PRIMARY KEY, shipment_id TEXT, origin TEXT, destination TEXT,
      commodity TEXT, volume NUMERIC, delivery_days INT, cost NUMERIC,
      status TEXT, imported_at TIMESTAMPTZ DEFAULT NOW()
    )`);

    const [totalRes, onTimeRes, statusRes, costRes] = await Promise.all([
      pool.query(`SELECT COUNT(*) AS total, ROUND(COALESCE(AVG(delivery_days),0)::numeric,1) AS avg_days FROM ogo_logistics_metric`),
      pool.query(`SELECT COUNT(*) FILTER (WHERE status ILIKE '%on%time%' OR status ILIKE '%delivered%') AS on_time,
        COUNT(*) FILTER (WHERE status ILIKE '%delay%') AS delayed,
        COUNT(*) AS total FROM ogo_logistics_metric`),
      pool.query(`SELECT status, COUNT(*) AS cnt FROM ogo_logistics_metric WHERE status IS NOT NULL GROUP BY status ORDER BY cnt DESC LIMIT 8`),
      pool.query(`SELECT ROUND(COALESCE(AVG(cost),0)::numeric,2) AS avg_cost, ROUND(COALESCE(SUM(cost),0)::numeric,2) AS total_cost FROM ogo_logistics_metric`),
    ]);

    const total = Number(totalRes.rows[0]?.total || 0);
    const onTime = Number(onTimeRes.rows[0]?.on_time || 0);

    return NextResponse.json({
      kpis: {
        total_shipments: total,
        avg_delivery_days: Number(totalRes.rows[0]?.avg_days || 0),
        on_time_rate_pct: total > 0 ? ((onTime / total) * 100).toFixed(1) : '0',
        cost_per_unit: Number(costRes.rows[0]?.avg_cost || 0),
      },
      status_breakdown: statusRes.rows,
      delayed: Number(onTimeRes.rows[0]?.delayed || 0),
    });
  } catch (err: unknown) {
    const msg = String(err);
    if (msg.includes('ECONNREFUSED') || msg.includes('connect') || msg.includes('DATABASE_URL')) {
      return NextResponse.json({ empty: true, message: 'Database not configured. Set DATABASE_URL to enable.', _mock: true });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}