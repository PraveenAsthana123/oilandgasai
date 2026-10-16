'use client';
import { useEffect, useState } from 'react';

export default function CustomersPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/accounts').then(r => r.json()).then(d => { setAccounts(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  const typeMap: Record<string, string> = { upstream: 'E&P Operator', midstream: 'Pipeline / Midstream', downstream: 'Refinery / Downstream' };

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Customer Directory</h1>
        <p className="text-slate-400 text-sm mt-1">E&P operators, pipeline companies, refineries, traders, utilities</p>
      </div>
      {loading ? <div className="text-slate-400">Loading...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((a: any) => (
            <div key={a.id} className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4 hover:border-emerald-500/40 transition-colors cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-bold">
                  {a.company.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-white">{a.company}</div>
                  <div className="text-xs text-blue-400">{typeMap[a.stream] || a.stream}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-slate-500">Revenue: </span><span className="text-emerald-400">${(parseFloat(a.revenue_cad) / 1000000).toFixed(1)}M</span></div>
                <div><span className="text-slate-500">Health: </span><span className={a.health_score >= 80 ? 'text-emerald-400' : a.health_score >= 60 ? 'text-yellow-400' : 'text-red-400'}>{a.health_score}/100</span></div>
                <div><span className="text-slate-500">Terms: </span><span className="text-slate-300">{a.payment_terms}</span></div>
                <div><span className="text-slate-500">Credit: </span><span className="text-slate-300">${(parseFloat(a.credit_limit_cad || 0) / 1000000).toFixed(1)}M</span></div>
              </div>
            </div>
          ))}
          {accounts.length === 0 && (
            <div className="col-span-3 text-center py-12 text-slate-500">No customers found. <a href="/api/init" className="text-emerald-400 underline">Initialize database</a></div>
          )}
        </div>
      )}
    </div>
  );
}
