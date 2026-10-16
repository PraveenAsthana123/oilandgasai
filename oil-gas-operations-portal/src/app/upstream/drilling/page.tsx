'use client';
import { useEffect, useState } from 'react';

export default function DrillingPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  useEffect(() => {
    fetch('/api/upstream/drilling').then(r => r.json()).then(d => setData(d.metrics));
  }, []);
  const d = data as Record<string, unknown> | null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Drilling Operations</h1>
        <p className="text-gray-400 text-sm mt-1">Well planning · ROP optimization · Stuck pipe prediction · Bit wear · Mud logging</p>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Active Wells', value: d ? String(d.active_wells) : '—', icon: '🔩', unit: 'drilling' },
          { label: 'Avg ROP', value: d ? `${d.avg_rop_mhr}` : '—', icon: '⚡', unit: 'm/hr' },
          { label: 'NPT', value: d ? `${d.npt_pct}%` : '—', icon: '⏱️', unit: 'non-productive' },
          { label: 'WOB', value: d ? `${d.wob_klbs} klbs` : '—', icon: '🏋️', unit: 'weight on bit' },
          { label: 'RPM', value: d ? String(d.rpm) : '—', icon: '🔄', unit: 'rotations/min' },
          { label: 'Wells Planned', value: d ? String(d.wells_planned) : '—', icon: '📋', unit: 'this year' },
          { label: 'Well Cost', value: d ? `$${d.avg_well_cost_m}M` : '—', icon: '💰', unit: 'avg per well' },
          { label: 'Stuck Pipe Risk', value: d ? String(d.stuck_pipe_risk) : '—', icon: '⚠️', unit: 'current risk' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <div className="text-xl mb-2">{kpi.icon}</div>
            <div className="text-2xl font-bold text-white">{kpi.value}</div>
            <div className="text-xs text-gray-400">{kpi.unit}</div>
            <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      {d && (d.rop_trend as number[])?.length > 0 && (
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          <h2 className="font-semibold text-white mb-3">ROP Trend (m/hr) — Last 7 Days</h2>
          <div className="flex items-end gap-2 h-24">
            {(d.rop_trend as number[]).map((v, i) => {
              const max = Math.max(...(d.rop_trend as number[]));
              const pct = max > 0 ? (v / max) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-xs text-amber-400">{v}</div>
                  <div className="w-full bg-amber-500 rounded-t" style={{ height: `${pct}%` }}></div>
                  <div className="text-xs text-gray-600">D{i + 1}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <h2 className="font-semibold text-white mb-3">AI Use Cases — Drilling</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { uc: 'ROP Optimization', tech: 'PPO RL Agent + XGBoost', value: '15-25% ROP improvement', status: 'deployed' },
            { uc: 'Stuck Pipe Prediction', tech: 'LSTM + Random Forest classifier', value: '$500K+ per avoided incident', status: 'deployed' },
            { uc: 'Bit Wear Detection', tech: 'YOLO v8 camera analysis', value: 'Optimal bit life utilization', status: 'active' },
            { uc: 'Wellbore Stability', tech: 'SVM + geomechanical surrogate', value: 'Prevent costly instability events', status: 'deployed' },
          ].map((uc) => (
            <div key={uc.uc} className="border border-[#1e2a45] rounded-lg p-3">
              <div className="flex items-start justify-between mb-1">
                <div className="text-sm font-medium text-white">{uc.uc}</div>
                <span className={`text-xs px-2 py-0.5 rounded ${uc.status === 'deployed' ? 'text-green-400 bg-green-500/10' : 'text-blue-400 bg-blue-500/10'}`}>{uc.status}</span>
              </div>
              <div className="text-xs text-amber-400/80 mb-1">{uc.tech}</div>
              <div className="text-xs text-gray-400">{uc.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
