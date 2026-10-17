import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function POST(_req: NextRequest) {
  const startedAt = new Date();
  const dataBase = process.env.DATA_BASE_PATH ?? '/mnt/deepa/IoT/code/oil-gas-monitoring';
  const csvPath = path.join(dataBase, 'data/kaggle/drilling-gas-peaks/content/GAS Peaks-Drilling_Well.csv');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ogo_job_run (
      id SERIAL PRIMARY KEY,
      job_name TEXT NOT NULL,
      status TEXT NOT NULL,
      rows_processed INT DEFAULT 0,
      started_at TIMESTAMPTZ,
      completed_at TIMESTAMPTZ
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ogo_drill_metric (
      id SERIAL PRIMARY KEY,
      depth_m NUMERIC, total_gas_ppm NUMERIC, c1_ppm NUMERIC,
      c2_ppm NUMERIC, c3_ppm NUMERIC, ic4_ppm NUMERIC, nc4_ppm NUMERIC,
      ic5_ppm NUMERIC, nc5_ppm NUMERIC, gas_type TEXT,
      imported_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  let rowsProcessed = 0;
  let status = 'success';
  try {
    const raw = fs.readFileSync(csvPath, 'utf-8');
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
    let dataStart = 0;
    for (let i = 0; i < lines.length; i++) {
      if (!isNaN(Number(lines[i].split(',')[1]?.trim()))) { dataStart = i; break; }
    }
    for (const line of lines.slice(dataStart)) {
      const cols = line.split(',');
      const depth = parseFloat(cols[1]);
      const totalGas = parseFloat(cols[2]);
      if (isNaN(depth) || isNaN(totalGas)) continue;
      await pool.query(
        `INSERT INTO ogo_drill_metric (depth_m,total_gas_ppm,c1_ppm,c2_ppm,c3_ppm,ic4_ppm,nc4_ppm,ic5_ppm,nc5_ppm,gas_type)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [depth, totalGas, parseFloat(cols[3])||0, parseFloat(cols[4])||0,
         parseFloat(cols[5])||0, parseFloat(cols[6])||0, parseFloat(cols[7])||0,
         parseFloat(cols[8])||0, parseFloat(cols[9])||0, cols[10]?.trim()||'UNKNOWN']
      );
      rowsProcessed++;
    }
  } catch { status = 'error'; }

  const completedAt = new Date();
  const { rows } = await pool.query(
    `INSERT INTO ogo_job_run (job_name, status, rows_processed, started_at, completed_at)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    ['upstream_drilling_import', status, rowsProcessed, startedAt, completedAt]
  );
  return NextResponse.json(rows[0]);
}
