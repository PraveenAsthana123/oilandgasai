const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

export async function ollamaGenerate(prompt: string): Promise<string> {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama3.2', prompt, stream: false }),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
    const data = await res.json();
    return data.response || '';
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return `⚠️ Ollama unavailable (${msg}). Please ensure Ollama is running at ${OLLAMA_URL} with llama3.2 model.`;
  }
}
