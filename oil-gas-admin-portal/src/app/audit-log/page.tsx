'use client';
import { useEffect, useState } from 'react';

interface AuditRow {
  id: number;
  user_id: string;
  action: string;
  module: string;
  record_type: string;
  record_id: string;
  details: Record<string, unknown>;
  ip: string;
  ts: string;
}

const ACTION_COLORS: Record<string, string> = {
  LOGIN: 'bg-green-500/20 text-green-400',
  LOGOUT: 'bg-gray-500/20 text-gray-400',
  VIEW: 'bg-blue-500/20 text-blue-400',
  CREATE: 'bg-purple-500/20 text-purple-400',
  UPDATE: 'bg-yellow-500/20 text-yellow-400',
  DELETE: 'bg-red-500/20 text-red-400',
  APPROVE: 'bg-green-500/20 text-green-400',
  EXPORT: 'bg-cyan-500/20 text-cyan-400',
};

export default function AuditLogPage() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [module, setModule] = useState('');

  const load = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (module) params.set('module', module);
    fetch(`/api/audit-log?${params}`).then(r => r.json()).then(d => { setRows(Array.isArray(d) ? d : []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Full Audit Trail</h1>
          <p className="text-gray-400 text-sm mt-1">Every user action logged — login, views, edits, exports</p>
        </div>
        <div className="text-gray-400 text-sm">{rows.length} entries</div>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          className="flex-1 bg-[#0f1629] border border-[#1e2a45] rounded-lg px-3 py-2 text-white text-sm"
          placeholder="Search by user, action, record type..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && load()}
        />
        <input
          className="w-40 bg-[#0f1629] border border-[#1e2a45] rounded-lg px-3 py-2 text-white text-sm"
          placeholder="Filter by module"
          value={module}
          onChange={e => setModule(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && load()}
        />
        <button onClick={load} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm">Search</button>
      </div>

      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1e2a45]">
              {['Timestamp', 'User', 'Action', 'Module', 'Record', 'IP'].map(h => (
                <th key={h} className="text-left text-gray-400 text-xs font-medium px-4 py-3 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-b border-[#1e2a45] hover:bg-[#0a0e1a]">
                <td className="px-4 py-3 text-gray-400 text-xs">{new Date(r.ts).toLocaleString()}</td>
                <td className="px-4 py-3 text-white text-sm">{r.user_id}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${ACTION_COLORS[r.action] ?? 'bg-gray-500/20 text-gray-400'}`}>{r.action}</span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-sm">{r.module}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{r.record_type} #{r.record_id}</td>
                <td className="px-4 py-3 text-gray-500 text-xs font-mono">{r.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <div className="text-center py-8 text-gray-500">No audit entries found</div>}
      </div>
    </div>
  );
}
