import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuote = false;
  for (const ch of line) {
    if (ch === '"') { inQuote = !inQuote; }
    else if (ch === ',' && !inQuote) { result.push(current.trim()); current = ''; }
    else { current += ch; }
  }
  result.push(current.trim());
  return result;
}

export async function POST(_req: NextRequest) {
  const startedAt = new Date();
  const dataBase = process.env.DATA_BASE_PATH ?? '/mnt/deepa/IoT/code/oil-gas-monitoring';
  const csvPath = path.join(dataBase, 'data/kaggle/reservoir-inventory/content/Reservoir_NameBasin_RegionLocatio.csv');

  await pool.query(`CREATE TABLE IF NOT EXISTS ogo_job_run (id SERIAL PRIMARY KEY, job_name TEXT, status TEXT, rows_processed INT DEFAULT 0, started_at TIMESTAMPTZ, completed_at TIMESTAMPTZ)`);
  await pool.query(`CREATE TABLE IF NOT EXISTS ogo_rsv_metric (id SERIAL PRIMARY KEY, reservoir_name TEXT, basin_region TEXT, location TEXT, proven_reserves NUMERIC, recoverable_reserves NUMERIC, production_capacity INT, oil_type TEXT, status TEXT, major_operators TEXT, year_discovered INT, notes TEXT, imported_at TIMESTAMPTZ DEFAULT NOW())`);

  let rowsProcessed = 0, jobStatus = 'success';
  try {
    const raw = fs.readFileSync(csvPath, 'utf-8');
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean).slice(1);
    for (const line of lines) {
      const cols = parseCSVLine(line);
      if (cols.length < 7) continue;
      const proven = parseFloat(cols[3]?.replace(/[^0-9.-]/g, '')) || null;
      const capacity = parseInt(cols[5]?.replace(/[^0-9]/g, '')) || null;
      const year = parseInt(cols[9]?.replace(/[^0-9]/g, '')) || null;
      try {
        await pool.query(
          `INSERT INTO ogo_rsv_metric (reservoir_name,basin_region,location,proven_reserves,production_capacity,oil_type,status,major_operators,year_discovered,notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [cols[0],cols[1],cols[2],proven,capacity,cols[6],cols[7],cols[8],year,cols[10]??'']
        );
        rowsProcessed++;
      } catch { /* skip bad rows */ }
    }
  } catch { jobStatus = 'error'; }

  const completedAt = new Date();
  const { rows } = await pool.query(
    `INSERT INTO ogo_job_run (job_name,status,rows_processed,started_at,completed_at) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    ['upstream_reservoir_import', jobStatus, rowsProcessed, startedAt, completedAt]
  );
  return NextResponse.json(rows[0]);
}
