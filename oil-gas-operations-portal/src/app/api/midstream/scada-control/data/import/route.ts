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
const CSV_PATH = '/mnt/deepa/IoT/code/oil-gas-monitoring/data/kaggle/environmental-telemetry/content/iot_telemetry_data.csv';

async function ensureTable(client: import('pg').PoolClient) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS ogo_scada_metric (
      id SERIAL PRIMARY KEY,
      ts BIGINT,
      device TEXT,
      co NUMERIC,
      humidity NUMERIC,
      lpg NUMERIC,
      smoke NUMERIC,
      temp NUMERIC,
      imported_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

export async function GET() {
  const client = await pool.connect();
  try {
    await ensureTable(client);
    const res = await client.query('SELECT COUNT(*) AS cnt FROM ogo_scada_metric');
    const rows = parseInt(res.rows[0].cnt, 10);
    let preview: Record<string, unknown>[] = [];
    if (rows > 0) {
      const pv = await client.query('SELECT ts, device, co, humidity, lpg, smoke, temp FROM ogo_scada_metric LIMIT 10');
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
    await client.query('DELETE FROM ogo_scada_metric');
    let count = 0;
    for (const r of records.slice(0, 50000)) {
      await client.query(
        `INSERT INTO ogo_scada_metric (ts, device, co, humidity, lpg, smoke, temp) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [parseFloat(r['ts'])||null, r['device']||null, parseFloat(r['co'])||null, parseFloat(r['humidity'])||null, parseFloat(r['lpg'])||null, parseFloat(r['smoke'])||null, parseFloat(r['temp'])||null]
      );
      count++;
    }
    const pv = await client.query('SELECT ts, device, co, humidity, lpg, smoke, temp FROM ogo_scada_metric LIMIT 10');
    return NextResponse.json({ status: 'ok', rows: count, preview: pv.rows });
  } catch (e: unknown) { return NextResponse.json({ status: 'error', error: String(e) }); }
  finally { client.release(); }
}
