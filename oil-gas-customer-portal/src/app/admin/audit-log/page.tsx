'use client';
import { useEffect, useState } from 'react';

interface AuditEntry { id: number; user_id: string; action: string; record_type: string; record_id: string; ts: string; details: Record<string, unknown> }

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);

  useEffect(() => {
    fetch('/api/audit-log').then(r => r.json()).then(d => setLogs(d.logs || []));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Audit Log</h1>
        <p className="text-gray-400 mt-1">All system actions and user activity</p>
      </div>

      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No audit log entries yet. Actions like paying invoices will appear here.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e2a45] text-gray-500 text-xs uppercase">
                <th className="px-4 py-3 text-left">Timestamp</th>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Action</th>
                <th className="px-4 py-3 text-left">Record</th>
                <th className="px-4 py-3 text-left">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id} className="border-b border-[#1e2a45]/50">
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(l.ts).toLocaleString('en-CA')}</td>
                  <td className="px-4 py-3 text-gray-300">{l.user_id}</td>
                  <td className="px-4 py-3 text-blue-400">{l.action}</td>
                  <td className="px-4 py-3 text-gray-400">{l.record_type}#{l.record_id}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs font-mono">{JSON.stringify(l.details)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
