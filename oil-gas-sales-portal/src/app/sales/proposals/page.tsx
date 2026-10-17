'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function SalesProposalsPage() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({ account_name: '', stream: 'upstream', value_cad: '', notes: '' });
  const [aiDraft, setAiDraft] = useState('');

  useEffect(() => {
    fetch('/api/proposals').then(r => r.json()).then(d => {
      setProposals(Array.isArray(d) ? d : d?.proposals || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const generateProposal = async () => {
    setGenerating(true);
    setAiDraft('');
    try {
      const r = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      setAiDraft(d.content || d.draft || JSON.stringify(d, null, 2));
      setProposals(prev => [d, ...prev]);
    } catch {
      setAiDraft('Failed to generate proposal. Check Ollama connection.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href="/sales" className="hover:text-emerald-400">Sales</Link>
            <span>/</span>
            <span className="text-gray-300">Proposals</span>
          </div>
          <h1 className="text-2xl font-bold text-white">AI Proposal Builder</h1>
          <p className="text-gray-400 mt-1">Generate O&G proposals using local Ollama AI</p>
        </div>
        <Link href="/proposals" className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded hover:bg-emerald-500/30 transition">
          Full Proposals →
        </Link>
      </div>

      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Generate New Proposal</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Account Name</label>
            <input
              value={form.account_name}
              onChange={e => setForm(f => ({ ...f, account_name: e.target.value }))}
              placeholder="Suncor Energy Inc."
              className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Stream</label>
            <select
              value={form.stream}
              onChange={e => setForm(f => ({ ...f, stream: e.target.value }))}
              className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded px-3 py-2 text-gray-300 text-sm"
            >
              <option value="upstream">Upstream</option>
              <option value="midstream">Midstream</option>
              <option value="downstream">Downstream</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Estimated Value (CAD)</label>
            <input
              value={form.value_cad}
              onChange={e => setForm(f => ({ ...f, value_cad: e.target.value }))}
              placeholder="5000000"
              type="number"
              className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Notes / Context</label>
            <input
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Pipeline integrity monitoring project..."
              className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none"
            />
          </div>
        </div>
        <button
          onClick={generateProposal}
          disabled={generating || !form.account_name}
          className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-bold px-5 py-2 rounded text-sm transition"
        >
          {generating ? 'Generating via Ollama...' : 'Generate Proposal'}
        </button>

        {aiDraft && (
          <div className="mt-4">
            <div className="text-xs text-emerald-400 mb-2">AI-Generated Draft</div>
            <pre className="bg-[#0a0e1a] border border-[#1e2a45] rounded p-4 text-xs text-gray-300 whitespace-pre-wrap max-h-64 overflow-y-auto">
              {aiDraft}
            </pre>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-emerald-400">Loading proposals...</div>
      ) : proposals.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-white mb-3">Recent Proposals ({proposals.length})</h2>
          <div className="space-y-2">
            {proposals.slice(0, 5).map((p: any) => (
              <div key={p.id} className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white">{p.account_name || p.title || 'Proposal'}</div>
                  <div className="text-xs text-gray-400">{p.stream || ''} • {p.created_at ? new Date(p.created_at).toLocaleDateString() : ''}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded ${p.status === 'accepted' ? 'bg-emerald-800 text-emerald-300' : 'bg-slate-700 text-slate-300'}`}>
                  {p.status || 'draft'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
