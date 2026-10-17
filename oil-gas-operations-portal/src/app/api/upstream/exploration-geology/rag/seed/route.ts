import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const DEPT = 'exploration-geology';

const DOMAIN_KNOWLEDGE = [
  `Exploration geology identifies subsurface hydrocarbon accumulations through seismic interpretation, well log analysis, and geological modeling. The petroleum system includes source rock, reservoir rock, seal, trap, and timing.`,
  `Well log interpretation: Gamma Ray (GR) measures clay content — high GR = shale/clay, low GR = clean sand. ILD_log10 (resistivity) identifies hydrocarbons — high resistivity in porous rock indicates oil/gas. Neutron-density crossplot distinguishes gas from oil.`,
  `Facies classification from well logs uses pattern recognition. Facies 1 (nonmarine sandstone): low GR, high porosity, high resistivity — prime reservoir target. Facies 5 (mudstone) and 4 (marine siltstone): high GR, act as seals or source rocks.`,
  `Porosity measurements: PHIND (density porosity) measures matrix + fluid porosity. DeltaPHI (neutron-density crossover) is used for gas identification — gas creates crossover due to low hydrogen index. PE (photoelectric factor) identifies lithology.`,
  `Formation tops from well logs: correlate between wells by matching GR signatures, marker beds, and lithological boundaries. Well log correlation establishes stratigraphic framework for field development planning.`,
  `Seismic-to-well tie: synthetic seismogram from well logs calibrates surface seismic data. Acoustic impedance contrasts create reflections. Zero-phase wavelets are standard. Polarity conventions follow SEG normal polarity.`,
  `Source rock evaluation: Total Organic Carbon (TOC) >2% indicates good source rock. Vitrinite reflectance (Ro) measures thermal maturity — 0.6-1.3% for oil window, >1.3% for gas. Kerogen types: I (marine algae), II (mixed marine/terrestrial), III (terrestrial).`,
  `Trap types: structural traps formed by anticlines, faults, salt domes. Stratigraphic traps formed by pinch-outs, unconformities, reefs. Combination traps. 4-way dip closures are the most secure structural traps for exploration targets.`,
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
