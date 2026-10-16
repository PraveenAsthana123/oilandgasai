'use client';
import { useEffect, useState } from 'react';

export default function ProductionPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  useEffect(() => { fetch('/api/upstream/production').then(r => r.json()).then(d => setData(d.metrics)); }, []);
  const d = data as Record<string, unknown> | null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Production Engineering</h1>
        <p className="text-gray-400 text-sm mt-1">Artificial lift · Flow assurance · Production allocation · Well performance</p>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Gross Production', value: d ? `${(d.gross_production_boed as number)?.toLocaleString()}` : '—', unit: 'BOE/d', icon: '⛽' },
          { label: 'Oil Rate', value: d ? `${(d.oil_bopd as number)?.toLocaleString()}` : '—', unit: 'BOPD', icon: '🛢️' },
          { label: 'Gas Rate', value: d ? `${d.gas_mmscfd}` : '—', unit: 'MMscf/d', icon: '💨' },
          { label: 'Water Rate', value: d ? `${(d.water_bwpd as number)?.toLocaleString()}` : '—', unit: 'BWPD', icon: '💧' },
          { label: 'Water Cut', value: d ? `${d.water_cut_pct}%` : '—', unit: 'of liquid', icon: '📊' },
          { label: 'GOR', value: d ? `${(d.gor_scf_bbl as number)?.toLocaleString()}` : '—', unit: 'scf/bbl', icon: '⚗️' },
          { label: 'Uptime', value: d ? `${d.uptime_pct}%` : '—', unit: 'availability', icon: '✅' },
          { label: 'Artificial Lift', value: d ? `${d.artificial_lift_wells}` : '—', unit: 'wells on AL', icon: '🔧' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <div className="text-xl mb-2">{kpi.icon}</div>
            <div className="text-2xl font-bold text-white">{kpi.value}</div>
            <div className="text-xs text-gray-400">{kpi.unit}</div>
            <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      {d && (d.production_trend as number[])?.length > 0 && (
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          <h2 className="font-semibold text-white mb-3">Production Trend — BOE/d (Last 6 Periods)</h2>
          <div className="flex items-end gap-3 h-24">
            {(d.production_trend as number[]).map((v, i) => {
              const max = Math.max(...(d.production_trend as number[]));
              const min = Math.min(...(d.production_trend as number[]));
              const pct = max > min ? ((v - min) / (max - min)) * 80 + 20 : 80;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-xs text-amber-400">{(v / 1000).toFixed(1)}k</div>
                  <div className="w-full bg-amber-500/60 rounded-t" style={{ height: `${pct}%` }}></div>
                  <div className="text-xs text-gray-600">W{i + 1}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
