'use client';
import { useEffect, useState } from 'react';

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    fetch('/api/admin/roles').then((r) => r.json()).then((d) => setRoles(d.roles || []));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Roles & Permissions</h1>
      <div className="space-y-3">
        {roles.map((role) => {
          const perms: string[] = Array.isArray(role.permissions) ? role.permissions : (typeof role.permissions === 'string' ? JSON.parse(role.permissions) : []);
          return (
            <div key={String(role.id)} className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
              <div className="text-white font-medium capitalize mb-2">{String(role.name)}</div>
              <div className="flex flex-wrap gap-2">
                {perms.map((p: string) => <span key={p} className="text-xs bg-purple-900/30 border border-purple-700 text-purple-300 px-2 py-0.5 rounded">{p}</span>)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
