export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import pool from '@/lib/db';

const CHUNKS = [
  'Gamma Ray (GR) logs measure natural radioactivity in formations. High GR (>75 API units) indicates shaly formations; low GR (<30 API) suggests clean sandstone or carbonate — good reservoir quality.',
  'ILD_log10 (deep induction log) measures formation resistivity. High resistivity in a porous zone indicates hydrocarbon saturation. Water-saturated sands show low resistivity values.',
  'PHIND (neutron-density crossplot porosity) is a composite porosity indicator. Values above 15% indicate good reservoir porosity. Gas-bearing formations show a characteristic "crossover" effect.',
  'PE (photoelectric factor) distinguishes lithology: limestone PE ~5, dolomite PE ~3, sandstone PE ~1.8. High PE with low GR indicates carbonate facies favorable for oil accumulation.',
  'Well facies classification groups similar rock properties into hydraulic flow units. Facies 1-3 typically represent shales; facies 4-6 are transitional; facies 7-9 are high-quality reservoir sands.',
  'Process engineering in refineries involves heat integration, catalyst management, and unit optimization. Pinch analysis identifies heat recovery opportunities reducing energy costs by 20–40%.',
  'Distillation column optimization requires balancing reflux ratio, feed tray location, and reboiler duty. Simulation tools like Aspen HYSYS predict performance under different operating conditions.',
  'Bottleneck identification uses constraint theory: the slowest unit (CDU, FCC, or HT) limits total throughput. Debottlenecking by 10% can increase refinery profits by $10-50M/year.',
];

export async function POST() {
  const client = await pool.connect();
  try {
    await client.query(`CREATE TABLE IF NOT EXISTS ogo_rag_chunk (
      id SERIAL PRIMARY KEY, dept TEXT, content TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    await client.query(`DELETE FROM ogo_rag_chunk WHERE dept='process-engineering'`);
    let seeded = 0;
    for (const chunk of CHUNKS) {
      await client.query(`INSERT INTO ogo_rag_chunk (dept, content) VALUES ($1, $2)`, ['process-engineering', chunk]);
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
      `SELECT id, dept, LEFT(content,100) AS preview, created_at FROM ogo_rag_chunk WHERE dept='process-engineering' ORDER BY id`
    );
    return NextResponse.json({ chunks: rows, count: rows.length });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
