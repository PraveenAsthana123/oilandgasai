'use client';
import { useState, useEffect } from 'react';

export default function RagPage() {
  const [chunks, setChunks] = useState<any[]>([]);
  const [seeding, setSeeding] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/downstream/environmental-compliance/rag/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '' }),
    })
      .then((r) => r.json())
      .then((d) => setChunks(d.chunks || []));
  }, []);

  async function seed() {
    setSeeding(true);
    await fetch('/api/downstream/environmental-compliance/rag/seed', { method: 'POST' });
    setSeeding(false);
  }

  async function search() {
    const r = await fetch('/api/downstream/environmental-compliance/rag/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    const d = await r.json();
    setResults(d.chunks || []);
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] p-6">
      <h1 className="text-2xl font-bold text-amber-400 mb-4">
        Environmental Compliance — Vector DB / RAG
      </h1>
      <div className="flex items-center gap-4 mb-6">
        <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded text-sm">
          {chunks.length} chunks indexed
        </span>
        <button
          onClick={seed}
          disabled={seeding}
          className="bg-amber-500 text-black px-4 py-2 rounded font-semibold text-sm"
        >
          {seeding ? 'Seeding...' : 'Seed Vector DB'}
        </button>
      </div>
      <div className="flex gap-2 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Test RAG query..."
          className="flex-1 bg-[#0f1629] border border-[#1e2a45] rounded px-3 py-2 text-white text-sm"
        />
        <button
          onClick={search}
          className="bg-amber-500 text-black px-4 py-2 rounded font-semibold text-sm"
        >
          Search
        </button>
      </div>
      {results.map((r, i) => (
        <div
          key={i}
          className="bg-[#0f1629] border border-[#1e2a45] rounded p-3 mb-2 text-gray-300 text-sm"
        >
          {r.content}
        </div>
      ))}
    </div>
  );
}
