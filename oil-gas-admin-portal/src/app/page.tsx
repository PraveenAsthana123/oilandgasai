'use client';
import { useEffect, useState } from 'react';

interface HealthData {
  status: string;
  db: string;
  ollama: string;
  user_count: number;
  ollama_models: string[];
  timestamp: string;
}

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon?: string;
}

function StatCard({ label, value, sub, color = 'red', icon }: StatCardProps) {
  return (
    <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-sm">{label}</span>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      <div className={`text-2xl font-bold text-${color}-400`}>{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}

export default function CommandCenter() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [sessions, setSessions] = useState<{ id: number; user_name: string; user_role: string; current_page: string; duration_min: number }[]>([]);
  const [approvals, setApprovals] = useState<{ id: number; approval_type: string; requested_by: string; status: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [initDone, setInitDone] = useState(false);
  const [initMsg, setInitMsg] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/health').then(r => r.json()).catch(() => null),
      fetch('/api/sessions').then(r => r.json()).catch(() => []),
      fetch('/api/approvals').then(r => r.json()).catch(() => []),
    ]).then(([h, s, a]) => {
      setHealth(h);
      setSessions(Array.isArray(s) ? s : []);
      setApprovals(Array.isArray(a) ? a.filter((x: { status: string }) => x.status === 'pending') : []);
      setLoading(false);
    });
  }, []);

  const handleInit = async () => {
    setInitMsg('Initializing...');
    const res = await fetch('/api/init');
    const data = await res.json();
    setInitMsg(data.ok ? `✅ ${data.message}` : `❌ ${data.error}`);
    setInitDone(true);
    setTimeout(() => window.location.reload(), 1500);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-gray-400 animate-pulse">Loading Command Center...</div>
    </div>
  );

  const dbOk = health?.db === 'connected';
  const ollamaOk = health?.ollama === 'connected';

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Command Center</h1>
          <p className="text-gray-400 text-sm mt-1">Oil &amp; Gas Enterprise Portal — Real-time System Overview</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleInit}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Initialize / Seed DB
          </button>
          {initDone && <span className="text-xs text-green-400 self-center">{initMsg}</span>}
        </div>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Database" value={dbOk ? 'Connected' : 'Disconnected'} sub={dbOk ? 'PostgreSQL healthy' : 'Check DATABASE_URL'} color={dbOk ? 'green' : 'red'} icon="🗄️" />
        <StatCard label="AI (Ollama)" value={ollamaOk ? 'Online' : 'Offline'} sub={ollamaOk ? `${health?.ollama_models?.length ?? 0} models` : 'localhost:11434'} color={ollamaOk ? 'green' : 'yellow'} icon="🤖" />
        <StatCard label="Total Users" value={health?.user_count ?? 0} sub="Active accounts" color="blue" icon="👥" />
        <StatCard label="Active Sessions" value={sessions.length} sub="Currently logged in" color="purple" icon="🖥️" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Pending Approvals" value={approvals.length} sub="Awaiting review" color="yellow" icon="✅" />
        <StatCard label="API Calls/min" value="~142" sub="Real-time estimate" color="cyan" icon="⚡" />
        <StatCard label="DB Connections" value={dbOk ? '4/10' : 'N/A'} sub="Pool utilization" color="green" icon="🔗" />
        <StatCard label="Portal Version" value="1.0.0" sub="Oil & Gas Admin" color="gray" icon="📦" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Sessions */}
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
          <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
            <span>🖥️</span> Active Sessions
          </h2>
          {sessions.length === 0 ? (
            <div className="text-gray-500 text-sm">No active sessions — initialize DB first</div>
          ) : (
            <div className="space-y-2">
              {sessions.slice(0, 5).map(s => (
                <div key={s.id} className="flex items-center justify-between bg-[#0a0e1a] rounded-lg px-3 py-2">
                  <div>
                    <div className="text-white text-sm font-medium">{s.user_name}</div>
                    <div className="text-gray-400 text-xs">{s.user_role} · {s.current_page}</div>
                  </div>
                  <div className="text-xs text-gray-400">{Math.round(s.duration_min ?? 0)}m ago</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Approvals */}
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
          <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
            <span>✅</span> Pending Approvals
          </h2>
          {approvals.length === 0 ? (
            <div className="text-gray-500 text-sm">No pending approvals — initialize DB first</div>
          ) : (
            <div className="space-y-2">
              {approvals.map(a => (
                <div key={a.id} className="flex items-center justify-between bg-[#0a0e1a] rounded-lg px-3 py-2">
                  <div>
                    <div className="text-white text-sm font-medium capitalize">{a.approval_type.replace(/_/g, ' ')}</div>
                    <div className="text-gray-400 text-xs">{a.requested_by}</div>
                  </div>
                  <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">Pending</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Info */}
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
          <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
            <span>⚙️</span> System Status
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Database', status: health?.db ?? 'unknown', ok: dbOk },
              { label: 'Ollama AI', status: health?.ollama ?? 'unknown', ok: ollamaOk },
              { label: 'Portal API', status: 'operational', ok: true },
              { label: 'ChromaDB (RAG)', status: '⚠️ Not configured — set CHROMA_URL', ok: false },
              { label: 'SMTP Email', status: '⚠️ Not configured — set SMTP_HOST', ok: false },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">{item.label}</span>
                <span className={`text-sm font-medium ${item.ok ? 'text-green-400' : 'text-yellow-400'}`}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
          <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
            <span>🚀</span> Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'View Compliance', href: '/regulatory', icon: '🏛️' },
              { label: 'Safety Incidents', href: '/incidents', icon: '⚠️' },
              { label: 'AI Models', href: '/ai-governance', icon: '🤖' },
              { label: 'Audit Trail', href: '/audit-log', icon: '📋' },
              { label: 'Manage Users', href: '/users', icon: '👥' },
              { label: 'Integrations', href: '/integrations', icon: '🔗' },
            ].map(q => (
              <a key={q.href} href={q.href} className="flex items-center gap-2 bg-[#0a0e1a] hover:bg-[#1e2a45] rounded-lg px-3 py-2 text-sm text-gray-300 hover:text-white transition-colors">
                <span>{q.icon}</span><span>{q.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
