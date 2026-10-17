'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface StatRow { label: string; value: number | string; color: string }

export default function MechanicalMaintenanceDashboard() {
  const [stats, setStats] = useState<StatRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/departments/overview')
      .then((r) => r.json())
      .then((d) => {
        const drilling = d?.departments?.find((dep: { slug: string }) => dep.slug === 'drilling-engineering');
        const wellInt  = d?.departments?.find((dep: { slug: string }) => dep.slug === 'well-integrity');
        setStats([
          { label: 'Drilling Records (proxy)',         value: drilling?.metric_count ?? 0, color: 'text-amber-400' },
          { label: 'Well Integrity Records (proxy)',   value: wellInt?.metric_count ?? 0,  color: 'text-blue-400' },
          { label: 'RAG Chunks (this dept)',           value: (d?.departments?.find((dep: { slug: string }) => dep.slug === 'mechanical-maintenance')?.rag_chunks ?? 0), color: 'text-purple-400' },
          { label: 'Total Jobs Running',               value: d?.kpis?.jobs_running ?? 0,  color: 'text-green-400' },
        ]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-gray-100 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-amber-400">🔧 Mechanical Maintenance</h1>
          <p className="text-gray-400 text-sm mt-1">Cross-cutting — predictive maintenance, equipment reliability, failure analysis</p>
        </div>
        <div className="flex gap-2">
          <Link href="/departments/mechanical-maintenance/bot" className="px-3 py-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-sm hover:bg-amber-500/30 transition-colors">
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
            <span>predictive_maintenance.csv — equipment failure prediction features (proxy: ogo_drill_metric)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span>ogo_wi_metric — well integrity inspection records used for corrosion pattern analysis</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>ogo_rag_chunk WHERE dept = &apos;mechanical-maintenance&apos; — maintenance procedure docs</span>
          </div>
        </div>
      </div>
    </div>
  );
}
