'use client';
import { useEffect, useState } from 'react';

export default function PipelinePage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  useEffect(() => { fetch('/api/midstream/pipeline').then(r => r.json()).then(d => setData(d.metrics)); }, []);
  const d = data as Record<string, unknown> | null;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Pipeline Operations</h1>
        <p className="text-gray-400 text-sm mt-1">ILI analysis · Leak detection · Pigging operations · Route optimization</p></div>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Pipeline Length', value: d ? `${(d.total_length_km as number)?.toLocaleString()} km` : '—', icon: '〰️' },
          { label: 'Throughput', value: d ? `${d.throughput_mmscfd} MMscf/d` : '—', icon: '📊' },
          { label: 'Active Leaks', value: d ? String(d.active_leaks) : '—', icon: '🔴' },
          { label: 'ILI Coverage', value: d ? `${d.ili_coverage_pct}%` : '—', icon: '🔍' },
          { label: 'Inlet Pressure', value: d ? `${d.pressure_inlet_bar} bar` : '—', icon: '⬆️' },
          { label: 'Outlet Pressure', value: d ? `${d.pressure_outlet_bar} bar` : '—', icon: '⬇️' },
          { label: 'Corrosion Rate', value: d ? `${d.corrosion_rate_mmy} mm/yr` : '—', icon: '🔬' },
          { label: 'Utilization', value: d ? `${d.utilization_pct}%` : '—', icon: '📈' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <div className="text-xl mb-2">{kpi.icon}</div>
            <div className="text-xl font-bold text-white">{kpi.value}</div>
            <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <h2 className="font-semibold text-white mb-3">Pigging Schedule</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="border border-[#1e2a45] rounded-lg p-3">
            <div className="text-gray-400 text-xs mb-1">Last Pig Run</div>
            <div className="text-white">{d ? String(d.last_pig_run) : '—'}</div>
          </div>
          <div className="border border-[#1e2a45] rounded-lg p-3">
            <div className="text-gray-400 text-xs mb-1">Next Scheduled Pig</div>
            <div className="text-amber-400">{d ? String(d.next_pig_scheduled) : '—'}</div>
          </div>
        </div>
      </div>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <h2 className="font-semibold text-white mb-3">AI Use Cases — Pipeline</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { uc: 'Pipeline Leak Detection', tech: 'SPC + LSTM on SCADA flow/pressure', value: 'Early detection prevents environmental damage', status: 'deployed' },
            { uc: 'Corrosion Rate Prediction', tech: 'Gradient Boosting + soil/chemistry data', value: 'Targeted inspection, optimized maintenance budget', status: 'deployed' },
            { uc: 'ILI Defect Classification', tech: 'ResNet / EfficientNet on MFL signals', value: '60% reduction in unnecessary digs', status: 'deployed' },
            { uc: 'Pigging Schedule Optimization', tech: 'XGBoost + constraint optimizer', value: '15% throughput efficiency improvement', status: 'active' },
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
