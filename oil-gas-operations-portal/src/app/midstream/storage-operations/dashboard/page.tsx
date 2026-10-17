'use client';
import { useEffect, useState } from 'react';

interface DashData {
  total_volume: number;
  commodity_types: number;
  states_count: number;
  latest_date: string;
  volume_by_state: { state: string; volume: number }[];
  monthly_trend: { label: string; volume: number }[];
  commodity_split: { commodity: string; volume: number }[];
  alerts: { severity: string; message: string; ts: string }[];
}

export default function StorageOperationsDashboard() {
  const [d, setD] = useState<DashData | null>(null);
  useEffect(() => { fetch('/api/midstream/storage-operations/dashboard').then(r => r.json()).then(setD); }, []);

  return (
    <div className="space-y-6 p-6">
      <div><h1 className="text-2xl font-bold text-white">Storage Operations — Dashboard</h1><p className="text-gray-400 text-sm mt-1">Production volumes: total stored, commodity types, state breakdown</p></div>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Volume Stored', value: d ? `${(d.total_volume / 1e9).toFixed(1)}B` : '—', icon: '🏭', unit: 'units' },
          { label: 'Commodity Types', value: d ? d.commodity_types.toString() : '—', icon: '⛽', unit: 'types' },
          { label: 'States', value: d ? d.states_count.toString() : '—', icon: '🗺️', unit: 'reporting' },
          { label: 'Latest Data', value: d ? d.latest_date : '—', icon: '📅', unit: 'date' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <div className="text-xl mb-2">{kpi.icon}</div>
            <div className="text-2xl font-bold text-amber-400">{kpi.value}</div>
            <div className="text-xs text-gray-400 mt-1">{kpi.unit}</div>
            <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {/* Volume by state bar */}
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          <h2 className="font-semibold text-white mb-3">Volume by State</h2>
          {d && d.volume_by_state?.length > 0 ? (
            <div className="space-y-2">
              {d.volume_by_state.slice(0, 8).map((s) => {
                const maxV = Math.max(...d.volume_by_state.map(x => x.volume)) || 1;
                return (
                  <div key={s.state} className="flex items-center gap-2 text-xs">
                    <div className="text-gray-400 w-16 truncate">{s.state}</div>
                    <div className="flex-1 bg-[#1e2a45] rounded-full h-2"><div className="bg-amber-500 h-2 rounded-full" style={{ width: `${(s.volume / maxV) * 100}%` }}></div></div>
                    <div className="text-amber-400 w-12 text-right">{(s.volume / 1e6).toFixed(0)}M</div>
                  </div>
                );
              })}
            </div>
          ) : <div className="text-gray-500 text-sm text-center py-8">Import data to view</div>}
        </div>
        {/* Monthly trend */}
        <div className="col-span-2 bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          <h2 className="font-semibold text-white mb-3">Monthly Volume Trend</h2>
          {d && d.monthly_trend?.length > 0 ? (
            <svg viewBox="0 0 380 120" className="w-full">
              {d.monthly_trend.map((pt, i) => {
                const maxV = Math.max(...d.monthly_trend.map(p => p.volume)) || 1;
                const x = (i / (d.monthly_trend.length - 1)) * 360 + 10;
                const y = 110 - (pt.volume / maxV) * 100;
                return (
                  <g key={i}>
                    {i > 0 && <line x1={(((i-1)/(d.monthly_trend.length-1))*360)+10} y1={110-(d.monthly_trend[i-1].volume/maxV)*100} x2={x} y2={y} stroke="#f59e0b" strokeWidth="1.5" />}
                    <circle cx={x} cy={y} r="2.5" fill="#f59e0b" />
                  </g>
                );
              })}
            </svg>
          ) : <div className="text-gray-500 text-sm text-center py-8">No data</div>}
        </div>
      </div>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <h2 className="font-semibold text-white mb-3">Alert Feed</h2>
        {d?.alerts?.length ? d.alerts.map((a, i) => (<div key={i} className="flex gap-3 text-sm border-b border-[#1e2a45]/30 pb-2"><span>{a.severity==='critical'?'🔴':'⚠️'}</span><div><div className="text-gray-300">{a.message}</div><div className="text-xs text-gray-600">{a.ts}</div></div></div>)) : <div className="text-gray-500 text-sm">No alerts. Import data to see alerts.</div>}
      </div>
    </div>
  );
}
