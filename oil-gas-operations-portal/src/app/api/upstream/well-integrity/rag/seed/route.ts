import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const DEPT = 'well-integrity';

const DOMAIN_KNOWLEDGE = [
  `Well integrity management ensures the containment of reservoir fluids throughout the well lifecycle. The ISO 16530 standard defines well integrity as the application of technical, operational, and organizational solutions to reduce the risk of uncontrolled release of formation fluids.`,
  `Barrier elements: primary barrier is typically production tubing + packer + wellhead. Secondary barrier includes production casing + cement + annular safety valve. Both barriers must be verified to declare well integrity assured.`,
  `Pipeline integrity management (PHMSA regulated): IMP (Integrity Management Program) requires regular assessment of high-consequence areas (HCAs). Assessment methods: ILI (inline inspection/smart pigging), pressure testing, direct assessment (ECDA/ICDA/SCCDA).`,
  `Common pipeline failure causes: corrosion (internal - microbiological/CO2/H2S, external - soil corrosivity/coating failure), material/weld defects, third-party excavation damage, incorrect operations, natural forces (erosion, seismic), mechanical failure.`,
  `Corrosion monitoring: ultrasonic thickness measurement, electrical resistance probes, corrosion coupons, biofilm sampling. Cathodic protection systems (impressed current or sacrificial anode) protect pipelines from external corrosion.`,
  `H2S (hydrogen sulfide) is a critical well integrity hazard. NACE MR0175/ISO 15156 defines material requirements for sour service. SSC (sulfide stress cracking) and HIC (hydrogen-induced cracking) are primary failure modes in H2S environments.`,
  `Blowout prevention: annular BOPs, ram BOPs (blind, pipe, shear). Well control procedures: shut-in BHP calculation, kill sheet preparation, driller's method vs. wait-and-weight method. Emergency response for kicks follows IADC procedures.`,
  `Well abandonment procedures (P&A): cement plugs placed across all productive zones, casing cut and removed or perforated and squeezed. Regulatory requirements vary by jurisdiction. Proper P&A prevents long-term environmental impact and maintains aquifer protection.`,
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
