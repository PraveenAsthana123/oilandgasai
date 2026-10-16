'use client';
import { useEffect, useState } from 'react';

export default function ExplorationPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  useEffect(() => {
    fetch('/api/upstream/exploration').then(r => r.json()).then(d => setData(d.metrics));
  }, []);

  const d = data as Record<string, unknown> | null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Seismic & Exploration</h1>
        <p className="text-gray-400 text-sm mt-1">Seismic acquisition · Interpretation · Prospect ranking · Resource estimation</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Active Prospects', value: d ? String(d.active_prospects) : '—', icon: '🎯' },
          { label: 'Wells Planned', value: d ? String(d.wells_planned_yr) : '—', icon: '⚙️' },
          { label: 'Success Rate', value: d ? `${d.prospect_success_rate_pct}%` : '—', icon: '✅' },
          { label: 'Risked Resources', value: d ? `${d.risked_resources_mmboe} MMBOE` : '—', icon: '💎' },
          { label: 'Seismic Coverage', value: d ? `${d.seismic_survey_km2} km²` : '—', icon: '📡' },
          { label: 'Acquisition Progress', value: d ? `${d.acquisition_progress_pct}%` : '—', icon: '📊' },
          { label: 'Mapped Horizons', value: d ? String(d.interpreted_horizons) : '—', icon: '🗺️' },
          { label: 'Mapped Faults', value: d ? String(d.mapped_faults) : '—', icon: '🔍' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <div className="text-xl mb-2">{kpi.icon}</div>
            <div className="text-2xl font-bold text-white">{kpi.value}</div>
            <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <h2 className="font-semibold text-white mb-3">AI Use Cases — Exploration</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { uc: 'Seismic Interpretation', tech: 'U-Net CNN image segmentation', value: '40% faster interpretation', status: 'deployed' },
            { uc: 'Formation Evaluation', tech: 'Random Forest on well logs', value: '30% faster petrophysics', status: 'deployed' },
            { uc: 'Noise-free Seismic Processing', tech: 'DnCNN denoising network', value: 'Better S/N ratio, improved imaging', status: 'deployed' },
            { uc: 'Prospect Ranking', tech: 'Multi-attribute ML scoring', value: 'Objective ranking, portfolio optimization', status: 'active' },
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

      {d && (d.prospect_list as string[])?.length > 0 && (
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          <h2 className="font-semibold text-white mb-3">Prospect Portfolio</h2>
          {(d.prospect_list as string[]).map((p, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-[#1e2a45]/50 last:border-0">
              <span className="text-amber-400 text-sm font-mono">#{i + 1}</span>
              <span className="text-sm text-gray-300">{p}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
