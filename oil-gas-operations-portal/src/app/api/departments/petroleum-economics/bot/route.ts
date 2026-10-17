export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const DEPT = 'petroleum-economics';
const STREAM = 'cross-cutting';
const SYSTEM_CONTEXT = `You are an expert Petroleum Economist for oil and gas operations. Your domain covers: crude oil and gas pricing benchmarks (WTI, Brent, Dubai), net present value calculations, fiscal regimes (PSAs, concessions, royalties), reserve valuations, cash flow modelling, breakeven analysis, and commodity market analysis. Provide quantitative, technically grounded answers.`;

async function ensureBotLogTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ogo_bot_log (
      id               SERIAL PRIMARY KEY,
      dept             TEXT NOT NULL,
      stream           TEXT,
      message          TEXT,
      response_preview TEXT,
      rag_chunks_used  INT DEFAULT 0,
      latency_ms       INT,
      created_at       TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

export async function POST(req: NextRequest) {
  const start = Date.now();
  try {
    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }

    const ollamaUrl = process.env.OLLAMA_URL ?? 'http://localhost:11434';
    const model = process.env.OLLAMA_MODEL ?? 'llama3.2';

    let response = '';
    let ragChunksUsed = 0;

    try {
      const ragRes = await pool.query(
        `SELECT content FROM ogo_rag_chunk WHERE dept = \$1 ORDER BY created_at DESC LIMIT 3`,
        [DEPT]
      );
      ragChunksUsed = ragRes.rows.length;
      const ragContext = ragRes.rows.map((r: { content: string }) => r.content).join('\n\n');

      const prompt = ragContext
        ? `${SYSTEM_CONTEXT}\n\nRelevant knowledge base context:\n${ragContext}\n\nUser question: ${message}`
        : `${SYSTEM_CONTEXT}\n\nUser question: ${message}`;

      const ollamaRes = await fetch(`${ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt, stream: false }),
        signal: AbortSignal.timeout(30000),
      });

      if (ollamaRes.ok) {
        const data = await ollamaRes.json();
        response = data.response ?? 'No response from model.';
      } else {
        response = `⚠️ Ollama returned ${ollamaRes.status}. Ensure Ollama is running at ${ollamaUrl} with model ${model}.`;
      }
    } catch (ollamaErr) {
      response = `⚠️ Ollama unavailable (${String(ollamaErr)}). Start Ollama and ensure model "${model}" is pulled.`;
    }

    const latency = Date.now() - start;

    try {
      await ensureBotLogTable();
      await pool.query(
        `INSERT INTO ogo_bot_log (dept, stream, message, response_preview, rag_chunks_used, latency_ms)
         VALUES (\$1, \$2, \$3, \$4, \$5, \$6)`,
        [DEPT, STREAM, message, response.slice(0, 500), ragChunksUsed, latency]
      );
    } catch { /* non-fatal */ }

    return NextResponse.json({ response, dept: DEPT, rag_chunks_used: ragChunksUsed, latency_ms: latency });
  } catch (err) {
    console.error(`[${DEPT}/bot POST]`, err);
    return NextResponse.json({ error: 'Failed to process bot request' }, { status: 500 });
  }
}
