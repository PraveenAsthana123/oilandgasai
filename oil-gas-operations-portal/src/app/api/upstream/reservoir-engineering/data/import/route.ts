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
  const csvPath = path.join(dataBase, 'data/kaggle/reservoir-inventory/content/Reservoir_NameBasin_RegionLocatio.csv');

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ogo_rsv_metric (
        id SERIAL PRIMARY KEY,
        reservoir_name TEXT,
        basin_region TEXT,
        location TEXT,
        proven_reserves NUMERIC,
        recoverable_reserves NUMERIC,
        production_capacity INT,
        oil_type TEXT,
        status TEXT,
        major_operators TEXT,
        year_discovered INT,
        notes TEXT,
        imported_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    const raw = fs.readFileSync(csvPath, 'utf-8');
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
    // Skip header row
    let imported = 0, errors = 0;

    for (const line of lines.slice(1)) {
      // Handle CSV with potential commas in quoted fields
      const cols = parseCSVLine(line);
      if (cols.length < 7) { errors++; continue; }
      try {
        const proven = parseFloat(cols[3]?.replace(/[^0-9.-]/g, '')) || null;
        const recoverable = parseFloat(cols[4]?.replace(/[^0-9.-]/g, '')) || null;
        const capacity = parseInt(cols[5]?.replace(/[^0-9]/g, '')) || null;
        const yearStr = cols[9]?.replace(/[^0-9]/g, '');
        const year = yearStr ? parseInt(yearStr) : null;
        await pool.query(
          `INSERT INTO ogo_rsv_metric (reservoir_name,basin_region,location,proven_reserves,recoverable_reserves,production_capacity,oil_type,status,major_operators,year_discovered,notes)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
          [cols[0], cols[1], cols[2], proven, recoverable, capacity, cols[6], cols[7], cols[8], year, cols[10] ?? '']
        );
        imported++;
      } catch { errors++; }
    }

    return NextResponse.json({ imported, errors, duration_ms: Date.now() - start });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

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
