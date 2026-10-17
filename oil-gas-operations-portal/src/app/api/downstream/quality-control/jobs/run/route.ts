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
      ['quality-control', 'quality-score-recalculation', 'running']
    );
    // Recalculate quality scores
    const { rowCount: updated } = await client.query(`
      UPDATE ogo_quality_metric SET quality_score = ROUND(
        (GREATEST(0, 100 - COALESCE(gr,50)) / 100.0 * 50 +
         LEAST(COALESCE(phind,15) / 30.0, 1.0) * 50)::numeric, 2)
    `);
    await client.query(
      `UPDATE ogo_job_run SET status='completed', finished_at=NOW(), rows_processed=$1, message=$2 WHERE id=$3`,
      [updated || 0, `Recalculated quality scores for ${updated || 0} records`, job.id]
    );
    return NextResponse.json({ success: true, job_id: job.id, rows_updated: updated || 0 });
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
      ['quality-control']
    );
    return NextResponse.json({ jobs: rows });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
