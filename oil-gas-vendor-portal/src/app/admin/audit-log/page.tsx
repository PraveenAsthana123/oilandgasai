'use client';
import { useEffect, useState } from 'react';

export default function AuditLogPage() {
  const [logs, setLogs] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    fetch('/api/admin/audit-log').then((r) => r.json()).then((d) => setLogs(d.logs || []));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Audit Log</h1>
      {logs.length === 0 ? (
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-8 text-center text-gray-500">No audit entries yet. Actions are logged automatically.</div>
      ) : (
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#1e2a45]">
              <tr>{['Timestamp', 'User', 'Action', 'Record Type', 'Record ID'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-gray-400 text-xs">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={String(log.id)} className="border-t border-[#1e2a45]">
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(String(log.ts)).toLocaleString()}</td>
                  <td className="px-4 py-3 text-purple-400">{String(log.user_id || '')}</td>
                  <td className="px-4 py-3 text-white">{String(log.action || '')}</td>
                  <td className="px-4 py-3 text-gray-400">{String(log.record_type || '')}</td>
                  <td className="px-4 py-3 text-gray-500">{String(log.record_id || '')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
