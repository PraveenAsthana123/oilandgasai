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
  const start = Date.now();
  const dataBase = process.env.DATA_BASE_PATH ?? '/mnt/deepa/IoT/code/oil-gas-monitoring';
  const csvPath = path.join(dataBase, 'data/kaggle/production-trends/content/OGORBcsv_cleaned.csv');

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ogo_prod_metric (
        id SERIAL PRIMARY KEY,
        production_date DATE,
        land_class TEXT,
        land_category TEXT,
        state TEXT,
        county TEXT,
        commodity TEXT,
        volume NUMERIC,
        imported_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    const raw = fs.readFileSync(csvPath, 'utf-8');
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
    // Header: Production Date,Land Class,Land Category,State,County,FIPS Code,Offshore Region,Commodity,Disposition Code,Disposition Description,Volume
    let imported = 0, errors = 0;

    for (const line of lines.slice(1)) {
      const cols = parseCSVLine(line);
      if (cols.length < 11) { errors++; continue; }
      try {
        const volStr = cols[10]?.replace(/[^0-9.-]/g, '');
        const volume = parseFloat(volStr) || 0;
        if (volume === 0) { errors++; continue; }
        // Parse date MM/DD/YYYY
        const dateParts = cols[0]?.split('/');
        let prodDate: string | null = null;
        if (dateParts?.length === 3) {
          prodDate = `${dateParts[2]}-${dateParts[0].padStart(2,'0')}-${dateParts[1].padStart(2,'0')}`;
        }
        await pool.query(
          `INSERT INTO ogo_prod_metric (production_date,land_class,land_category,state,county,commodity,volume) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [prodDate, cols[1], cols[2], cols[3], cols[4], cols[7], volume]
        );
        imported++;
      } catch { errors++; }
    }

    return NextResponse.json({ imported, errors, duration_ms: Date.now() - start });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
