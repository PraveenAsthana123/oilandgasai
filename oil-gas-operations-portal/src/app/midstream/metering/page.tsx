'use client';
import { useEffect, useState } from 'react';

export default function MeteringPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  useEffect(() => { fetch('/api/midstream/metering').then(r => r.json()).then(d => setData(d.metrics)); }, []);
  const d = data as Record<string, unknown> | null;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Custody Transfer Metering</h1>
        <p className="text-gray-400 text-sm mt-1">Flow computer calibration · Measurement uncertainty · Audit trails · GC analysis</p></div>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Metering Stations', value: d ? String(d.metering_stations) : '—', icon: '📏', unit: 'custody points' },
          { label: 'Measurement Uncertainty', value: d ? `±${d.uncertainty_pct}%` : '—', icon: '📊', unit: 'allowance' },
          { label: 'Unaccounted Gas', value: d ? `${d.unaccounted_gas_pct}%` : '—', icon: '💨', unit: 'vs metered' },
          { label: 'Calibration Due', value: d ? String(d.calibration_due) : '—', icon: '⚙️', unit: 'stations' },
          { label: 'Audit Trail', value: d ? `${d.audit_trail_completeness_pct}%` : '—', icon: '📋', unit: 'completeness' },
          { label: 'GC Units', value: d ? String(d.gc_units) : '—', icon: '🔬', unit: 'gas chromatographs' },
          { label: 'GC Anomalies YTD', value: d ? String(d.gc_anomalies_ytd) : '—', icon: '⚠️', unit: 'detected' },
          { label: 'Last Calibration', value: d ? String(d.last_calibration) : '—', icon: '📅', unit: 'date' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <div className="text-xl mb-2">{kpi.icon}</div>
            <div className="text-xl font-bold text-white">{kpi.value}</div>
            <div className="text-xs text-gray-400">{kpi.unit}</div>
            <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
