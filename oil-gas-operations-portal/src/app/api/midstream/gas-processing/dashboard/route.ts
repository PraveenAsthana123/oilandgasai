export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET() {
  const client = await pool.connect();
  try {
    const tableCheck = await client.query(`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name='ogo_gasdem_metric') AS exists`);
    if (!tableCheck.rows[0].exists) {
      return NextResponse.json({ total_volume_mmcf: 0, states_covered: 0, process_types: 0, latest_year: 0, monthly_trend: [], process_split: [], top_states: [], alerts: [] });
    }

    const [kpi, monthly, processSplit, topStates] = await Promise.all([
      client.query(`SELECT SUM(value) AS total_vol, COUNT(DISTINCT area_name) AS states, COUNT(DISTINCT process_name) AS processes, MAX(year) AS latest_year FROM ogo_gasdem_metric`),
      client.query(`SELECT year, month, SUM(value) AS total FROM ogo_gasdem_metric GROUP BY year, month ORDER BY year, month DESC LIMIT 24`),
      client.query(`SELECT process_name, SUM(value) AS total_value FROM ogo_gasdem_metric GROUP BY process_name ORDER BY total_value DESC LIMIT 6`),
      client.query(`SELECT area_name, SUM(value) AS total_value FROM ogo_gasdem_metric GROUP BY area_name ORDER BY total_value DESC LIMIT 10`),
    ]);

    const k = kpi.rows[0];
    const alerts = [];
    if (parseFloat(k.total_vol) === 0) {
      alerts.push({ severity: 'info', message: 'No demand data found. Run Import to load dataset.', ts: new Date().toISOString() });
    }

    return NextResponse.json({
      total_volume_mmcf: parseFloat(k.total_vol ?? 0),
      states_covered: parseInt(k.states ?? 0, 10),
      process_types: parseInt(k.processes ?? 0, 10),
      latest_year: parseInt(k.latest_year ?? 0, 10),
      monthly_trend: monthly.rows.map(r => ({ label: `${r.year}-${String(r.month).padStart(2, '0')}`, value: parseFloat(r.total) })).reverse(),
      process_split: processSplit.rows.map(r => ({ process_name: r.process_name, total_value: parseFloat(r.total_value) })),
      top_states: topStates.rows.map(r => ({ area_name: r.area_name, total_value: parseFloat(r.total_value) })),
      alerts,
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  } finally { client.release(); }
}
