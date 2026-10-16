'use client';
import { useEffect, useState } from 'react';

interface Role {
  id: number;
  name: string;
  permissions: Record<string, string[]>;
  created_at: string;
}

const MODULES = ['users', 'compliance', 'incidents', 'permits', 'ai_models', 'reports', 'integrations', 'inspections', 'audit', 'settings', 'approvals'];
const ACTIONS = ['read', 'write', 'delete', 'approve', 'deploy'];

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/roles').then(r => r.json()).then(d => { setRoles(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  const hasPermission = (role: Role, module: string, action: string) => {
    return role.permissions?.[module]?.includes(action) ?? false;
  };

  const togglePermission = async (role: Role, module: string, action: string) => {
    const current = role.permissions ?? {};
    const modulePerms = current[module] ?? [];
    const newPerms = modulePerms.includes(action)
      ? modulePerms.filter(a => a !== action)
      : [...modulePerms, action];
    const updated = { ...current, [module]: newPerms };
    await fetch('/api/roles', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: role.id, permissions: updated }),
    });
    setMsg(`Updated ${role.name} — ${module}:${action}`);
    setTimeout(() => setMsg(''), 2000);
    const res = await fetch('/api/roles');
    const data = await res.json();
    setRoles(Array.isArray(data) ? data : []);
  };

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Role &amp; Permission Matrix</h1>
        <p className="text-gray-400 text-sm mt-1">DB-backed oga_role table — click to toggle permissions per role/module</p>
      </div>
      {msg && <div className="mb-4 text-green-400 text-sm">{msg}</div>}
      {roles.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No roles — initialize DB first</div>
      ) : (
        <div className="overflow-x-auto">
          <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#1e2a45]">
                  <th className="text-left text-gray-400 px-4 py-3 uppercase tracking-wider font-medium">Module / Action</th>
                  {roles.map(r => (
                    <th key={r.id} className="text-center text-gray-400 px-3 py-3 uppercase tracking-wider font-medium capitalize">{r.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODULES.map(mod => (
                  ACTIONS.map((action, ai) => (
                    <tr key={`${mod}-${action}`} className={`border-b border-[#1e2a45] hover:bg-[#0a0e1a] ${ai === 0 ? 'border-t-2 border-t-[#1e2a45]' : ''}`}>
                      <td className="px-4 py-2">
                        {ai === 0 && <div className="text-gray-300 font-medium capitalize mb-0.5">{mod}</div>}
                        <div className="text-gray-500 pl-2">{action}</div>
                      </td>
                      {roles.map(role => (
                        <td key={role.id} className="px-3 py-2 text-center">
                          <button
                            onClick={() => togglePermission(role, mod, action)}
                            className={`w-5 h-5 rounded ${hasPermission(role, mod, action) ? 'bg-green-500 text-white' : 'bg-[#1e2a45] text-gray-600'} transition-colors text-xs`}
                          >
                            {hasPermission(role, mod, action) ? '✓' : ''}
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
