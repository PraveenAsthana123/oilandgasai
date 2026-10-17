export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const KNOWLEDGE = [
  { source: 'custody-transfer-standards', content: 'Custody transfer is the measurement of fluid quantity at a contractual handoff point between buyer and seller. Accuracy requirements: liquid hydrocarbons ±0.25% (API MPMS Chapter 8), natural gas ±1% (AGA Report No. 3/7/9). Legal metrology requirements vary by jurisdiction — NTEP (USA), OIML (international), Measurement Canada (Canada).' },
  { source: 'lact-units', content: 'LACT (Lease Automatic Custody Transfer) units meter crude oil from a lease to a pipeline. Components: BS&W (basic sediment and water) monitor, density/gravity meter, flow computer, sampler, prover connection, strainer, pressure/temperature sensors. API MPMS Chapter 6 governs LACT design. BS&W must be < 0.5% (typically < 1%) for pipeline acceptance.' },
  { source: 'coriolis-meters', content: 'Coriolis meters measure mass flow directly by detecting the Coriolis effect on vibrating tubes. Accuracy: ±0.1% of reading for liquids, ±0.35% for gases. No moving parts, bidirectional, measure density and temperature simultaneously. Advantages over turbine meters: better low-flow accuracy, no need for VCF/CTL/CPL corrections. API MPMS Chapter 5.6 covers Coriolis.' },
  { source: 'orifice-plate-aga3', content: 'AGA Report No. 3 (ANSI/API 14.3) governs orifice plate meters for natural gas. Differential pressure measurement at a concentric, square-edged orifice. Key parameters: beta ratio (bore/pipe diameter, 0.2-0.75), Reynolds number (≥4000), RG (relative density), Z (compressibility factor). Accuracy: ±0.5% on discharge coefficient alone. Requires regular inspection for plate wear, erosion, and buildup.' },
  { source: 'ctl-cpl-corrections', content: 'CTL (Correction for Temperature of Liquid) and CPL (Correction for Pressure of Liquid) convert observed volume at operating conditions to standard volume (60°F / 15°C, atmospheric). API MPMS Chapter 11 (API Tables 5A/5B/6A/6B). CTL depends on API gravity or density. CPL applies for high-pressure pipelines. Gross Standard Volume (GSV) = Net Standard Volume (NSV) after BS&W deduction.' },
  { source: 'aga7-turbine-meters', content: 'AGA Report No. 7 covers turbine meters for natural gas measurement. Accuracy: ±1% across 10:1 turndown ratio. Requires upstream/downstream straight pipe lengths (10D upstream, 5D downstream minimum). K-factor calibration at reference conditions. Susceptible to over-speed damage and mechanical degradation. Meter factor (MF) from proving run normalizes to reference.' },
  { source: 'aga9-ultrasonic', content: 'AGA Report No. 9 covers multipath ultrasonic meters (USM) for natural gas. Accuracy: ±0.7% at base conditions, ±0.5% with flow calibration. 4+ paths for diagnostics and self-verification. Velocity of sound (VOS) diagnostic detects composition changes, coating, contamination. No mechanical wear. Preferred for large-diameter (≥4") custody transfer.' },
  { source: 'measurement-uncertainty', content: 'Measurement uncertainty (GUM method): combined standard uncertainty = √(u_systematic² + u_random²). Expanded uncertainty at 95% confidence = k×uc, k≈2. Sources for liquid metering: flow meter (0.1-0.5%), proving (0.02-0.1%), CTL/CPL (0.05-0.1%), BS&W (0.1-0.5%). Total typical uncertainty: ±0.25% for crude oil LACT, ±0.5% for natural gas orifice.' },
  { source: 'prover-systems', content: 'Provers verify meter accuracy in-service. Bidirectional pipe provers: calibrated displacement volume, ±0.01% uncertainty. Small volume provers (SVP): compact, 4+ pass requirement. Brooks-type compact provers with piston. Tank provers: static calibration for large volumes. Proving frequency: per API MPMS Chapter 4 — initially every 6 months, then based on meter factor stability (deviation > 0.05% triggers re-prove).' },
  { source: 'volume-reconciliation', content: 'Volume reconciliation compares metered volumes across custody points to detect losses. Mass balance: input volumes − output volumes − inventory change = losses/gains. Acceptable loss: ≤0.1% by value for crude oil pipelines. Unaccounted-for gas (UAG) for gas systems: target < 0.2% of throughput. Root causes: meter drift, incorrect CTL/CPL, theft, unauthorized connections, evaporation losses.' },
];

async function ensureTable(client: import('pg').PoolClient) {
  await client.query(`CREATE TABLE IF NOT EXISTS ogo_rag_chunk (id SERIAL PRIMARY KEY, dept TEXT, source TEXT, content TEXT, created_at TIMESTAMPTZ DEFAULT NOW())`);
}

export async function GET() {
  const client = await pool.connect();
  try {
    await ensureTable(client);
    const res = await client.query(`SELECT COUNT(*) AS cnt FROM ogo_rag_chunk WHERE dept='midstream-custody-metering'`);
    return NextResponse.json({ status: 'ok', chunks_seeded: parseInt(res.rows[0].cnt, 10) });
  } catch (e: unknown) { return NextResponse.json({ status: 'error', error: String(e) }); }
  finally { client.release(); }
}

export async function POST(_req: NextRequest) {
  const client = await pool.connect();
  try {
    await ensureTable(client);
    await client.query(`DELETE FROM ogo_rag_chunk WHERE dept='midstream-custody-metering'`);
    for (const chunk of KNOWLEDGE) {
      await client.query(`INSERT INTO ogo_rag_chunk (dept, source, content) VALUES ($1,$2,$3)`, ['midstream-custody-metering', chunk.source, chunk.content]);
    }
    return NextResponse.json({ status: 'ok', chunks_created: KNOWLEDGE.length });
  } catch (e: unknown) { return NextResponse.json({ status: 'error', error: String(e) }); }
  finally { client.release(); }
}
