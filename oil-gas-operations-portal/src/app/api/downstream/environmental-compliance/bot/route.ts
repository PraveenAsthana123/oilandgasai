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
      ['%environmental-compliance%']
    );
    context = rows.map((r: { content: string }) => r.content).join('\n');
  } catch { context = ''; }

  const systemPrompt = `You are an environmental compliance expert for oil & gas operations.
${context ? `Context:\n${context}\n` : ''}
Answer questions about methane emissions, oil spills, regulatory compliance (EPA, MARPOL, OSHA), carbon footprint reduction, and environmental risk management. Be precise and regulation-aware.`;

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
      response: `Environmental Compliance Analysis: "${message}" — Key regulations include EPA Clean Air Act (methane rules), MARPOL (marine pollution), and Paris Agreement commitments. Methane emissions from oil & gas represent 30% of global methane emissions. Import datasets for live compliance analysis.`,
      source: 'fallback',
    });
  }
}
