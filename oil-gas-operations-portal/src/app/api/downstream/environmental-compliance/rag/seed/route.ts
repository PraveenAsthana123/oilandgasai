export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import pool from '@/lib/db';

const CHUNKS = [
  'Methane (CH4) is 80x more potent than CO2 over 20 years as a greenhouse gas. Oil & gas operations (upstream: well pads, midstream: pipelines/compressors, downstream: refineries) account for ~30% of global anthropogenic methane emissions.',
  'EPA Subpart W (Greenhouse Gas Reporting Program) requires U.S. petroleum and natural gas systems to report annual methane emissions. Venting, flaring, and fugitive emissions are tracked separately.',
  'MARPOL Convention (Annex I) regulates oil pollution from ships. Maximum oil content in discharge: 15 ppm. Oil Record Books document all cargo operations, ballast, and bilge water handling.',
  'LDAR (Leak Detection and Repair) programs use OGI (optical gas imaging) cameras, sniffers, and drone surveys to detect methane leaks. EPA Method 21 is the standard for component-level measurement.',
  'Carbon capture and storage (CCS) and methane utilization (converting waste methane to energy) are key decarbonization strategies. Blue hydrogen uses natural gas with CCS; green hydrogen uses renewable electrolysis.',
  'Oil spill response follows the Incident Command System (ICS). Response tiers: Tier 1 (operator, <50 bbl), Tier 2 (regional, 50-2000 bbl), Tier 3 (national/international, >2000 bbl). USCG coordinates US responses.',
  'Environmental compliance KPIs: VOC emissions (tons/year), flaring efficiency (>98%), water discharge quality (mg/L), spill frequency (events/year), and GHG intensity (MTCO2e/bbl produced).',
  'Paris Agreement commitments require oil & gas companies to set Scope 1, 2, and 3 emission reduction targets. Net-zero pledges by 2050 require methane intensity below 0.2% by 2025 (OGCI target).',
];

export async function POST() {
  const client = await pool.connect();
  try {
    await client.query(`CREATE TABLE IF NOT EXISTS ogo_rag_chunk (
      id SERIAL PRIMARY KEY, dept TEXT, content TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    await client.query(`DELETE FROM ogo_rag_chunk WHERE dept='environmental-compliance'`);
    let seeded = 0;
    for (const chunk of CHUNKS) {
      await client.query(`INSERT INTO ogo_rag_chunk (dept, content) VALUES ($1,$2)`, ['environmental-compliance', chunk]);
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
      `SELECT id, dept, LEFT(content,100) AS preview, created_at FROM ogo_rag_chunk WHERE dept='environmental-compliance' ORDER BY id`
    );
    return NextResponse.json({ chunks: rows, count: rows.length });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
