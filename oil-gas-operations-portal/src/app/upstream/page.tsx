'use client';
import { useEffect, useState } from 'react';

export default function UpstreamDashboard() {
  const [production, setProd] = useState<Record<string, unknown> | null>(null);
  const [drilling, setDrilling] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch('/api/upstream/production').then(r => r.json()).then(d => setProd(d.metrics));
    fetch('/api/upstream/drilling').then(r => r.json()).then(d => setDrilling(d.metrics));
  }, []);

  const p = production as Record<string, unknown> | null;
  const dr = drilling as Record<string, unknown> | null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Upstream Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Exploration · Drilling · Reservoir · Production · Well Integrity · HSE</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Gross Production', value: p ? `${(p.gross_production_boed as number)?.toLocaleString()}` : '—', unit: 'BOE/d', icon: '⛽', color: 'amber' },
          { label: 'Oil Rate', value: p ? `${(p.oil_bopd as number)?.toLocaleString()}` : '—', unit: 'BOPD', icon: '🛢️', color: 'amber' },
          { label: 'Gas Rate', value: p ? String(p.gas_mmscfd) : '—', unit: 'MMscf/d', icon: '💨', color: 'blue' },
          { label: 'Water Cut', value: p ? `${p.water_cut_pct}` : '—', unit: '%', icon: '💧', color: 'blue' },
          { label: 'Active Wells', value: p ? String(p.active_wells) : '—', unit: 'producing', icon: '🔩', color: 'green' },
          { label: 'Uptime', value: p ? `${p.uptime_pct}` : '—', unit: '%', icon: '✅', color: 'green' },
          { label: 'Avg ROP', value: dr ? String(dr.avg_rop_mhr) : '—', unit: 'm/hr', icon: '⚙️', color: 'purple' },
          { label: 'Wells Drilling', value: dr ? String(dr.wells_drilling) : '—', unit: 'active', icon: '🔭', color: 'purple' },
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
          { href: '/upstream/exploration', icon: '🔭', label: 'Seismic & Exploration', desc: 'Prospect ranking, seismic acquisition, resource estimation' },
          { href: '/upstream/drilling', icon: '⚙️', label: 'Drilling Operations', desc: 'ROP optimization, stuck pipe prediction, bit wear detection' },
          { href: '/upstream/reservoir', icon: '🧪', label: 'Reservoir Management', desc: 'Decline curve, material balance, EOR optimization' },
          { href: '/upstream/production', icon: '📊', label: 'Production Engineering', desc: 'Artificial lift, flow assurance, production allocation' },
          { href: '/upstream/well-integrity', icon: '🔩', label: 'Well Integrity', desc: 'Barrier status, corrosion, cement evaluation, casing' },
          { href: '/upstream/hse', icon: '⛑️', label: 'HSE Management', desc: 'PPE compliance, H2S monitoring, incident tracking, SIMOPS' },
        ].map((item) => (
          <a key={item.href} href={item.href} className="bg-[#0f1629] border border-[#1e2a45] hover:border-amber-500/40 rounded-xl p-4 transition-colors group">
            <div className="text-2xl mb-2">{item.icon}</div>
            <div className="font-medium text-white group-hover:text-amber-400 transition-colors text-sm">{item.label}</div>
            <div className="text-xs text-gray-500 mt-1">{item.desc}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
