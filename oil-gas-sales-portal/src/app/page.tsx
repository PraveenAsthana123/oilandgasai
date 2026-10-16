'use client';
import { useEffect, useState } from 'react';

const KPICard = ({ label, value, sub, color = 'emerald' }: any) => (
  <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
    <div className="text-xs text-slate-400 mb-1">{label}</div>
    <div className={`text-2xl font-bold text-${color}-400`}>{value}</div>
    {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
  </div>
);

const stageColors: Record<string, string> = {
  prospect: 'bg-slate-700',
  qualified: 'bg-blue-800',
  technical_eval: 'bg-purple-800',
  proposal: 'bg-yellow-800',
  negotiation: 'bg-orange-800',
  won: 'bg-emerald-800',
  lost: 'bg-red-900',
};

export default function Dashboard() {
  const [leads, setLeads] = useState<any[]>([]);
  const [opps, setOpps] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [seeded, setSeeded] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [l, o, a] = await Promise.all([
        fetch('/api/leads').then(r => r.json()),
        fetch('/api/opportunities').then(r => r.json()),
        fetch('/api/accounts').then(r => r.json()),
      ]);
      setLeads(Array.isArray(l) ? l : []);
      setOpps(Array.isArray(o) ? o : []);
      setAccounts(Array.isArray(a) ? a : []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSeed = async () => {
    await fetch('/api/init', { method: 'POST' });
    setSeeded(true);
    fetchData();
  };

  const pipelineValue = opps.reduce((s: number, o: any) => s + parseFloat(o.value_cad || 0), 0);
  const leadsToday = leads.filter((l: any) => new Date(l.created_at).toDateString() === new Date().toDateString()).length;
  const qualified = leads.filter((l: any) => l.status === 'qualified' || l.status === 'proposal').length;
  const convRate = leads.length > 0 ? ((qualified / leads.length) * 100).toFixed(1) : '0';
  const revenueMTD = accounts.reduce((s: number, a: any) => s + parseFloat(a.revenue_cad || 0), 0);
  const quotaTarget = 15000000;
  const quotaAttainment = ((revenueMTD / quotaTarget) * 100).toFixed(1);

  const byStream: Record<string, number> = {};
  opps.forEach((o: any) => { byStream[o.stream] = (byStream[o.stream] || 0) + 1; });

  if (loading) return (
    <div className="p-8 flex items-center gap-3">
      <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-slate-400">Loading Sales Command Center...</span>
    </div>
  );

  if (!leads.length && !seeded) return (
    <div className="p-8 flex flex-col items-center gap-4">
      <div className="text-4xl">⛽</div>
      <div className="text-xl font-bold text-white">Oil & Gas Sales Portal</div>
      <div className="text-slate-400">No data yet. Initialize the database to get started.</div>
      <button onClick={handleSeed} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-medium transition-colors">
        Initialize & Seed Database
      </button>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sales Command Center</h1>
          <p className="text-slate-400 text-sm mt-1">Oil & Gas AI Sales — Real-time pipeline overview</p>
        </div>
        <button onClick={fetchData} className="text-xs text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded hover:bg-emerald-500/10 transition-colors">
          Refresh
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICard label="Pipeline Value (CAD)" value={`$${(pipelineValue / 1000000).toFixed(1)}M`} sub="Active opportunities" />
        <KPICard label="Leads Today" value={leadsToday || leads.length} sub="Total leads in system" color="blue" />
        <KPICard label="Conversion Rate" value={`${convRate}%`} sub="Lead → Qualified" color="yellow" />
        <KPICard label="Revenue MTD (CAD)" value={`$${(revenueMTD / 1000000).toFixed(1)}M`} sub="Month-to-date" color="purple" />
        <KPICard label="Quota Attainment" value={`${quotaAttainment}%`} sub={`vs $${(quotaTarget / 1000000).toFixed(0)}M target`} color="orange" />
        <KPICard label="Active Deals" value={opps.filter((o: any) => !['won','lost'].includes(o.stage)).length} sub="In pipeline" color="cyan" />
      </div>

      {/* Pipeline by Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
          <h2 className="text-sm font-semibold text-white mb-3">Pipeline by Stage</h2>
          <div className="space-y-2">
            {['prospect','qualified','technical_eval','proposal','negotiation','won','lost'].map(stage => {
              const stageOpps = opps.filter((o: any) => o.stage === stage);
              const val = stageOpps.reduce((s: number, o: any) => s + parseFloat(o.value_cad || 0), 0);
              return (
                <div key={stage} className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${stageColors[stage]?.replace('bg-', 'bg-').replace('800','500').replace('900','600')}`} style={{background: stage === 'prospect' ? '#94a3b8' : undefined}} />
                  <span className="text-xs text-slate-300 w-32 capitalize">{stage.replace('_',' ')}</span>
                  <div className="flex-1 bg-[#1e2a45] rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${pipelineValue > 0 ? (val / pipelineValue * 100) : 0}%` }} />
                  </div>
                  <span className="text-xs text-emerald-400 w-20 text-right">${(val / 1000).toFixed(0)}K</span>
                  <span className="text-xs text-slate-500 w-6 text-right">{stageOpps.length}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
          <h2 className="text-sm font-semibold text-white mb-3">Active Deals by Stream</h2>
          <div className="space-y-3">
            {Object.entries(byStream).map(([stream, count]) => (
              <div key={stream} className="flex items-center justify-between p-2 bg-[#0a0e1a] rounded">
                <div>
                  <div className="text-sm text-white capitalize">{stream}</div>
                  <div className="text-xs text-slate-400">{count} active deals</div>
                </div>
                <div className="text-emerald-400 font-bold">{count}</div>
              </div>
            ))}
            {Object.keys(byStream).length === 0 && <div className="text-slate-500 text-sm">No opportunities yet</div>}
          </div>
        </div>
      </div>

      {/* Recent Leads */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
        <h2 className="text-sm font-semibold text-white mb-3">Recent Leads</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-[#1e2a45]">
                <th className="text-left pb-2">Company</th>
                <th className="text-left pb-2">Contact</th>
                <th className="text-left pb-2">Stream</th>
                <th className="text-left pb-2">Score</th>
                <th className="text-left pb-2">Status</th>
                <th className="text-left pb-2">Owner</th>
              </tr>
            </thead>
            <tbody>
              {leads.slice(0, 8).map((l: any) => (
                <tr key={l.id} className="border-b border-[#1e2a45]/50 hover:bg-[#1e2a45]/20">
                  <td className="py-2 text-white font-medium">{l.company}</td>
                  <td className="py-2 text-slate-300">{l.contact_name}</td>
                  <td className="py-2"><span className="capitalize text-blue-400">{l.stream}</span></td>
                  <td className="py-2">
                    <div className="flex items-center gap-1">
                      <div className="w-8 bg-[#1e2a45] rounded-full h-1">
                        <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${l.score}%` }} />
                      </div>
                      <span className="text-emerald-400">{l.score}</span>
                    </div>
                  </td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${l.status === 'qualified' ? 'bg-emerald-500/20 text-emerald-400' : l.status === 'proposal' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-700 text-slate-300'}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="py-2 text-slate-400">{l.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Accounts */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
        <h2 className="text-sm font-semibold text-white mb-3">Top Accounts by Revenue</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {accounts.slice(0, 6).map((a: any) => (
            <div key={a.id} className="p-3 bg-[#0a0e1a] rounded border border-[#1e2a45]/50">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm font-medium text-white">{a.company}</div>
                  <div className="text-xs text-blue-400 capitalize mt-0.5">{a.stream}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-400">${(parseFloat(a.revenue_cad) / 1000000).toFixed(1)}M</div>
                  <div className="text-xs text-slate-500">Health: {a.health_score}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
