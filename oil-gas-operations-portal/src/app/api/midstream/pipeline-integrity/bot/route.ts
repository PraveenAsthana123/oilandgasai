export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434';

async function ensureTables(client: import('pg').PoolClient) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS ogo_bot_conversation (
      id SERIAL PRIMARY KEY,
      dept TEXT,
      role TEXT,
      content TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
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
  try {
    const client = await pool.connect();
    await ensureTables(client);
    const res = await client.query(
      `SELECT role, content, created_at AS ts FROM ogo_bot_conversation
       WHERE dept='midstream-pipeline-integrity' ORDER BY created_at DESC LIMIT 20`
    );
    return NextResponse.json({ history: res.rows.reverse() });
  } catch (e: unknown) {
    return NextResponse.json({ history: [], error: String(e) });
  }
}

export async function POST(req: NextRequest) {
  const { message, dept } = await req.json();
  const client = await pool.connect();
  try {
    await ensureTables(client);

    // Store user message
    await client.query(
      `INSERT INTO ogo_bot_conversation (dept, role, content) VALUES ($1,'user',$2)`,
      [dept ?? 'midstream-pipeline-integrity', message]
    );

    // RAG context
    const ragRes = await client.query(
      `SELECT content FROM ogo_rag_chunk WHERE dept ILIKE '%pipeline-integrity%' LIMIT 3`
    );
    const context = ragRes.rows.map((r: {content: string}) => r.content).join('\n---\n');

    // DB stats for context
    let dbContext = '';
    try {
      const stats = await client.query(
        `SELECT COUNT(*) AS total, AVG(corrosion_pct) AS avg_corr,
                SUM(CASE WHEN corrosion_pct>20 THEN 1 ELSE 0 END) AS high_corr
         FROM ogo_pipe_metric`
      );
      const s = stats.rows[0];
      dbContext = `DB stats: ${s.total} pipe segments, avg corrosion ${parseFloat(s.avg_corr ?? 0).toFixed(1)}%, ${s.high_corr} high-corrosion segments.`;
    } catch {}

    const prompt = `You are a pipeline integrity expert AI assistant for an oil and gas operations portal.
${dbContext}
${context ? `Knowledge base context:\n${context}` : ''}

User question: ${message}

Provide a concise, technical answer focused on pipeline integrity, corrosion management, and inspection scheduling.`;

    let response = '';
    try {
      const ollamaRes = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'llama3.2', prompt, stream: false }),
        signal: AbortSignal.timeout(30000),
      });
      const data = await ollamaRes.json();
      response = data.response ?? 'No response from model';
    } catch {
      response = `⚠️ Ollama unavailable. Based on DB data: ${dbContext || 'No data imported yet. Run Import to DB first.'}`;
    }

    await client.query(
      `INSERT INTO ogo_bot_conversation (dept, role, content) VALUES ($1,'assistant',$2)`,
      [dept ?? 'midstream-pipeline-integrity', response]
    );

    return NextResponse.json({ response });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
