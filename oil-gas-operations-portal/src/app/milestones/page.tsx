'use client';
import { useEffect, useState } from 'react';

interface Milestone {
  id: number;
  name: string;
  project: string;
  due_date: string | null;
  status: string;
  owner: string | null;
  pct_complete: number;
  created_at: string;
}

interface Kpis {
  total: string;
  on_track: string;
  at_risk: string;
  completed: string;
}

const STATUS_COLORS: Record<string, string> = {
  'on-track': 'text-green-400 bg-green-400/10',
  'at-risk': 'text-amber-400 bg-amber-400/10',
  delayed: 'text-red-400 bg-red-400/10',
  complete: 'text-blue-400 bg-blue-400/10',
};

export default function MilestonesPage() {
  const [rows, setRows] = useState<Milestone[]>([]);
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', project: '', due_date: '', owner: '', pct_complete: '0' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/milestones');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch('/api/milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, pct_complete: parseInt(form.pct_complete) || 0 }),
      });
      setForm({ name: '', project: '', due_date: '', owner: '', pct_complete: '0' });
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  const kv = (v: string | undefined) => (v ? v : '—');

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-gray-300 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-amber-400">🎯 Milestone Tracking</h1>
          <p className="text-gray-500 mt-1 text-sm">Project milestones for wells, pipelines, and facility projects.</p>
          {isMock && <div className="mt-2 text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded px-3 py-1 inline-block">⚠️ Mocked — DATABASE_URL not configured or DB unavailable</div>}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Milestones', value: kv(kpis?.total), color: 'text-gray-300' },
            { label: 'On Track', value: kv(kpis?.on_track), color: 'text-green-400' },
            { label: 'At Risk', value: kv(kpis?.at_risk), color: 'text-amber-400' },
            { label: 'Completed', value: kv(kpis?.completed), color: 'text-blue-400' },
          ].map((k) => (
            <div key={k.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">{k.label}</div>
              <div className={`text-2xl font-bold ${k.color}`}>{loading ? '…' : k.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#1e2a45] flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-200">Milestones</span>
              <span className="text-xs text-gray-500">{rows.length} records</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#1e2a45] text-gray-500">
                    <th className="text-left px-4 py-2">Milestone</th>
                    <th className="text-left px-4 py-2">Project</th>
                    <th className="text-left px-4 py-2">Due Date</th>
                    <th className="text-left px-4 py-2">Status</th>
                    <th className="text-left px-4 py-2">Owner</th>
                    <th className="text-right px-4 py-2">% Done</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-600">No milestones yet</td></tr>
                  )}
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b border-[#1e2a45]/50 hover:bg-[#1e2a45]/30">
                      <td className="px-4 py-2 text-gray-200 max-w-[160px] truncate" title={r.name}>{r.name}</td>
                      <td className="px-4 py-2 text-gray-400 max-w-[120px] truncate">{r.project}</td>
                      <td className="px-4 py-2 text-gray-500">{r.due_date ? new Date(r.due_date).toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${STATUS_COLORS[r.status] ?? 'text-gray-400 bg-gray-400/10'}`}>{r.status}</span>
                      </td>
                      <td className="px-4 py-2 text-gray-500">{r.owner || '—'}</td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 bg-[#1e2a45] rounded-full h-1.5">
                            <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${Math.min(r.pct_complete, 100)}%` }} />
                          </div>
                          <span className="text-gray-400 w-8 text-right">{r.pct_complete}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <div className="text-sm font-semibold text-gray-200 mb-4">Create Milestone</div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Milestone Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Spud Date — Well A-12" className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Project</label>
                <input value={form.project} onChange={e => setForm(f => ({ ...f, project: e.target.value }))}
                  placeholder="Block 14 Drilling Campaign" className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Due Date</label>
                <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                  className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Owner</label>
                <input value={form.owner} onChange={e => setForm(f => ({ ...f, owner: e.target.value }))}
                  placeholder="S. Martinez" className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">% Complete</label>
                <input type="number" min="0" max="100" value={form.pct_complete} onChange={e => setForm(f => ({ ...f, pct_complete: e.target.value }))}
                  className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-amber-500/50" />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold py-2 rounded text-xs transition-colors">
                {submitting ? 'Saving…' : 'Create Milestone'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
