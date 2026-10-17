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
      ['%process-engineering%']
    );
    context = rows.map((r: { content: string }) => r.content).join('\n');
  } catch { context = ''; }

  const systemPrompt = `You are a process engineering expert in oil & gas operations.
${context ? `Context:\n${context}\n` : ''}
Answer questions about well formation analysis, petrophysical properties (GR, PHIND, PE), process efficiency, and bottleneck identification. Be concise.`;

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
      response: `Process Engineering Analysis: "${message}" — Well formation properties like Gamma Ray (GR), porosity (PHIND), and photoelectric factor (PE) are key indicators of formation quality and process potential. Import the well facies dataset for detailed analysis.`,
      source: 'fallback',
    });
  }
}
