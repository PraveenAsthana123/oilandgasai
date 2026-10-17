export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import pool from '@/lib/db';

const CHUNKS = [
  'Refinery throughput is measured in barrels per day (BPD). A typical large refinery processes 200,000–500,000 BPD of crude oil. Utilization rates above 85% are considered efficient.',
  'Crude distillation units (CDU) separate crude oil into fractions by boiling point: LPG, naphtha, kerosene, gasoil, and residue. The atmospheric tower is the first processing step.',
  'Fluid Catalytic Cracking (FCC) converts heavy gas oils into lighter, higher-value products including gasoline (FCC naphtha) and LPG. Catalyst regeneration is a continuous process.',
  'Refinery yield optimization involves maximizing gasoline and distillate cuts while minimizing low-value fuel oil. Linear programming (LP) models are the industry standard for planning.',
  'Key refinery KPIs: Energy Intensity Index (EII), Solomon Utilization Factor, distillate yield %, gasoline yield %, residue yield %, and unplanned downtime hours.',
  'Hydrocracking converts vacuum gas oil into diesel and jet fuel with high selectivity. Operating pressures of 1,500–2,500 psi require specialized high-pressure equipment.',
  'Nelson Complexity Index measures the relative cost of refinery hardware. High-complexity refineries (NCI > 10) can process heavier, cheaper crudes profitably.',
  'Refinery margins are the difference between the price of refined products (crack spread) and crude oil feedstock cost. Margins are volatile and linked to product demand seasonality.',
];

export async function POST() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS ogo_rag_chunk (
        id SERIAL PRIMARY KEY,
        dept TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await client.query(`DELETE FROM ogo_rag_chunk WHERE dept = 'refining-operations'`);
    let seeded = 0;
    for (const chunk of CHUNKS) {
      await client.query(
        `INSERT INTO ogo_rag_chunk (dept, content) VALUES ($1, $2)`,
        ['refining-operations', chunk]
      );
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
      `SELECT id, dept, LEFT(content,100) AS preview, created_at FROM ogo_rag_chunk WHERE dept='refining-operations' ORDER BY id`
    );
    return NextResponse.json({ chunks: rows, count: rows.length });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
