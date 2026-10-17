'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function RegulatoryAffairsDashboard() {
  const [stats, setStats] = useState<{ label: string; value: number | string; color: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/departments/overview')
      .then((r) => r.json())
      .then((d) => {
        const hse      = d?.departments?.find((dep: { slug: string }) => dep.slug === 'hse-safety');
        const wi       = d?.departments?.find((dep: { slug: string }) => dep.slug === 'well-integrity');
        const deptSelf = d?.departments?.find((dep: { slug: string }) => dep.slug === 'regulatory-affairs');
        setStats([
          { label: 'HSE Incident Records',       value: hse?.metric_count ?? 0,       color: 'text-red-400' },
          { label: 'Well Integrity Records',     value: wi?.metric_count ?? 0,        color: 'text-amber-400' },
          { label: 'RAG Chunks (this dept)',     value: deptSelf?.rag_chunks ?? 0,    color: 'text-purple-400' },
          { label: 'Regulatory Bot Queries',     value: deptSelf?.bot_queries ?? 0,   color: 'text-blue-400' },
        ]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-gray-100 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-amber-400">⚖️ Regulatory Affairs</h1>
          <p className="text-gray-400 text-sm mt-1">Cross-cutting — compliance monitoring, incident reporting, permit management</p>
        </div>
        <div className="flex gap-2">
          <Link href="/departments/regulatory-affairs/bot" className="px-3 py-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-sm hover:bg-amber-500/30 transition-colors">
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
        <h2 className="text-sm font-semibold text-amber-400 mb-3">Compliance Frameworks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {[
            { name: 'API RP 1173',     desc: 'Pipeline Safety Management Systems',             status: 'monitored' },
            { name: 'ISO 14001',       desc: 'Environmental Management Systems',               status: 'monitored' },
            { name: 'OSHA PSM',        desc: 'Process Safety Management',                      status: 'monitored' },
            { name: 'EPA Tier II',     desc: 'Hazardous Chemical Reporting',                   status: 'pending' },
          ].map((fw) => (
            <div key={fw.name} className="bg-[#0a0e1a] rounded-lg p-3 flex items-center justify-between">
              <div>
                <div className="text-gray-200 font-medium">{fw.name}</div>
                <div className="text-gray-500 text-xs">{fw.desc}</div>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs border ${
                fw.status === 'monitored'
                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}>
                {fw.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
