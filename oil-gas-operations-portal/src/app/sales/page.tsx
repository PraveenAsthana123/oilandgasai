'use client';
import { useEffect, useState } from 'react';

export default function SalesPage() {
  const [data, setData] = useState<{ leads?: unknown[]; opportunities?: unknown[]; pipeline_value?: number } | null>(null);
  useEffect(() => { fetch('/api/sales').then(r => r.json()).then(setData).catch(() => {}); }, []);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Sales Hub</h1>
        <p className="text-gray-400 text-sm mt-1">Leads · Pipeline · Quotes · Proposals · Accounts · Activities</p></div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Leads', value: data?.leads?.length ?? '—', icon: '🎯', href: '/sales/leads' },
          { label: 'Opportunities', value: data?.opportunities?.length ?? '—', icon: '💼', href: '/sales/pipeline' },
          { label: 'Pipeline Value', value: data?.pipeline_value ? `$${(data.pipeline_value / 1000).toFixed(1)}k` : '—', icon: '📈', href: '/sales/reports' },
        ].map((k) => (
          <a key={k.label} href={k.href} className="bg-[#0f1629] border border-[#1e2a45] hover:border-amber-500/40 rounded-xl p-4 transition-colors group">
            <div className="text-2xl mb-2">{k.icon}</div>
            <div className="text-2xl font-bold text-amber-400">{k.value}</div>
            <div className="text-xs text-gray-500 mt-1">{k.label}</div>
          </a>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[
          { href: '/sales/leads', label: 'Leads', desc: 'ogo_lead table — status, score, owner', icon: '🎯' },
          { href: '/sales/pipeline', label: 'Pipeline', desc: 'ogo_opportunity — stage, value, probability', icon: '📊' },
          { href: '/sales/quotes', label: 'Quotes', desc: 'Quote builder for AI platform services', icon: '💬' },
          { href: '/sales/proposals', label: 'Proposals', desc: 'Full technical + commercial proposals', icon: '📄' },
        ].map((item) => (
          <a key={item.href} href={item.href} className="bg-[#0f1629] border border-[#1e2a45] hover:border-amber-500/30 rounded-xl p-4 transition-colors group">
            <div className="flex items-center gap-3">
              <span className="text-xl">{item.icon}</span>
              <div><div className="font-medium text-white group-hover:text-amber-400 text-sm">{item.label}</div>
              <div className="text-xs text-gray-500">{item.desc}</div></div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
