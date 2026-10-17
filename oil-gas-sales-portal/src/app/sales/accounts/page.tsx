'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function SalesAccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/accounts').then(r => r.json()).then(d => {
      setAccounts(Array.isArray(d) ? d : d?.accounts || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = accounts.filter(a =>
    !search || (a.company || a.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = accounts.reduce((s, a) => s + parseFloat(a.revenue_cad || 0), 0);
  const activeCount = accounts.filter(a => a.status === 'active' || !a.status).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href="/sales" className="hover:text-emerald-400">Sales</Link>
            <span>/</span>
            <span className="text-gray-300">Accounts</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Accounts</h1>
          <p className="text-gray-400 mt-1">{activeCount} active • ${(totalRevenue / 1_000_000).toFixed(2)}M total revenue</p>
        </div>
      </div>

      <div className="flex gap-3">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search accounts..."
          className="bg-[#0f1629] border border-[#1e2a45] text-gray-300 text-sm rounded px-3 py-1.5 w-64 focus:border-emerald-500 outline-none"
        />
      </div>

      {loading ? (
        <div className="text-emerald-400">Loading accounts...</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-500 text-sm">No accounts found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((a: any) => (
            <div key={a.id} className="bg-[#0f1629] border border-[#1e2a45] hover:border-emerald-500/40 rounded-lg p-4 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-semibold text-white">{a.company || a.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded ${a.tier === 'enterprise' ? 'bg-purple-800 text-purple-300' : a.tier === 'mid-market' ? 'bg-blue-800 text-blue-300' : 'bg-slate-700 text-slate-300'}`}>
                  {a.tier || 'standard'}
                </span>
              </div>
              <div className="text-xs text-gray-400 space-y-1">
                {a.industry && <div>Industry: <span className="text-gray-300">{a.industry}</span></div>}
                {a.contact_name && <div>Contact: <span className="text-gray-300">{a.contact_name}</span></div>}
                {a.revenue_cad && (
                  <div>Revenue: <span className="text-emerald-400 font-medium">${parseFloat(a.revenue_cad).toLocaleString()}</span></div>
                )}
                {a.stream && <div>Stream: <span className="text-gray-300 capitalize">{a.stream}</span></div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
