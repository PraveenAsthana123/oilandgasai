export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS ogo_trading_metric (
      id SERIAL PRIMARY KEY, symbol TEXT, trade_date DATE, open_price NUMERIC,
      high_price NUMERIC, low_price NUMERIC, close_price NUMERIC,
      volume NUMERIC, currency TEXT, imported_at TIMESTAMPTZ DEFAULT NOW()
    )`);

    const [latestRes, rangeRes, trendRes, volRes] = await Promise.all([
      pool.query(`SELECT symbol, close_price, trade_date
        FROM ogo_trading_metric WHERE symbol IN ('BZ=F','CL=F','NG=F')
        ORDER BY trade_date DESC LIMIT 3`),
      pool.query(`SELECT symbol,
        ROUND(MIN(low_price)::numeric,2) AS low30,
        ROUND(MAX(high_price)::numeric,2) AS high30,
        ROUND(AVG(close_price)::numeric,2) AS avg_close
        FROM ogo_trading_metric
        WHERE trade_date >= NOW() - INTERVAL '30 days'
        GROUP BY symbol`),
      pool.query(`SELECT symbol, trade_date, close_price
        FROM ogo_trading_metric
        WHERE symbol IN ('BZ=F','CL=F')
        ORDER BY trade_date DESC LIMIT 60`),
      pool.query(`SELECT symbol, ROUND(AVG(volume)::numeric,0) AS avg_vol FROM ogo_trading_metric GROUP BY symbol ORDER BY avg_vol DESC LIMIT 5`),
    ]);

    // Latest prices keyed by symbol
    const prices: Record<string, number> = {};
    for (const r of latestRes.rows) prices[r.symbol] = Number(r.close_price);

    return NextResponse.json({
      kpis: {
        brent_price: prices['BZ=F'] ?? null,
        wti_price: prices['CL=F'] ?? null,
        natgas_price: prices['NG=F'] ?? null,
      },
      price_range_30d: rangeRes.rows,
      price_trend: trendRes.rows.reverse(),
      volume: volRes.rows,
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
