'use client';
import { useEffect, useState } from 'react';

export default function RAGPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ answer: string; sources: string[]; _mock?: boolean } | null>(null);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const r = await fetch('/api/ai/rag', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) });
      const d = await r.json();
      setResult(d);
    } catch (e) {
      setResult({ answer: `Error: ${e}`, sources: [] });
    } finally {
      setLoading(false);
    }
  };

  const examples = [
    'What is the safe mud weight window for drilling in overpressured formations?',
    'How do I interpret an H2S reading above 10 ppm in process area?',
    'What are the API 1160 requirements for pipeline integrity management?',
    'Explain the Arps decline curve parameters for shale gas wells',
    'What maintenance procedures should I follow for a reciprocating compressor?',
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">RAG Knowledge Base</h1>
        <p className="text-gray-400 text-sm mt-1">Technical docs · Maintenance procedures · Regulatory standards · HSE procedures — ChromaDB + Ollama</p>
      </div>

      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <div className="flex gap-3 mb-3">
          <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="Ask a technical question about oil & gas operations..."
            className="flex-1 bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50" />
          <button onClick={search} disabled={loading}
            className="px-4 py-2 bg-amber-500 text-black text-sm font-semibold rounded-lg hover:bg-amber-400 disabled:opacity-50">
            {loading ? '...' : '🔍 Search'}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {examples.map((ex) => (
            <button key={ex} onClick={() => { setQuery(ex); }}
              className="text-xs text-amber-400/70 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded hover:bg-amber-500/20 transition-colors">
              {ex.substring(0, 50)}...
            </button>
          ))}
        </div>
      </div>

      {result && (
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          {result._mock && (
            <div className="mb-3 p-2 bg-amber-500/10 border border-amber-500/30 rounded text-xs text-amber-400">
              ⚠️ Mocked — CHROMA_URL not set. Set CHROMA_URL + OLLAMA_URL environment variables to enable real RAG.
            </div>
          )}
          <h2 className="font-semibold text-white mb-3">Answer</h2>
          <div className="text-gray-300 text-sm whitespace-pre-wrap">{result.answer}</div>
          {result.sources?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[#1e2a45]">
              <div className="text-xs text-gray-500 mb-2">Sources</div>
              {result.sources.map((s, i) => (
                <div key={i} className="text-xs text-gray-400 mb-1 pl-3 border-l border-amber-500/30">{s.substring(0, 200)}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Document categories */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <h2 className="font-semibold text-white mb-3">Knowledge Base Document Categories</h2>
        <div className="grid grid-cols-3 gap-3 text-xs">
          {[
            { cat: 'Technical Manuals', count: '450+', icon: '📘', desc: 'Equipment OEM manuals, technical specs' },
            { cat: 'Maintenance Procedures', count: '280+', icon: '🔧', desc: 'Preventive & corrective maintenance SOP' },
            { cat: 'Regulatory Standards', count: '120+', icon: '📋', desc: 'API, ISO, ASME, EPA standards' },
            { cat: 'HSE Procedures', count: '200+', icon: '⛑️', desc: 'Safety management system documents' },
            { cat: 'Incident Reports', count: '1,800+', icon: '📄', desc: 'Historical incident analysis reports' },
            { cat: 'Engineering Studies', count: '340+', icon: '🔬', desc: 'HAZOP, FMEA, reliability studies' },
          ].map((c) => (
            <div key={c.cat} className="border border-[#1e2a45] rounded-lg p-3">
              <div className="text-xl mb-1">{c.icon}</div>
              <div className="text-white font-medium">{c.cat}</div>
              <div className="text-amber-400">{c.count} documents</div>
              <div className="text-gray-500 mt-1">{c.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
