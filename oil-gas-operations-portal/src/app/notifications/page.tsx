'use client';
import { useEffect, useState } from 'react';

interface Notification {
  id: number;
  type: string;
  message: string;
  severity: string;
  source_dept: string | null;
  read: boolean;
  created_at: string;
}

interface Kpis {
  total: string;
  unread: string;
  critical: string;
  resolved: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'text-red-400 bg-red-400/10 border-red-400/20',
  warning: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  info: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
};

const SEVERITY_DOT: Record<string, string> = {
  critical: 'bg-red-400',
  warning: 'bg-amber-400',
  info: 'bg-blue-400',
};

export default function NotificationsPage() {
  const [rows, setRows] = useState<Notification[]>([]);
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [marking, setMarking] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      const json = await res.json();
      setRows(json.data ?? []);
      setKpis(json.kpis ?? null);
      setIsMock(!!json._mock);
    } catch {
      setIsMock(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const markAllRead = async () => {
    setMarking(true);
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mark_all_read: true }),
      });
      await load();
    } finally {
      setMarking(false);
    }
  };

  const markRead = async (id: number) => {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, read: true }),
    });
    setRows(r => r.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const filtered = filter === 'all' ? rows : rows.filter(r => r.severity === filter);
  const kv = (v: string | undefined) => (v ? v : '—');

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-gray-300 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-amber-400">🔔 Notification Hub</h1>
            <p className="text-gray-500 mt-1 text-sm">System alerts, job completions, and threshold breach notifications.</p>
            {isMock && <div className="mt-2 text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded px-3 py-1 inline-block">⚠️ Mocked — DATABASE_URL not configured or DB unavailable</div>}
          </div>
          <button onClick={markAllRead} disabled={marking}
            className="mt-1 bg-[#1e2a45] hover:bg-[#2a3a5a] disabled:opacity-50 text-gray-300 px-4 py-2 rounded text-xs border border-[#1e2a45] transition-colors">
            {marking ? 'Marking…' : 'Mark All Read'}
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: kv(kpis?.total), color: 'text-gray-300' },
            { label: 'Unread', value: kv(kpis?.unread), color: 'text-amber-400' },
            { label: 'Critical', value: kv(kpis?.critical), color: 'text-red-400' },
            { label: 'Resolved', value: kv(kpis?.resolved), color: 'text-green-400' },
          ].map((k) => (
            <div key={k.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">{k.label}</div>
              <div className={`text-2xl font-bold ${k.color}`}>{loading ? '…' : k.value}</div>
            </div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="flex gap-2">
          {['all', 'critical', 'warning', 'info'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded text-xs capitalize transition-colors ${filter === f ? 'bg-amber-500 text-black font-semibold' : 'bg-[#0f1629] border border-[#1e2a45] text-gray-400 hover:text-gray-200'}`}>
              {f}
            </button>
          ))}
        </div>

        {/* Feed */}
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1e2a45] flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-200">Notification Feed</span>
            <span className="text-xs text-gray-500">{filtered.length} showing</span>
          </div>
          {loading ? (
            <div className="px-4 py-8 text-center text-gray-600 text-sm">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-600 text-sm">No notifications</div>
          ) : (
            <div className="divide-y divide-[#1e2a45]/50">
              {filtered.map((n) => (
                <div key={n.id} className={`px-4 py-3 flex items-start gap-3 transition-colors ${n.read ? 'opacity-50' : 'hover:bg-[#1e2a45]/20'}`}>
                  <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${SEVERITY_DOT[n.severity] ?? 'bg-gray-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded border ${SEVERITY_COLORS[n.severity] ?? 'text-gray-400 bg-gray-400/10 border-gray-400/20'}`}>{n.severity}</span>
                      {n.type && <span className="text-xs text-gray-500">{n.type}</span>}
                      {n.source_dept && <span className="text-xs text-gray-600">{n.source_dept}</span>}
                    </div>
                    <p className="mt-1 text-sm text-gray-300">{n.message}</p>
                    <div className="mt-1 text-xs text-gray-600">{new Date(n.created_at).toLocaleString()}</div>
                  </div>
                  {!n.read && (
                    <button onClick={() => markRead(n.id)} className="text-xs text-gray-600 hover:text-gray-300 flex-shrink-0">Mark read</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
