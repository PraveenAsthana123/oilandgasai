'use client';
import { useEffect, useState } from 'react';

interface DashData {
  total_volume: number;
  commodity_count: number;
  top_state: string;
  measurement_points: number;
  by_commodity: { commodity: string; total_volume: number; records: number }[];
  empty: boolean;
}

export default function CustodyMeteringDashboard() {
  const [d, setD] = useState<DashData | null>(null);
  useEffect(() => { fetch('/api/midstream/custody-metering/dashboard').then(r => r.json()).then(setD); }, []);

  return (
    <div className="space-y-6 p-6">
      <div><h1 className="text-2xl font-bold text-white">Custody Metering — Dashboard</h1><p className="text-gray-400 text-sm mt-1">Volume by commodity and state, measurement points, reconciliation KPIs</p></div>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Volume (MMbbl)', value: d ? (d.total_volume / 1e6).toFixed(2) : '—', icon: '🛢️', unit: 'million barrels equiv.' },
          { label: 'Commodity Count', value: d ? d.commodity_count.toString() : '—', icon: '📦', unit: 'distinct commodities' },
          { label: 'Top State', value: d ? (d.top_state || '—') : '—', icon: '📍', unit: 'by volume' },
          { label: 'Measurement Points', value: d ? d.measurement_points.toLocaleString() : '—', icon: '📏', unit: 'custody records' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <div className="text-xl mb-2">{kpi.icon}</div>
            <div className="text-2xl font-bold text-amber-400">{kpi.value}</div>
            <div className="text-xs text-gray-400 mt-1">{kpi.unit}</div>
            <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {/* Volume by commodity bar chart */}
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          <h2 className="font-semibold text-white mb-3">Volume by Commodity</h2>
          {d && d.by_commodity?.length > 0 ? (
            <div className="space-y-2">
              {d.by_commodity.slice(0, 8).map(item => {
                const maxV = Math.max(...d.by_commodity.map(x => x.total_volume)) || 1;
                return (
                  <div key={item.commodity} className="flex items-center gap-2 text-xs">
                    <div className="text-gray-400 w-28 truncate">{item.commodity}</div>
                    <div className="flex-1 bg-[#1e2a45] rounded-full h-2">
                      <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${(item.total_volume / maxV) * 100}%` }}></div>
                    </div>
                    <div className="text-amber-400 w-20 text-right font-mono">{item.total_volume.toLocaleString()}</div>
                  </div>
                );
              })}
            </div>
          ) : <div className="text-gray-500 text-sm text-center py-8">Import data to view</div>}
        </div>
        {/* SVG bar chart: top commodities */}
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          <h2 className="font-semibold text-white mb-3">Volume Distribution (Top 8)</h2>
          {d && d.by_commodity?.length > 0 ? (
            <svg viewBox="0 0 240 100" className="w-full">
              {d.by_commodity.slice(0, 8).map((item, i) => {
                const maxV = Math.max(...d.by_commodity.map(x => x.total_volume)) || 1;
                const barH = (item.total_volume / maxV) * 80;
                const x = i * 30;
                return (
                  <g key={i}>
                    <rect x={x + 2} y={90 - barH} width="26" height={barH} fill="#f59e0b" rx="2" />
                    <text x={x + 15} y={98} textAnchor="middle" fill="#6b7280" fontSize="5">{item.commodity.slice(0, 5)}</text>
                  </g>
                );
              })}
            </svg>
          ) : <div className="text-gray-500 text-sm text-center py-8">No data</div>}
        </div>
      </div>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <h2 className="font-semibold text-white mb-3">Commodity Records Detail</h2>
        {d?.by_commodity?.length ? (
          <table className="w-full text-xs text-gray-300">
            <thead><tr className="border-b border-[#1e2a45]">{['Commodity','Total Volume','Records'].map(h => <th key={h} className="text-left py-2 pr-6 text-amber-400 font-semibold">{h}</th>)}</tr></thead>
            <tbody>{d.by_commodity.map((r, i) => (<tr key={i} className="border-b border-[#1e2a45]/30"><td className="py-1.5 pr-6 text-gray-300">{r.commodity}</td><td className="py-1.5 pr-6 text-amber-400 font-mono">{r.total_volume.toLocaleString()}</td><td className="py-1.5 pr-6 text-gray-400">{r.records.toLocaleString()}</td></tr>))}</tbody>
          </table>
        ) : <div className="text-gray-500 text-sm">No data. Import production-trends CSV first.</div>}
      </div>
    </div>
  );
}
