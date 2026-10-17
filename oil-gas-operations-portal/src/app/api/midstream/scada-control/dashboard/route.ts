export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET() {
  try {
    const client = await pool.connect();
    const tableCheck = await client.query(`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name='ogo_scada_metric') AS exists`);
    if (!tableCheck.rows[0].exists) {
      return NextResponse.json({ total_readings: 0, anomaly_count: 0, device_count: 0, alert_rate_pct: 0, anomaly_trend: [], readings_over_time: [], alerts: [] });
    }

    const [kpi, anomalyByDevice, readingsDist] = await Promise.all([
      client.query(`SELECT COUNT(*) AS total, SUM(CASE WHEN co>0.006 OR lpg>0.007 THEN 1 ELSE 0 END) AS anomalies, COUNT(DISTINCT device) AS devices FROM ogo_scada_metric`),
      client.query(`SELECT device, SUM(CASE WHEN co>0.006 OR lpg>0.007 THEN 1 ELSE 0 END) AS anomalies FROM ogo_scada_metric GROUP BY device ORDER BY anomalies DESC LIMIT 6`),
      client.query(`SELECT device, COUNT(*) AS cnt FROM ogo_scada_metric GROUP BY device ORDER BY cnt DESC LIMIT 12`),
    ]);

    const k = kpi.rows[0];
    const total = parseInt(k.total, 10);
    const anomalies = parseInt(k.anomalies, 10);
    const alertRate = total > 0 ? (anomalies / total) * 100 : 0;

    const alerts = [];
    if (alertRate > 5) {
      alerts.push({ severity: 'critical', message: `Alert rate ${alertRate.toFixed(1)}% exceeds 5% threshold — ${anomalies} anomalous readings`, ts: new Date().toISOString() });
    } else if (anomalies > 0) {
      alerts.push({ severity: 'warning', message: `${anomalies} sensor readings exceeded CO or LPG thresholds`, ts: new Date().toISOString() });
    }

    return NextResponse.json({
      total_readings: total,
      anomaly_count: anomalies,
      device_count: parseInt(k.devices, 10),
      alert_rate_pct: alertRate,
      anomaly_trend: anomalyByDevice.rows.map(r => ({ device: r.device, anomalies: parseInt(r.anomalies, 10) })),
      readings_over_time: readingsDist.rows.map(r => ({ hour: r.device, count: parseInt(r.cnt, 10) })),
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