import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function parseCSVLine(line: string): string[] {
  const result: string[] = []; let current = ''; let inQuote = false;
  for (const ch of line) {
    if (ch === '"') { inQuote = !inQuote; }
    else if (ch === ',' && !inQuote) { result.push(current.trim()); current = ''; }
    else { current += ch; }
  }
  result.push(current.trim()); return result;
}

export async function POST(_req: NextRequest) {
  const startedAt = new Date();
  const dataBase = process.env.DATA_BASE_PATH ?? '/mnt/deepa/IoT/code/oil-gas-monitoring';
  const csvPath = path.join(dataBase, 'data/kaggle/production-trends/content/OGORBcsv_cleaned.csv');

  await pool.query(`CREATE TABLE IF NOT EXISTS ogo_job_run (id SERIAL PRIMARY KEY, job_name TEXT, status TEXT, rows_processed INT DEFAULT 0, started_at TIMESTAMPTZ, completed_at TIMESTAMPTZ)`);
  await pool.query(`CREATE TABLE IF NOT EXISTS ogo_prod_metric (id SERIAL PRIMARY KEY, production_date DATE, land_class TEXT, land_category TEXT, state TEXT, county TEXT, commodity TEXT, volume NUMERIC, imported_at TIMESTAMPTZ DEFAULT NOW())`);

  let rowsProcessed = 0, jobStatus = 'success';
  try {
    const raw = fs.readFileSync(csvPath, 'utf-8');
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean).slice(1);
    for (const line of lines) {
      const cols = parseCSVLine(line);
      if (cols.length < 11) continue;
      const vol = parseFloat(cols[10]?.replace(/[^0-9.-]/g, '')) || 0;
      if (vol === 0) continue;
      const dp = cols[0]?.split('/');
      const pd = dp?.length === 3 ? `${dp[2]}-${dp[0].padStart(2,'0')}-${dp[1].padStart(2,'0')}` : null;
      try { await pool.query(`INSERT INTO ogo_prod_metric (production_date,land_class,land_category,state,county,commodity,volume) VALUES ($1,$2,$3,$4,$5,$6,$7)`, [pd,cols[1],cols[2],cols[3],cols[4],cols[7],vol]); rowsProcessed++; } catch { /* skip */ }
    }
  } catch { jobStatus = 'error'; }

  const { rows } = await pool.query(`INSERT INTO ogo_job_run (job_name,status,rows_processed,started_at,completed_at) VALUES ($1,$2,$3,$4,$5) RETURNING *`, ['upstream_production_import', jobStatus, rowsProcessed, startedAt, new Date()]);
  return NextResponse.json(rows[0]);
}
