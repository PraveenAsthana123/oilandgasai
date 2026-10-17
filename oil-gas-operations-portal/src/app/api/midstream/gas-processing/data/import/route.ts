export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import fs from 'fs';
import { parse } from 'csv-parse/sync';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const CSV_PATH = '/mnt/deepa/IoT/code/oil-gas-monitoring/data/kaggle/natural-gas-demand/content/data.csv';

async function ensureTable(client: import('pg').PoolClient) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS ogo_gasdem_metric (
      id SERIAL PRIMARY KEY,
      year INT,
      month INT,
      area_name TEXT,
      process_name TEXT,
      value NUMERIC,
      units TEXT,
      imported_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

export async function GET() {
  const client = await pool.connect();
  try {
    await ensureTable(client);
    const res = await client.query('SELECT COUNT(*) AS cnt FROM ogo_gasdem_metric');
    const rows = parseInt(res.rows[0].cnt, 10);
    let preview: Record<string, unknown>[] = [];
    if (rows > 0) {
      const pv = await client.query('SELECT year, month, area_name, process_name, value, units FROM ogo_gasdem_metric LIMIT 10');
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
    if (!fs.existsSync(CSV_PATH)) {
      return NextResponse.json({ status: 'error', error: `CSV not found: ${CSV_PATH}` });
    }
    const raw = fs.readFileSync(CSV_PATH, 'utf-8');
    const records = parse(raw, { columns: true, skip_empty_lines: true, trim: true });

    await client.query('DELETE FROM ogo_gasdem_metric');
    let count = 0;
    for (const r of records.slice(0, 100000)) {
      await client.query(
        `INSERT INTO ogo_gasdem_metric (year, month, area_name, process_name, value, units) VALUES ($1,$2,$3,$4,$5,$6)`,
        [
          parseInt(r['year']) || null,
          parseInt(r['month']) || null,
          r['area-name'] || null,
          r['process-name'] || null,
          parseFloat(r['value']) || null,
          r['units'] || null,
        ]
      );
      count++;
    }
    const pv = await client.query('SELECT year, month, area_name, process_name, value, units FROM ogo_gasdem_metric LIMIT 10');
    return NextResponse.json({ status: 'ok', rows: count, preview: pv.rows });
  } catch (e: unknown) {
    return NextResponse.json({ status: 'error', error: String(e) });
  } finally { client.release(); }
}
