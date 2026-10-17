import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const DEPT_CONTEXT = `You are a drilling engineering expert AI assistant for an oil & gas operations portal.
You have access to drilling well gas peak data including depth measurements, total gas readings (ppm),
component gases (C1/methane, C2/ethane, C3/propane, iC4, nC4, iC5, nC5), and gas types (FG=free gas, BG=background gas).
Help engineers analyze drilling anomalies, gas peaks, and well performance data.`;

export async function POST(req: NextRequest) {
  const start = Date.now();
  const { message } = await req.json();

  // Search RAG chunks
  let ragChunks: { content: string }[] = [];
  try {
    const tableCheck = await pool.query(`
      SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ogo_rag_chunk') AS exists
    `);
    if (tableCheck.rows[0].exists) {
      const keywords = message.split(/\s+/).filter((w: string) => w.length > 3).slice(0, 3);
      if (keywords.length > 0) {
        const likeClause = keywords.map((_: string, i: number) => `content ILIKE $${i + 2}`).join(' OR ');
        const res = await pool.query(
          `SELECT content FROM ogo_rag_chunk WHERE dept = $1 AND (${likeClause}) LIMIT 3`,
          ['drilling-engineering', ...keywords.map((k: string) => `%${k}%`)]
        );
        ragChunks = res.rows;
      }
    }
  } catch { /* RAG unavailable */ }

  const context = ragChunks.length > 0
    ? ragChunks.map((c, i) => `[Context ${i + 1}]: ${c.content}`).join('\n')
    : '';

  const prompt = `${DEPT_CONTEXT}\n\n${context ? context + '\n\n' : ''}User question: ${message}\n\nProvide a concise, expert answer:`;

  try {
    const ollamaUrl = process.env.OLLAMA_URL ?? 'http://localhost:11434';
    const ollamaRes = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama3.2', prompt, stream: false }),
      signal: AbortSignal.timeout(30000),
    });
    if (!ollamaRes.ok) throw new Error('Ollama error');
    const data = await ollamaRes.json();
    return NextResponse.json({
      response: data.response,
      rag_chunks_used: ragChunks.length,
      model: 'llama3.2',
      latency_ms: Date.now() - start,
    });
  } catch {
    return NextResponse.json({
      response: 'AI unavailable — Ollama not running. Please start Ollama.',
      rag_chunks_used: ragChunks.length,
      model: 'llama3.2',
      latency_ms: Date.now() - start,
    });
  }
}
