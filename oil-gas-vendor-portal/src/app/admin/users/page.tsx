'use client';
import { useEffect, useState } from 'react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    fetch('/api/admin/users').then((r) => r.json()).then((d) => setUsers(d.users || []));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">User Management</h1>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#1e2a45]">
            <tr>{['ID', 'Company', 'Business #', 'HST #', 'WSIB', 'Approval Status', 'Score'].map((h) => (
              <th key={h} className="text-left px-4 py-3 text-gray-400 text-xs">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={String(u.id)} className="border-t border-[#1e2a45] hover:bg-[#1e2a45]/30">
                <td className="px-4 py-3 text-gray-500">{String(u.id)}</td>
                <td className="px-4 py-3 text-white">{String(u.company || '')}</td>
                <td className="px-4 py-3 text-gray-400">{String(u.business_number || '')}</td>
                <td className="px-4 py-3 text-gray-400">{String(u.hst_number || '')}</td>
                <td className="px-4 py-3"><span className={String(u.wsib_status) === 'clear' ? 'text-green-400' : 'text-yellow-400'}>{String(u.wsib_status || '')}</span></td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full border ${String(u.approval_status) === 'approved' ? 'bg-green-900/30 text-green-400 border-green-700' : 'bg-yellow-900/30 text-yellow-400 border-yellow-700'}`}>{String(u.approval_status || '')}</span></td>
                <td className="px-4 py-3 text-white">{String(u.performance_score || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
