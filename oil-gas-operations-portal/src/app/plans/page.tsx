'use client';
import { useEffect, useState } from 'react';

interface Plan {
  id: number;
  name: string;
  type: string;
  year: number;
  status: string;
  wells_planned: number;
  budget_m: string;
  approved_by: string | null;
  ai_summary: string | null;
  created_at: string;
}

interface Kpis {
  active: string;
  draft: string;
  approved: string;
  total_wells: string;
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'text-gray-400 bg-gray-400/10',
  under_review: 'text-amber-400 bg-amber-400/10',
  approved: 'text-green-400 bg-green-400/10',
  active: 'text-blue-400 bg-blue-400/10',
  archived: 'text-gray-600 bg-gray-600/10',
};

export default function PlansPage() {
  const [rows, setRows] = useState<Plan[]>([]);
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'Annual Well Plan', year: String(new Date().getFullYear()), wells_planned: '', budget_m: '', approved_by: '' });
  const [aiResult, setAiResult] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/plans');
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
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, year: parseInt(form.year) || new Date().getFullYear(), wells_planned: parseInt(form.wells_planned) || 0, ai_assist: aiAssist }),
      });
      const json = await res.json();
      if (json.data?.ai_summary) setAiResult(json.data.ai_summary);
      setForm({ name: '', type: 'Annual Well Plan', year: String(new Date().getFullYear()), wells_planned: '', budget_m: '', approved_by: '' });
      await load();
    } finally {
      setSubmitting(false);
      setAiLoading(false);
    }
  };

  const kv = (v: string | undefined) => (v ? v : '—');

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-gray-300 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-amber-400">📐 Strategic & Operational Plans</h1>
          <p className="text-gray-500 mt-1 text-sm">Annual well plans, production forecasts, and maintenance schedules.</p>
          {isMock && <div className="mt-2 text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded px-3 py-1 inline-block">⚠️ Mocked — DATABASE_URL not configured or DB unavailable</div>}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Active Plans', value: kv(kpis?.active), color: 'text-blue-400' },
            { label: 'Draft', value: kv(kpis?.draft), color: 'text-gray-400' },
            { label: 'Approved', value: kv(kpis?.approved), color: 'text-green-400' },
            { label: 'Total Wells Planned', value: kv(kpis?.total_wells), color: 'text-amber-400' },
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
            <div className="text-xs text-amber-400 font-semibold mb-2">🤖 AI-Generated Plan Summary</div>
            <p className="text-sm text-gray-300 leading-relaxed">{aiResult}</p>
            <button onClick={() => setAiResult(null)} className="mt-2 text-xs text-gray-500 hover:text-gray-300">Dismiss</button>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#1e2a45] flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-200">All Plans</span>
              <span className="text-xs text-gray-500">{rows.length} records</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#1e2a45] text-gray-500">
                    <th className="text-left px-4 py-2">Plan Name</th>
                    <th className="text-left px-4 py-2">Type</th>
                    <th className="text-right px-4 py-2">Year</th>
                    <th className="text-left px-4 py-2">Status</th>
                    <th className="text-right px-4 py-2">Wells</th>
                    <th className="text-right px-4 py-2">Budget ($M)</th>
                    <th className="text-left px-4 py-2">Approved By</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-600">No plans yet</td></tr>
                  )}
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b border-[#1e2a45]/50 hover:bg-[#1e2a45]/30">
                      <td className="px-4 py-2 text-gray-200 max-w-[160px] truncate" title={r.name}>
                        {r.name}
                        {r.ai_summary && <span className="ml-1 text-amber-400/60" title={r.ai_summary}>🤖</span>}
                      </td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-0.5 rounded text-xs bg-amber-500/10 text-amber-400">{r.type}</span>
                      </td>
                      <td className="px-4 py-2 text-right text-gray-400">{r.year}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${STATUS_COLORS[r.status] ?? 'text-gray-400 bg-gray-400/10'}`}>{r.status}</span>
                      </td>
                      <td className="px-4 py-2 text-right text-gray-300">{r.wells_planned}</td>
                      <td className="px-4 py-2 text-right text-gray-300">{r.budget_m ? `$${parseFloat(r.budget_m).toFixed(1)}M` : '—'}</td>
                      <td className="px-4 py-2 text-gray-500">{r.approved_by || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <div className="text-sm font-semibold text-gray-200 mb-4">Create Plan</div>
            <form className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Plan Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="FY2027 Annual Well Plan" className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-amber-500/50">
                  <option>Annual Well Plan</option>
                  <option>Production Forecast</option>
                  <option>Maintenance Schedule</option>
                  <option>CAPEX Plan</option>
                  <option>Field Development Plan</option>
                  <option>Decommissioning Plan</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Year</label>
                  <input type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                    className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-amber-500/50" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Wells Planned</label>
                  <input type="number" value={form.wells_planned} onChange={e => setForm(f => ({ ...f, wells_planned: e.target.value }))}
                    placeholder="12" className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-500/50" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Budget ($M)</label>
                <input type="number" value={form.budget_m} onChange={e => setForm(f => ({ ...f, budget_m: e.target.value }))}
                  placeholder="120.0" className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Approved By</label>
                <input value={form.approved_by} onChange={e => setForm(f => ({ ...f, approved_by: e.target.value }))}
                  placeholder="VP Operations" className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-500/50" />
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
