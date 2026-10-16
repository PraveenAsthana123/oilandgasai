'use client';
import { useEffect, useState } from 'react';

export default function DistributionPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  useEffect(() => { fetch('/api/downstream/distribution').then(r => r.json()).then(d => setData(d.metrics)); }, []);
  const d = data as Record<string, unknown> | null;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Distribution & Logistics</h1>
        <p className="text-gray-400 text-sm mt-1">Tank farm management · Truck loading · Pipeline scheduling · Inventory</p></div>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Truck Loads Today', value: d ? String(d.truck_loads_today) : '—', icon: '🚛' },
          { label: 'Truck Utilization', value: d ? `${d.truck_utilization_pct}%` : '—', icon: '📊' },
          { label: 'On-time Delivery', value: d ? `${d.on_time_delivery_pct}%` : '—', icon: '✅' },
          { label: 'Tanks in Service', value: d ? String(d.tanks_in_service) : '—', icon: '🗄️' },
          { label: 'Demurrage MTD', value: d ? `$${(d.demurrage_cost_usd_mtd as number)?.toLocaleString()}` : '—', icon: '💰' },
          { label: 'Active Schedules', value: d ? String(d.pipeline_schedules_active) : '—', icon: '📋' },
          { label: 'Inventory Days', value: d ? String(d.inventory_days) : '—', icon: '📦' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <div className="text-xl mb-2">{kpi.icon}</div>
            <div className="text-xl font-bold text-white">{kpi.value}</div>
            <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
