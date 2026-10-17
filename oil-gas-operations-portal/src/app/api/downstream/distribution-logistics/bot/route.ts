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
      ['%distribution-logistics%']
    );
    context = rows.map((r: { content: string }) => r.content).join('\n');
  } catch { context = ''; }

  const systemPrompt = `You are a logistics and distribution expert for petroleum products.
${context ? `Context:\n${context}\n` : ''}
Answer questions about pipeline routing, tanker scheduling, delivery optimization, cost reduction, and supply chain efficiency. Be concise and actionable.`;

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
      response: `Distribution Logistics Analysis: "${message}" — Petroleum logistics involves pipeline, tanker, rail, and truck modes. Delivery performance KPIs include on-time rate, transit days, and cost per barrel. Import the logistics dataset for live analysis.`,
      source: 'fallback',
    });
  }
}
