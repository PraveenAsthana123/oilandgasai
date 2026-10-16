'use client';
import { useEffect, useState } from 'react';

interface Role { id: number; name: string; permissions: Record<string, boolean>; created_at: string }

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    // Use seeded roles data
    setRoles([
      { id: 1, name: 'customer', permissions: { view_contracts: true, view_invoices: true, submit_requests: true }, created_at: new Date().toISOString() },
      { id: 2, name: 'admin', permissions: { all: true }, created_at: new Date().toISOString() },
      { id: 3, name: 'sales', permissions: { view_leads: true, view_pipeline: true, manage_quotes: true }, created_at: new Date().toISOString() },
    ]);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Role Management</h1>
        <p className="text-gray-400 mt-1">Permissions and role-based access control</p>
      </div>

      <div className="grid gap-4">
        {roles.map(r => (
          <div key={r.id} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-white font-semibold capitalize">{r.name}</span>
              <span className="text-gray-500 text-xs">Role ID: {r.id}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(r.permissions).map(([perm, val]) => (
                <span key={perm} className={`px-2 py-0.5 rounded text-xs ${val ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-500'}`}>
                  {val ? '✓' : '✗'} {perm.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
