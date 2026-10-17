import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const DEPT = 'drilling-engineering';

const DOMAIN_KNOWLEDGE = [
  `Drilling engineering involves designing and executing wellbore construction plans. Key parameters include well depth, formation pressure, mud weight, casing design, and bit selection. Gas shows during drilling are critical safety and evaluation indicators.`,
  `Gas chromatography during drilling (mud logging) measures C1 (methane), C2 (ethane), C3 (propane), iC4 (isobutane), nC4 (normal butane), iC5, nC5 components. Total gas in ppm indicates formation hydrocarbon presence.`,
  `Free Gas (FG) shows occur when gas from formation enters the wellbore directly. Background Gas (BG) is baseline gas dissolved in drilling mud. Abnormal gas peaks indicate potential reservoir zones or well control events.`,
  `Drilling Well Gas Peaks analysis: depths above 2000m typically show lower gas concentrations. Peak gas zones between 2000-4000m depth often indicate productive formations. Gas ratios (wetness ratio = C2+C3/C1) help classify oil vs gas reservoirs.`,
  `Well control principles: when formation pore pressure exceeds hydrostatic mud pressure, a kick occurs. Primary well control uses mud weight. Secondary control uses BOP (Blowout Preventer). Gas kicks require immediate controlled shut-in.`,
  `Mud logging unit monitors: total gas (ppm), individual gas components, drilling parameters (WOB, RPM, ROP), and lag time calculations. Real-time gas curve analysis helps identify formation tops and hydrocarbon zones.`,
  `Formation evaluation during drilling: high GR (gamma ray) indicates shale/clay. Low resistivity in porous zones indicates water. High resistivity with gas peaks indicates potential hydrocarbon accumulation zones.`,
  `Abnormal pressure indicators while drilling: drilling break (sudden ROP increase), gas cuts in mud, pit level increase, decreased pump pressure. These require immediate assessment to maintain well control.`,
];

export async function POST(_req: NextRequest) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ogo_rag_chunk (
      id SERIAL PRIMARY KEY,
      content TEXT NOT NULL,
      source_doc TEXT,
      dept TEXT,
      embedding_status TEXT DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // Delete existing chunks for this dept
  await pool.query(`DELETE FROM ogo_rag_chunk WHERE dept = $1`, [DEPT]);

  let chunksCreated = 0;

  // Seed domain knowledge
  for (const chunk of DOMAIN_KNOWLEDGE) {
    const parts = chunk.match(/.{1,400}/g) ?? [chunk];
    for (const part of parts) {
      await pool.query(
        `INSERT INTO ogo_rag_chunk (content, source_doc, dept, embedding_status) VALUES ($1,$2,$3,'seeded')`,
        [part.trim(), 'domain-knowledge', DEPT]
      );
      chunksCreated++;
    }
  }

  // Try to read docs from portal
  const docsDir = path.join(process.cwd(), '..', 'oil-gas-monitoring-portal', 'docs');
  if (fs.existsSync(docsDir)) {
    const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.md') || f.endsWith('.txt')).slice(0, 5);
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(docsDir, file), 'utf-8');
        const chunks = content.match(/.{1,400}/g) ?? [];
        for (const chunk of chunks.slice(0, 10)) {
          await pool.query(
            `INSERT INTO ogo_rag_chunk (content, source_doc, dept, embedding_status) VALUES ($1,$2,$3,'seeded')`,
            [chunk.trim(), file, DEPT]
          );
          chunksCreated++;
        }
      } catch { /* skip unreadable files */ }
    }
  }

  return NextResponse.json({ chunks_created: chunksCreated });
}
