export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import pool from '@/lib/db';

const CHUNKS = [
  'Crude oil quality is defined by API gravity, sulfur content, viscosity, and metal content. Light sweet crude (API>31.1, sulfur<0.5%) commands a premium; heavy sour crude requires more complex processing.',
  'Off-spec product detection relies on inline analyzers (NIR, density, viscosity) and laboratory testing (ASTM methods). Automated systems can detect out-of-spec conditions in real time.',
  'Product quality specifications: gasoline (RON, RVP, sulfur, benzene), diesel (cetane number, cloud point, sulfur, FAME content), jet fuel (smoke point, freeze point, flash point).',
  'Root cause analysis (RCA) for quality failures uses fishbone (Ishikawa) diagrams, 5-Whys, and FMEA. Common root causes: feedstock variability, catalyst deactivation, heat exchanger fouling.',
  'Statistical Process Control (SPC) monitors product quality with control charts. UCL/LCL violations trigger immediate investigation. Cp and Cpk indices measure process capability.',
  'Photoelectric factor (PE) is a lithology indicator in wireline logs. Sandstone PE ≈ 1.8, limestone PE ≈ 5.1, dolomite PE ≈ 3.1. Combined with GR and porosity, enables formation identification.',
  'Quality assurance in refineries follows ISO 9001 and industry standards (API, ASTM, IP). Certified laboratories, instrument calibration, and round-robin testing ensure measurement accuracy.',
  'Crude assay provides detailed property profile: density, viscosity, distillation curve (TBP), sulfur, nitrogen, metals (Ni, V), salt, and residue properties — essential for refinery planning.',
];

export async function POST() {
  const client = await pool.connect();
  try {
    await client.query(`CREATE TABLE IF NOT EXISTS ogo_rag_chunk (
      id SERIAL PRIMARY KEY, dept TEXT, content TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    await client.query(`DELETE FROM ogo_rag_chunk WHERE dept='quality-control'`);
    let seeded = 0;
    for (const chunk of CHUNKS) {
      await client.query(`INSERT INTO ogo_rag_chunk (dept, content) VALUES ($1,$2)`, ['quality-control', chunk]);
      seeded++;
    }
    return NextResponse.json({ success: true, seeded });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function GET() {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS ogo_rag_chunk (
      id SERIAL PRIMARY KEY, dept TEXT, content TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    const { rows } = await pool.query(
      `SELECT id, dept, LEFT(content,100) AS preview, created_at FROM ogo_rag_chunk WHERE dept='quality-control' ORDER BY id`
    );
    return NextResponse.json({ chunks: rows, count: rows.length });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
