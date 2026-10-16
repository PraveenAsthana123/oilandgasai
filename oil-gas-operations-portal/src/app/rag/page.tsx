'use client';

import { useState, useEffect } from 'react';

type Chunk = { id: number; source: string; chunk_text: string; chunk_index: number; dept_tag: string; created_at: string };
type Stats = { total_chunks: string; total_docs: string; last_updated: string };
type DeptCoverage = { dept_tag: string; chunk_count: string };

export default function RAGPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Chunk[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [deptCoverage, setDeptCoverage] = useState<DeptCoverage[]>([]);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<Record<string, unknown> | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load stats on mount
    fetch('/api/rag/search?q=oil gas')
      .then(r => r.json())
      .then((d: { stats?: Stats; dept_coverage?: DeptCoverage[] }) => {
        if (d.stats) setStats(d.stats);
        if (d.dept_coverage) setDeptCoverage(d.dept_coverage);
      })
      .catch(() => {});
  }, []);

  async function search() {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    try {
      const resp = await fetch(`/api/rag/search?q=${encodeURIComponent(query)}`);
      const data = await resp.json() as { results: Chunk[]; total: number; stats: Stats; dept_coverage: DeptCoverage[] };
      setResults(data.results ?? []);
      setTotal(data.total ?? 0);
      if (data.stats) setStats(data.stats);
      if (data.dept_coverage) setDeptCoverage(data.dept_coverage);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  async function seedDocs() {
    setSeeding(true);
    setSeedResult(null);
    try {
      const resp = await fetch('/api/rag/seed', { method: 'POST' });
      const data = await resp.json() as Record<string, unknown>;
      setSeedResult(data);
      // Refresh stats
      const statsResp = await fetch('/api/rag/search?q=oil gas');
      const statsData = await statsResp.json() as { stats?: Stats; dept_coverage?: DeptCoverage[] };
      if (statsData.stats) setStats(statsData.stats);
      if (statsData.dept_coverage) setDeptCoverage(statsData.dept_coverage);
    } catch (e) {
      setSeedResult({ error: String(e) });
    } finally {
      setSeeding(false);
    }
  }

  const totalChunks = parseInt(stats?.total_chunks ?? '0');
  const totalDocs = parseInt(stats?.total_docs ?? '0');

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-amber-500/70 uppercase tracking-wider mb-1">AI / Knowledge Base</div>
          <h1 className="text-2xl font-bold text-white">RAG Knowledge Base</h1>
          <p className="text-gray-400 text-sm mt-1">
            Oil & Gas document corpus · Keyword search · Auto-chunked from technical docs
          </p>
        </div>
        <button
          onClick={seedDocs}
          disabled={seeding}
          className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-sm hover:bg-green-500/30 disabled:opacity-50 transition-colors">
          {seeding ? 'Seeding…' : '⚡ Seed Documents'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          <div className="text-xs text-gray-500">Total Chunks</div>
          <div className="text-2xl font-bold text-amber-400">{totalChunks > 0 ? totalChunks.toLocaleString() : '—'}</div>
        </div>
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          <div className="text-xs text-gray-500">Documents Indexed</div>
          <div className="text-2xl font-bold text-blue-400">{totalDocs > 0 ? totalDocs : '—'}</div>
        </div>
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          <div className="text-xs text-gray-500">Dept Coverage</div>
          <div className="text-2xl font-bold text-green-400">{deptCoverage.length > 0 ? deptCoverage.length : '—'}</div>
        </div>
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          <div className="text-xs text-gray-500">Last Updated</div>
          <div className="text-sm font-semibold text-purple-400">
            {stats?.last_updated ? new Date(stats.last_updated).toLocaleDateString() : '—'}
          </div>
        </div>
      </div>

      {totalChunks === 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-amber-400 text-sm">
          ⚠️ No documents indexed yet. Click &ldquo;Seed Documents&rdquo; to ingest from
          /mnt/deepa/sohamyoga/oil-gas-monitoring-portal/docs/
        </div>
      )}

      {/* Seed result */}
      {seedResult && (
        <div className="bg-[#0f1629] border border-green-500/30 rounded-xl p-4">
          <div className="text-sm font-semibold text-green-400 mb-2">Seed Result</div>
          {'error' in seedResult
            ? <div className="text-red-400 text-sm">{String(seedResult.error)}</div>
            : (
              <div className="space-y-1">
                <div className="text-xs text-gray-400">Total inserted: <span className="text-green-400">{String(seedResult.total_inserted)}</span></div>
                {Array.isArray(seedResult.docs) && seedResult.docs.map((d: Record<string, string>, i: number) => (
                  <div key={i} className="text-xs">
                    <span className={d.status.includes('seeded') && !d.status.includes('already') ? 'text-green-400' : 'text-gray-500'}>
                      {d.file}: {d.chunks} chunks — {d.status}
                    </span>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      )}

      {/* Search */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <h2 className="text-sm font-semibold text-gray-300 mb-3">Search Knowledge Base</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="e.g. pipeline corrosion inspection, SCADA anomaly detection, drilling NPT…"
            className="flex-1 bg-[#0a0e1a] border border-[#1e2a45] text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50 placeholder-gray-600"
          />
          <button
            onClick={search}
            disabled={loading || !query.trim()}
            className="px-4 py-2 bg-amber-500 text-black font-semibold rounded-lg text-sm hover:bg-amber-400 disabled:opacity-50 transition-colors">
            {loading ? '…' : 'Search'}
          </button>
        </div>
        {error && <div className="text-red-400 text-xs mt-2">{error}</div>}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div>
          <div className="text-xs text-gray-500 mb-3">Found {total} result(s) for &ldquo;{query}&rdquo;</div>
          <div className="space-y-3">
            {results.map((chunk) => (
              <div key={chunk.id} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-amber-400 font-mono">{chunk.source}</span>
                    <span className="text-xs text-gray-600">chunk #{chunk.chunk_index}</span>
                    {chunk.dept_tag && (
                      <span className="px-1.5 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400">{chunk.dept_tag}</span>
                    )}
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{chunk.chunk_text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {query && results.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          No results for &ldquo;{query}&rdquo;.{totalChunks === 0 ? ' Seed documents first.' : ' Try different keywords.'}
        </div>
      )}

      {/* Coverage */}
      {deptCoverage.length > 0 && (
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Coverage by Department</h2>
          <div className="space-y-2">
            {deptCoverage.map((d) => {
              const pct = totalChunks > 0 ? (parseInt(d.chunk_count) / totalChunks) * 100 : 0;
              return (
                <div key={d.dept_tag} className="flex items-center gap-3">
                  <div className="w-28 text-xs text-gray-400 text-right">{d.dept_tag}</div>
                  <div className="flex-1 bg-[#1e2a45] rounded h-4 overflow-hidden">
                    <div className="h-full bg-amber-500/60 rounded" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-xs text-gray-500 w-16">{d.chunk_count} chunks</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
