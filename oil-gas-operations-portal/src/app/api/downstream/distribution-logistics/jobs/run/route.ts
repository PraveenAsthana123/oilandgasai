export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST() {
  const client = await pool.connect();
  try {
    await client.query(`CREATE TABLE IF NOT EXISTS ogo_job_run (
      id SERIAL PRIMARY KEY, dept TEXT, job_name TEXT, status TEXT DEFAULT 'running',
      started_at TIMESTAMPTZ DEFAULT NOW(), finished_at TIMESTAMPTZ, rows_processed INT DEFAULT 0, message TEXT
    )`);
    const { rows: [job] } = await client.query(
      `INSERT INTO ogo_job_run (dept, job_name, status) VALUES ($1, $2, $3) RETURNING id`,
      ['distribution-logistics', 'shipment-status-sync', 'running']
    );
    const { rows } = await client.query(`SELECT COUNT(*) as cnt FROM ogo_logistics_metric`);
    const rowCount = Number(rows[0]?.cnt || 0);
    await client.query(
      `UPDATE ogo_job_run SET status='completed', finished_at=NOW(), rows_processed=$1, message=$2 WHERE id=$3`,
      [rowCount, `Synced ${rowCount} shipment records`, job.id]
    );
    return NextResponse.json({ success: true, job_id: job.id, rows_processed: rowCount });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function GET() {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS ogo_job_run (
      id SERIAL PRIMARY KEY, dept TEXT, job_name TEXT, status TEXT,
      started_at TIMESTAMPTZ DEFAULT NOW(), finished_at TIMESTAMPTZ, rows_processed INT, message TEXT
    )`);
    const { rows } = await pool.query(
      `SELECT * FROM ogo_job_run WHERE dept=$1 ORDER BY started_at DESC LIMIT 20`,
      ['distribution-logistics']
    );
    return NextResponse.json({ jobs: rows });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
