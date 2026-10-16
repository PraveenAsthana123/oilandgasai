'use client';
import { useEffect, useState } from 'react';

export default function CompressionPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  useEffect(() => { fetch('/api/midstream/compression').then(r => r.json()).then(d => setData(d.metrics)); }, []);
  const d = data as Record<string, unknown> | null;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Compression Management</h1>
        <p className="text-gray-400 text-sm mt-1">Compressor health · Vibration analysis · Efficiency optimization · Surge protection</p></div>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Compressors Online', value: d ? `${d.compressors_online}/${d.compressors_total}` : '—', icon: '⚙️' },
          { label: 'Avg Efficiency', value: d ? `${d.avg_efficiency_pct}%` : '—', icon: '📊' },
          { label: 'Availability', value: d ? `${d.availability_pct}%` : '—', icon: '✅' },
          { label: 'Surge Events YTD', value: d ? String(d.surge_events_ytd) : '—', icon: '⚡' },
          { label: 'Unplanned Downtime', value: d ? `${d.unplanned_downtime_hrs_ytd} hrs` : '—', icon: '⏱️' },
          { label: 'Power Consumption', value: d ? `${(d.avg_power_kw as number)?.toLocaleString()} kW` : '—', icon: '🔌' },
          { label: 'Vibration Alerts', value: d ? String(d.vibration_alerts) : '—', icon: '📳' },
          { label: 'Stations', value: d ? String(d.stations) : '—', icon: '🏭' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <div className="text-xl mb-2">{kpi.icon}</div>
            <div className="text-xl font-bold text-white">{kpi.value}</div>
            <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <h2 className="font-semibold text-white mb-3">Vibration Analysis — FFT Methods</h2>
        <div className="grid grid-cols-3 gap-3 text-xs">
          {[
            { method: 'FFT Spectrum', freq: '0-5000 Hz', fault: 'Imbalance at 1X, misalignment at 2X', icon: '📉' },
            { method: 'EEMD Decomposition', freq: 'Adaptive', fault: 'Non-stationary faults, transient events', icon: '🌊' },
            { method: 'Envelope Analysis', freq: 'High-freq demodulation', fault: 'Bearing defect frequencies (BPFO/BPFI)', icon: '📊' },
          ].map((v) => (
            <div key={v.method} className="border border-[#1e2a45] rounded-lg p-3">
              <div className="text-amber-400 font-medium mb-1">{v.icon} {v.method}</div>
              <div className="text-gray-400 mb-1">Range: {v.freq}</div>
              <div className="text-gray-500">{v.fault}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
