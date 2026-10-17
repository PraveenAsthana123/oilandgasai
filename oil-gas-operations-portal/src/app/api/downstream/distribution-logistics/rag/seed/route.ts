export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import pool from '@/lib/db';

const CHUNKS = [
  'Petroleum product distribution uses four main modes: pipelines (cheapest for large volumes), tankers (ocean/river), railcars (flexibility), and tanker trucks (last-mile). Mode selection depends on distance, volume, urgency, and infrastructure.',
  'Pipeline scheduling uses a product interface management system (PIMS). Products are shipped as slugs separated by interface batches. Interface contamination is managed by diverting to off-spec tanks.',
  'On-time delivery rate is a key KPI. Industry benchmark: >95% on-time for domestic pipeline, >92% for marine. Delays cause downstream shutdowns costing $50,000–$500,000 per day.',
  'Transportation cost optimization: full truck loads (FTL) vs less-than-truckload (LTL), round-trip optimization, backhaul opportunities, and fuel surcharge management reduce costs by 15–25%.',
  'Inventory management uses safety stock calculations based on demand variability and lead time. Lean inventory reduces carrying costs but increases stockout risk for critical fuels.',
  'Smart logistics uses GPS tracking, IoT sensors (temperature, pressure, flow), and AI-powered route optimization. Real-time visibility reduces delivery exceptions by 30%.',
  'Petroleum tanker scheduling: berth availability, vessel arrival windows, terminal throughput, and customs clearance are critical path items. VLCC tankers carry 2M barrels; Aframax 700K barrels.',
  'Distribution loss control: pipeline shrinkage should be <0.1% of throughput. Measurement discrepancies trigger custody transfer audit and potential regulatory reporting obligations.',
];

export async function POST() {
  const client = await pool.connect();
  try {
    await client.query(`CREATE TABLE IF NOT EXISTS ogo_rag_chunk (
      id SERIAL PRIMARY KEY, dept TEXT, content TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    await client.query(`DELETE FROM ogo_rag_chunk WHERE dept='distribution-logistics'`);
    let seeded = 0;
    for (const chunk of CHUNKS) {
      await client.query(`INSERT INTO ogo_rag_chunk (dept, content) VALUES ($1,$2)`, ['distribution-logistics', chunk]);
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
      `SELECT id, dept, LEFT(content,100) AS preview, created_at FROM ogo_rag_chunk WHERE dept='distribution-logistics' ORDER BY id`
    );
    return NextResponse.json({ chunks: rows, count: rows.length });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
