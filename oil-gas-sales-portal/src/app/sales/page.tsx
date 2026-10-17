'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const KPICard = ({ label, value, sub, color = 'emerald' }: { label: string; value: string; sub?: string; color?: string }) => (
  <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
    <div className="text-xs text-slate-400 mb-1">{label}</div>
    <div className={`text-2xl font-bold text-${color}-400`}>{value}</div>
    {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
  </div>
);

const NAV = [
  { href: '/sales/leads', label: 'Leads', icon: '🎯', desc: 'Manage and qualify leads' },
  { href: '/sales/pipeline', label: 'Pipeline', icon: '📊', desc: 'Track opportunity stages' },
  { href: '/sales/quotes', label: 'Quotes', icon: '📋', desc: 'Create and send quotes' },
  { href: '/sales/proposals', label: 'Proposals', icon: '📝', desc: 'AI-assisted proposals' },
  { href: '/sales/accounts', label: 'Accounts', icon: '🏢', desc: 'Customer accounts' },
  { href: '/sales/activities', label: 'Activities', icon: '📅', desc: 'Calls, meetings, tasks' },
  { href: '/sales/reports', label: 'Reports', icon: '📈', desc: 'Sales analytics' },
];

export default function SalesDashboard() {
  const [leads, setLeads] = useState<any[]>([]);
  const [opps, setOpps] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/leads').then(r => r.json()).catch(() => []),
      fetch('/api/opportunities').then(r => r.json()).catch(() => []),
      fetch('/api/accounts').then(r => r.json()).catch(() => []),
    ]).then(([l, o, a]) => {
      setLeads(Array.isArray(l) ? l : []);
      setOpps(Array.isArray(o) ? o : []);
      setAccounts(Array.isArray(a) ? a : []);
      setLoading(false);
    });
  }, []);

  const pipelineValue = opps.reduce((s: number, o: any) => s + parseFloat(o.value_cad || 0), 0);
  const leadsThisMonth = leads.filter((l: any) => {
    const d = new Date(l.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const wonOpps = opps.filter((o: any) => o.stage === 'won');
  const winRate = opps.length > 0 ? ((wonOpps.length / opps.length) * 100).toFixed(1) : '0';
  const revenueMTD = accounts.reduce((s: number, a: any) => s + parseFloat(a.revenue_cad || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sales Dashboard</h1>
          <p className="text-gray-400 mt-1">Role-gated sales section — requires sales, manager, or admin role</p>
        </div>
        <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full">
          Sales Section
        </span>
      </div>

      {loading ? (
        <div className="text-emerald-400">Loading sales data...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard label="Pipeline Value" value={`$${(pipelineValue / 1_000_000).toFixed(1)}M`} sub="Active opportunities" color="emerald" />
          <KPICard label="Leads This Month" value={leadsThisMonth.toString()} sub="New inbound/outbound" color="blue" />
          <KPICard label="Win Rate" value={`${winRate}%`} sub="Won vs total closed" color="yellow" />
          <KPICard label="Revenue MTD" value={`$${(revenueMTD / 1_000_000).toFixed(2)}M`} sub="Month to date" color="purple" />
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Sales Sections</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {NAV.map(n => (
            <Link
              key={n.href}
              href={n.href}
              className="bg-[#0f1629] border border-[#1e2a45] hover:border-emerald-500/50 rounded-lg p-4 transition-colors group"
            >
              <div className="text-2xl mb-2">{n.icon}</div>
              <div className="text-sm font-semibold text-white group-hover:text-emerald-400">{n.label}</div>
              <div className="text-xs text-gray-500 mt-1">{n.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Recent Opportunities</h3>
        {opps.length === 0 ? (
          <p className="text-gray-500 text-sm">No opportunities yet. <Link href="/api/init" className="text-emerald-400 underline">Seed data</Link></p>
        ) : (
          <div className="space-y-2">
            {opps.slice(0, 5).map((o: any) => (
              <div key={o.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-300">{o.account_name || o.company}</span>
                <span className="text-gray-400">{o.stage}</span>
                <span className="text-emerald-400">${parseFloat(o.value_cad || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
