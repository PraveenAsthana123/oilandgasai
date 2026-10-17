import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const DEPT = 'production-engineering';

const DOMAIN_KNOWLEDGE = [
  `Production engineering optimizes the extraction of oil and gas from reservoirs to surface. Key systems: wellbore completion, artificial lift, surface facilities, pipeline network, and production measurement.`,
  `Artificial lift methods increase production when reservoir pressure is insufficient: ESP (Electric Submersible Pump) for high-volume oil wells, gas lift for high GOR wells, rod pump (beam pump) for low-rate stripper wells, PCP (progressive cavity pump) for heavy oil.`,
  `Well performance analysis uses inflow performance relationships (IPR) and tubing performance curves (TPR/VLP). The intersection of IPR and TPR gives the natural flow rate. Nodal analysis optimizes the system from reservoir to separator.`,
  `Production decline analysis: exponential decline applies to boundary-dominated flow. Hyperbolic decline better fits early production in unconventional wells (shale). Harmonic decline is the limit case of hyperbolic. DCA predicts EUR (estimated ultimate recovery).`,
  `Gas commodities: Gas measured in Mcf (thousand cubic feet) or MMBtu. NGL (natural gas liquids) includes ethane, propane, butanes, pentane. Oil measured in barrels (BBL). BOE (barrel of oil equivalent) = 6 Mcf gas = 1 BOE.`,
  `US production regions: Gulf of Mexico offshore (deep water), Permian Basin (TX/NM), Eagle Ford (TX), Bakken (ND), Marcellus/Utica (PA/WV/OH). Federal vs state lands have different royalty structures and reporting requirements to ONRR.`,
  `Flow assurance addresses fluid flow issues: wax deposition (requires pigging), hydrate formation (requires inhibitors like MEG/methanol), scale buildup (requires scale inhibitors), corrosion (monitoring + inhibitors), slugging (separator design).`,
  `Production optimization: real-time monitoring of wellhead pressure, temperature, and flow rates. SCADA systems collect data. Digital twins model well performance. Machine learning predicts failures. Target: maximize oil rate while managing GOR and water cut.`,
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
