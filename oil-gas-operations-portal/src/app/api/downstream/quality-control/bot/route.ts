export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  const { message } = await req.json();
  let context = '';
  try {
    const { rows } = await pool.query(
      `SELECT content FROM ogo_rag_chunk WHERE dept ILIKE $1 ORDER BY created_at DESC LIMIT 5`,
      ['%quality-control%']
    );
    context = rows.map((r: { content: string }) => r.content).join('\n');
  } catch { context = ''; }

  const systemPrompt = `You are a quality control specialist for crude oil and refined products.
${context ? `Context:\n${context}\n` : ''}
Answer questions about crude quality specifications, off-spec detection, product testing, GR/PE/PHIND properties, and quality improvement. Be concise and practical.`;

  try {
    const res = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama3.2', prompt: `${systemPrompt}\n\nUser: ${message}\nAssistant:`, stream: false }),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) throw new Error('Ollama unavailable');
    const data = await res.json();
    return NextResponse.json({ response: data.response, source: 'ollama' });
  } catch {
    return NextResponse.json({
      response: `Quality Control Analysis: "${message}" — Quality metrics include GR (gamma ray), PE (photoelectric factor), and PHIND (porosity). Off-spec batches with quality score < 0.6 require root cause analysis. Import the well facies dataset for live data.`,
      source: 'fallback',
    });
  }
}
