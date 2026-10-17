export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET() {
  try {
    const client = await pool.connect();
    const tableCheck = await client.query(
      `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name='ogo_iot_metric') AS exists`
    );
    if (!tableCheck.rows[0].exists) {
      return NextResponse.json({ active_devices: 0, avg_co_ppm: 0, lpg_above_threshold: 0, total_readings: 0, temp_trend: [], co_by_device: [], alerts: [] });
    }

    const [kpi, tempDev, coDev] = await Promise.all([
      client.query(`
        SELECT COUNT(DISTINCT device) AS devices,
               AVG(co) AS avg_co,
               SUM(CASE WHEN lpg>0.007 THEN 1 ELSE 0 END) AS lpg_thresh,
               COUNT(*) AS total
        FROM ogo_iot_metric
      `),
      client.query(`SELECT device, AVG(temp) AS avg_temp FROM ogo_iot_metric GROUP BY device ORDER BY avg_temp DESC LIMIT 8`),
      client.query(`SELECT device, AVG(co) AS avg_co FROM ogo_iot_metric GROUP BY device ORDER BY avg_co DESC LIMIT 5`),
    ]);

    const k = kpi.rows[0];
    const alerts = [];
    if (parseInt(k.lpg_thresh, 10) > 1000) {
      alerts.push({ severity: 'critical', message: `${k.lpg_thresh} readings above LPG threshold (0.007)`, ts: new Date().toISOString() });
    }
    if (parseFloat(k.avg_co) > 0.005) {
      alerts.push({ severity: 'warning', message: `Average CO level ${parseFloat(k.avg_co).toFixed(4)} approaching threshold`, ts: new Date().toISOString() });
    }

    return NextResponse.json({
      active_devices: parseInt(k.devices, 10),
      avg_co_ppm: parseFloat(k.avg_co ?? 0),
      lpg_above_threshold: parseInt(k.lpg_thresh ?? 0, 10),
      total_readings: parseInt(k.total, 10),
      temp_trend: tempDev.rows.map(r => ({ device: r.device, avg_temp: parseFloat(r.avg_temp) })),
      co_by_device: coDev.rows.map(r => ({ device: r.device, avg_co: parseFloat(r.avg_co) })),
      alerts,
    });
  } catch (err: unknown) {
    const msg = String(err);
    if (msg.includes('ECONNREFUSED') || msg.includes('connect') || msg.includes('DATABASE_URL')) {
      return NextResponse.json({ empty: true, message: 'Database not configured. Set DATABASE_URL to enable.', _mock: true });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}