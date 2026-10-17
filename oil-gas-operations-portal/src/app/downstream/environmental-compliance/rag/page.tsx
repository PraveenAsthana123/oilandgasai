'use client';
import { useState, useEffect, useCallback } from 'react';
interface Chunk { id: number; dept: string; preview: string; created_at: string; }
interface QueryResult { id: number; content: string; created_at: string; }

export default function EnviroRAGPage() {
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<QueryResult[]>([]);
  const [querying, setQuerying] = useState(false);

  const fetchChunks = useCallback(async () => { setChunks((await (await fetch('/api/downstream/environmental-compliance/rag/seed')).json()).chunks || []); }, []);
  useEffect(() => { fetchChunks(); }, [fetchChunks]);
  const handleSeed = async () => { setSeeding(true); setSeedMsg(null); const d = await (await fetch('/api/downstream/environmental-compliance/rag/seed', { method: 'POST' })).json(); setSeedMsg(d.error ? `Error: ${d.error}` : `Seeded ${d.seeded} chunks`); setSeeding(false); fetchChunks(); };
  const handleQuery = async () => { if (!query.trim()) return; setQuerying(true); setResults((await (await fetch('/api/downstream/environmental-compliance/rag/query', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ query }) })).json()).results || []); setQuerying(false); };

  return (
    <div className="min-h-screen bg-gray-950 text-amber-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8"><div className="flex items-center gap-3 mb-2"><div className="w-3 h-3 rounded-full bg-amber-500" /><span className="text-amber-400 text-sm font-mono uppercase tracking-widest">Downstream / Environmental Compliance</span></div><h1 className="text-3xl font-bold text-amber-300">RAG Knowledge Base</h1><p className="text-gray-400 mt-1">Environmental regulations, methane emissions, and oil spill response domain knowledge.</p></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900 border border-amber-900/40 rounded-xl p-5"><p className="text-gray-500 text-xs uppercase mb-1">Chunk Count</p><p className="text-amber-300 text-2xl font-bold">{chunks.length}</p><p className="text-gray-500 text-xs mt-1">Environmental compliance domain</p></div>
          <div className="bg-gray-900 border border-amber-900/40 rounded-xl p-5"><p className="text-gray-500 text-xs uppercase mb-1">Storage</p><p className="text-amber-300 text-xl font-bold">PostgreSQL</p><p className="text-gray-500 text-xs mt-1">ogo_rag_chunk table</p></div>
          <div className="bg-gray-900 border border-amber-900/40 rounded-xl p-5 flex items-center justify-between"><div><p className="text-gray-500 text-xs uppercase mb-1">Seed KB</p><p className="text-gray-400 text-sm">8 domain chunks</p></div><button onClick={handleSeed} disabled={seeding} className="bg-amber-600 hover:bg-amber-500 disabled:bg-gray-700 text-white font-semibold px-4 py-2 rounded-lg text-sm">{seeding ? 'Seeding…' : 'Seed'}</button></div>
        </div>
        {seedMsg && <div className={`mb-4 rounded-lg p-3 text-sm ${seedMsg.startsWith('Error') ? 'bg-red-900/30 text-red-300 border border-red-700' : 'bg-green-900/30 text-green-300 border border-green-700'}`}>{seedMsg}</div>}
        <div className="bg-gray-900 border border-amber-900/40 rounded-xl p-6 mb-6">
          <h2 className="text-amber-400 font-semibold mb-4">Query Test</h2>
          <div className="flex gap-3"><input className="flex-1 bg-gray-800 border border-gray-700 text-amber-50 rounded-lg px-4 py-2 text-sm outline-none focus:border-amber-600" placeholder="Search… e.g. 'methane', 'MARPOL', 'Paris Agreement'" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleQuery()} /><button onClick={handleQuery} disabled={querying} className="bg-amber-600 hover:bg-amber-500 disabled:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">{querying ? '…' : 'Search'}</button></div>
          {results.length > 0 && <div className="mt-4 space-y-3">{results.map(r=><div key={r.id} className="bg-gray-800/60 rounded-lg p-4 border border-gray-700"><p className="text-gray-300 text-sm leading-relaxed">{r.content}</p><p className="text-gray-600 text-xs mt-2">Chunk #{r.id}</p></div>)}</div>}
          {results.length === 0 && query && !querying && <p className="text-gray-600 text-sm mt-3">No matching chunks for &quot;{query}&quot;</p>}
        </div>
        <div className="bg-gray-900 border border-amber-900/40 rounded-xl p-6">
          <h2 className="text-amber-400 font-semibold mb-4">Knowledge Chunks</h2>
          {chunks.length === 0 ? <div className="text-center text-gray-500 py-8 border border-dashed border-gray-800 rounded-lg text-sm">No chunks yet. Click <strong className="text-amber-400">Seed</strong>.</div> : (
            <div className="space-y-2">{chunks.map(c=><div key={c.id} className="flex items-start gap-3 bg-gray-800/50 rounded-lg px-4 py-3"><span className="text-amber-600 font-mono text-xs mt-0.5">#{c.id}</span><p className="text-gray-400 text-sm flex-1">{c.preview}…</p><span className="text-gray-600 text-xs shrink-0">{new Date(c.created_at).toLocaleDateString()}</span></div>)}</div>
          )}
        </div>
      </div>
    </div>
  );
}
