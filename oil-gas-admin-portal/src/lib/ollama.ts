const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434';

export async function ollamaGenerate(prompt: string, model = 'llama3.2'): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt, stream: false }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
    const data = await res.json();
    return data.response ?? '';
  } catch (e: unknown) {
    if (e instanceof Error && e.name === 'AbortError') return '[Ollama timeout after 30s]';
    return `[Ollama error: ${e instanceof Error ? e.message : String(e)}]`;
  } finally {
    clearTimeout(timeout);
  }
}

export async function ollamaStatus(): Promise<{ ok: boolean; models: string[] }> {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return { ok: false, models: [] };
    const data = await res.json();
    return { ok: true, models: (data.models ?? []).map((m: { name: string }) => m.name) };
  } catch {
    return { ok: false, models: [] };
  }
}
