'use client';
import { useEffect, useState } from 'react';

const streamColors: Record<string, string> = { upstream: 'text-blue-400', midstream: 'text-yellow-400', downstream: 'text-purple-400' };
const statusColors: Record<string, string> = { new: 'bg-slate-700 text-slate-300', contacted: 'bg-blue-800 text-blue-300', qualified: 'bg-emerald-800 text-emerald-300', proposal: 'bg-yellow-800 text-yellow-300', lost: 'bg-red-900 text-red-300' };

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ stream: '', status: '' });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ company: '', contact_name: '', email: '', phone: '', stream: 'upstream', source: 'website', score: 50, status: 'new', owner: '' });

  const fetch_ = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter.stream) params.set('stream', filter.stream);
    if (filter.status) params.set('status', filter.status);
    const data = await fetch(`/api/leads?${params}`).then(r => r.json());
    setLeads(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetch_(); }, [filter]);

  const submit = async () => {
    await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setShowForm(false);
    fetch_();
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Lead Management</h1>
          <p className="text-slate-400 text-sm mt-1">Oil & Gas prospect tracking — {leads.length} leads</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + New Lead
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select value={filter.stream} onChange={e => setFilter(f => ({ ...f, stream: e.target.value }))} className="bg-[#0f1629] border border-[#1e2a45] text-white text-sm rounded px-3 py-1.5">
          <option value="">All Streams</option>
          <option value="upstream">Upstream</option>
          <option value="midstream">Midstream</option>
          <option value="downstream">Downstream</option>
        </select>
        <select value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))} className="bg-[#0f1629] border border-[#1e2a45] text-white text-sm rounded px-3 py-1.5">
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="proposal">Proposal</option>
        </select>
      </div>

      {/* New Lead Form */}
      {showForm && (
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4 space-y-3">
          <h2 className="text-sm font-semibold text-white">New Lead</h2>
          <div className="grid grid-cols-2 gap-3">
            {[['company', 'Company'], ['contact_name', 'Contact Name'], ['email', 'Email'], ['phone', 'Phone'], ['owner', 'Owner']].map(([k, label]) => (
              <div key={k}>
                <label className="block text-xs text-slate-400 mb-1">{label}</label>
                <input value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} className="w-full bg-[#0a0e1a] border border-[#1e2a45] text-white text-sm rounded px-3 py-1.5" />
              </div>
            ))}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Stream</label>
              <select value={form.stream} onChange={e => setForm(f => ({ ...f, stream: e.target.value }))} className="w-full bg-[#0a0e1a] border border-[#1e2a45] text-white text-sm rounded px-3 py-1.5">
                <option value="upstream">Upstream</option>
                <option value="midstream">Midstream</option>
                <option value="downstream">Downstream</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Source</label>
              <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} className="w-full bg-[#0a0e1a] border border-[#1e2a45] text-white text-sm rounded px-3 py-1.5">
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="conference">Conference</option>
                <option value="cold_call">Cold Call</option>
                <option value="linkedin">LinkedIn</option>
                <option value="event">Event</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Lead Score (0-100)</label>
              <input type="number" min="0" max="100" value={form.score} onChange={e => setForm(f => ({ ...f, score: parseInt(e.target.value) }))} className="w-full bg-[#0a0e1a] border border-[#1e2a45] text-white text-sm rounded px-3 py-1.5" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={submit} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded text-sm">Save Lead</button>
            <button onClick={() => setShowForm(false)} className="border border-[#1e2a45] text-slate-300 px-4 py-1.5 rounded text-sm hover:bg-[#1e2a45]">Cancel</button>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? <div className="text-slate-400 text-sm">Loading leads...</div> : (
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 text-xs border-b border-[#1e2a45] bg-[#0a0e1a]">
                <th className="text-left px-4 py-3">Company</th>
                <th className="text-left px-4 py-3">Contact</th>
                <th className="text-left px-4 py-3">Stream</th>
                <th className="text-left px-4 py-3">Source</th>
                <th className="text-left px-4 py-3">Score</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Owner</th>
                <th className="text-left px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l: any) => (
                <tr key={l.id} className="border-b border-[#1e2a45]/40 hover:bg-[#1e2a45]/20 transition-colors">
                  <td className="px-4 py-3 font-medium text-white">{l.company}</td>
                  <td className="px-4 py-3 text-slate-300">
                    <div>{l.contact_name}</div>
                    <div className="text-xs text-slate-500">{l.email}</div>
                  </td>
                  <td className="px-4 py-3 capitalize"><span className={streamColors[l.stream]}>{l.stream}</span></td>
                  <td className="px-4 py-3 text-slate-400 capitalize">{l.source?.replace('_', ' ')}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-[#1e2a45] rounded-full h-1.5">
                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${l.score}%` }} />
                      </div>
                      <span className="text-emerald-400 font-medium">{l.score}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${statusColors[l.status] || 'bg-slate-700 text-slate-300'}`}>{l.status}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{l.owner}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{new Date(l.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr><td colSpan={8} className="text-center py-8 text-slate-500">No leads found. <a href="/api/init" className="text-emerald-400 underline">Initialize database</a></td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
