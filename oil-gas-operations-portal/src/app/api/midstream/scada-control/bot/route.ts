export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434';

async function ensureTables(client: import('pg').PoolClient) {
  await client.query(`CREATE TABLE IF NOT EXISTS ogo_bot_conversation (id SERIAL PRIMARY KEY, dept TEXT, role TEXT, content TEXT, created_at TIMESTAMPTZ DEFAULT NOW())`);
  await client.query(`CREATE TABLE IF NOT EXISTS ogo_rag_chunk (id SERIAL PRIMARY KEY, dept TEXT, source TEXT, content TEXT, created_at TIMESTAMPTZ DEFAULT NOW())`);
}

export async function GET() {
  const client = await pool.connect();
  try {
    await ensureTables(client);
    const res = await client.query(`SELECT role, content, created_at AS ts FROM ogo_bot_conversation WHERE dept='midstream-scada-control' ORDER BY created_at DESC LIMIT 20`);
    return NextResponse.json({ history: res.rows.reverse() });
  } catch (e: unknown) { return NextResponse.json({ history: [], error: String(e) }); }
  finally { client.release(); }
}

export async function POST(req: NextRequest) {
  const { message, dept } = await req.json();
  const client = await pool.connect();
  try {
    await ensureTables(client);
    await client.query(`INSERT INTO ogo_bot_conversation (dept, role, content) VALUES ($1,'user',$2)`, [dept ?? 'midstream-scada-control', message]);

    const ragRes = await client.query(`SELECT content FROM ogo_rag_chunk WHERE dept ILIKE '%scada-control%' LIMIT 3`);
    const context = ragRes.rows.map((r: { content: string }) => r.content).join('\n---\n');

    let dbContext = '';
    try {
      const s = (await client.query(`SELECT COUNT(*) AS total_readings, COUNT(DISTINCT device) AS devices, COUNT(CASE WHEN co > 0.006 OR lpg > 0.007 THEN 1 END) AS anomalies FROM ogo_scada_metric`)).rows[0];
      dbContext = `DB: ${parseInt(s.total_readings, 10).toLocaleString()} readings, ${s.devices} devices, ${s.anomalies} anomalies (CO>0.006 or LPG>0.007).`;
    } catch {}

    const prompt = `You are a SCADA control systems expert for oil and gas operations.\n${dbContext}\n${context ? `Knowledge:\n${context}` : ''}\nUser: ${message}\nAnswer concisely about SCADA systems, anomaly detection, sensor health, and alarm management.`;

    let response = '';
    try {
      response = (await (await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'llama3.2', prompt, stream: false }),
        signal: AbortSignal.timeout(30000),
      })).json()).response ?? 'No response';
    } catch {
      response = `⚠️ Ollama unavailable. ${dbContext || 'No SCADA data imported yet.'}`;
    }

    await client.query(`INSERT INTO ogo_bot_conversation (dept, role, content) VALUES ($1,'assistant',$2)`, [dept ?? 'midstream-scada-control', response]);
    return NextResponse.json({ response });
  } catch (e: unknown) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
  finally { client.release(); }
}
