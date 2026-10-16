'use client';
import { useEffect, useState } from 'react';

interface AIModel {
  id: number;
  model_name: string;
  purpose: string;
  ai_type: string;
  version: string;
  accuracy: number;
  data_drift_pct: number;
  approval_status: string;
  owner: string;
  last_validated: string;
  risks?: { risk_type: string; severity: string }[];
}

const APPROVAL_COLORS: Record<string, string> = {
  approved: 'bg-green-500/20 text-green-400 border-green-500/30',
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  retired: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export default function AIGovernancePage() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AIModel | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetch('/api/ai-models').then(r => r.json()).then(d => { setModels(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  const analyzeModel = async (model: AIModel) => {
    setSelected(model);
    setAnalyzing(true);
    setAiAnalysis('');
    const prompt = `As an AI governance expert for oil & gas operations, analyze this AI model:
Model: ${model.model_name}
Purpose: ${model.purpose}
Type: ${model.ai_type}
Accuracy: ${model.accuracy}%
Data Drift: ${model.data_drift_pct}%
Status: ${model.approval_status}
Owner: ${model.owner}

Provide a brief governance assessment covering: (1) safety criticality, (2) key risks, (3) monitoring recommendations. Keep it concise (3-4 sentences).`;
    const res = await fetch('/api/ollama', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) });
    const data = await res.json();
    setAiAnalysis(data.response ?? data.error ?? 'No response');
    setAnalyzing(false);
  };

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>;

  const approved = models.filter(m => m.approval_status === 'approved').length;
  const pending = models.filter(m => m.approval_status === 'pending').length;
  const highDrift = models.filter(m => m.data_drift_pct > 5).length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">AI Model Governance</h1>
        <p className="text-gray-400 text-sm mt-1">Model registry, validation evidence, drift monitoring, deployment approval</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{models.length}</div>
          <div className="text-gray-400 text-xs mt-1">Total Models</div>
        </div>
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{approved}</div>
          <div className="text-gray-400 text-xs mt-1">Approved</div>
        </div>
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{pending}</div>
          <div className="text-gray-400 text-xs mt-1">Pending Review</div>
        </div>
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{highDrift}</div>
          <div className="text-gray-400 text-xs mt-1">High Data Drift (&gt;5%)</div>
        </div>
      </div>

      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden mb-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1e2a45]">
              {['Model Name', 'Purpose', 'AI Type', 'Version', 'Accuracy', 'Data Drift', 'Approval', 'Owner', 'Actions'].map(h => (
                <th key={h} className="text-left text-gray-400 text-xs font-medium px-4 py-3 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {models.map(m => (
              <tr key={m.id} className="border-b border-[#1e2a45] hover:bg-[#0a0e1a] transition-colors">
                <td className="px-4 py-3">
                  <div className="text-white text-sm font-medium">{m.model_name}</div>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs max-w-xs truncate" title={m.purpose}>{m.purpose}</td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">{m.ai_type}</span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-sm">{m.version}</td>
                <td className="px-4 py-3">
                  <div className={`text-sm font-medium ${m.accuracy >= 90 ? 'text-green-400' : m.accuracy >= 80 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {m.accuracy}%
                  </div>
                  <div className="w-16 h-1 bg-[#1e2a45] rounded mt-1">
                    <div className={`h-1 rounded ${m.accuracy >= 90 ? 'bg-green-400' : m.accuracy >= 80 ? 'bg-yellow-400' : 'bg-red-400'}`} style={{ width: `${m.accuracy}%` }} />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-sm font-medium ${m.data_drift_pct > 5 ? 'text-red-400' : m.data_drift_pct > 3 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {m.data_drift_pct}%
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded border capitalize ${APPROVAL_COLORS[m.approval_status] ?? ''}`}>
                    {m.approval_status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">{m.owner}</td>
                <td className="px-4 py-3">
                  <button onClick={() => analyzeModel(m)} className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-2 py-1 rounded transition-colors">
                    🤖 Analyze
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
          <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
            <span>🤖</span> Ollama AI Governance Analysis — {selected.model_name}
          </h3>
          {analyzing ? (
            <div className="text-yellow-400 text-sm animate-pulse">Calling Ollama llama3.2...</div>
          ) : (
            <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{aiAnalysis}</div>
          )}
        </div>
      )}
    </div>
  );
}
