'use client';
import { useEffect, useState } from 'react';

interface DashData {
  total_volume_mmcf: number;
  states_covered: number;
  process_types: number;
  latest_year: number;
  monthly_trend: { label: string; value: number }[];
  process_split: { process_name: string; total_value: number }[];
  top_states: { area_name: string; total_value: number }[];
  alerts: { severity: string; message: string; ts: string }[];
}

export default function GasProcessingDashboard() {
  const [d, setD] = useState<DashData | null>(null);

  useEffect(() => {
    fetch('/api/midstream/gas-processing/dashboard').then(r => r.json()).then(setD);
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Gas Processing — Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Natural gas demand: volume, states, process types, monthly trends</p>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Volume', value: d ? `${(d.total_volume_mmcf / 1e6).toFixed(1)}B MMcf` : '—', icon: '🔵', unit: 'MMcf aggregate' },
          { label: 'States Covered', value: d ? d.states_covered.toString() : '—', icon: '🗺️', unit: 'areas' },
          { label: 'Process Types', value: d ? d.process_types.toString() : '—', icon: '⚙️', unit: 'types' },
          { label: 'Latest Year', value: d ? d.latest_year.toString() : '—', icon: '📅', unit: 'data year' },
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
        {/* Monthly trend line */}
        <div className="col-span-2 bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          <h2 className="font-semibold text-white mb-3">Monthly Volume Trend (MMcf)</h2>
          {d && d.monthly_trend?.length > 0 ? (
            <svg viewBox="0 0 400 120" className="w-full">
              {d.monthly_trend.map((pt, i) => {
                const maxV = Math.max(...d.monthly_trend.map(p => p.value)) || 1;
                const x = (i / (d.monthly_trend.length - 1)) * 380 + 10;
                const y = 110 - (pt.value / maxV) * 100;
                return (
                  <g key={i}>
                    {i > 0 && (
                      <line
                        x1={(((i - 1) / (d.monthly_trend.length - 1)) * 380) + 10}
                        y1={110 - (d.monthly_trend[i - 1].value / maxV) * 100}
                        x2={x} y2={y} stroke="#f59e0b" strokeWidth="1.5"
                      />
                    )}
                    <circle cx={x} cy={y} r="2.5" fill="#f59e0b" />
                  </g>
                );
              })}
            </svg>
          ) : <div className="text-gray-500 text-sm text-center py-8">Import data to view</div>}
        </div>
        {/* Process split pie */}
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          <h2 className="font-semibold text-white mb-3">Process Split</h2>
          {d && d.process_split?.length > 0 ? (
            <div className="space-y-2">
              {d.process_split.slice(0, 6).map((p, i) => {
                const colors = ['#f59e0b','#3b82f6','#22c55e','#ef4444','#8b5cf6','#ec4899'];
                const maxV = Math.max(...d.process_split.map(x => x.total_value)) || 1;
                return (
                  <div key={p.process_name} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: colors[i % colors.length] }}></div>
                    <div className="text-gray-400 truncate flex-1">{p.process_name}</div>
                    <div style={{ color: colors[i % colors.length] }}>{((p.total_value / maxV) * 100).toFixed(0)}%</div>
                  </div>
                );
              })}
            </div>
          ) : <div className="text-gray-500 text-sm text-center py-8">No data</div>}
        </div>
      </div>
      {/* Top states */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <h2 className="font-semibold text-white mb-3">Top States by Consumption (MMcf)</h2>
        {d && d.top_states?.length > 0 ? (
          <div className="grid grid-cols-5 gap-3">
            {d.top_states.map((s) => (
              <div key={s.area_name} className="border border-[#1e2a45] rounded-lg p-3 text-center">
                <div className="text-amber-400 font-bold text-sm">{(s.total_value / 1000).toFixed(0)}K</div>
                <div className="text-xs text-gray-400 mt-1 truncate">{s.area_name}</div>
              </div>
            ))}
          </div>
        ) : <div className="text-gray-500 text-sm">Import data to view top states</div>}
      </div>
    </div>
  );
}
