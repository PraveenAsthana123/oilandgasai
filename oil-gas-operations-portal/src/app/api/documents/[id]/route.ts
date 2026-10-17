export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

async function ollamaSummarize(description: string, name: string): Promise<string> {
  const prompt = `You are a technical document analyst for an oil and gas company. Provide a concise 2-3 sentence summary of this document based on its name and description.

Document: "${name}"
Description: "${description}"

Write a professional, factual summary suitable for a document management system.`;

  const resp = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'llama3.2', prompt, stream: false }),
    signal: AbortSignal.timeout(30000),
  });
  if (!resp.ok) throw new Error(`Ollama HTTP ${resp.status}`);
  const data = await resp.json() as { response?: string };
  return (data.response || '').trim();
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    if (body.action !== 'summarize') {
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

    const client = await pool.connect();
    try {
      const docRes = await client.query('SELECT * FROM ogo_document WHERE id = $1', [id]);
      if (docRes.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      const doc = docRes.rows[0] as { name: string; description: string };

      let summary: string;
      try {
        summary = await ollamaSummarize(doc.description || '', doc.name || '');
      } catch {
        summary = `⚠️ Mocked — Ollama not available. Document "${doc.name}" covers ${doc.description?.substring(0, 100) || 'technical operations content'}...`;
      }

      const { rows } = await client.query(
        'UPDATE ogo_document SET ai_summary = $1 WHERE id = $2 RETURNING *',
        [summary, id]
      );
      return NextResponse.json({ data: rows[0], summary });
    } finally {
      client.release();
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('ECONNREFUSED') || msg.includes('connect')) {
      return NextResponse.json({ _mock: true, _reason: 'DB unavailable', summary: 'DB unavailable' });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
