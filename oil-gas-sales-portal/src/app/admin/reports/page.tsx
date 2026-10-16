'use client';
import { useEffect, useState } from 'react';

export default function AdminReportsPage() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch('/api/reports/sales').then(r => r.json()).then(setData);
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-white">Admin Reports</h1>
      <p className="text-slate-400 text-sm">System-wide usage and activity reports</p>
      {data && (
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-[#0f1629] border border-[#1e2a45] rounded p-3"><div className="text-xs text-slate-400">Total Leads</div><div className="text-xl font-bold text-white">{data.summary?.total_leads}</div></div>
          <div className="bg-[#0f1629] border border-[#1e2a45] rounded p-3"><div className="text-xs text-slate-400">Pipeline Value</div><div className="text-xl font-bold text-emerald-400">${((data.summary?.total_pipeline_value_cad || 0) / 1000000).toFixed(1)}M</div></div>
          <div className="bg-[#0f1629] border border-[#1e2a45] rounded p-3"><div className="text-xs text-slate-400">Conversion Rate</div><div className="text-xl font-bold text-blue-400">{data.summary?.conversion_rate}%</div></div>
          <div className="bg-[#0f1629] border border-[#1e2a45] rounded p-3"><div className="text-xs text-slate-400">Won Deals</div><div className="text-xl font-bold text-emerald-400">{data.summary?.won_deals}</div></div>
        </div>
      )}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4 text-slate-400 text-sm">
        Full admin reports pull from real DB aggregations. <a href="/reports" className="text-emerald-400 underline">View Sales Reports →</a>
      </div>
    </div>
  );
}
