'use client';
import { useEffect, useState } from 'react';

export default function ReservoirPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  useEffect(() => { fetch('/api/upstream/reservoir').then(r => r.json()).then(d => setData(d.metrics)); }, []);
  const d = data as Record<string, unknown> | null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Reservoir Management</h1>
        <p className="text-gray-400 text-sm mt-1">Decline curve · Material balance · Well test analysis · EOR optimization</p>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Reservoir Pressure', value: d ? `${(d.reservoir_pressure_psi as number)?.toLocaleString()}` : '—', unit: 'psi', icon: '🔵' },
          { label: 'Recovery Factor', value: d ? `${d.recovery_factor_pct}%` : '—', unit: 'of OOIP', icon: '📊' },
          { label: '2P Reserves', value: d ? `${d.proved_reserves_mmboe}` : '—', unit: 'MMBOE', icon: '💎' },
          { label: 'OOIP', value: d ? `${d.ooip_mmboe}` : '—', unit: 'MMBOE', icon: '🛢️' },
          { label: 'Decline Rate', value: d ? `${d.decline_rate_pct_yr}%` : '—', unit: 'per year', icon: '📉' },
          { label: 'Initial Pressure', value: d ? `${(d.initial_pressure_psi as number)?.toLocaleString()}` : '—', unit: 'psi', icon: '⬆️' },
          { label: 'Material Balance F', value: d ? String(d.material_balance_f) : '—', unit: 'Havlena-Odeh', icon: '⚖️' },
          { label: 'History Match', value: d ? String(d.history_match_quality) : '—', unit: 'quality', icon: '✅' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <div className="text-xl mb-2">{kpi.icon}</div>
            <div className="text-2xl font-bold text-white">{kpi.value}</div>
            <div className="text-xs text-gray-400">{kpi.unit}</div>
            <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Decline curve equation */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <h2 className="font-semibold text-white mb-3">Arps Decline Curve Models</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { type: 'Hyperbolic', eq: 'q(t) = qᵢ/(1+b·Dᵢ·t)^(1/b)', b: '0 < b < 1', desc: 'Most common for oil wells, transient flow periods' },
            { type: 'Exponential', eq: 'q(t) = qᵢ · exp(-Dᵢ·t)', b: 'b = 0', desc: 'Boundary dominated, steady-state depletion' },
            { type: 'Harmonic', eq: 'q(t) = qᵢ/(1+Dᵢ·t)', b: 'b = 1', desc: 'Fracture-dominated flow, gravity drainage' },
          ].map((m) => (
            <div key={m.type} className="border border-[#1e2a45] rounded-lg p-3">
              <div className="text-sm font-medium text-amber-400 mb-1">{m.type}</div>
              <div className="font-mono text-xs text-blue-400 mb-2 bg-[#0a0e1a] px-2 py-1 rounded">{m.eq}</div>
              <div className="text-xs text-gray-500 mb-1">b parameter: {m.b}</div>
              <div className="text-xs text-gray-400">{m.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pressure history */}
      {d && (d.pressure_history as number[])?.length > 0 && (
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          <h2 className="font-semibold text-white mb-3">Reservoir Pressure Depletion History (psi)</h2>
          <div className="flex items-end gap-3 h-28">
            {(d.pressure_history as number[]).map((v, i) => {
              const max = Math.max(...(d.pressure_history as number[]));
              const pct = max > 0 ? (v / max) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-xs text-blue-400">{(v / 1000).toFixed(1)}k</div>
                  <div className="w-full bg-blue-500 rounded-t" style={{ height: `${pct}%` }}></div>
                  <div className="text-xs text-gray-600">Y{i}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
