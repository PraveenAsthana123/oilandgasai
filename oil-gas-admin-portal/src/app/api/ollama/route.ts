import { NextResponse, NextRequest } from 'next/server';
import { ollamaGenerate } from '@/lib/ollama';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, model } = body;
    if (!prompt) return NextResponse.json({ error: 'prompt required' }, { status: 400 });
    const response = await ollamaGenerate(prompt, model ?? 'llama3.2');
    return NextResponse.json({ response });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
