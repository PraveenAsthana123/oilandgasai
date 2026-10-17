'use client';
import { useEffect, useState } from 'react';

interface Project {
  id: number;
  name: string;
  type: string;
  status: string;
  budget_m: string;
  spent_m: string;
  start_date: string | null;
  end_date: string | null;
  pm: string | null;
  created_at: string;
}

interface Kpis {
  active: string;
  on_budget: string;
  on_schedule: string;
  total_budget: string;
}

const STATUS_COLORS: Record<string, string> = {
  planning: 'text-gray-400 bg-gray-400/10',
  active: 'text-green-400 bg-green-400/10',
  on_hold: 'text-amber-400 bg-amber-400/10',
  completed: 'text-blue-400 bg-blue-400/10',
  cancelled: 'text-red-400 bg-red-400/10',
};

export default function ProjectsPage() {
  const [rows, setRows] = useState<Project[]>([]);
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'Drilling Campaign', budget_m: '', start_date: '', end_date: '', pm: '' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects');
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
      await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setForm({ name: '', type: 'Drilling Campaign', budget_m: '', start_date: '', end_date: '', pm: '' });
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  const kv = (v: string | undefined) => (v ? v : '—');

  const spendPct = (spent: string, budget: string) => {
    const s = parseFloat(spent) || 0;
    const b = parseFloat(budget) || 0;
    return b > 0 ? Math.min(Math.round((s / b) * 100), 100) : 0;
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-gray-300 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-amber-400">🏗️ Project Portfolio</h1>
          <p className="text-gray-500 mt-1 text-sm">Drilling campaigns, pipeline projects, and facility upgrade programs.</p>
          {isMock && <div className="mt-2 text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded px-3 py-1 inline-block">⚠️ Mocked — DATABASE_URL not configured or DB unavailable</div>}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Active Projects', value: kv(kpis?.active), color: 'text-green-400' },
            { label: 'On Budget', value: kv(kpis?.on_budget), color: 'text-blue-400' },
            { label: 'On Schedule', value: kv(kpis?.on_schedule), color: 'text-amber-400' },
            { label: 'Total Budget ($M)', value: kpis?.total_budget ? `$${parseFloat(kpis.total_budget).toFixed(1)}M` : '—', color: 'text-purple-400' },
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
              <span className="text-sm font-semibold text-gray-200">All Projects</span>
              <span className="text-xs text-gray-500">{rows.length} records</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#1e2a45] text-gray-500">
                    <th className="text-left px-4 py-2">Project Name</th>
                    <th className="text-left px-4 py-2">Type</th>
                    <th className="text-left px-4 py-2">Status</th>
                    <th className="text-right px-4 py-2">Budget ($M)</th>
                    <th className="text-right px-4 py-2">Spent ($M)</th>
                    <th className="text-left px-4 py-2">PM</th>
                    <th className="text-left px-4 py-2">End Date</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-600">No projects yet</td></tr>
                  )}
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b border-[#1e2a45]/50 hover:bg-[#1e2a45]/30">
                      <td className="px-4 py-2 text-gray-200 max-w-[160px] truncate" title={r.name}>{r.name}</td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-0.5 rounded text-xs bg-amber-500/10 text-amber-400">{r.type}</span>
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${STATUS_COLORS[r.status] ?? 'text-gray-400 bg-gray-400/10'}`}>{r.status}</span>
                      </td>
                      <td className="px-4 py-2 text-right text-gray-300">{r.budget_m ? `$${parseFloat(r.budget_m).toFixed(1)}M` : '—'}</td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <div className="w-12 bg-[#1e2a45] rounded-full h-1">
                            <div className={`h-1 rounded-full ${spendPct(r.spent_m, r.budget_m) > 90 ? 'bg-red-500' : 'bg-amber-500'}`}
                              style={{ width: `${spendPct(r.spent_m, r.budget_m)}%` }} />
                          </div>
                          <span className="text-gray-400">{r.spent_m ? `$${parseFloat(r.spent_m).toFixed(1)}M` : '—'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-gray-500">{r.pm || '—'}</td>
                      <td className="px-4 py-2 text-gray-600">{r.end_date ? new Date(r.end_date).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <div className="text-sm font-semibold text-gray-200 mb-4">Create Project</div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Project Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Block 14 Infill Drilling Program" className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-amber-500/50">
                  <option>Drilling Campaign</option>
                  <option>Pipeline</option>
                  <option>Facility Upgrade</option>
                  <option>Compression</option>
                  <option>Exploration</option>
                  <option>FEED</option>
                  <option>Decommissioning</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Budget ($M)</label>
                <input type="number" value={form.budget_m} onChange={e => setForm(f => ({ ...f, budget_m: e.target.value }))}
                  placeholder="45.0" className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-500/50" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Start Date</label>
                  <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                    className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-amber-500/50" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">End Date</label>
                  <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                    className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-amber-500/50" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Project Manager</label>
                <input value={form.pm} onChange={e => setForm(f => ({ ...f, pm: e.target.value }))}
                  placeholder="R. Thompson" className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-500/50" />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold py-2 rounded text-xs transition-colors">
                {submitting ? 'Saving…' : 'Create Project'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
