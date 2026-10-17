import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const DEPT = 'reservoir-engineering';

const DOMAIN_KNOWLEDGE = [
  `Reservoir engineering is the application of scientific principles to the drainage problems arising during the development and production of oil and gas reservoirs. Key metrics include porosity, permeability, saturation, and formation volume factor.`,
  `Proven reserves (1P) are quantities of oil expected to be commercially recoverable with reasonable certainty. Probable reserves (2P) add locations reasonably expected to be developed. Possible reserves (3P) are less certain. The Orinoco Belt holds world record heavy oil deposits.`,
  `Production capacity in barrels per day (BPD) depends on reservoir pressure, fluid viscosity, permeability, and well completion. Light crude (API >31°) flows easily. Heavy crude (API 10-22°) requires thermal EOR methods like SAGD or steam flooding.`,
  `Enhanced Oil Recovery (EOR) methods: thermal (steam injection, SAGD for heavy oil), chemical (polymer flooding, surfactant), gas injection (CO2, natural gas, nitrogen). EOR can recover 30-60% of original oil in place versus 20-40% primary recovery.`,
  `Material balance equation (MBE) is fundamental to reservoir engineering. It relates reservoir fluid expansion to production: Np*Bo = N*[(Bo-Boi) + m*Boi*(Bg/Bgi - 1)] + We. This tracks pressure decline and depletion mechanism.`,
  `Basin analysis identifies structural traps (anticlines, faults), stratigraphic traps (pinch-outs, unconformities), and combination traps. Major basins: Permian (USA), Orinoco Belt (Venezuela), Ghawar field (Saudi Arabia), Khurais (Saudi Arabia).`,
  `Reservoir simulation uses numerical models to predict fluid behavior. Grid-based models solve flow equations at each cell. History matching calibrates simulation to actual production data. Forecast scenarios guide development decisions.`,
  `Well test analysis: pressure buildup tests measure skin factor, permeability. Deliverability tests establish Absolute Open Flow (AOF). Interference tests determine interwell connectivity. DST (drillstem test) evaluates formation productivity.`,
];

export async function POST(_req: NextRequest) {
  await pool.query(`CREATE TABLE IF NOT EXISTS ogo_rag_chunk (id SERIAL PRIMARY KEY, content TEXT, source_doc TEXT, dept TEXT, embedding_status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT NOW())`);
  await pool.query(`DELETE FROM ogo_rag_chunk WHERE dept = $1`, [DEPT]);

  let chunksCreated = 0;
  for (const chunk of DOMAIN_KNOWLEDGE) {
    const parts = chunk.match(/.{1,400}/g) ?? [chunk];
    for (const part of parts) {
      await pool.query(`INSERT INTO ogo_rag_chunk (content,source_doc,dept,embedding_status) VALUES ($1,$2,$3,'seeded')`, [part.trim(), 'domain-knowledge', DEPT]);
      chunksCreated++;
    }
  }
  return NextResponse.json({ chunks_created: chunksCreated });
}
