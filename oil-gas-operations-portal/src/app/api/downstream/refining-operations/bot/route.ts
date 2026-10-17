export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  // Fetch context from RAG chunks
  let context = '';
  try {
    const { rows } = await pool.query(
      `SELECT content FROM ogo_rag_chunk WHERE dept ILIKE $1 ORDER BY created_at DESC LIMIT 5`,
      ['%refining-operations%']
    );
    context = rows.map((r: { content: string }) => r.content).join('\n');
  } catch { context = ''; }

  const systemPrompt = `You are an expert refinery operations analyst for an oil & gas company.
${context ? `Context:\n${context}\n` : ''}
Answer questions about crude processing, distillation yields, refinery throughput, and operational efficiency.
Be concise and data-driven.`;

  try {
    const ollamaRes = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2',
        prompt: `${systemPrompt}\n\nUser: ${message}\nAssistant:`,
        stream: false,
      }),
      signal: AbortSignal.timeout(30000),
    });
    if (!ollamaRes.ok) throw new Error('Ollama unavailable');
    const data = await ollamaRes.json();
    return NextResponse.json({ response: data.response, source: 'ollama' });
  } catch {
    return NextResponse.json({
      response: `Refining Operations Analysis: For "${message}" — based on production data, typical refinery operations involve crude distillation, cracking, and yield optimization. Please import dataset for live analysis.`,
      source: 'fallback',
    });
  }
}
