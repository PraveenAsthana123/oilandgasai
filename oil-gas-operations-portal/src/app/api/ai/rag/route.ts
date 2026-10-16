export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  let query = '';
  try {
    const body = await request.json();
    query = body.query || '';
  } catch {}

  if (!query) return Response.json({ error: 'query required' }, { status: 400 });

  const chromaUrl = process.env.CHROMA_URL;
  if (!chromaUrl) {
    return Response.json({
      query,
      answer: '⚠️ Mocked — CHROMA_URL not set. Set CHROMA_URL to enable real vector search.',
      sources: [],
      _mock: true,
    });
  }

  // Real Ollama + ChromaDB RAG
  const ollamaUrl = `${process.env.OLLAMA_URL ?? 'http://localhost:11434'}/api/generate`;
  let answer = '';
  let sources: string[] = [];

  try {
    // Query ChromaDB
    const chromaRes = await fetch(`${chromaUrl}/api/v1/collections/ogo_knowledge/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query_texts: [query], n_results: 5 }),
      signal: AbortSignal.timeout(10000),
    });
    if (chromaRes.ok) {
      const chromaData = await chromaRes.json();
      sources = (chromaData.documents?.[0] || []).slice(0, 3);
    }
  } catch {}

  const context = sources.length > 0 ? sources.join('\n\n') : 'No document context available.';
  const prompt = `You are an Oil & Gas technical knowledge assistant. Use the provided context to answer the question.

Context:
${context}

Question: ${query}

Provide a precise, technical answer with references to relevant standards or procedures where applicable.`;

  try {
    const res = await fetch(ollamaUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama3.2', prompt, stream: false }),
      signal: AbortSignal.timeout(30000),
    });
    if (res.ok) {
      const data = await res.json();
      answer = data.response || '';
    }
  } catch {
    answer = '⚠️ Ollama unavailable — set OLLAMA_URL to enable AI-powered Q&A.';
  }

  return Response.json({ query, answer, sources, timestamp: new Date().toISOString() });
}
