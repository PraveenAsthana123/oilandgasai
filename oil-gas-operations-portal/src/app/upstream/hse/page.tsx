'use client';
import { useEffect, useState } from 'react';

export default function HSEPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  useEffect(() => { fetch('/api/upstream/hse').then(r => r.json()).then(d => setData(d.metrics)); }, []);
  const d = data as Record<string, unknown> | null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">HSE Management</h1>
        <p className="text-gray-400 text-sm mt-1">PPE compliance · H2S monitoring · Incident tracking · SIMOPS safety</p>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'TRIR', value: d ? String(d.trir) : '—', unit: 'total recordable', icon: '📊', color: 'text-amber-400' },
          { label: 'LTIF', value: d ? String(d.ltif) : '—', unit: 'lost time injury', icon: '🏥', color: 'text-green-400' },
          { label: 'PPE Compliance', value: d ? `${d.ppe_compliance_pct}%` : '—', unit: 'CV enforced', icon: '⛑️', color: 'text-green-400' },
          { label: 'Open Incidents', value: d ? String(d.open_incidents) : '—', unit: 'under investigation', icon: '🔍', color: 'text-amber-400' },
          { label: 'Near Miss YTD', value: d ? String(d.near_miss_ytd) : '—', unit: 'reported', icon: '⚠️', color: 'text-blue-400' },
          { label: 'H2S Drills YTD', value: d ? String(d.h2s_drills_ytd) : '—', unit: 'completed', icon: '🚨', color: 'text-white' },
          { label: 'Active Permits', value: d ? String(d.permits_active) : '—', unit: 'PTW active', icon: '📋', color: 'text-white' },
          { label: 'Safety Observations', value: d ? String(d.safety_observations_ytd) : '—', unit: 'YTD', icon: '👁️', color: 'text-blue-400' },
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
        <h2 className="font-semibold text-white mb-3">AI Safety Use Cases</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { uc: 'Worker PPE Detection', tech: 'YOLO v8 real-time video', value: 'Zero-tolerance PPE enforcement 24/7', status: 'deployed' },
            { uc: 'H2S Gas Leak Detection', tech: 'IoT multi-sensor fusion + ML', value: 'Personnel safety, evacuation zoning', status: 'deployed' },
            { uc: 'SIMOPS Risk Assessment', tech: 'NLP + RAG procedure lookup', value: 'Conflict detection across simultaneous ops', status: 'active' },
            { uc: 'Environmental Incident Prediction', tech: 'Gradient Boosting risk model', value: 'Pre-emptive incident prevention', status: 'active' },
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
