'use client';
import { useEffect, useState } from 'react';

interface Role { id: number; name: string; permissions: Record<string, unknown> | string; created_at: string; }

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  useEffect(() => { fetch('/api/admin').then(r => r.json()).then(d => setRoles(d.roles || [])); }, []);

  const parsePerms = (p: Record<string, unknown> | string) => {
    if (typeof p === 'object') return JSON.stringify(p);
    try { return JSON.stringify(JSON.parse(p)); } catch { return String(p); }
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Roles</h1>
        <p className="text-gray-400 text-sm mt-1">Role-based access control — ogo_role table</p></div>
      <div className="grid grid-cols-3 gap-4">
        {roles.map((r) => (
          <div key={r.id} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <div className="text-lg font-bold text-amber-400 capitalize mb-2">{r.name}</div>
            <div className="text-xs font-mono text-gray-400 bg-[#0a0e1a] p-2 rounded">{parsePerms(r.permissions as Record<string, unknown> | string)}</div>
            <div className="text-xs text-gray-600 mt-2">{new Date(r.created_at).toLocaleDateString()}</div>
          </div>
        ))}
        {roles.length === 0 && <div className="col-span-3 text-center py-10 text-gray-500">No roles found. Seed the database first.</div>}
      </div>
    </div>
  );
}
