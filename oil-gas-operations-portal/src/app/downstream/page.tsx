'use client';
import { useEffect, useState } from 'react';

export default function DownstreamDashboard() {
  const [refining, setRefining] = useState<Record<string, unknown> | null>(null);
  const [env, setEnv] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch('/api/downstream/refining').then(r => r.json()).then(d => setRefining(d.metrics));
    fetch('/api/downstream/environmental').then(r => r.json()).then(d => setEnv(d.metrics));
  }, []);
  const rf = refining as Record<string, unknown> | null;
  const ev = env as Record<string, unknown> | null;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Downstream Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Refining · Process · Quality · Distribution · Trading · Environmental</p></div>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Crude Charge', value: rf ? `${(rf.crude_charge_bpd as number)?.toLocaleString()}` : '—', unit: 'bbl/d', icon: '🏭' },
          { label: 'Utilization', value: rf ? `${rf.utilization_pct}%` : '—', unit: 'of capacity', icon: '📊' },
          { label: 'Distillate Yield', value: rf ? `${rf.distillate_yield_pct}%` : '—', unit: 'of crude', icon: '⛽' },
          { label: 'Energy Intensity', value: rf ? `${(rf.energy_intensity_btu_bbl as number)?.toLocaleString()}` : '—', unit: 'BTU/bbl', icon: '🔥' },
          { label: 'EII Index', value: rf ? String(rf.eii) : '—', unit: 'energy index', icon: '⚡' },
          { label: 'Gasoline Yield', value: rf ? `${rf.gasoline_yield_pct}%` : '—', unit: 'of crude', icon: '🚗' },
          { label: 'CO₂ Today', value: ev ? `${(ev.co2e_tonnes_today as number)?.toLocaleString()}` : '—', unit: 'tonnes CO₂e', icon: '🌱' },
          { label: 'Spill Incidents', value: ev ? String(ev.spill_incidents_ytd) : '—', unit: 'YTD', icon: '⚠️' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <div className="text-xl mb-2">{kpi.icon}</div>
            <div className="text-2xl font-bold text-white">{kpi.value}</div>
            <div className="text-xs text-gray-400">{kpi.unit}</div>
            <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { href: '/downstream/refining', icon: '⚗️', label: 'Refinery Operations', desc: 'CDU/VDU, FCC, hydrocracker, reformer units' },
          { href: '/downstream/process', icon: '🔬', label: 'Process Optimization', desc: 'Crude blending, distillation, catalyst management' },
          { href: '/downstream/quality', icon: '✅', label: 'Product Quality', desc: 'Lab LIMS, spec prediction, contamination detection' },
          { href: '/downstream/distribution', icon: '🚛', label: 'Distribution & Logistics', desc: 'Tank farm, truck loading, pipeline scheduling' },
          { href: '/downstream/trading', icon: '📈', label: 'Commercial & Trading', desc: 'Price forecasting, cargo optimization, hedging' },
          { href: '/downstream/environmental', icon: '🌱', label: 'Environmental Compliance', desc: 'Emissions, flare management, wastewater, spills' },
        ].map((item) => (
          <a key={item.href} href={item.href} className="bg-[#0f1629] border border-[#1e2a45] hover:border-green-500/40 rounded-xl p-4 transition-colors group">
            <div className="text-2xl mb-2">{item.icon}</div>
            <div className="font-medium text-white group-hover:text-green-400 transition-colors text-sm">{item.label}</div>
            <div className="text-xs text-gray-500 mt-1">{item.desc}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
