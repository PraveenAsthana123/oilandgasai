export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { ollamaGenerate } from '@/lib/ollama';

export async function POST(req: NextRequest) {
  try {
    const { question, context } = await req.json();
    if (!question) {
      return NextResponse.json({ error: 'question is required' }, { status: 400 });
    }
    const prompt = `You are a helpful assistant for an Oil & Gas vendor portal operating in Canada. Help vendors with: understanding RFQ requirements, compliance documentation needs (WSIB, liability insurance, COR/SECOR, ISO certifications), invoice procedures, contract terms (MSA, frame agreements), safety requirements (TRIF, LTI rate, H2S, WHMIS), procurement processes, and dispute resolution.

Context: ${context || 'General vendor portal inquiry'}

Vendor question: ${question}

Provide a clear, practical answer focused on Oil & Gas industry standards in Canada (Alberta focus).`;

    const response = await ollamaGenerate(prompt);
    return NextResponse.json({ response, model: 'llama3.2', timestamp: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
