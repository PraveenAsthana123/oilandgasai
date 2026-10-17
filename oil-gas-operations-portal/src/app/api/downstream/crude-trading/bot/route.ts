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
      ['%crude-trading%']
    );
    context = rows.map((r: { content: string }) => r.content).join('\n');
  } catch { context = ''; }

  const systemPrompt = `You are a crude oil and energy commodity trading analyst.
${context ? `Context:\n${context}\n` : ''}
Answer questions about WTI/Brent/Natural Gas prices, price volatility, trading strategies, crack spreads, and energy market dynamics. Be analytical and concise.`;

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
      response: `Crude Trading Analysis: "${message}" — Crude oil prices are driven by OPEC+ supply decisions, US inventories (EIA reports), demand from Asia, and geopolitical risk. WTI-Brent spread reflects US export capacity and Gulf Coast logistics. Import price dataset for live analysis.`,
      source: 'fallback',
    });
  }
}
