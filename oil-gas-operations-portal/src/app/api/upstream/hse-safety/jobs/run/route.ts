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
  const csvPath = path.join(dataBase, 'data/kaggle/pipeline-accidents/content/database.csv');

  await pool.query(`CREATE TABLE IF NOT EXISTS ogo_job_run (id SERIAL PRIMARY KEY, job_name TEXT, status TEXT, rows_processed INT DEFAULT 0, started_at TIMESTAMPTZ, completed_at TIMESTAMPTZ)`);
  await pool.query(`CREATE TABLE IF NOT EXISTS ogo_hse_metric (id SERIAL PRIMARY KEY, report_number TEXT, accident_year INT, accident_date TEXT, operator_name TEXT, accident_state TEXT, cause_category TEXT, severity TEXT, liquid_ignition BOOLEAN, liquid_explosion BOOLEAN, public_evacuations BOOLEAN, unintentional_release NUMERIC, all_injuries INT, all_fatalities INT, emergency_response_costs NUMERIC, environmental_remediation_costs NUMERIC, all_costs NUMERIC, imported_at TIMESTAMPTZ DEFAULT NOW())`);

  let rowsProcessed = 0, jobStatus = 'success';
  try {
    const raw = fs.readFileSync(csvPath, 'utf-8');
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean).slice(1);
    for (const line of lines) {
      const cols = parseCSVLine(line);
      if (cols.length < 48) continue;
      try {
        const injuries = parseInt(cols[36]?.replace(/[^0-9]/g,''))||0;
        const fatalities = parseInt(cols[41]?.replace(/[^0-9]/g,''))||0;
        const severity = fatalities > 0 ? 'CRITICAL' : injuries > 0 ? 'HIGH' : parseFloat(cols[19]?.replace(/[^0-9.-]/g,''))||0 > 100 ? 'MEDIUM' : 'LOW';
        await pool.query(`INSERT INTO ogo_hse_metric (report_number,accident_year,accident_date,operator_name,accident_state,cause_category,severity,liquid_ignition,liquid_explosion,public_evacuations,unintentional_release,all_injuries,all_fatalities,emergency_response_costs,environmental_remediation_costs,all_costs) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
          [cols[0],parseInt(cols[2])||null,cols[3],cols[5],cols[14],cols[17],severity,cols[23]?.toUpperCase()==='YES',cols[24]?.toUpperCase()==='YES',cols[28]?.toUpperCase()==='YES',parseFloat(cols[19]?.replace(/[^0-9.-]/g,''))||0,injuries,fatalities,parseFloat(cols[44]?.replace(/[^0-9.-]/g,''))||0,parseFloat(cols[45]?.replace(/[^0-9.-]/g,''))||0,parseFloat(cols[47]?.replace(/[^0-9.-]/g,''))||0]);
        rowsProcessed++;
      } catch { /* skip */ }
    }
  } catch { jobStatus = 'error'; }

  const { rows } = await pool.query(`INSERT INTO ogo_job_run (job_name,status,rows_processed,started_at,completed_at) VALUES ($1,$2,$3,$4,$5) RETURNING *`, ['upstream_hse_import', jobStatus, rowsProcessed, startedAt, new Date()]);
  return NextResponse.json(rows[0]);
}
