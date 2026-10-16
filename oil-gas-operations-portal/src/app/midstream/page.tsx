'use client';
import { useEffect, useState } from 'react';

export default function MidstreamDashboard() {
  const [pipeline, setPipeline] = useState<Record<string, unknown> | null>(null);
  const [compression, setCompression] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch('/api/midstream/pipeline').then(r => r.json()).then(d => setPipeline(d.metrics));
    fetch('/api/midstream/compression').then(r => r.json()).then(d => setCompression(d.metrics));
  }, []);

  const pl = pipeline as Record<string, unknown> | null;
  const cp = compression as Record<string, unknown> | null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Midstream Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Pipeline · Compression · Gas Processing · Storage · SCADA · Metering</p>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Pipeline Throughput', value: pl ? `${pl.throughput_mmscfd}` : '—', unit: 'MMscf/d', icon: '〰️' },
          { label: 'Utilization', value: pl ? `${pl.utilization_pct}%` : '—', unit: 'pipeline', icon: '📊' },
          { label: 'Active Leaks', value: pl ? String(pl.active_leaks) : '—', unit: 'detected', icon: '🔴' },
          { label: 'Compression Eff.', value: cp ? `${cp.avg_efficiency_pct}%` : '—', unit: 'avg efficiency', icon: '🔄' },
          { label: 'Compressors Online', value: cp ? `${cp.compressors_online}/${cp.compressors_total}` : '—', unit: 'units', icon: '⚙️' },
          { label: 'Availability', value: cp ? `${cp.availability_pct}%` : '—', unit: 'compression', icon: '✅' },
          { label: 'Corrosion Rate', value: pl ? `${pl.corrosion_rate_mmy}` : '—', unit: 'mm/year', icon: '🔬' },
          { label: 'ILI Coverage', value: pl ? `${pl.ili_coverage_pct}%` : '—', unit: 'inspected', icon: '🔍' },
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
          { href: '/midstream/pipeline', icon: '〰️', label: 'Pipeline Operations', desc: 'ILI, leak detection, pigging, route optimization' },
          { href: '/midstream/compression', icon: '🔄', label: 'Compression Management', desc: 'Compressor health, vibration, surge protection' },
          { href: '/midstream/gas-processing', icon: '💨', label: 'Gas Processing', desc: 'Dehydration, acid gas removal, NGL fractionation' },
          { href: '/midstream/storage', icon: '🗄️', label: 'Storage Operations', desc: 'Tank level optimization, LNG, inventory management' },
          { href: '/midstream/scada', icon: '🖥️', label: 'SCADA & Control', desc: 'Alarm management, anomaly detection, cybersecurity' },
          { href: '/midstream/metering', icon: '📏', label: 'Custody Transfer Metering', desc: 'Flow computer calibration, measurement uncertainty' },
        ].map((item) => (
          <a key={item.href} href={item.href} className="bg-[#0f1629] border border-[#1e2a45] hover:border-blue-500/40 rounded-xl p-4 transition-colors group">
            <div className="text-2xl mb-2">{item.icon}</div>
            <div className="font-medium text-white group-hover:text-blue-400 transition-colors text-sm">{item.label}</div>
            <div className="text-xs text-gray-500 mt-1">{item.desc}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
