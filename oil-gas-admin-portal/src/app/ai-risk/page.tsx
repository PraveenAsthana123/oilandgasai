'use client';
import { useEffect, useState } from 'react';

interface AIRisk {
  id: number;
  model_name: string;
  risk_type: string;
  description: string;
  severity: string;
  mitigation: string;
  status: string;
  created_at: string;
}

const SEV_COLORS: Record<string, string> = {
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-red-500/20 text-red-400',
  in_progress: 'bg-yellow-500/20 text-yellow-400',
  mitigated: 'bg-green-500/20 text-green-400',
};

export default function AIRiskPage() {
  const [risks, setRisks] = useState<AIRisk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ai-risk').then(r => r.json()).then(d => { setRisks(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">AI Risk Register</h1>
        <p className="text-gray-400 text-sm mt-1">Risks per AI model: bias, safety-critical failure modes, data quality, explainability gaps</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {['high','medium','low'].map(sev => {
          const count = risks.filter(r => r.severity === sev).length;
          const col = { high: 'text-red-400', medium: 'text-yellow-400', low: 'text-green-400' }[sev];
          return (
            <div key={sev} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4 text-center">
              <div className={`text-2xl font-bold ${col}`}>{count}</div>
              <div className="text-gray-400 text-xs mt-1 capitalize">{sev} Severity</div>
            </div>
          );
        })}
      </div>

      <div className="space-y-4">
        {risks.map(r => (
          <div key={r.id} className={`bg-[#0f1629] border rounded-xl p-5 ${SEV_COLORS[r.severity]?.includes('red') ? 'border-red-500/30' : r.severity === 'medium' ? 'border-yellow-500/20' : 'border-[#1e2a45]'}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-semibold">{r.model_name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded border ${SEV_COLORS[r.severity] ?? ''}`}>{r.severity}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-500/20 text-gray-400 capitalize">{r.risk_type.replace(/_/g, ' ')}</span>
                </div>
                <p className="text-gray-300 text-sm">{r.description}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded capitalize whitespace-nowrap ml-4 ${STATUS_COLORS[r.status] ?? ''}`}>{r.status.replace(/_/g, ' ')}</span>
            </div>
            <div className="bg-[#0a0e1a] rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Mitigation</div>
              <div className="text-gray-300 text-sm">{r.mitigation}</div>
            </div>
          </div>
        ))}
      </div>
      {risks.length === 0 && <div className="text-center py-12 text-gray-500">No AI risks — initialize DB first</div>}
    </div>
  );
}
