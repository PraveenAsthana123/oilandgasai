export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function ensureJobTable(client: import('pg').PoolClient) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS ogo_job_run (
      id SERIAL PRIMARY KEY, job_name TEXT, dept TEXT, status TEXT,
      rows_processed INT DEFAULT 0, result_json JSONB,
      started_at TIMESTAMPTZ DEFAULT NOW(), finished_at TIMESTAMPTZ
    )
  `);
}

export async function GET() {
  const client = await pool.connect();
  try {
    await ensureJobTable(client);
    const res = await client.query(
      `SELECT id, job_name, status, started_at, finished_at, rows_processed
       FROM ogo_job_run WHERE dept='midstream-gas-compression' ORDER BY started_at DESC LIMIT 20`
    );
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
    const ins = await client.query(
      `INSERT INTO ogo_job_run (job_name, dept, status) VALUES ($1,'midstream-gas-compression','running') RETURNING id`,
      [job_id]
    );
    const runId = ins.rows[0].id;
    let resultJson: Record<string, unknown> = {};
    let rowsProcessed = 0;

    if (job_id === 'compress-anomaly-detect') {
      const res = await client.query(`SELECT COUNT(*) AS cnt FROM ogo_iot_metric WHERE co>0.006 OR lpg>0.007`);
      rowsProcessed = parseInt(res.rows[0].cnt, 10);
      resultJson = { anomaly_count: rowsProcessed, thresholds: { co: 0.006, lpg: 0.007 } };
    } else if (job_id === 'compress-temp-trend') {
      const res = await client.query(`SELECT device, AVG(temp) AS avg_temp FROM ogo_iot_metric GROUP BY device ORDER BY avg_temp DESC LIMIT 10`);
      rowsProcessed = res.rows.length;
      resultJson = { temp_by_device: res.rows };
    } else if (job_id === 'compress-device-health') {
      const res = await client.query(`SELECT device, COUNT(*) AS reading_count FROM ogo_iot_metric GROUP BY device ORDER BY reading_count DESC`);
      rowsProcessed = res.rows.length;
      resultJson = { device_count: rowsProcessed, devices: res.rows };
    } else {
      resultJson = { message: `Unknown job: ${job_id}` };
    }

    await client.query(
      `UPDATE ogo_job_run SET status='success', finished_at=NOW(), rows_processed=$1, result_json=$2 WHERE id=$3`,
      [rowsProcessed, JSON.stringify(resultJson), runId]
    );
    return NextResponse.json({ status: 'success', job_id, rows_processed: rowsProcessed, result: resultJson });
  } catch (e: unknown) {
    return NextResponse.json({ status: 'error', error: String(e) });
  } finally { client.release(); }
}
