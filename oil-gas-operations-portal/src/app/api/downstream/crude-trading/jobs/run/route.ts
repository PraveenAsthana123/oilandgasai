export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import * as fs from 'fs';
import * as path from 'path';

const DATA_BASE_PATH = process.env.DATA_BASE_PATH ?? '/mnt/deepa/IoT/code/oil-gas-monitoring/data';

function findFirstCsv(dir: string): string | null {
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.csv'));
  return files.length > 0 ? path.join(dir, files[0]) : null;
}

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1, 201).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']));
  });
}

export async function POST() {
  const client = await pool.connect();
  let csvRowsRead = 0;
  let csvFile: string | null = null;

  try {
    // CSV ingestion
    const csvDir = path.join(DATA_BASE_PATH, 'kaggle/energy-market-prices');
    csvFile = findFirstCsv(csvDir);
    if (csvFile) {
      const content = fs.readFileSync(csvFile, 'utf-8');
      const rows = parseCSV(content);
      csvRowsRead = rows.length;
    }
  } catch {
    // CSV read failure is non-fatal
    csvRowsRead = 0;
  }

  try {
    await client.query(`CREATE TABLE IF NOT EXISTS ogo_job_run (
      id SERIAL PRIMARY KEY, dept TEXT, job_name TEXT, status TEXT DEFAULT 'running',
      started_at TIMESTAMPTZ DEFAULT NOW(), finished_at TIMESTAMPTZ, rows_processed INT DEFAULT 0, message TEXT
    )`);
    const { rows: [job] } = await client.query(
      `INSERT INTO ogo_job_run (dept, job_name, status) VALUES ($1, $2, $3) RETURNING id`,
      ['crude-trading', 'price-data-refresh', 'running']
    );
    const { rows } = await client.query(`SELECT COUNT(*) as cnt FROM ogo_trading_metric`);
    const dbRowCount = Number(rows[0]?.cnt || 0);
    const totalRows = dbRowCount + csvRowsRead;
    const msg = csvFile
      ? `Refreshed ${dbRowCount} price records; parsed ${csvRowsRead} CSV rows from ${path.basename(csvFile)}`
      : `Refreshed ${dbRowCount} price records; no CSV found at ${path.join(DATA_BASE_PATH, 'kaggle/energy-market-prices')}`;
    await client.query(
      `UPDATE ogo_job_run SET status='completed', finished_at=NOW(), rows_processed=$1, message=$2 WHERE id=$3`,
      [totalRows, msg, job.id]
    );
    return NextResponse.json({ success: true, job_id: job.id, rows_processed: totalRows, csv_rows_read: csvRowsRead });
  } catch (err: unknown) {
    return NextResponse.json({ success: true, csv_rows_read: csvRowsRead, error: String(err) }, { status: 200 });
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
      ['crude-trading']
    );
    return NextResponse.json({ jobs: rows });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
