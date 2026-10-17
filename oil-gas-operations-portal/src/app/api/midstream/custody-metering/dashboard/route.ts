export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function ensureTable(client: import('pg').PoolClient) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS ogo_metering_metric (
      id SERIAL PRIMARY KEY,
      production_date DATE,
      commodity TEXT,
      volume NUMERIC,
      state TEXT,
      imported_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

export async function GET() {
  try {
    const client = await pool.connect();
    await ensureTable(client);
    const countRes = await client.query('SELECT COUNT(*) AS cnt FROM ogo_metering_metric');
    const total_records = parseInt(countRes.rows[0].cnt, 10);

    if (total_records === 0) {
      return NextResponse.json({ total_volume: 0, commodity_count: 0, top_state: null, measurement_points: 0, by_commodity: [], empty: true });
    }

    const volRes = await client.query(`SELECT SUM(volume) AS total_volume FROM ogo_metering_metric`);
    const total_volume = parseFloat(volRes.rows[0].total_volume ?? '0');

    const commRes = await client.query(`SELECT COUNT(DISTINCT commodity) AS cnt FROM ogo_metering_metric`);
    const commodity_count = parseInt(commRes.rows[0].cnt, 10);

    const stateRes = await client.query(`SELECT state, SUM(volume) AS sv FROM ogo_metering_metric WHERE state IS NOT NULL GROUP BY state ORDER BY sv DESC LIMIT 1`);
    const top_state = stateRes.rows[0]?.state ?? null;

    const byCommRes = await client.query(`SELECT commodity, SUM(volume) AS total_volume, COUNT(*) AS records FROM ogo_metering_metric GROUP BY commodity ORDER BY total_volume DESC LIMIT 10`);
    const by_commodity = byCommRes.rows.map(r => ({ commodity: r.commodity, total_volume: parseFloat(r.total_volume), records: parseInt(r.records, 10) }));

    return NextResponse.json({
      total_volume,
      commodity_count,
      top_state,
      measurement_points: total_records,
      by_commodity,
      empty: false,
    });
  } catch (e: unknown) {
    const msg = String(e);
    if (msg.includes('ECONNREFUSED') || msg.includes('connect') || msg.includes('DATABASE_URL')) {
      return NextResponse.json({ total_volume: 0, commodity_count: 0, top_state: null, measurement_points: 0, by_commodity: [], empty: true, _mock: true });
    }
    return NextResponse.json({ total_volume: 0, commodity_count: 0, top_state: null, measurement_points: 0, by_commodity: [], empty: true, error: msg });
  }
}
