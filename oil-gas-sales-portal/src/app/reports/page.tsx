'use client';
import { useEffect, useState } from 'react';

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports/sales').then(r => r.json()).then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading) return <div className="p-6 text-slate-400">Loading reports...</div>;
  if (!data) return <div className="p-6 text-red-400">Failed to load report data.</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Sales Reports</h1>
        <p className="text-slate-400 text-sm mt-1">Win rate, pipeline analysis, rep performance, top accounts</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-3">
          <div className="text-xs text-slate-400">Total Leads</div>
          <div className="text-2xl font-bold text-white">{data.summary?.total_leads || 0}</div>
        </div>
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-3">
          <div className="text-xs text-slate-400">Conversion Rate</div>
          <div className="text-2xl font-bold text-emerald-400">{data.summary?.conversion_rate || 0}%</div>
        </div>
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-3">
          <div className="text-xs text-slate-400">Pipeline Value (CAD)</div>
          <div className="text-2xl font-bold text-white">${((data.summary?.total_pipeline_value_cad || 0) / 1000000).toFixed(1)}M</div>
        </div>
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-3">
          <div className="text-xs text-slate-400">Won Deals</div>
          <div className="text-2xl font-bold text-emerald-400">{data.summary?.won_deals || 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pipeline by Stage */}
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
          <h2 className="text-sm font-semibold text-white mb-3">Pipeline by Stage</h2>
          {(data.opportunities || []).map((o: any) => (
            <div key={o.stage} className="flex items-center gap-3 mb-2">
              <span className="text-xs text-slate-400 capitalize w-32">{o.stage?.replace('_', ' ')}</span>
              <div className="flex-1 bg-[#1e2a45] rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${data.summary?.total_pipeline_value_cad > 0 ? (parseFloat(o.value || 0) / data.summary.total_pipeline_value_cad * 100) : 0}%` }} />
              </div>
              <span className="text-xs text-emerald-400 w-24 text-right">${(parseFloat(o.value || 0) / 1000).toFixed(0)}K ({o.count})</span>
            </div>
          ))}
          {(data.opportunities || []).length === 0 && <div className="text-slate-500 text-sm">No opportunity data</div>}
        </div>

        {/* Revenue by Stream */}
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
          <h2 className="text-sm font-semibold text-white mb-3">Revenue by Stream (Accounts)</h2>
          {(data.accounts || []).map((a: any) => (
            <div key={a.stream} className="flex items-center justify-between mb-3 p-2 bg-[#0a0e1a] rounded">
              <div>
                <div className="text-sm text-white capitalize">{a.stream}</div>
                <div className="text-xs text-slate-400">{a.count} accounts</div>
              </div>
              <div className="text-emerald-400 font-bold">${(parseFloat(a.revenue || 0) / 1000000).toFixed(1)}M</div>
            </div>
          ))}
          {(data.accounts || []).length === 0 && <div className="text-slate-500 text-sm">No account data</div>}
        </div>

        {/* Lead Status Breakdown */}
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
          <h2 className="text-sm font-semibold text-white mb-3">Lead Status Breakdown</h2>
          {(data.leads || []).map((l: any) => (
            <div key={l.status} className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 capitalize w-24">{l.status}</span>
              <div className="flex-1 mx-3 bg-[#1e2a45] rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${data.summary?.total_leads > 0 ? (parseInt(l.total) / data.summary.total_leads * 100) : 0}%` }} />
              </div>
              <span className="text-xs text-slate-300 w-8 text-right">{l.total}</span>
            </div>
          ))}
        </div>

        {/* Contract Status */}
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
          <h2 className="text-sm font-semibold text-white mb-3">Contract Status</h2>
          {(data.contracts || []).map((c: any) => (
            <div key={c.status} className="flex items-center justify-between mb-2 p-2 bg-[#0a0e1a] rounded">
              <span className="text-xs text-slate-300 capitalize">{c.status?.replace('_', ' ')}</span>
              <div className="flex gap-4 text-xs">
                <span className="text-slate-400">{c.count} contracts</span>
                <span className="text-emerald-400 font-semibold">${(parseFloat(c.value || 0) / 1000000).toFixed(1)}M</span>
              </div>
            </div>
          ))}
          {(data.contracts || []).length === 0 && <div className="text-slate-500 text-sm">No contract data</div>}
        </div>
      </div>
    </div>
  );
}
