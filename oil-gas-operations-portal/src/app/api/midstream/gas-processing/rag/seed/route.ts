export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const KNOWLEDGE = [
  { source: 'gas-processing-overview', content: 'Natural gas processing removes impurities (H2S, CO2, N2, water) and separates NGLs (ethane, propane, butane) from methane. Key processes: amine treating, glycol dehydration, cryogenic extraction, fractionation.' },
  { source: 'eia-demand-data', content: 'EIA natural gas demand data covers commercial (VCS), residential (VRS), industrial (VIN), electric power (VEI), and vehicle fuel consumption. Units in MMcf (million cubic feet). Data is monthly by US state and territory.' },
  { source: 'seasonal-patterns', content: 'Natural gas demand peaks in winter (November-February) due to heating and in summer (July-August) for power generation cooling. Peak-to-trough ratios can be 3-4x in cold climate states like NY, PA, OH, MI.' },
  { source: 'processing-capacity', content: 'US gas processing capacity: ~80 Bcf/d. Key processing states: TX (40% of capacity), WY, LA, CO, WV. Capacity utilization >90% triggers throughput constraints and associated gas curtailments.' },
  { source: 'ngl-recovery', content: 'NGL recovery varies by inlet gas composition. Rich gas (high BTU) yields more NGLs. Ethane recovery depends on fractionation economics vs. rejection. Propane and butane always recovered at positive spreads.' },
  { source: 'commercial-consumption', content: 'Commercial natural gas consumption (process-name: Commercial Consumption) covers office buildings, retail, and institutions. High in densely populated states (NY, CA, TX, FL). Sensitive to weather and economic activity.' },
  { source: 'glycol-dehydration', content: 'Glycol dehydration removes water vapor to meet pipeline spec (typically <65 mg/m³ or 4 lb/MMscf). Triethylene glycol (TEG) is the industry standard with absorption efficiency >99%. The glycol-to-water ratio must exceed 25 L TEG per kg H2O absorbed. Reboiler temperature of 204°C achieves 99.95% pure lean glycol. Structured packing in contactors reduces pressure drop vs. bubble-cap trays while maintaining equivalent theoretical stages.' },
  { source: 'cryogenic-ngl-extraction', content: 'Cryogenic NGL extraction uses the Joule-Thomson effect and turboexpanders to achieve temperatures of -100°C, recovering ethane (C2+) at >95% efficiency. The demethanizer column separates methane overhead from NGL liquid bottoms. Heat integration via feed/product exchangers recovers 85-90% of refrigeration duty. C2 rejection mode bypasses the cold box when ethane prices are below fuel value parity, switching the plant to propane-plus recovery only.' },
];

async function ensureTable(client: import('pg').PoolClient) {
  await client.query(`CREATE TABLE IF NOT EXISTS ogo_rag_chunk (id SERIAL PRIMARY KEY, dept TEXT, source TEXT, content TEXT, created_at TIMESTAMPTZ DEFAULT NOW())`);
}

export async function GET() {
  const client = await pool.connect();
  try {
    await ensureTable(client);
    const res = await client.query(`SELECT COUNT(*) AS cnt FROM ogo_rag_chunk WHERE dept='midstream-gas-processing'`);
    return NextResponse.json({ status: 'ok', chunks_seeded: parseInt(res.rows[0].cnt, 10) });
  } catch (e: unknown) {
    return NextResponse.json({ status: 'error', error: String(e) });
  } finally { client.release(); }
}

export async function POST(_req: NextRequest) {
  const client = await pool.connect();
  try {
    await ensureTable(client);
    await client.query(`DELETE FROM ogo_rag_chunk WHERE dept='midstream-gas-processing'`);
    for (const chunk of KNOWLEDGE) {
      await client.query(`INSERT INTO ogo_rag_chunk (dept, source, content) VALUES ($1,$2,$3)`, ['midstream-gas-processing', chunk.source, chunk.content]);
    }
    return NextResponse.json({ status: 'ok', chunks_seeded: KNOWLEDGE.length });
  } catch (e: unknown) {
    return NextResponse.json({ status: 'error', error: String(e) });
  } finally { client.release(); }
}
