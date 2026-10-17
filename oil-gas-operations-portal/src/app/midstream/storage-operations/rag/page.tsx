'use client';
import { useEffect, useState } from 'react';

interface RagResult { chunk_id: number; dept: string; content: string; source: string; similarity: number; }
interface SeedStatus { status: string; chunks_seeded?: number; error?: string; }

export default function StorageOperationsRagPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<RagResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedStatus, setSeedStatus] = useState<SeedStatus | null>(null);

  useEffect(() => { fetch('/api/midstream/storage-operations/rag/seed').then(r => r.json()).then(setSeedStatus).catch(() => {}); }, []);

  const runSeed = async () => {
    setSeeding(true);
    try { setSeedStatus(await (await fetch('/api/midstream/storage-operations/rag/seed', { method: 'POST' })).json()); }
    finally { setSeeding(false); }
  };

  const runQuery = async () => {
    if (!query.trim()) return;
    setSearching(true); setResults([]);
    try { setResults((await (await fetch('/api/midstream/storage-operations/rag/query', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query, dept: 'midstream-storage-operations', limit: 5 }) })).json()).results ?? []); }
    finally { setSearching(false); }
  };

  return (
    <div className="space-y-6 p-6">
      <div><h1 className="text-2xl font-bold text-white">Storage Operations — RAG Knowledge Base</h1><p className="text-gray-400 text-sm mt-1">dept = midstream-storage-operations</p></div>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4 flex items-center justify-between">
        <div><div className="text-white font-semibold">Vector DB Status</div>
          {seedStatus ? <div className="text-sm mt-1"><span className={seedStatus.status==='ok'?'text-green-400':'text-amber-400'}>{seedStatus.status==='ok'?`✓ ${seedStatus.chunks_seeded} chunks`:seedStatus.status}</span></div> : <div className="text-gray-500 text-sm">Checking…</div>}
        </div>
        <button onClick={runSeed} disabled={seeding} className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold px-4 py-2 rounded-lg text-sm">{seeding?'Seeding…':'Re-Seed Knowledge Base'}</button>
      </div>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <h2 className="font-semibold text-white mb-3">Semantic Search</h2>
        <div className="flex gap-2">
          <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key==='Enter'&&runQuery()} placeholder="e.g. gas storage capacity, inventory management…" className="flex-1 bg-[#0a0e1a] border border-[#1e2a45] text-white rounded-lg px-4 py-2 text-sm outline-none focus:border-amber-500" />
          <button onClick={runQuery} disabled={searching||!query.trim()} className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold px-5 py-2 rounded-lg text-sm">{searching?'Searching…':'Search'}</button>
        </div>
      </div>
      {results.length > 0 && (
        <div className="space-y-3"><h2 className="font-semibold text-white">Top {results.length} Results</h2>
          {results.map(r => (<div key={r.chunk_id} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4"><div className="flex justify-between mb-2"><div className="text-xs text-amber-400 font-mono">{r.source}</div><div className="text-xs text-gray-500">sim: {r.similarity?.toFixed(3)}</div></div><div className="text-sm text-gray-300 leading-relaxed">{r.content}</div></div>))}
        </div>
      )}
    </div>
  );
}
