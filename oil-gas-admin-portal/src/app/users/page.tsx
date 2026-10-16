'use client';
import { useEffect, useState } from 'react';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  mfa_enabled: boolean;
  last_login: string;
  active: boolean;
  created_at: string;
}

const ROLES = ['admin', 'operator', 'analyst', 'viewer', 'safety_officer'];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ email: '', name: '', role: 'viewer' });
  const [msg, setMsg] = useState('');

  const load = () => {
    fetch('/api/users').then(r => r.json()).then(d => { setUsers(Array.isArray(d) ? d : []); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const addUser = async () => {
    const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json();
    if (data.id) { setMsg('User added'); setShowAdd(false); setForm({ email: '', name: '', role: 'viewer' }); load(); }
    else setMsg(data.error ?? 'Error');
  };

  const updateUser = async (id: number, updates: Partial<User>) => {
    await fetch(`/api/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) });
    load();
  };

  const roleColor: Record<string, string> = {
    admin: 'red', operator: 'blue', analyst: 'purple', safety_officer: 'yellow', viewer: 'gray'
  };

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-gray-400 text-sm mt-1">{users.length} users · Manage roles, MFA, and access</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm">+ Add User</button>
      </div>

      {msg && <div className="mb-4 text-green-400 text-sm">{msg}</div>}

      {showAdd && (
        <div className="mb-4 bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          <h3 className="text-white font-medium mb-3">New User</h3>
          <div className="grid grid-cols-3 gap-3">
            <input className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-white text-sm" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <input className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-white text-sm" placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <select className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-white text-sm" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={addUser} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm">Create</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 bg-[#1e2a45] text-gray-300 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1e2a45]">
              {['Name', 'Email', 'Role', 'MFA', 'Last Login', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left text-gray-400 text-xs font-medium px-4 py-3 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-[#1e2a45] hover:bg-[#0a0e1a] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 text-xs font-bold">{u.name?.[0] ?? '?'}</div>
                    <span className="text-white text-sm">{u.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-400 text-sm">{u.email}</td>
                <td className="px-4 py-3">
                  <select
                    value={u.role}
                    onChange={e => updateUser(u.id, { role: e.target.value })}
                    className={`bg-${roleColor[u.role] ?? 'gray'}-500/10 border border-${roleColor[u.role] ?? 'gray'}-500/30 text-${roleColor[u.role] ?? 'gray'}-400 rounded px-2 py-1 text-xs`}
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${u.mfa_enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {u.mfa_enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">{u.last_login ? new Date(u.last_login).toLocaleString() : 'Never'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${u.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {u.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => updateUser(u.id, { mfa_enabled: !u.mfa_enabled })} className="text-xs text-blue-400 hover:text-blue-300">
                      {u.mfa_enabled ? 'Disable MFA' : 'Enable MFA'}
                    </button>
                    <button onClick={() => updateUser(u.id, { active: !u.active })} className="text-xs text-red-400 hover:text-red-300">
                      {u.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
