export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function ensureJobTable(client: import('pg').PoolClient) {
  await client.query(`CREATE TABLE IF NOT EXISTS ogo_job_run (id SERIAL PRIMARY KEY, job_name TEXT, dept TEXT, status TEXT, rows_processed INT DEFAULT 0, result_json JSONB, started_at TIMESTAMPTZ DEFAULT NOW(), finished_at TIMESTAMPTZ)`);
}

export async function GET() {
  const client = await pool.connect();
  try {
    await ensureJobTable(client);
    const res = await client.query(`SELECT id, job_name, status, started_at, finished_at, rows_processed FROM ogo_job_run WHERE dept='midstream-gas-processing' ORDER BY started_at DESC LIMIT 20`);
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
    const ins = await client.query(`INSERT INTO ogo_job_run (job_name, dept, status) VALUES ($1,'midstream-gas-processing','running') RETURNING id`, [job_id]);
    const runId = ins.rows[0].id;
    let resultJson: Record<string, unknown> = {};
    let rowsProcessed = 0;

    if (job_id === 'gasdem-peak-analysis') {
      const res = await client.query(`SELECT year, month, SUM(value) AS total_mmcf FROM ogo_gasdem_metric GROUP BY year, month ORDER BY total_mmcf DESC LIMIT 10`);
      rowsProcessed = res.rows.length;
      resultJson = { peak_months: res.rows };
    } else if (job_id === 'gasdem-state-summary') {
      const res = await client.query(`SELECT area_name, SUM(value) AS total_mmcf FROM ogo_gasdem_metric GROUP BY area_name ORDER BY total_mmcf DESC LIMIT 15`);
      rowsProcessed = res.rows.length;
      resultJson = { state_summary: res.rows };
    } else if (job_id === 'gasdem-process-split') {
      const res = await client.query(`SELECT process_name, SUM(value) AS total_mmcf FROM ogo_gasdem_metric GROUP BY process_name ORDER BY total_mmcf DESC`);
      rowsProcessed = res.rows.length;
      resultJson = { process_split: res.rows };
    } else {
      resultJson = { message: `Unknown job: ${job_id}` };
    }

    await client.query(`UPDATE ogo_job_run SET status='success', finished_at=NOW(), rows_processed=$1, result_json=$2 WHERE id=$3`, [rowsProcessed, JSON.stringify(resultJson), runId]);
    return NextResponse.json({ status: 'success', job_id, rows_processed: rowsProcessed, result: resultJson });
  } catch (e: unknown) {
    return NextResponse.json({ status: 'error', error: String(e) });
  } finally { client.release(); }
}
