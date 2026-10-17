'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-slate-700 text-slate-300',
  contacted: 'bg-blue-800 text-blue-300',
  qualified: 'bg-emerald-800 text-emerald-300',
  proposal: 'bg-yellow-800 text-yellow-300',
  lost: 'bg-red-900 text-red-300',
};

export default function SalesLeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ stream: '', status: '' });

  const fetchLeads = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter.stream) params.set('stream', filter.stream);
    if (filter.status) params.set('status', filter.status);
    const data = await fetch(`/api/leads?${params}`).then(r => r.json()).catch(() => []);
    setLeads(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchLeads(); }, [filter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href="/sales" className="hover:text-emerald-400">Sales</Link>
            <span>/</span>
            <span className="text-gray-300">Leads</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Leads</h1>
          <p className="text-gray-400 mt-1">Sales-qualified view of all inbound and outbound leads</p>
        </div>
        <Link href="/leads" className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded hover:bg-emerald-500/30 transition">
          Full Leads Page →
        </Link>
      </div>

      <div className="flex gap-3">
        <select
          value={filter.stream}
          onChange={e => setFilter(f => ({ ...f, stream: e.target.value }))}
          className="bg-[#0f1629] border border-[#1e2a45] text-gray-300 text-sm rounded px-3 py-1.5"
        >
          <option value="">All Streams</option>
          <option value="upstream">Upstream</option>
          <option value="midstream">Midstream</option>
          <option value="downstream">Downstream</option>
        </select>
        <select
          value={filter.status}
          onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
          className="bg-[#0f1629] border border-[#1e2a45] text-gray-300 text-sm rounded px-3 py-1.5"
        >
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="proposal">Proposal</option>
          <option value="lost">Lost</option>
        </select>
      </div>

      {loading ? (
        <div className="text-emerald-400">Loading leads...</div>
      ) : leads.length === 0 ? (
        <div className="text-gray-500 text-sm">No leads found.</div>
      ) : (
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e2a45] text-gray-400 text-xs">
                <th className="px-4 py-3 text-left">Company</th>
                <th className="px-4 py-3 text-left">Contact</th>
                <th className="px-4 py-3 text-left">Stream</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Score</th>
                <th className="px-4 py-3 text-left">Source</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l: any) => (
                <tr key={l.id} className="border-b border-[#1e2a45]/50 hover:bg-[#1e2a45]/30">
                  <td className="px-4 py-3 text-white font-medium">{l.company}</td>
                  <td className="px-4 py-3 text-gray-300">{l.contact_name}</td>
                  <td className="px-4 py-3 text-gray-400 capitalize">{l.stream}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${STATUS_COLORS[l.status] || 'bg-gray-700 text-gray-300'}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-700 rounded-full h-1.5">
                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${l.score || 0}%` }} />
                      </div>
                      <span className="text-xs text-gray-400">{l.score || 0}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 capitalize">{l.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
