'use client';
import { useEffect, useState } from 'react';

export default function RolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/roles').then(r => r.json()).then(d => { setRoles(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-white">Roles & Permissions</h1>
      <p className="text-slate-400 text-sm">Role-based access control for the portal</p>
      {loading ? <div className="text-slate-400">Loading roles...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((r: any) => (
            <div key={r.id} className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
              <div className="font-semibold text-white capitalize">{r.name}</div>
              <div className="mt-2 space-y-1">
                {Object.entries(r.permissions || {}).map(([k, v]: any) => (
                  <div key={k} className="flex items-center gap-2 text-xs">
                    <span className="text-emerald-400">✓</span>
                    <span className="text-slate-300 capitalize">{k}</span>
                    {v !== true && <span className="text-slate-500">: {String(v)}</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {roles.length === 0 && <div className="col-span-2 text-center py-8 text-slate-500">No roles found. <a href="/api/init" className="text-emerald-400 underline">Initialize database</a></div>}
        </div>
      )}
    </div>
  );
}
