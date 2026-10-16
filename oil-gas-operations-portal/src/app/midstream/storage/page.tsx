'use client';
import { useEffect, useState } from 'react';

export default function StoragePage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  useEffect(() => { fetch('/api/midstream/storage').then(r => r.json()).then(d => setData(d.metrics)); }, []);
  const d = data as Record<string, unknown> | null;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Storage Operations</h1>
        <p className="text-gray-400 text-sm mt-1">Tank level optimization · Inventory management · Tank inspection · LNG stratification</p></div>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Tanks', value: d ? `${d.tanks_operational}/${d.tanks_total}` : '—', icon: '🗄️', unit: 'operational' },
          { label: 'Inventory', value: d ? `${(d.current_inventory_m3 as number)?.toLocaleString()} m³` : '—', icon: '📦', unit: 'current' },
          { label: 'Utilization', value: d ? `${d.utilization_pct}%` : '—', icon: '📊', unit: 'of capacity' },
          { label: 'LNG Boiloff', value: d ? `${d.lng_boiloff_rate_pct}%/day` : '—', icon: '❄️', unit: 'boiloff rate' },
          { label: 'Total Capacity', value: d ? `${(d.total_capacity_m3 as number)?.toLocaleString()} m³` : '—', icon: '🏭', unit: 'nameplate' },
          { label: 'Stratification Risk', value: d ? String(d.stratification_risk) : '—', icon: '🌡️', unit: 'level' },
          { label: 'Last Inspection', value: d ? String(d.last_inspection) : '—', icon: '🔍', unit: 'date' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <div className="text-xl mb-2">{kpi.icon}</div>
            <div className="text-xl font-bold text-white">{kpi.value}</div>
            <div className="text-xs text-gray-400">{kpi.unit}</div>
            <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
