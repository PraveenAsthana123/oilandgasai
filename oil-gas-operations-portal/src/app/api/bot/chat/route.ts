export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';

const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434';

const SYSTEM_PROMPT = `You are the Oil & Gas AI Agency assistant. You have knowledge of upstream, midstream, and downstream operations, AI/ML use cases for O&G, safety regulations, equipment, and best practices. Answer technical questions about: well operations, pipeline integrity, refinery processes, AI monitoring, HSE compliance, predictive maintenance. Be specific and cite your sources when referencing industry standards (API, ASME, ISO, OSHA).`;

async function searchRAG(question: string): Promise<string[]> {
  try {
    const words = question.split(/\s+/).slice(0, 4);
    const conditions = words.map((_, i) => `chunk_text ILIKE $${i + 1}`).join(' OR ');
    const values = words.map(w => `%${w}%`);
    const result = await pool.query(
      `SELECT chunk_text, source FROM ogo_rag_chunk WHERE ${conditions} LIMIT 3`,
      values
    );
    return result.rows.map(r => `[Source: ${r.source}]\n${r.chunk_text}`);
  } catch {
    return [];
  }
}

export async function POST(req: Request) {
  const body = await req.json() as {
    message: string; session_id?: string; dept_tag?: string; stream?: string; mode?: string;
  };
  const { message, session_id = `sess_${Date.now()}`, dept_tag = '', stream = '', mode = 'normal' } = body;

  if (!message?.trim()) return Response.json({ error: 'No message provided' }, { status: 400 });

  await pool.query(`CREATE TABLE IF NOT EXISTS ogo_bot_session (
    id SERIAL PRIMARY KEY, session_id TEXT, role TEXT, content TEXT,
    dept_tag TEXT, stream TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
  )`);

  // Save user message
  await pool.query(
    'INSERT INTO ogo_bot_session (session_id, role, content, dept_tag, stream) VALUES ($1, $2, $3, $4, $5)',
    [session_id, 'user', message, dept_tag, stream]
  ).catch(() => {});

  // RAG context injection
  const ragChunks = await searchRAG(message);
  const ragContext = ragChunks.length > 0
    ? `\n\nRelevant context from O&G knowledge base:\n${ragChunks.join('\n\n---\n\n')}\n\n`
    : '';

  const modeInstruction = mode === 'expert'
    ? 'Provide detailed technical explanation with formulas, standards, and engineering specifics. '
    : mode === 'summary'
    ? 'Provide a brief executive summary (3-5 sentences max). '
    : '';

  const scopeInstruction = stream ? `Focus on ${stream} operations context. ` : '';
  const deptInstruction = dept_tag ? `Department context: ${dept_tag}. ` : '';

  const fullPrompt = `${SYSTEM_PROMPT}\n\n${modeInstruction}${scopeInstruction}${deptInstruction}${ragContext}User question: ${message}`;

  try {
    const resp = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama3.2', prompt: fullPrompt, stream: false }),
      signal: AbortSignal.timeout(90000),
    });

    if (!resp.ok) throw new Error(`Ollama HTTP ${resp.status}: ${await resp.text()}`);
    const data = await resp.json() as { response?: string };
    const reply = data.response ?? 'No response from model.';

    // Save assistant reply
    await pool.query(
      'INSERT INTO ogo_bot_session (session_id, role, content, dept_tag, stream) VALUES ($1, $2, $3, $4, $5)',
      [session_id, 'assistant', reply, dept_tag, stream]
    ).catch(() => {});

    return Response.json({
      reply,
      session_id,
      rag_used: ragChunks.length > 0,
      rag_sources: ragChunks.length,
      model: 'llama3.2',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({
      reply: '⚠️ AI Assistant unavailable — Ollama not running. Set OLLAMA_URL to connect.',
      session_id,
      error: msg,
      _mock: true,
      _reason: 'OLLAMA_URL not configured or Ollama is not running',
    });
  }
}
