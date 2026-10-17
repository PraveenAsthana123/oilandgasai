'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PetroleumEconomicsDashboard() {
  const [stats, setStats] = useState<{ label: string; value: number | string; color: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/departments/overview')
      .then((r) => r.json())
      .then((d) => {
        const trading  = d?.departments?.find((dep: { slug: string }) => dep.slug === 'crude-trading');
        const deptSelf = d?.departments?.find((dep: { slug: string }) => dep.slug === 'petroleum-economics');
        setStats([
          { label: 'Energy Price Records',     value: trading?.metric_count ?? 0,   color: 'text-amber-400' },
          { label: 'RAG Chunks (this dept)',   value: deptSelf?.rag_chunks ?? 0,    color: 'text-purple-400' },
          { label: 'Bot Queries (this dept)',  value: deptSelf?.bot_queries ?? 0,   color: 'text-blue-400' },
          { label: 'Data Imported (all)',      value: d?.kpis?.data_imported ?? 0,  color: 'text-green-400' },
        ]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-gray-100 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-amber-400">💰 Petroleum Economics</h1>
          <p className="text-gray-400 text-sm mt-1">Cross-cutting — energy price analysis, cost modelling, fiscal regimes</p>
        </div>
        <div className="flex gap-2">
          <Link href="/departments/petroleum-economics/bot" className="px-3 py-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-sm hover:bg-amber-500/30 transition-colors">
            🤖 Bot
          </Link>
          <Link href="/departments/dashboard" className="px-3 py-1.5 bg-[#1e2a45] text-gray-300 rounded-lg text-sm hover:bg-[#253456] transition-colors">
            ← All Depts
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4 animate-pulse h-24" />
            ))
          : stats.map((s) => (
              <div key={s.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-400 mt-1">{s.label}</div>
              </div>
            ))}
      </div>

      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-amber-400 mb-3">Data Sources</h2>
        <div className="space-y-2 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
            <span>ogo_trading_metric — crude price, volume, benchmark differentials (WTI, Brent, Dubai)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span>ogo_rag_chunk WHERE dept = &apos;petroleum-economics&apos; — fiscal regime docs, PSA contracts</span>
          </div>
        </div>
      </div>
    </div>
  );
}
