export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Logistics CSV columns: Timestamp,Asset_ID,Latitude,Longitude,Inventory_Level,
// Shipment_Status,Temperature,Humidity,Traffic_Status,Waiting_Time,
// User_Transaction_Amount,User_Purchase_Frequency,Logistics_Delay_Reason,
// Asset_Utilization,Demand_Forecast,Logistics_Delay

import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import fs from 'fs';
import { parse } from 'csv-parse/sync';

const CSV_PATH = '/mnt/deepa/IoT/code/oil-gas-monitoring/data/kaggle/logistics/content/smart_logistics_dataset.csv';

export async function POST() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS ogo_logistics_metric (
        id SERIAL PRIMARY KEY,
        shipment_id TEXT,
        origin TEXT,
        destination TEXT,
        commodity TEXT,
        volume NUMERIC,
        delivery_days INT,
        cost NUMERIC,
        status TEXT,
        imported_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    if (!fs.existsSync(CSV_PATH)) {
      return NextResponse.json({ error: 'CSV not found', path: CSV_PATH }, { status: 404 });
    }

    const content = fs.readFileSync(CSV_PATH, 'utf-8');
    const records = parse(content, { columns: true, skip_empty_lines: true, trim: true });

    let inserted = 0, skipped = 0;
    await client.query('BEGIN');
    for (const row of records.slice(0, 5000)) {
      const shipment_id = row['Asset_ID'] || null;
      const origin = row['Traffic_Status'] || null; // best proxy
      const destination = row['Logistics_Delay_Reason'] || null;
      const commodity = 'petroleum';
      const volume = parseFloat(row['Inventory_Level'] || '0') || null;
      const delivery_days = parseInt(row['Waiting_Time'] || '0') || null;
      const cost = parseFloat(row['User_Transaction_Amount'] || '0') || null;
      const status = row['Shipment_Status'] || null;
      try {
        await client.query(
          `INSERT INTO ogo_logistics_metric (shipment_id, origin, destination, commodity, volume, delivery_days, cost, status)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [shipment_id, origin, destination, commodity, volume, delivery_days, cost, status]
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
    await pool.query(`CREATE TABLE IF NOT EXISTS ogo_logistics_metric (
      id SERIAL PRIMARY KEY, shipment_id TEXT, origin TEXT, destination TEXT,
      commodity TEXT, volume NUMERIC, delivery_days INT, cost NUMERIC,
      status TEXT, imported_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    const { rows } = await pool.query(`SELECT COUNT(*) as total FROM ogo_logistics_metric`);
    return NextResponse.json({ rows: Number(rows[0].total) });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
