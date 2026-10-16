'use client';
import { useEffect, useState } from 'react';

interface Session {
  id: number;
  user_id: string;
  user_name: string;
  user_role: string;
  current_page: string;
  started_at: string;
  last_active: string;
  ip: string;
  duration_min: number;
  active: boolean;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const load = () => {
    fetch('/api/sessions').then(r => r.json()).then(d => { setSessions(Array.isArray(d) ? d : []); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const forceLogout = async (id: number) => {
    await fetch('/api/sessions', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: id }) });
    setMsg(`Session ${id} terminated`);
    load();
  };

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Active Sessions</h1>
          <p className="text-gray-400 text-sm mt-1">{sessions.length} active sessions — force logout capability</p>
        </div>
        <button onClick={load} className="px-4 py-2 bg-[#1e2a45] hover:bg-[#2a3a5a] text-white rounded-lg text-sm">Refresh</button>
      </div>
      {msg && <div className="mb-4 text-green-400 text-sm">{msg}</div>}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1e2a45]">
              {['User', 'Role', 'Current Page', 'IP', 'Duration', 'Last Active', 'Actions'].map(h => (
                <th key={h} className="text-left text-gray-400 text-xs font-medium px-4 py-3 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sessions.map(s => (
              <tr key={s.id} className="border-b border-[#1e2a45] hover:bg-[#0a0e1a]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs">{s.user_name?.[0]}</div>
                    <span className="text-white text-sm">{s.user_name}</span>
                  </div>
                </td>
                <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded capitalize">{s.user_role}</span></td>
                <td className="px-4 py-3 text-gray-400 text-sm font-mono">{s.current_page}</td>
                <td className="px-4 py-3 text-gray-400 text-xs font-mono">{s.ip}</td>
                <td className="px-4 py-3 text-gray-400 text-sm">{Math.round(s.duration_min ?? 0)}m</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{new Date(s.last_active).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <button onClick={() => forceLogout(s.id)} className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-2 py-1 rounded transition-colors">
                    Force Logout
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sessions.length === 0 && <div className="text-center py-8 text-gray-500">No active sessions</div>}
      </div>
    </div>
  );
}
