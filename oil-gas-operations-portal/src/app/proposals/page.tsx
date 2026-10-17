'use client';
import { useEffect, useState } from 'react';

interface Proposal {
  id: number;
  title: string;
  type: string;
  description: string;
  value_m: string;
  engineer: string;
  status: string;
  ai_summary: string | null;
  created_at: string;
}

interface Kpis {
  total: string;
  under_review: string;
  approved: string;
  total_value: string;
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'text-gray-400 bg-gray-400/10',
  under_review: 'text-amber-400 bg-amber-400/10',
  approved: 'text-green-400 bg-green-400/10',
  rejected: 'text-red-400 bg-red-400/10',
};

export default function ProposalsPage() {
  const [rows, setRows] = useState<Proposal[]>([]);
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'Well', description: '', value_m: '', engineer: '' });
  const [aiResult, setAiResult] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/proposals');
      const json = await res.json();
      setRows(json.data ?? []);
      setKpis(json.kpis ?? null);
      setIsMock(!!json._mock);
    } catch {
      setIsMock(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent, aiAssist = false) => {
    e.preventDefault();
    if (aiAssist) setAiLoading(true); else setSubmitting(true);
    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, ai_assist: aiAssist }),
      });
      const json = await res.json();
      if (json.data?.ai_summary) setAiResult(json.data.ai_summary);
      setForm({ title: '', type: 'Well', description: '', value_m: '', engineer: '' });
      await load();
    } finally {
      setSubmitting(false);
      setAiLoading(false);
    }
  };

  const kv = (v: string | undefined) => (v && v !== '0' ? v : '—');

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-gray-300 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-amber-400">📋 Proposal Management</h1>
          <p className="text-gray-500 mt-1 text-sm">Well proposals, field development plans, and CAPEX proposals for O&amp;G operations.</p>
          {isMock && <div className="mt-2 text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded px-3 py-1 inline-block">⚠️ Mocked — DATABASE_URL not configured or DB unavailable</div>}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Proposals', value: kv(kpis?.total), color: 'text-amber-400' },
            { label: 'Under Review', value: kv(kpis?.under_review), color: 'text-yellow-400' },
            { label: 'Approved', value: kv(kpis?.approved), color: 'text-green-400' },
            { label: 'Total Value ($M)', value: kpis?.total_value ? `$${parseFloat(kpis.total_value).toFixed(1)}M` : '—', color: 'text-blue-400' },
          ].map((k) => (
            <div key={k.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">{k.label}</div>
              <div className={`text-2xl font-bold ${k.color}`}>{loading ? '…' : k.value}</div>
            </div>
          ))}
        </div>

        {/* AI Summary Result */}
        {aiResult && (
          <div className="bg-[#0f1629] border border-amber-500/30 rounded-xl p-4">
            <div className="text-xs text-amber-400 font-semibold mb-2">🤖 AI-Generated Executive Summary</div>
            <p className="text-sm text-gray-300 leading-relaxed">{aiResult}</p>
            <button onClick={() => setAiResult(null)} className="mt-2 text-xs text-gray-500 hover:text-gray-300">Dismiss</button>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Table */}
          <div className="xl:col-span-2 bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#1e2a45] flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-200">All Proposals</span>
              <span className="text-xs text-gray-500">{rows.length} records</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#1e2a45] text-gray-500">
                    <th className="text-left px-4 py-2">Title</th>
                    <th className="text-left px-4 py-2">Type</th>
                    <th className="text-left px-4 py-2">Status</th>
                    <th className="text-right px-4 py-2">Value ($M)</th>
                    <th className="text-left px-4 py-2">Engineer</th>
                    <th className="text-left px-4 py-2">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-600">No proposals yet</td></tr>
                  )}
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b border-[#1e2a45]/50 hover:bg-[#1e2a45]/30">
                      <td className="px-4 py-2 text-gray-200 max-w-[180px] truncate" title={r.title}>{r.title}</td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-0.5 rounded text-xs bg-amber-500/10 text-amber-400">{r.type}</span>
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${STATUS_COLORS[r.status] ?? 'text-gray-400 bg-gray-400/10'}`}>{r.status}</span>
                      </td>
                      <td className="px-4 py-2 text-right text-gray-300">{r.value_m ? `$${parseFloat(r.value_m).toFixed(1)}M` : '—'}</td>
                      <td className="px-4 py-2 text-gray-400">{r.engineer || '—'}</td>
                      <td className="px-4 py-2 text-gray-600">{new Date(r.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Form */}
          <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <div className="text-sm font-semibold text-gray-200 mb-4">Create Proposal</div>
            <form className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Title</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Well Development Proposal — Block 14" className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-amber-500/50">
                  <option>Well</option>
                  <option>Field Dev</option>
                  <option>CAPEX</option>
                  <option>Pipeline</option>
                  <option>Facility</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3} placeholder="Scope and objectives…" className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-500/50 resize-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Value ($M)</label>
                <input type="number" value={form.value_m} onChange={e => setForm(f => ({ ...f, value_m: e.target.value }))}
                  placeholder="12.5" className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Engineer</label>
                <input value={form.engineer} onChange={e => setForm(f => ({ ...f, engineer: e.target.value }))}
                  placeholder="J. Williams" className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-500/50" />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={submitting} onClick={e => handleSubmit(e, false)}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold py-2 rounded text-xs transition-colors">
                  {submitting ? 'Saving…' : 'Create'}
                </button>
                <button type="button" disabled={aiLoading} onClick={e => handleSubmit(e as unknown as React.FormEvent, true)}
                  className="flex-1 bg-[#1e2a45] hover:bg-[#2a3a5a] disabled:opacity-50 text-amber-400 font-semibold py-2 rounded text-xs border border-amber-500/30 transition-colors">
                  {aiLoading ? '🤖 Generating…' : '🤖 AI Summary'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
