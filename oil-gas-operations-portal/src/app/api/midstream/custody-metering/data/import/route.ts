export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import fs from 'fs';
function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']));
  });
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const DATA_BASE_PATH = process.env.DATA_BASE_PATH ?? '/mnt/deepa/IoT/code/oil-gas-monitoring';
const CSV_PATH = `${DATA_BASE_PATH}/data/kaggle/production-trends/content/OGORBcsv_cleaned.csv`;

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
  const client = await pool.connect();
  try {
    await ensureTable(client);
    const res = await client.query('SELECT COUNT(*) AS cnt FROM ogo_metering_metric');
    const rows = parseInt(res.rows[0].cnt, 10);
    let preview: Record<string, unknown>[] = [];
    if (rows > 0) {
      const pv = await client.query('SELECT production_date, commodity, volume, state FROM ogo_metering_metric LIMIT 10');
      preview = pv.rows;
    }
    return NextResponse.json({ status: 'ok', rows, preview });
  } catch (e: unknown) { return NextResponse.json({ status: 'error', error: String(e) }); }
  finally { client.release(); }
}

export async function POST(_req: NextRequest) {
  const client = await pool.connect();
  try {
    await ensureTable(client);
    if (!fs.existsSync(CSV_PATH)) return NextResponse.json({ status: 'error', error: `CSV not found: ${CSV_PATH}` });
    const raw = fs.readFileSync(CSV_PATH, 'utf-8');
    const records = parseCSV(raw);
    await client.query('DELETE FROM ogo_metering_metric');
    let count = 0;
    for (const r of records.slice(0, 100000)) {
      const dateVal = r['Production_Date'] || r['production_date'] || null;
      const commodityVal = r['Commodity'] || r['commodity'] || null;
      const volumeVal = r['Volume'] || r['volume'] || null;
      const stateVal = r['State'] || r['state'] || null;
      await client.query(
        `INSERT INTO ogo_metering_metric (production_date, commodity, volume, state) VALUES ($1,$2,$3,$4)`,
        [
          dateVal ? new Date(dateVal).toISOString().split('T')[0] : null,
          commodityVal,
          volumeVal ? parseFloat(volumeVal) : null,
          stateVal,
        ]
      );
      count++;
    }
    const pv = await client.query('SELECT production_date, commodity, volume, state FROM ogo_metering_metric LIMIT 10');
    return NextResponse.json({ status: 'ok', rows: count, preview: pv.rows });
  } catch (e: unknown) { return NextResponse.json({ status: 'error', error: String(e) }); }
  finally { client.release(); }
}
