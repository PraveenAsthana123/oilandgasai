export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET() {
  const client = await pool.connect();
  try {
    const tableCheck = await client.query(`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name='ogo_storage_metric') AS exists`);
    if (!tableCheck.rows[0].exists) {
      return NextResponse.json({ total_volume: 0, commodity_types: 0, states_count: 0, latest_date: '—', volume_by_state: [], monthly_trend: [], commodity_split: [], alerts: [] });
    }

    const [kpi, byState, monthly, byCommodity] = await Promise.all([
      client.query(`SELECT SUM(volume) AS total, COUNT(DISTINCT commodity) AS cmods, COUNT(DISTINCT state) AS states, MAX(production_date) AS latest FROM ogo_storage_metric`),
      client.query(`SELECT state, SUM(volume) AS volume FROM ogo_storage_metric GROUP BY state ORDER BY volume DESC LIMIT 10`),
      client.query(`SELECT TO_CHAR(production_date,'YYYY-MM') AS label, SUM(volume) AS volume FROM ogo_storage_metric GROUP BY label ORDER BY label DESC LIMIT 24`),
      client.query(`SELECT commodity, SUM(volume) AS volume FROM ogo_storage_metric GROUP BY commodity ORDER BY volume DESC`),
    ]);

    const k = kpi.rows[0];
    const alerts = [];
    if (!k.total || parseFloat(k.total) === 0) {
      alerts.push({ severity: 'info', message: 'No storage data found. Run Import to load dataset.', ts: new Date().toISOString() });
    }

    return NextResponse.json({
      total_volume: parseFloat(k.total ?? 0),
      commodity_types: parseInt(k.cmods ?? 0, 10),
      states_count: parseInt(k.states ?? 0, 10),
      latest_date: k.latest ? new Date(k.latest).toISOString().split('T')[0] : '—',
      volume_by_state: byState.rows.map(r => ({ state: r.state, volume: parseFloat(r.volume) })),
      monthly_trend: monthly.rows.map(r => ({ label: r.label, volume: parseFloat(r.volume) })).reverse(),
      commodity_split: byCommodity.rows.map(r => ({ commodity: r.commodity, volume: parseFloat(r.volume) })),
      alerts,
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  } finally { client.release(); }
}
