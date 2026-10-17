export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Dataset 1: methane_hist_emissions.csv — Country, Sector, Gas, Unit, 1990..2018 year columns
// Dataset 2: Oil spillage dataset.csv — Spill / Vessel, Location, Dates, Min Tonnes, Max Tonnes, Owner

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

const METHANE_CSV = '/mnt/deepa/IoT/code/oil-gas-monitoring/data/kaggle/methane-emissions/content/methane_hist_emissions.csv';
const SPILL_CSV = '/mnt/deepa/IoT/code/oil-gas-monitoring/data/kaggle/oil-spill-incidents/content/Oil spillage dataset.csv';

export async function POST(req: Request) {
  const { dataset } = await req.json().catch(() => ({ dataset: 'methane' }));
  const client = await pool.connect();

  try {
    if (dataset === 'spill') {
      // Oil spill table
      await client.query(`
        CREATE TABLE IF NOT EXISTS ogo_spill_metric (
          id SERIAL PRIMARY KEY,
          vessel TEXT,
          location TEXT,
          incident_date TEXT,
          min_tonnes NUMERIC,
          max_tonnes NUMERIC,
          owner TEXT,
          imported_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      if (!fs.existsSync(SPILL_CSV)) {
        return NextResponse.json({ error: 'Spill CSV not found', path: SPILL_CSV }, { status: 404 });
      }
      const content = fs.readFileSync(SPILL_CSV, 'utf-8');
      const records = parseCSV(content);
      let inserted = 0, skipped = 0;
      await client.query('BEGIN');
      for (const row of records) {
        const vessel = row['Spill / Vessel'] || row['spill / vessel'] || null;
        const location = row['Location'] || null;
        const incidentDate = row['Dates'] || null;
        const minT = parseFloat(row['Min Tonnes'] || row['min tonnes'] || '0') || null;
        const maxT = parseFloat(row['Max Tonnes'] || row['max tonnes'] || '0') || null;
        const owner = row['Owner'] || null;
        try {
          await client.query(
            `INSERT INTO ogo_spill_metric (vessel, location, incident_date, min_tonnes, max_tonnes, owner) VALUES ($1,$2,$3,$4,$5,$6)`,
            [vessel, location, incidentDate, minT, maxT, owner]
          );
          inserted++;
        } catch { skipped++; }
      }
      await client.query('COMMIT');
      return NextResponse.json({ success: true, dataset: 'spill', inserted, skipped, total: records.length });
    }

    // Default: methane emissions
    await client.query(`
      CREATE TABLE IF NOT EXISTS ogo_enviro_metric (
        id SERIAL PRIMARY KEY,
        country TEXT,
        sector TEXT,
        gas TEXT,
        unit TEXT,
        year INT,
        value NUMERIC,
        imported_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    if (!fs.existsSync(METHANE_CSV)) {
      return NextResponse.json({ error: 'Methane CSV not found', path: METHANE_CSV }, { status: 404 });
    }
    const content = fs.readFileSync(METHANE_CSV, 'utf-8');
    const records = parseCSV(content);

    let inserted = 0, skipped = 0;
    await client.query('BEGIN');
    for (const row of records.slice(0, 20000)) {
      const country = row['Country'] || row['country'] || null;
      const sector = row['Sector'] || row['sector'] || null;
      const gas = row['Gas'] || row['gas'] || null;
      const unit = row['Unit'] || row['unit'] || null;
      // Year columns: 1990 through 2018
      for (let yr = 1990; yr <= 2018; yr++) {
        const val = parseFloat(row[String(yr)] || '0');
        if (!val) continue;
        try {
          await client.query(
            `INSERT INTO ogo_enviro_metric (country, sector, gas, unit, year, value) VALUES ($1,$2,$3,$4,$5,$6)`,
            [country, sector, gas, unit, yr, val]
          );
          inserted++;
        } catch { skipped++; }
      }
    }
    await client.query('COMMIT');
    return NextResponse.json({ success: true, dataset: 'methane', inserted, skipped, total: records.length });
  } catch (err: unknown) {
    await client.query('ROLLBACK').catch(() => {});
    return NextResponse.json({ error: String(err) }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function GET() {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS ogo_enviro_metric (
      id SERIAL PRIMARY KEY, country TEXT, sector TEXT, gas TEXT, unit TEXT,
      year INT, value NUMERIC, imported_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    await pool.query(`CREATE TABLE IF NOT EXISTS ogo_spill_metric (
      id SERIAL PRIMARY KEY, vessel TEXT, location TEXT, incident_date TEXT,
      min_tonnes NUMERIC, max_tonnes NUMERIC, owner TEXT, imported_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    const [e, s] = await Promise.all([
      pool.query(`SELECT COUNT(*) as total FROM ogo_enviro_metric`),
      pool.query(`SELECT COUNT(*) as total FROM ogo_spill_metric`),
    ]);
    return NextResponse.json({ methane_rows: Number(e.rows[0].total), spill_rows: Number(s.rows[0].total) });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
