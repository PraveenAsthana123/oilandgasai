import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const DEPT_CONTEXT = `You are a reservoir engineering expert AI assistant. You specialize in reservoir characterization,
fluid flow analysis, material balance calculations, and reserve estimation. You have access to global reservoir inventory data
including proven reserves (billion barrels), production capacity, oil type classifications (Light Crude, Heavy Crude, Extra Heavy,
Condensate), reservoir status (Active/Development/Discovered), and basin/region information.`;

export async function POST(req: NextRequest) {
  const start = Date.now();
  const { message } = await req.json();

  let ragChunks: { content: string }[] = [];
  try {
    const tc = await pool.query(`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ogo_rag_chunk') AS exists`);
    if (tc.rows[0].exists) {
      const kw = message.split(/\s+/).filter((w: string) => w.length > 3).slice(0, 3);
      if (kw.length > 0) {
        const lc = kw.map((_: string, i: number) => `content ILIKE $${i + 2}`).join(' OR ');
        const res = await pool.query(`SELECT content FROM ogo_rag_chunk WHERE dept = $1 AND (${lc}) LIMIT 3`, ['reservoir-engineering', ...kw.map((k: string) => `%${k}%`)]);
        ragChunks = res.rows;
      }
    }
  } catch { /* RAG unavailable */ }

  const context = ragChunks.map((c, i) => `[Context ${i + 1}]: ${c.content}`).join('\n');
  const prompt = `${DEPT_CONTEXT}\n\n${context ? context + '\n\n' : ''}User question: ${message}\n\nProvide a concise, expert answer:`;

  try {
    const ollamaUrl = process.env.OLLAMA_URL ?? 'http://localhost:11434';
    const res = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama3.2', prompt, stream: false }),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) throw new Error('Ollama error');
    const data = await res.json();
    return NextResponse.json({ response: data.response, rag_chunks_used: ragChunks.length, model: 'llama3.2', latency_ms: Date.now() - start });
  } catch {
    return NextResponse.json({ response: 'AI unavailable — Ollama not running. Please start Ollama.', rag_chunks_used: ragChunks.length, model: 'llama3.2', latency_ms: Date.now() - start });
  }
}
