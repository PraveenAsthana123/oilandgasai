export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import fs from 'fs';
import { parse } from 'csv-parse/sync';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const CSV_PATH = '/mnt/deepa/IoT/code/oil-gas-monitoring/data/kaggle/production-trends/content/OGORBcsv_cleaned.csv';

async function ensureTable(client: import('pg').PoolClient) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS ogo_storage_metric (
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
  const client = await pool.connect();
  try {
    await ensureTable(client);
    const res = await client.query('SELECT COUNT(*) AS cnt FROM ogo_storage_metric');
    const rows = parseInt(res.rows[0].cnt, 10);
    let preview: Record<string, unknown>[] = [];
    if (rows > 0) {
      const pv = await client.query('SELECT production_date, commodity, volume, state FROM ogo_storage_metric LIMIT 10');
      preview = pv.rows;
    }
    return NextResponse.json({ status: 'ok', rows, preview });
  } catch (e: unknown) {
    return NextResponse.json({ status: 'error', error: String(e) });
  } finally { client.release(); }
}

export async function POST(_req: NextRequest) {
  const client = await pool.connect();
  try {
    await ensureTable(client);
    if (!fs.existsSync(CSV_PATH)) return NextResponse.json({ status: 'error', error: `CSV not found: ${CSV_PATH}` });
    const raw = fs.readFileSync(CSV_PATH, 'utf-8');
    const records = parse(raw, { columns: true, skip_empty_lines: true, trim: true });

    await client.query('DELETE FROM ogo_storage_metric');
    let count = 0;
    for (const r of records.slice(0, 100000)) {
      // Parse volume — remove commas and quotes
      const rawVol = String(r['Volume'] ?? r['volume'] ?? '').replace(/[",]/g, '');
      const volume = parseFloat(rawVol) || null;
      // Parse date
      const rawDate = r['Production Date'] ?? r['Production_Date'] ?? null;
      let prodDate: string | null = null;
      if (rawDate) {
        try { prodDate = new Date(rawDate).toISOString().split('T')[0]; } catch {}
      }
      const state = r['State'] ?? r['state'] ?? null;
      const commodity = r['Commodity'] ?? r['commodity'] ?? null;
      await client.query(
        `INSERT INTO ogo_storage_metric (production_date, commodity, volume, state) VALUES ($1,$2,$3,$4)`,
        [prodDate, commodity, volume, state]
      );
      count++;
    }
    const pv = await client.query('SELECT production_date, commodity, volume, state FROM ogo_storage_metric LIMIT 10');
    return NextResponse.json({ status: 'ok', rows: count, preview: pv.rows });
  } catch (e: unknown) {
    return NextResponse.json({ status: 'error', error: String(e) });
  } finally { client.release(); }
}
