'use client';
import { useEffect, useState } from 'react';

export default function GasProcessingPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  useEffect(() => { fetch('/api/midstream/gas-processing').then(r => r.json()).then(d => setData(d.metrics)); }, []);
  const d = data as Record<string, unknown> | null;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Gas Processing</h1>
        <p className="text-gray-400 text-sm mt-1">Dehydration · Acid gas removal · NGL fractionation · Mercury removal</p></div>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Feed Rate', value: d ? `${d.feed_rate_mmscfd} MMscf/d` : '—', icon: '💨' },
          { label: 'NGL Recovery', value: d ? `${d.ngl_recovery_pct}%` : '—', icon: '💎' },
          { label: 'Acid Gas Removal', value: d ? `${d.acid_gas_removal_pct}%` : '—', icon: '⚗️' },
          { label: 'Dehydration Dewpoint', value: d ? `${d.dehydration_dewpoint_c}°C` : '—', icon: '🌡️' },
          { label: 'Plant Utilization', value: d ? `${d.plant_utilization_pct}%` : '—', icon: '🏭' },
          { label: 'C3 Yield', value: d ? `${d.c3_yield_tpd} TPD` : '—', icon: '🔷' },
          { label: 'C4 Yield', value: d ? `${d.c4_yield_tpd} TPD` : '—', icon: '🔶' },
          { label: 'Hg Removal Eff.', value: d ? `${d.mercury_removal_efficiency}%` : '—', icon: '⚠️' },
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
