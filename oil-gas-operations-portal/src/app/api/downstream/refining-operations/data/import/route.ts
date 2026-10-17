export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const CSV_PATH = '/mnt/deepa/IoT/code/oil-gas-monitoring/data/kaggle/production-trends/content/OGORBcsv_cleaned.csv';

export async function POST() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS ogo_refine_metric (
        id SERIAL PRIMARY KEY,
        production_date DATE,
        commodity TEXT,
        volume NUMERIC,
        state TEXT,
        imported_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    if (!fs.existsSync(CSV_PATH)) {
      return NextResponse.json({ error: 'CSV file not found', path: CSV_PATH }, { status: 404 });
    }

    const content = fs.readFileSync(CSV_PATH, 'utf-8');
    const records = parse(content, { columns: true, skip_empty_lines: true, trim: true });

    let inserted = 0;
    let skipped = 0;
    await client.query('BEGIN');
    for (const row of records.slice(0, 5000)) {
      const dateVal = row['Production_Date'] || row['production_date'] || null;
      const commodity = row['Commodity'] || row['commodity'] || null;
      const volume = parseFloat(row['Volume'] || row['volume'] || '0') || null;
      const state = row['State'] || row['state'] || null;
      if (!dateVal) { skipped++; continue; }
      try {
        await client.query(
          `INSERT INTO ogo_refine_metric (production_date, commodity, volume, state) VALUES ($1, $2, $3, $4)`,
          [dateVal, commodity, volume, state]
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
    await pool.query(`CREATE TABLE IF NOT EXISTS ogo_refine_metric (
      id SERIAL PRIMARY KEY, production_date DATE, commodity TEXT,
      volume NUMERIC, state TEXT, imported_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    const { rows } = await pool.query(`SELECT COUNT(*) as total FROM ogo_refine_metric`);
    return NextResponse.json({ rows: Number(rows[0].total) });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
