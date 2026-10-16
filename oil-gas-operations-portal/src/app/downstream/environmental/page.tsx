'use client';
import { useEffect, useState } from 'react';

export default function EnvironmentalPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  useEffect(() => { fetch('/api/downstream/environmental').then(r => r.json()).then(d => setData(d.metrics)); }, []);
  const d = data as Record<string, unknown> | null;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Environmental Compliance</h1>
        <p className="text-gray-400 text-sm mt-1">Emissions monitoring · Flare management · Wastewater · Spill response</p></div>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'CO₂e Today', value: d ? `${(d.co2e_tonnes_today as number)?.toLocaleString()} t` : '—', icon: '🌡️', color: 'text-amber-400' },
          { label: 'Flare Volume MTD', value: d ? `${d.flare_volume_mmscf_mtd} MMscf` : '—', icon: '🔥', color: 'text-amber-400' },
          { label: 'Wastewater Compliance', value: d ? `${d.wastewater_compliance_pct}%` : '—', icon: '💧', color: 'text-green-400' },
          { label: 'Spill Incidents YTD', value: d ? String(d.spill_incidents_ytd) : '—', icon: '⚠️', color: d?.spill_incidents_ytd === 0 ? 'text-green-400' : 'text-red-400' },
          { label: 'Permit Utilization', value: d ? `${d.permit_utilization_pct}%` : '—', icon: '📋', color: 'text-white' },
          { label: 'Emissions Alerts', value: d ? String(d.emissions_alerts_active) : '—', icon: '🔔', color: d?.emissions_alerts_active === 0 ? 'text-green-400' : 'text-amber-400' },
          { label: 'Air Quality Index', value: d ? String(d.air_quality_index) : '—', icon: '🌬️', color: 'text-green-400' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <div className="text-xl mb-2">{kpi.icon}</div>
            <div className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</div>
            <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <h2 className="font-semibold text-white mb-3">Flare Monitoring — CV Image Segmentation</h2>
        <div className="text-sm text-gray-300 space-y-2">
          <p>Thermal cameras mounted at flare stack base capture continuous video. DeepLab v3 semantic segmentation identifies the flare plume boundary in each frame.</p>
          <div className="grid grid-cols-3 gap-3 mt-3">
            {[
              { metric: 'Camera Coverage', value: '4 stacks monitored 24/7', icon: '📷' },
              { metric: 'Combustion Efficiency', value: '>98.5% target (EPA Method 22)', icon: '🔥' },
              { metric: 'Volume Estimation', value: 'CEMS + plume area correlation', icon: '📊' },
            ].map((m) => (
              <div key={m.metric} className="border border-[#1e2a45] rounded-lg p-3 text-xs">
                <div className="text-xl mb-1">{m.icon}</div>
                <div className="text-amber-400 font-medium">{m.metric}</div>
                <div className="text-gray-400 mt-1">{m.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
