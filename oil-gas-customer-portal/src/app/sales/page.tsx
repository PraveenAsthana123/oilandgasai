'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function SalesDashboardPage() {
  const [data, setData] = useState({ leads: 0, opportunities: 0, pipeline: 0 });

  useEffect(() => {
    fetch('/api/sales').then(r => r.json()).then(d => setData(d));
  }, []);

  const links = [
    { href: '/sales/leads', label: 'Leads', icon: '🎯', value: data.leads },
    { href: '/sales/pipeline', label: 'Pipeline', icon: '🔄', value: data.opportunities },
    { href: '/sales/quotes', label: 'Quotes', icon: '💬', value: 0 },
    { href: '/sales/proposals', label: 'Proposals', icon: '📄', value: 0 },
    { href: '/sales/accounts', label: 'Accounts', icon: '🏢', value: 3 },
    { href: '/sales/activities', label: 'Activities', icon: '📅', value: 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Sales Dashboard</h1>
        <p className="text-gray-400 mt-1">Pipeline, leads, and account management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{data.leads}</div>
          <div className="text-gray-500 text-xs mt-1">Active Leads</div>
        </div>
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{data.opportunities}</div>
          <div className="text-gray-500 text-xs mt-1">Opportunities</div>
        </div>
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-400">${((data.pipeline || 0) / 1000000).toFixed(1)}M</div>
          <div className="text-gray-500 text-xs mt-1">Pipeline Value (CAD)</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {links.map(l => (
          <Link key={l.href} href={l.href} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4 hover:border-blue-600/40 transition-colors">
            <div className="text-xl mb-2">{l.icon}</div>
            <div className="text-white font-medium">{l.label}</div>
            {l.value > 0 && <div className="text-blue-400 text-lg font-bold mt-1">{l.value}</div>}
          </Link>
        ))}
      </div>
    </div>
  );
}
