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
  const csvPath = path.join(dataBase, 'data/kaggle/well-facies/content/facies_data.csv');

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ogo_exp_metric (
        id SERIAL PRIMARY KEY,
        facies INT,
        formation TEXT,
        well_name TEXT,
        depth NUMERIC,
        gr NUMERIC,
        ild_log10 NUMERIC,
        delta_phi NUMERIC,
        phind NUMERIC,
        pe NUMERIC,
        nm_m INT,
        relpos NUMERIC,
        imported_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    const raw = fs.readFileSync(csvPath, 'utf-8');
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
    // Header: Facies,Formation,Well Name,Depth,GR,ILD_log10,DeltaPHI,PHIND,PE,NM_M,RELPOS
    let imported = 0, errors = 0;

    for (const line of lines.slice(1)) {
      const cols = line.split(',');
      if (cols.length < 9) { errors++; continue; }
      try {
        await pool.query(
          `INSERT INTO ogo_exp_metric (facies,formation,well_name,depth,gr,ild_log10,delta_phi,phind,pe,nm_m,relpos)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
          [
            parseInt(cols[0]) || null, cols[1]?.trim(), cols[2]?.trim(),
            parseFloat(cols[3]) || null, parseFloat(cols[4]) || null,
            parseFloat(cols[5]) || null, parseFloat(cols[6]) || null,
            parseFloat(cols[7]) || null, parseFloat(cols[8]) || null,
            parseInt(cols[9]) || null, parseFloat(cols[10]) || null
          ]
        );
        imported++;
      } catch { errors++; }
    }

    return NextResponse.json({ imported, errors, duration_ms: Date.now() - start });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
