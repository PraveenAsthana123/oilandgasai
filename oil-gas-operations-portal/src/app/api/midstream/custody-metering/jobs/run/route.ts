export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import fs from 'fs';
import { parse } from 'csv-parse/sync';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const DATA_BASE_PATH = process.env.DATA_BASE_PATH ?? '/mnt/deepa/IoT/code/oil-gas-monitoring';
const CSV_PATH = `${DATA_BASE_PATH}/data/kaggle/production-trends/content/OGORBcsv_cleaned.csv`;

async function ensureTables(client: import('pg').PoolClient) {
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
  await client.query(`
    CREATE TABLE IF NOT EXISTS ogo_job_run (
      id SERIAL PRIMARY KEY,
      job_name TEXT,
      status TEXT,
      rows_processed INT,
      started_at TIMESTAMPTZ DEFAULT NOW(),
      completed_at TIMESTAMPTZ
    )
  `);
}

export async function GET() {
  const client = await pool.connect();
  try {
    await ensureTables(client);
    const res = await client.query(`SELECT * FROM ogo_job_run WHERE job_name LIKE 'midstream_metering%' ORDER BY started_at DESC LIMIT 20`);
    return NextResponse.json({ history: res.rows });
  } catch (e: unknown) { return NextResponse.json({ history: [], error: String(e) }); }
  finally { client.release(); }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const jobId: string = body.job_id ?? 'metering-reconciliation';
  const client = await pool.connect();
  try {
    await ensureTables(client);
    const jobRes = await client.query(
      `INSERT INTO ogo_job_run (job_name, status, rows_processed, started_at) VALUES ($1,'running',0,NOW()) RETURNING id`,
      [`midstream_metering_${jobId}`]
    );
    const runId: number = jobRes.rows[0].id;

    let rowsProcessed = 0;
    let detail: Record<string, unknown> = {};

    try {
      if (jobId === 'metering-data-import') {
        if (!fs.existsSync(CSV_PATH)) throw new Error(`CSV not found: ${CSV_PATH}`);
        const raw = fs.readFileSync(CSV_PATH, 'utf-8');
        const records = parse(raw, { columns: true, skip_empty_lines: true, trim: true });
        await client.query('DELETE FROM ogo_metering_metric');
        for (const r of records.slice(0, 100000)) {
          const dateVal = r['Production_Date'] || r['production_date'] || null;
          await client.query(
            `INSERT INTO ogo_metering_metric (production_date, commodity, volume, state) VALUES ($1,$2,$3,$4)`,
            [dateVal ? new Date(dateVal).toISOString().split('T')[0] : null, r['Commodity'] || r['commodity'] || null, r['Volume'] ? parseFloat(r['Volume']) : null, r['State'] || r['state'] || null]
          );
          rowsProcessed++;
        }
        detail = { action: 'import', rows_imported: rowsProcessed };
      } else if (jobId === 'metering-reconciliation') {
        const res = await client.query(`SELECT COUNT(*) AS total, COUNT(CASE WHEN state IS NULL THEN 1 END) AS missing_state, COUNT(CASE WHEN volume IS NULL OR volume <= 0 THEN 1 END) AS invalid_volume FROM ogo_metering_metric`);
        rowsProcessed = parseInt(res.rows[0].total, 10);
        detail = { total: rowsProcessed, missing_state: parseInt(res.rows[0].missing_state, 10), invalid_volume: parseInt(res.rows[0].invalid_volume, 10) };
      } else if (jobId === 'metering-volume-summary') {
        const res = await client.query(`SELECT commodity, SUM(volume) AS total_volume, COUNT(*) AS records FROM ogo_metering_metric GROUP BY commodity ORDER BY total_volume DESC LIMIT 10`);
        rowsProcessed = res.rowCount ?? 0;
        detail = { commodities: res.rows };
      }

      await client.query(`UPDATE ogo_job_run SET status='success', rows_processed=$1, completed_at=NOW() WHERE id=$2`, [rowsProcessed, runId]);
      return NextResponse.json({ status: 'success', job_id: jobId, rows_processed: rowsProcessed, run_id: runId, ...detail });
    } catch (innerErr) {
      await client.query(`UPDATE ogo_job_run SET status='error', completed_at=NOW() WHERE id=$1`, [runId]);
      return NextResponse.json({ status: 'error', error: String(innerErr), run_id: runId }, { status: 500 });
    }
  } catch (e: unknown) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
  finally { client.release(); }
}
