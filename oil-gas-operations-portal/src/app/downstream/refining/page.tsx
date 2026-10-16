'use client';
import { useEffect, useState } from 'react';

export default function RefiningPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  useEffect(() => { fetch('/api/downstream/refining').then(r => r.json()).then(d => setData(d.metrics)); }, []);
  const d = data as Record<string, unknown> | null;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Refinery Operations</h1>
        <p className="text-gray-400 text-sm mt-1">CDU/VDU · FCC · Hydrocracker · Reformer · Isomerization · Alkylation</p></div>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Crude Charge', value: d ? `${(d.crude_charge_bpd as number)?.toLocaleString()}` : '—', unit: 'bbl/d', icon: '🏭' },
          { label: 'Utilization', value: d ? `${d.utilization_pct}%` : '—', unit: 'of nameplate', icon: '📊' },
          { label: 'Distillate Yield', value: d ? `${d.distillate_yield_pct}%` : '—', unit: 'wt% of crude', icon: '⛽' },
          { label: 'EII Index', value: d ? String(d.eii) : '—', unit: 'energy intensity', icon: '⚡' },
          { label: 'Gasoline Yield', value: d ? `${d.gasoline_yield_pct}%` : '—', unit: 'wt%', icon: '🚗' },
          { label: 'Fuel Oil Yield', value: d ? `${d.fuel_oil_yield_pct}%` : '—', unit: 'wt%', icon: '⚓' },
          { label: 'Energy Intensity', value: d ? `${(d.energy_intensity_btu_bbl as number)?.toLocaleString()}` : '—', unit: 'BTU/bbl', icon: '🔥' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <div className="text-xl mb-2">{kpi.icon}</div>
            <div className="text-xl font-bold text-white">{kpi.value}</div>
            <div className="text-xs text-gray-400">{kpi.unit}</div>
            <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>
      {d && (d.units as string[])?.length > 0 && (
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          <h2 className="font-semibold text-white mb-3">Processing Units</h2>
          <div className="flex flex-wrap gap-2">
            {(d.units as string[]).map((u, i) => (
              <span key={i} className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-lg">{u} ✅ Online</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
