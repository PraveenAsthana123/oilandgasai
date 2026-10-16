import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ollamaStatus } from '@/lib/ollama';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const res = await query(`SELECT * FROM oga_integration ORDER BY service_name`);
    // Check live Ollama status
    const ollama = await ollamaStatus();
    const rows = res.rows.map(r => {
      if (r.service_name === 'Ollama LLM') {
        return { ...r, live_status: ollama.ok ? 'connected' : 'disconnected', models: ollama.models };
      }
      return r;
    });
    return NextResponse.json(rows);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
