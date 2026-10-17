export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const CSV_PATH = '/mnt/deepa/IoT/code/oil-gas-monitoring/data/kaggle/pipeline-maintenance/content/market_pipe_thickness_loss_dataset.csv';

async function ensureTable(client: import('pg').PoolClient) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS ogo_pipe_metric (
      id SERIAL PRIMARY KEY,
      pipe_size_mm NUMERIC,
      thickness_mm NUMERIC,
      material TEXT,
      corrosion_pct NUMERIC,
      time_years NUMERIC,
      condition TEXT,
      imported_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

export async function GET() {
  const client = await pool.connect();
  try {
    await ensureTable(client);
    const res = await client.query('SELECT COUNT(*) AS cnt FROM ogo_pipe_metric');
    const rows = parseInt(res.rows[0].cnt, 10);
    let preview: Record<string, unknown>[] = [];
    if (rows > 0) {
      const pv = await client.query('SELECT pipe_size_mm, thickness_mm, material, corrosion_pct, time_years, condition FROM ogo_pipe_metric LIMIT 10');
      preview = pv.rows;
    }
    return NextResponse.json({ status: 'ok', rows, preview });
  } catch (e: unknown) {
    return NextResponse.json({ status: 'error', error: String(e) });
  } finally {
    client.release();
  }
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

    await client.query('DELETE FROM ogo_pipe_metric');
    let count = 0;
    for (const r of records) {
      await client.query(
        `INSERT INTO ogo_pipe_metric (pipe_size_mm, thickness_mm, material, corrosion_pct, time_years, condition)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [
          parseFloat(r['Pipe_Size_mm']) || null,
          parseFloat(r['Thickness_mm']) || null,
          r['Material'] || null,
          parseFloat(r['Corrosion_Impact_Percent']) || null,
          parseFloat(r['Time_Years']) || null,
          r['Condition'] || null,
        ]
      );
      count++;
    }

    const pv = await client.query('SELECT pipe_size_mm, thickness_mm, material, corrosion_pct, time_years, condition FROM ogo_pipe_metric LIMIT 10');
    return NextResponse.json({ status: 'ok', rows: count, preview: pv.rows });
  } catch (e: unknown) {
    return NextResponse.json({ status: 'error', error: String(e) });
  } finally {
    client.release();
  }
}
