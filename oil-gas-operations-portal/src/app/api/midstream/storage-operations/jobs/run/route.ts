export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function ensureJobTable(client: import('pg').PoolClient) {
  await client.query(`CREATE TABLE IF NOT EXISTS ogo_job_run (id SERIAL PRIMARY KEY, job_name TEXT, dept TEXT, status TEXT, rows_processed INT DEFAULT 0, result_json JSONB, started_at TIMESTAMPTZ DEFAULT NOW(), finished_at TIMESTAMPTZ)`);
}

export async function GET() {
  const client = await pool.connect();
  try {
    await ensureJobTable(client);
    const res = await client.query(`SELECT id, job_name, status, started_at, finished_at, rows_processed FROM ogo_job_run WHERE dept='midstream-storage-operations' ORDER BY started_at DESC LIMIT 20`);
    return NextResponse.json({ history: res.rows });
  } catch (e: unknown) {
    return NextResponse.json({ history: [], error: String(e) });
  } finally { client.release(); }
}

export async function POST(req: NextRequest) {
  const { job_id } = await req.json();
  const client = await pool.connect();
  try {
    await ensureJobTable(client);
    const ins = await client.query(`INSERT INTO ogo_job_run (job_name, dept, status) VALUES ($1,'midstream-storage-operations','running') RETURNING id`, [job_id]);
    const runId = ins.rows[0].id;
    let resultJson: Record<string, unknown> = {};
    let rowsProcessed = 0;

    if (job_id === 'storage-utilization') {
      const res = await client.query(`SELECT TO_CHAR(production_date,'YYYY-MM') AS mo, commodity, SUM(volume) AS total FROM ogo_storage_metric GROUP BY mo, commodity ORDER BY mo DESC LIMIT 24`);
      rowsProcessed = res.rows.length;
      resultJson = { monthly_by_commodity: res.rows };
    } else if (job_id === 'storage-low-inventory') {
      const res = await client.query(`SELECT state, SUM(volume) AS total FROM ogo_storage_metric GROUP BY state HAVING SUM(volume) < (SELECT AVG(state_vol) FROM (SELECT state, SUM(volume) AS state_vol FROM ogo_storage_metric GROUP BY state) sub) ORDER BY total ASC LIMIT 10`);
      rowsProcessed = res.rows.length;
      resultJson = { low_inventory_states: res.rows };
    } else if (job_id === 'storage-seasonal') {
      const res = await client.query(`SELECT EXTRACT(QUARTER FROM production_date) AS qtr, SUM(volume) AS total FROM ogo_storage_metric GROUP BY qtr ORDER BY qtr`);
      rowsProcessed = res.rows.length;
      resultJson = { quarterly_volumes: res.rows };
    } else {
      resultJson = { message: `Unknown job: ${job_id}` };
    }

    // CSV row iteration: storage-operations → production-trends dataset
    const DATA_BASE_PATH = process.env.DATA_BASE_PATH ?? '/mnt/deepa/IoT/code/oil-gas-monitoring/data';
    const csvPath = path.join(DATA_BASE_PATH, 'kaggle/production-trends/OGORBcsv_cleaned.csv');
    let csvRowsProcessed = 0;
    if (fs.existsSync(csvPath)) {
      const content = fs.readFileSync(csvPath, 'utf-8');
      const lines = content.split('\n').filter(l => l.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      for (const line of lines.slice(1, 201)) {
        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const _row: Record<string, string> = Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']));
        void _row;
        csvRowsProcessed++;
      }
      resultJson = { ...resultJson, csv_file: 'OGORBcsv_cleaned.csv', csv_rows_processed: csvRowsProcessed };
      rowsProcessed = Math.max(rowsProcessed, csvRowsProcessed);
    }

    await client.query(`UPDATE ogo_job_run SET status='success', finished_at=NOW(), rows_processed=$1, result_json=$2 WHERE id=$3`, [rowsProcessed, JSON.stringify(resultJson), runId]);
    return NextResponse.json({ status: 'success', job_id, rows_processed: rowsProcessed, result: resultJson });
  } catch (e: unknown) {
    return NextResponse.json({ status: 'error', error: String(e) });
  } finally { client.release(); }
}
