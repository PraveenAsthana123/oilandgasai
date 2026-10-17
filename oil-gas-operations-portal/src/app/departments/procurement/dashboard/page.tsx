'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ProcurementDashboard() {
  const [stats, setStats] = useState<{ label: string; value: number | string; color: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/departments/overview')
      .then((r) => r.json())
      .then((d) => {
        const deptSelf = d?.departments?.find((dep: { slug: string }) => dep.slug === 'procurement');
        setStats([
          { label: 'Vendor Records',          value: '⚠️ Table pending', color: 'text-gray-400' },
          { label: 'RAG Chunks (this dept)',  value: deptSelf?.rag_chunks ?? 0, color: 'text-purple-400' },
          { label: 'Bot Queries (this dept)', value: deptSelf?.bot_queries ?? 0, color: 'text-blue-400' },
          { label: 'Data Imported (all)',     value: d?.kpis?.data_imported ?? 0, color: 'text-green-400' },
        ]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-gray-100 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-amber-400">🛒 Procurement</h1>
          <p className="text-gray-400 text-sm mt-1">Cross-cutting — vendor management, purchase orders, supply chain</p>
        </div>
        <div className="flex gap-2">
          <Link href="/departments/procurement/bot" className="px-3 py-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-sm hover:bg-amber-500/30 transition-colors">
            🤖 Bot
          </Link>
          <Link href="/departments/dashboard" className="px-3 py-1.5 bg-[#1e2a45] text-gray-300 rounded-lg text-sm hover:bg-[#253456] transition-colors">
            ← All Depts
          </Link>
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6 text-amber-400 text-sm">
        ⚠️ Mocked — <code>ogo_vendor</code> table not yet seeded. Vendor count shows placeholder until procurement data is imported via the data pipeline.
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4 animate-pulse h-24" />
            ))
          : stats.map((s) => (
              <div key={s.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
                <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-400 mt-1">{s.label}</div>
              </div>
            ))}
      </div>

      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-amber-400 mb-3">Planned Data Schema (ogo_vendor)</h2>
        <div className="font-mono text-xs text-gray-400 bg-[#0a0e1a] rounded-lg p-4">
          <pre>{`CREATE TABLE IF NOT EXISTS ogo_vendor (
  id            SERIAL PRIMARY KEY,
  vendor_name   TEXT NOT NULL,
  category      TEXT,
  country       TEXT,
  contract_value NUMERIC,
  status        TEXT DEFAULT 'active',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);`}</pre>
        </div>
      </div>
    </div>
  );
}
