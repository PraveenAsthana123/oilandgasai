'use client';
import { useEffect, useState } from 'react';

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/audit-log').then(r => r.json()).then(d => { setLogs(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-white">Audit Log</h1>
      <p className="text-slate-400 text-sm">All system actions tracked for compliance and security</p>
      {loading ? <div className="text-slate-400">Loading audit log...</div> : (
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 border-b border-[#1e2a45] bg-[#0a0e1a]">
                <th className="text-left px-4 py-3">Time</th>
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3">Action</th>
                <th className="text-left px-4 py-3">Record Type</th>
                <th className="text-left px-4 py-3">Record ID</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l: any) => (
                <tr key={l.id} className="border-b border-[#1e2a45]/40 hover:bg-[#1e2a45]/20">
                  <td className="px-4 py-3 text-xs text-slate-500">{new Date(l.ts).toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-300">{l.user_id}</td>
                  <td className="px-4 py-3 text-white">{l.action}</td>
                  <td className="px-4 py-3 text-blue-400">{l.record_type}</td>
                  <td className="px-4 py-3 text-slate-400">{l.record_id}</td>
                </tr>
              ))}
              {logs.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-slate-500">No audit log entries yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
