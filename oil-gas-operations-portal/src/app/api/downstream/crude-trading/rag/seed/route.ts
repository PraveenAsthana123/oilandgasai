export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import pool from '@/lib/db';

const CHUNKS = [
  'WTI (West Texas Intermediate) and Brent are the two global crude oil benchmarks. WTI is landlocked at Cushing, Oklahoma; Brent reflects North Sea supply. The WTI-Brent spread reflects US export logistics and global demand balance.',
  'OPEC+ production decisions are the primary driver of global oil prices. Supply cuts raise prices; increases lower them. Non-OPEC supply growth (US shale) moderates OPEC+ pricing power.',
  'Crack spreads measure refinery profitability: the difference between crude input cost and product output value. 3-2-1 crack spread = (2×gasoline + 1×distillate − 3×crude) / 3. Positive spread encourages refinery runs.',
  'Crude oil futures are traded on CME (WTI, ticker CL) and ICE (Brent, ticker B). Contracts are for 1,000 barrels. Backwardation (spot > futures) signals tight near-term supply; contango (spot < futures) allows storage arbitrage.',
  'Energy price volatility is driven by geopolitical events, weather (hurricanes, cold snaps), economic data (GDP, PMI), US EIA weekly inventory reports, and OPEC+ meetings. Implied volatility (OVX) measures market uncertainty.',
  'Natural gas prices (Henry Hub, NYMEX NG) are seasonal. Winter demand (heating) and summer demand (power generation) create predictable patterns, modulated by LNG exports and production growth.',
  'Trading strategies: paper trading (futures/options), physical trading (cargoes), and derivatives (swaps, options). Risk management uses Value at Risk (VaR), stop-loss orders, and portfolio hedging.',
  'Price forecasting models: time-series (ARIMA, GARCH for volatility), fundamental analysis (supply/demand balances), machine learning (LSTM networks for price prediction), and sentiment analysis of news/social media.',
];

export async function POST() {
  const client = await pool.connect();
  try {
    await client.query(`CREATE TABLE IF NOT EXISTS ogo_rag_chunk (
      id SERIAL PRIMARY KEY, dept TEXT, content TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    await client.query(`DELETE FROM ogo_rag_chunk WHERE dept='crude-trading'`);
    let seeded = 0;
    for (const chunk of CHUNKS) {
      await client.query(`INSERT INTO ogo_rag_chunk (dept, content) VALUES ($1,$2)`, ['crude-trading', chunk]);
      seeded++;
    }
    return NextResponse.json({ success: true, seeded });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function GET() {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS ogo_rag_chunk (
      id SERIAL PRIMARY KEY, dept TEXT, content TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    const { rows } = await pool.query(
      `SELECT id, dept, LEFT(content,100) AS preview, created_at FROM ogo_rag_chunk WHERE dept='crude-trading' ORDER BY id`
    );
    return NextResponse.json({ chunks: rows, count: rows.length });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
