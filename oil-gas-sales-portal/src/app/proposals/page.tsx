'use client';
import { useState } from 'react';

const PAIN_POINTS = [
  'Unplanned equipment downtime',
  'High maintenance costs',
  'Safety incidents',
  'Production optimization',
  'Regulatory compliance',
  'Environmental monitoring',
  'Asset integrity concerns',
];

export default function ProposalsPage() {
  const [form, setForm] = useState({
    company: '',
    stream: 'upstream',
    pain_points: [] as string[],
    assets: '',
    budget: '',
  });
  const [proposal, setProposal] = useState('');
  const [status, setStatus] = useState<'idle' | 'generating' | 'done' | 'error' | 'needs_review'>('idle');
  const [isMock, setIsMock] = useState(false);

  const togglePainPoint = (pp: string) => {
    setForm(f => ({
      ...f,
      pain_points: f.pain_points.includes(pp) ? f.pain_points.filter(p => p !== pp) : [...f.pain_points, pp],
    }));
  };

  const generate = async () => {
    if (!form.company || form.pain_points.length === 0) return;
    setStatus('generating');
    setProposal('');
    try {
      const res = await fetch('/api/proposals/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, pain_points: form.pain_points.join(', ') }),
      });
      const data = await res.json();
      setProposal(data.proposal || 'No proposal generated');
      setIsMock(!!data._mock);
      setStatus(data.status === 'needs_review' ? 'needs_review' : 'done');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">AI Proposal Builder</h1>
        <p className="text-slate-400 text-sm mt-1">Generate professional O&G proposals with Ollama AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4 space-y-4">
          <h2 className="text-sm font-semibold text-white">Deal Context</h2>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Company Name *</label>
            <input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} className="w-full bg-[#0a0e1a] border border-[#1e2a45] text-white text-sm rounded px-3 py-2" placeholder="e.g. Suncor Energy" />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Stream Type</label>
            <select value={form.stream} onChange={e => setForm(f => ({ ...f, stream: e.target.value }))} className="w-full bg-[#0a0e1a] border border-[#1e2a45] text-white text-sm rounded px-3 py-2">
              <option value="upstream">Upstream — E&P, Reservoirs, Wells</option>
              <option value="midstream">Midstream — Pipelines, Processing, Storage</option>
              <option value="downstream">Downstream — Refining, Petrochemicals, LPG</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-2">Primary Pain Points *</label>
            <div className="space-y-1.5">
              {PAIN_POINTS.map(pp => (
                <label key={pp} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.pain_points.includes(pp)} onChange={() => togglePainPoint(pp)} className="accent-emerald-500" />
                  <span className="text-sm text-slate-300">{pp}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Current Assets</label>
            <input value={form.assets} onChange={e => setForm(f => ({ ...f, assets: e.target.value }))} className="w-full bg-[#0a0e1a] border border-[#1e2a45] text-white text-sm rounded px-3 py-2" placeholder="e.g. 150 wells, 300km pipeline" />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Budget Range (CAD)</label>
            <select value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} className="w-full bg-[#0a0e1a] border border-[#1e2a45] text-white text-sm rounded px-3 py-2">
              <option value="">Select range</option>
              <option value="$500K - $1M">$500K - $1M</option>
              <option value="$1M - $2M">$1M - $2M</option>
              <option value="$2M - $5M">$2M - $5M</option>
              <option value="$5M - $10M">$5M - $10M</option>
              <option value="$10M+">$10M+</option>
            </select>
          </div>

          <button
            onClick={generate}
            disabled={status === 'generating' || !form.company || form.pain_points.length === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
          >
            {status === 'generating' ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating with Ollama...</>
            ) : (
              <><span>🤖</span> Generate AI Proposal</>
            )}
          </button>
        </div>

        {/* Output Panel */}
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Generated Proposal</h2>
            {isMock && (
              <span className="text-xs bg-yellow-800 text-yellow-300 px-2 py-0.5 rounded">⚠️ AI unavailable — template</span>
            )}
            {status === 'done' && !isMock && (
              <span className="text-xs bg-emerald-800 text-emerald-300 px-2 py-0.5 rounded">✓ AI Generated</span>
            )}
          </div>

          {status === 'idle' && (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-2">
              <span className="text-3xl">📄</span>
              <span className="text-sm">Fill in the deal context and click Generate</span>
            </div>
          )}

          {status === 'generating' && (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-2">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Calling Ollama (llama3.2)...</span>
              <span className="text-xs text-slate-500">Generating tailored O&G proposal...</span>
            </div>
          )}

          {(status === 'done' || status === 'needs_review') && proposal && (
            <div className="bg-[#0a0e1a] rounded p-3 h-96 overflow-y-auto">
              <pre className="text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">{proposal}</pre>
            </div>
          )}

          {status === 'error' && (
            <div className="text-red-400 text-sm p-4">Failed to generate proposal. Check console for errors.</div>
          )}
        </div>
      </div>

      {/* Proposal Sections Reference */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
        <h2 className="text-sm font-semibold text-white mb-3">Standard Proposal Structure</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {['Executive Summary', 'Technical Solution', 'Commercial Terms', 'Implementation Plan', 'ROI Analysis'].map((s, i) => (
            <div key={s} className="bg-[#0a0e1a] rounded p-3 text-center">
              <div className="text-emerald-400 font-bold text-sm mb-1">Section {i + 1}</div>
              <div className="text-xs text-slate-300">{s}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
