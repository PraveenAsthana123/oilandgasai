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
  const csvPath = path.join(dataBase, 'data/kaggle/well-facies/content/facies_data.csv');

  await pool.query(`CREATE TABLE IF NOT EXISTS ogo_job_run (id SERIAL PRIMARY KEY, job_name TEXT, status TEXT, rows_processed INT DEFAULT 0, started_at TIMESTAMPTZ, completed_at TIMESTAMPTZ)`);
  await pool.query(`CREATE TABLE IF NOT EXISTS ogo_exp_metric (id SERIAL PRIMARY KEY, facies INT, formation TEXT, well_name TEXT, depth NUMERIC, gr NUMERIC, ild_log10 NUMERIC, delta_phi NUMERIC, phind NUMERIC, pe NUMERIC, nm_m INT, relpos NUMERIC, imported_at TIMESTAMPTZ DEFAULT NOW())`);

  let rowsProcessed = 0, jobStatus = 'success';
  try {
    const raw = fs.readFileSync(csvPath, 'utf-8');
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean).slice(1);
    for (const line of lines) {
      const cols = line.split(',');
      if (cols.length < 9) continue;
      try {
        await pool.query(
          `INSERT INTO ogo_exp_metric (facies,formation,well_name,depth,gr,ild_log10,delta_phi,phind,pe,nm_m,relpos) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
          [parseInt(cols[0])||null,cols[1]?.trim(),cols[2]?.trim(),parseFloat(cols[3])||null,parseFloat(cols[4])||null,parseFloat(cols[5])||null,parseFloat(cols[6])||null,parseFloat(cols[7])||null,parseFloat(cols[8])||null,parseInt(cols[9])||null,parseFloat(cols[10])||null]
        );
        rowsProcessed++;
      } catch { /* skip */ }
    }
  } catch { jobStatus = 'error'; }

  const completedAt = new Date();
  const { rows } = await pool.query(`INSERT INTO ogo_job_run (job_name,status,rows_processed,started_at,completed_at) VALUES ($1,$2,$3,$4,$5) RETURNING *`, ['upstream_exploration_import', jobStatus, rowsProcessed, startedAt, completedAt]);
  return NextResponse.json(rows[0]);
}
