import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function POST(_req: NextRequest) {
  const start = Date.now();
  const dataBase = process.env.DATA_BASE_PATH ?? '/mnt/deepa/IoT/code/oil-gas-monitoring';
  const csvPath = path.join(dataBase, 'data/kaggle/drilling-gas-peaks/content/GAS Peaks-Drilling_Well.csv');

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ogo_drill_metric (
        id SERIAL PRIMARY KEY,
        depth_m NUMERIC,
        total_gas_ppm NUMERIC,
        c1_ppm NUMERIC,
        c2_ppm NUMERIC,
        c3_ppm NUMERIC,
        ic4_ppm NUMERIC,
        nc4_ppm NUMERIC,
        ic5_ppm NUMERIC,
        nc5_ppm NUMERIC,
        gas_type TEXT,
        imported_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    const raw = fs.readFileSync(csvPath, 'utf-8');
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);

    // Skip header rows (first 4 lines are metadata/headers)
    let dataStart = 0;
    for (let i = 0; i < lines.length; i++) {
      const first = lines[i].split(',')[1]?.trim();
      if (first && !isNaN(Number(first))) { dataStart = i; break; }
    }

    let imported = 0;
    let errors = 0;
    const dataLines = lines.slice(dataStart);

    for (const line of dataLines) {
      const cols = line.split(',');
      // Format: blank, depth, total_gas, c1, c2, c3, ic4, nc4, ic5, nc5, gas_type
      const depth = parseFloat(cols[1]);
      const totalGas = parseFloat(cols[2]);
      if (isNaN(depth) || isNaN(totalGas)) { errors++; continue; }
      const c1 = parseFloat(cols[3]) || 0;
      const c2 = parseFloat(cols[4]) || 0;
      const c3 = parseFloat(cols[5]) || 0;
      const ic4 = parseFloat(cols[6]) || 0;
      const nc4 = parseFloat(cols[7]) || 0;
      const ic5 = parseFloat(cols[8]) || 0;
      const nc5 = parseFloat(cols[9]) || 0;
      const gasType = cols[10]?.trim() || 'UNKNOWN';
      try {
        await pool.query(
          `INSERT INTO ogo_drill_metric (depth_m, total_gas_ppm, c1_ppm, c2_ppm, c3_ppm, ic4_ppm, nc4_ppm, ic5_ppm, nc5_ppm, gas_type)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [depth, totalGas, c1, c2, c3, ic4, nc4, ic5, nc5, gasType]
        );
        imported++;
      } catch { errors++; }
    }

    return NextResponse.json({ imported, errors, duration_ms: Date.now() - start });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
