'use client';
import { useEffect, useState } from 'react';

export default function WellIntegrityPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  useEffect(() => { fetch('/api/upstream/well-integrity').then(r => r.json()).then(d => setData(d.metrics)); }, []);
  const d = data as Record<string, unknown> | null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Well Integrity</h1>
        <p className="text-gray-400 text-sm mt-1">Barrier status · Corrosion monitoring · Cement evaluation · Casing inspection</p>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Wells', value: d ? String(d.total_wells) : '—', unit: 'in program', icon: '🔩', color: 'text-white' },
          { label: 'Barrier Class A', value: d ? String(d.barrier_a_wells) : '—', unit: 'fully compliant', icon: '✅', color: 'text-green-400' },
          { label: 'Barrier Class B', value: d ? String(d.barrier_b_wells) : '—', unit: 'minor issues', icon: '🟡', color: 'text-amber-400' },
          { label: 'Barrier Class C', value: d ? String(d.barrier_c_wells) : '—', unit: 'requires action', icon: '🔴', color: 'text-red-400' },
          { label: 'SCP Wells', value: d ? String(d.scp_wells) : '—', unit: 'sustained casing P', icon: '⚠️', color: 'text-red-400' },
          { label: 'Tests Passed YTD', value: d ? String(d.integrity_tests_passed_ytd) : '—', unit: 'this year', icon: '📋', color: 'text-green-400' },
          { label: 'Remediation Backlog', value: d ? String(d.remediation_backlog) : '—', unit: 'wells pending', icon: '🔧', color: 'text-amber-400' },
          { label: 'Corrosion Alerts', value: d ? String(d.corrosion_alerts) : '—', unit: 'active alerts', icon: '🔬', color: 'text-amber-400' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <div className="text-xl mb-2">{kpi.icon}</div>
            <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
            <div className="text-xs text-gray-400">{kpi.unit}</div>
            <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <h2 className="font-semibold text-white mb-3">Well Barrier Framework</h2>
        <div className="space-y-2 text-sm">
          {[
            { cls: 'A', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', desc: 'All primary and secondary barriers verified and functional. No intervention required.' },
            { cls: 'B', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', desc: 'One barrier element degraded or unverified. Monitor frequency increased, risk assessment required.' },
            { cls: 'C', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', desc: 'Multiple barriers compromised. Immediate intervention required or well suspended.' },
          ].map((b) => (
            <div key={b.cls} className={`flex items-start gap-3 p-3 rounded-lg border ${b.border} ${b.bg}`}>
              <span className={`font-bold text-lg ${b.color}`}>Class {b.cls}</span>
              <span className="text-gray-300 text-sm">{b.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
