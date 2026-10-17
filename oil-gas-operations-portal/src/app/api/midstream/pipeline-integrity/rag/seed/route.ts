export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const PIPELINE_INTEGRITY_KNOWLEDGE = [
  {
    source: 'pipeline-integrity-overview',
    content: 'Pipeline integrity management (PIM) encompasses all activities to ensure pipelines operate safely within design parameters. Key processes: In-Line Inspection (ILI) using smart pigs, direct assessment, hydrostatic testing, and cathodic protection monitoring.',
  },
  {
    source: 'corrosion-management',
    content: 'Pipeline corrosion is classified as internal (from product flow, water, CO2, H2S) or external (soil corrosivity, stray currents). Corrosion impact percent >20% triggers mandatory inspection under ASME B31.8S integrity management rules.',
  },
  {
    source: 'condition-assessment',
    content: 'Pipe condition categories: Good (<5% wall loss), Moderate (5-15%), Poor (15-30%), Critical (>30%). Critical segments require immediate remediation. Condition is determined from ultrasonic thickness measurements and ILI data.',
  },
  {
    source: 'inspection-scheduling',
    content: 'Inspection intervals are risk-based: high consequence areas (HCAs) every 7 years per PHMSA 49 CFR 195. Carbon steel pipes in corrosive soils require more frequent checks. Time_Years in dataset tracks cumulative service life.',
  },
  {
    source: 'material-properties',
    content: 'Common pipeline materials: Carbon Steel (API 5L X42/X52/X65/X70) for high-pressure gas; PVC/HDPE for low-pressure distribution. Thickness_mm is the remaining wall thickness after corrosion loss. API 5L X65 minimum wall 6.35mm at 1500 psi.',
  },
  {
    source: 'failure-prevention',
    content: 'Top pipeline failure causes: corrosion (30%), third-party damage (25%), operational error (15%), material/weld defects (15%), natural forces (15%). Pipeline accident records (cause, barrels spilled, costs) inform risk prioritization and regulatory reporting.',
  },
];

async function ensureTable(client: import('pg').PoolClient) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS ogo_rag_chunk (
      id SERIAL PRIMARY KEY,
      dept TEXT,
      source TEXT,
      content TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

export async function GET() {
  const client = await pool.connect();
  try {
    await ensureTable(client);
    const res = await client.query(
      `SELECT COUNT(*) AS cnt FROM ogo_rag_chunk WHERE dept='midstream-pipeline-integrity'`
    );
    return NextResponse.json({ status: 'ok', chunks_seeded: parseInt(res.rows[0].cnt, 10) });
  } catch (e: unknown) {
    return NextResponse.json({ status: 'error', error: String(e) });
  } finally {
    client.release();
  }
}

export async function POST(_req: NextRequest) {
  const client = await pool.connect();
  try {
    await ensureTable(client);
    await client.query(`DELETE FROM ogo_rag_chunk WHERE dept='midstream-pipeline-integrity'`);

    for (const chunk of PIPELINE_INTEGRITY_KNOWLEDGE) {
      await client.query(
        `INSERT INTO ogo_rag_chunk (dept, source, content) VALUES ($1,$2,$3)`,
        ['midstream-pipeline-integrity', chunk.source, chunk.content]
      );
    }

    return NextResponse.json({ status: 'ok', chunks_seeded: PIPELINE_INTEGRITY_KNOWLEDGE.length });
  } catch (e: unknown) {
    return NextResponse.json({ status: 'error', error: String(e) });
  } finally {
    client.release();
  }
}
