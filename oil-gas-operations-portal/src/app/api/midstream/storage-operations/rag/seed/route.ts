export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const KNOWLEDGE = [
  { source: 'storage-overview', content: 'Natural gas storage facilities: depleted reservoirs (largest capacity), aquifer storage, and salt caverns (fastest injection/withdrawal). US total working gas capacity ~4.1 Tcf. Key storage states: TX, LA, PA, WV, OH.' },
  { source: 'inventory-management', content: 'Storage inventory management balances injection season (April-October) and withdrawal season (November-March). End-of-October target inventory: 3.5-3.8 Tcf. Below 3.2 Tcf = supply risk signal.' },
  { source: 'production-reporting', content: 'ONRR (Office of Natural Resources Revenue) tracks federal land production. Volumes in Mcf (thousand cubic feet) for gas, Bbl for oil. Offshore production: Gulf of Mexico, Pacific, Alaska. Onshore: Western, Eastern states.' },
  { source: 'seasonal-patterns', content: 'Gas storage follows seasonal cycles: net injection April-October, net withdrawal November-March. Texas and Louisiana show less seasonality. Northern states (PA, OH, MI) show high winter withdrawal rates.' },
  { source: 'commodity-types', content: 'Storage commodities: natural gas (Mcf), crude oil (Bbl), condensate, NGLs. Gas (Mcf) represents majority of federal production. Disposition codes: Sales-Royalty Due-MEASURED = verified production; Not Measured = estimated.' },
  { source: 'low-inventory-alerts', content: 'Low inventory thresholds: state below 90% of 5-year average = watch; below 80% = warning; below 70% = critical. Supply curtailment risk begins when regional hub storage drops below 60% working capacity.' },
  { source: 'salt-cavern-design', content: 'Salt cavern storage design requires minimum cavern roof depth of 460m to ensure overburden pressure exceeds maximum operating pressure (MOP). Cavern shape optimization uses sonar surveys; the ideal aspect ratio (height/diameter) is 2:1. Leaching rate targets 1,000-3,000 m³/day fresh water injection. Nitrogen blanket pressure at top of cavern prevents brine contamination of gas. Working gas capacity = total gas volume − base gas volume; base gas provides pressure support and typically represents 30-50% of total capacity.' },
  { source: 'storage-well-integrity', content: 'Underground storage well integrity is governed by AER Directive 065 and CSA Z341. Casing pressure tests at 110% MOP are required before initial fill and every 5 years. The wellbore must maintain mechanical integrity per the B1 pressure test criterion (sustained casing pressure <10% of MAOP or <344 kPa over 30 minutes). Storage deliverability declines as reservoir pressure drops; deliverability D = C(P_r² - P_wf²)^n where C and n are backpressure curve constants from well tests.' },
];

async function ensureTable(client: import('pg').PoolClient) {
  await client.query(`CREATE TABLE IF NOT EXISTS ogo_rag_chunk (id SERIAL PRIMARY KEY, dept TEXT, source TEXT, content TEXT, created_at TIMESTAMPTZ DEFAULT NOW())`);
}

export async function GET() {
  const client = await pool.connect();
  try {
    await ensureTable(client);
    const res = await client.query(`SELECT COUNT(*) AS cnt FROM ogo_rag_chunk WHERE dept='midstream-storage-operations'`);
    return NextResponse.json({ status: 'ok', chunks_seeded: parseInt(res.rows[0].cnt, 10) });
  } catch (e: unknown) { return NextResponse.json({ status: 'error', error: String(e) }); }
  finally { client.release(); }
}

export async function POST(_req: NextRequest) {
  const client = await pool.connect();
  try {
    await ensureTable(client);
    await client.query(`DELETE FROM ogo_rag_chunk WHERE dept='midstream-storage-operations'`);
    for (const chunk of KNOWLEDGE) {
      await client.query(`INSERT INTO ogo_rag_chunk (dept, source, content) VALUES ($1,$2,$3)`, ['midstream-storage-operations', chunk.source, chunk.content]);
    }
    return NextResponse.json({ status: 'ok', chunks_seeded: KNOWLEDGE.length });
  } catch (e: unknown) { return NextResponse.json({ status: 'error', error: String(e) }); }
  finally { client.release(); }
}
