'use client';
import { useEffect, useState } from 'react';

interface AuditEntry { id: number; user_id: string; action: string; record_type: string; record_id: string; ts: string; }

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  useEffect(() => {
    fetch('/api/admin').then(r => r.json()).then(d => setLogs(d.audit_log || []));
  }, []);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Audit Log</h1>
        <p className="text-gray-400 text-sm mt-1">All user actions tracked in ogo_audit_log — real DB queries</p></div>
      {logs.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No audit events yet. Events logged as users take actions.</div>
      ) : (
        <div className="overflow-x-auto bg-[#0f1629] border border-[#1e2a45] rounded-xl">
          <table className="w-full text-xs">
            <thead><tr className="text-gray-400 border-b border-[#1e2a45]">
              {['ID', 'User', 'Action', 'Record Type', 'Record ID', 'Timestamp'].map(h => <th key={h} className="text-left py-2 px-3 font-medium">{h}</th>)}
            </tr></thead>
            <tbody>{logs.map(l => (
              <tr key={l.id} className="border-b border-[#1e2a45]/50">
                <td className="py-2 px-3 text-gray-500">{l.id}</td>
                <td className="py-2 px-3 text-amber-400">{l.user_id}</td>
                <td className="py-2 px-3 text-white">{l.action}</td>
                <td className="py-2 px-3 text-gray-300">{l.record_type}</td>
                <td className="py-2 px-3 font-mono text-blue-400/70">{l.record_id}</td>
                <td className="py-2 px-3 text-gray-500">{new Date(l.ts).toLocaleString()}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
