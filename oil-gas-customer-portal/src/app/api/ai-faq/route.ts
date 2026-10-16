export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { question } = await req.json();
    if (!question) return Response.json({ error: 'question required' }, { status: 400 });

    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    const prompt = `You are a helpful assistant for an Oil & Gas AI Monitoring Platform customer portal. Answer customer questions about deliveries, invoices, contracts, quality certificates, and AI monitoring services. Be concise and professional. Question: ${question}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const resp = await fetch(`${ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'llama3.2', prompt, stream: false }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!resp.ok) {
        return Response.json({ answer: null, _mock: true, _reason: 'Ollama returned error', status: resp.status }, { status: 200 });
      }

      const data = await resp.json();
      return Response.json({ answer: data.response, model: 'llama3.2' });
    } catch (fetchErr: unknown) {
      clearTimeout(timeout);
      const isAbort = fetchErr instanceof Error && fetchErr.name === 'AbortError';
      return Response.json({
        answer: null,
        _mock: true,
        _reason: isAbort ? 'Ollama timeout (30s)' : 'Ollama unavailable — set OLLAMA_URL to enable',
        status: 'needs_review',
      });
    }
  } catch (e: unknown) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
