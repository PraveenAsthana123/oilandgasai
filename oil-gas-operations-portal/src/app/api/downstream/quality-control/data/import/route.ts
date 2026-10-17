export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import fs from 'fs';
function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']));
  });
}

const CSV_PATH = '/mnt/deepa/IoT/code/oil-gas-monitoring/data/kaggle/well-facies/content/facies_data.csv';

export async function POST() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS ogo_quality_metric (
        id SERIAL PRIMARY KEY,
        well_name TEXT,
        formation TEXT,
        gr NUMERIC,
        pe NUMERIC,
        phind NUMERIC,
        quality_score NUMERIC,
        imported_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    if (!fs.existsSync(CSV_PATH)) {
      return NextResponse.json({ error: 'CSV not found', path: CSV_PATH }, { status: 404 });
    }

    const content = fs.readFileSync(CSV_PATH, 'utf-8');
    const records = parseCSV(content);

    let inserted = 0, skipped = 0;
    await client.query('BEGIN');
    for (const row of records.slice(0, 5000)) {
      const well = row['Well Name'] || row['well_name'] || null;
      const formation = row['Formation'] || row['formation'] || null;
      const gr = parseFloat(row['GR'] || '0') || null;
      const pe = parseFloat(row['PE'] || '0') || null;
      const phind = parseFloat(row['PHIND'] || '0') || null;
      // Quality score: normalize GR (lower=better), PHIND (higher=better), PE proximity to sandstone
      const grScore = gr ? Math.max(0, 100 - gr) / 100 : 0.5;
      const phindScore = phind ? Math.min(phind / 30, 1) : 0.5;
      const quality_score = Math.round((grScore * 50 + phindScore * 50) * 100) / 100;
      try {
        await client.query(
          `INSERT INTO ogo_quality_metric (well_name, formation, gr, pe, phind, quality_score) VALUES ($1,$2,$3,$4,$5,$6)`,
          [well, formation, gr, pe, phind, quality_score]
        );
        inserted++;
      } catch { skipped++; }
    }
    await client.query('COMMIT');
    return NextResponse.json({ success: true, inserted, skipped, total: records.length });
  } catch (err: unknown) {
    await client.query('ROLLBACK').catch(() => {});
    return NextResponse.json({ error: String(err) }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function GET() {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS ogo_quality_metric (
      id SERIAL PRIMARY KEY, well_name TEXT, formation TEXT, gr NUMERIC,
      pe NUMERIC, phind NUMERIC, quality_score NUMERIC, imported_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    const { rows } = await pool.query(`SELECT COUNT(*) as total FROM ogo_quality_metric`);
    return NextResponse.json({ rows: Number(rows[0].total) });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
