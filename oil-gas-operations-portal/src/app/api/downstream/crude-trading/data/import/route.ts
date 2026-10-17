export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import fs from 'fs';
import { parse } from 'csv-parse/sync';

const CSV_PATH = '/mnt/deepa/IoT/code/oil-gas-monitoring/data/kaggle/energy-market-prices/content/oil and gas.csv';

export async function POST() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS ogo_trading_metric (
        id SERIAL PRIMARY KEY,
        symbol TEXT,
        trade_date DATE,
        open_price NUMERIC,
        high_price NUMERIC,
        low_price NUMERIC,
        close_price NUMERIC,
        volume NUMERIC,
        currency TEXT,
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
    for (const row of records.slice(0, 10000)) {
      const symbol = row['Symbol'] || row['symbol'] || null;
      const tradeDate = row['Date'] || row['date'] || null;
      const open = parseFloat(row['Open'] || row['open'] || '0') || null;
      const high = parseFloat(row['High'] || row['high'] || '0') || null;
      const low = parseFloat(row['Low'] || row['low'] || '0') || null;
      const close = parseFloat(row['Close'] || row['close'] || '0') || null;
      const volume = parseFloat(row['Volume'] || row['volume'] || '0') || null;
      const currency = row['Currency'] || row['currency'] || 'USD';
      if (!tradeDate) { skipped++; continue; }
      try {
        await client.query(
          `INSERT INTO ogo_trading_metric (symbol, trade_date, open_price, high_price, low_price, close_price, volume, currency)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [symbol, tradeDate, open, high, low, close, volume, currency]
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
    await pool.query(`CREATE TABLE IF NOT EXISTS ogo_trading_metric (
      id SERIAL PRIMARY KEY, symbol TEXT, trade_date DATE, open_price NUMERIC,
      high_price NUMERIC, low_price NUMERIC, close_price NUMERIC,
      volume NUMERIC, currency TEXT, imported_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    const { rows } = await pool.query(`SELECT COUNT(*) as total FROM ogo_trading_metric`);
    return NextResponse.json({ rows: Number(rows[0].total) });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
