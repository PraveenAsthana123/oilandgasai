import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const DEPT = 'hse-safety';

const DOMAIN_KNOWLEDGE = [
  `Process Safety Management (PSM) under OSHA 29 CFR 1910.119 applies to facilities handling highly hazardous chemicals above threshold quantities. The 14 elements include: process safety information, process hazard analysis, operating procedures, training, mechanical integrity, and emergency planning.`,
  `Risk assessment in oil & gas uses HAZOP (Hazard and Operability Study), FMEA (Failure Mode and Effects Analysis), and bow-tie analysis. Risk = Likelihood × Consequence. ALARP (As Low As Reasonably Practicable) is the target risk reduction principle.`,
  `Incident severity classification: CRITICAL = fatality or major environmental release requiring evacuation. HIGH = serious injury or significant property damage. MEDIUM = minor injury or reportable spill. LOW = near-miss or minor property damage. All incidents require root cause analysis.`,
  `The 5 Whys technique traces incident root causes. Swiss cheese model shows how multiple barrier failures allow accidents. Bow-tie analysis maps threats → barriers → consequences. SCAT (Systematic Cause Analysis Technique) identifies substandard acts and conditions.`,
  `Emergency response planning: HAZMAT spill response follows ICS (Incident Command System). Initial response: evacuate, isolate, notify. MSDS/SDS sheets provide chemical hazard data. Pipeline leak emergency procedures include emergency shutdown, public notification, and EPA NRC notification.`,
  `Permit-to-work (PTW) system controls high-risk work: hot work (welding/cutting near flammables), confined space entry (atmospheric testing, continuous monitoring, rescue standby), LOTO (lockout/tagout) for energy isolation, excavation near pipelines.`,
  `Environmental compliance: EPA RMP (Risk Management Plan) requires off-site consequence analysis and accident prevention program for facilities with flammable/toxic substances above thresholds. SPCC (Spill Prevention Control and Countermeasure) plans for oil handling facilities.`,
  `Safety performance metrics: TRIR (Total Recordable Incident Rate) = (recordable incidents × 200,000) / hours worked. LTIR (Lost Time Incident Rate). Process Safety Event (PSE) rates track containment losses. Leading indicators include near-miss reporting rates, observation safety tours.`,
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
