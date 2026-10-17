export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const KNOWLEDGE = [
  { source: 'gas-compression-overview', content: 'Gas compression stations boost pipeline pressure to maintain flow. Key equipment: reciprocating compressors, centrifugal compressors, scrubbers, coolers. IoT sensors monitor CO, LPG, temperature, humidity, and smoke for safety.' },
  { source: 'co-monitoring', content: 'Carbon monoxide (CO) threshold: >0.006 ppm triggers safety alert at compression stations. CO is a byproduct of incomplete combustion. Elevated CO indicates engine problems or inadequate ventilation.' },
  { source: 'lpg-safety', content: 'LPG (liquefied petroleum gas) threshold: >0.007 indicates potential gas leak. LPG is heavier than air and accumulates in low areas. Concentration >0.007 requires immediate evacuation and ventilation protocol.' },
  { source: 'temperature-monitoring', content: 'Compressor operating temperature: ideal 15-40°C. Temperatures >60°C indicate cooling system failure. Temperature spikes correlate with mechanical stress, bearing wear, or coolant loss.' },
  { source: 'anomaly-detection', content: 'IoT anomaly detection uses threshold-based rules: CO>0.006 OR LPG>0.007 = critical alert. Multi-device correlation: if 3+ devices trigger simultaneously = area-wide event. Single device = localized equipment fault.' },
  { source: 'compression-efficiency', content: 'Compression efficiency measured by ratio of actual to theoretical power. Low efficiency signals: valve wear, piston ring wear, cylinder damage. Humidity sensor helps detect moisture ingress causing corrosion in cylinders.' },
  { source: 'centrifugal-performance-curves', content: 'Centrifugal compressor performance curves define the relationship between flow rate and head. The surge line represents the minimum stable flow boundary — operating left of this causes violent pressure oscillations. Anti-surge control systems inject recycle gas to maintain a safe margin (typically 10% flow margin from surge line). Compressor maps plot polytropic head vs. actual volume flow for multiple speed lines, enabling operators to select optimal operating points.' },
  { source: 'station-design-standards', content: 'Compressor station design follows ASME B31.8 for gas transmission. Station block valve closures must achieve full close within 10 seconds per AER Directive 056. Station MAOP is governed by the weakest segment pressure rating. Suction scrubbers remove liquids to prevent slug damage; coalescing filters target >99.98% efficiency for particles >0.3 micron to protect impeller blades from erosion.' },
];

async function ensureTable(client: import('pg').PoolClient) {
  await client.query(`CREATE TABLE IF NOT EXISTS ogo_rag_chunk (id SERIAL PRIMARY KEY, dept TEXT, source TEXT, content TEXT, created_at TIMESTAMPTZ DEFAULT NOW())`);
}

export async function GET() {
  const client = await pool.connect();
  try {
    await ensureTable(client);
    const res = await client.query(`SELECT COUNT(*) AS cnt FROM ogo_rag_chunk WHERE dept='midstream-gas-compression'`);
    return NextResponse.json({ status: 'ok', chunks_seeded: parseInt(res.rows[0].cnt, 10) });
  } catch (e: unknown) {
    return NextResponse.json({ status: 'error', error: String(e) });
  } finally { client.release(); }
}

export async function POST(_req: NextRequest) {
  const client = await pool.connect();
  try {
    await ensureTable(client);
    await client.query(`DELETE FROM ogo_rag_chunk WHERE dept='midstream-gas-compression'`);
    for (const chunk of KNOWLEDGE) {
      await client.query(`INSERT INTO ogo_rag_chunk (dept, source, content) VALUES ($1,$2,$3)`, ['midstream-gas-compression', chunk.source, chunk.content]);
    }
    return NextResponse.json({ status: 'ok', chunks_seeded: KNOWLEDGE.length });
  } catch (e: unknown) {
    return NextResponse.json({ status: 'error', error: String(e) });
  } finally { client.release(); }
}
