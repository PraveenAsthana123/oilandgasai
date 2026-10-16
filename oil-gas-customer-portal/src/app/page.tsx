'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DashboardData {
  contracts: Array<{ id: number; product: string; status: string; end_date: string; renewal_alert: boolean }>;
  deliveries: Array<{ id: number; product: string; status: string; delivery_date: string; volume: number; unit: string }>;
  invoices: Array<{ id: number; total_cad: number; computed_status: string; due_date: string }>;
  assets: Array<{ id: number; asset_type: string; asset_name: string; health_score: number; alert_count: number; status: string }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        await fetch('/api/init');
        const [contracts, deliveries, invoices, monitoring] = await Promise.all([
          fetch('/api/contracts').then(r => r.json()),
          fetch('/api/deliveries').then(r => r.json()),
          fetch('/api/invoices').then(r => r.json()),
          fetch('/api/monitoring/assets').then(r => r.json()),
        ]);
        setData({
          contracts: contracts.contracts || [],
          deliveries: deliveries.deliveries || [],
          invoices: invoices.invoices || [],
          assets: monitoring.assets || [],
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-blue-400 text-lg">Loading dashboard...</div>
    </div>
  );

  const outstanding = data?.invoices.filter(i => i.computed_status !== 'paid') || [];
  const overdue = data?.invoices.filter(i => i.computed_status === 'overdue') || [];
  const totalOwing = outstanding.reduce((s, i) => s + Number(i.total_cad), 0);
  const activeContracts = data?.contracts.filter(c => c.status === 'active') || [];
  const renewalAlerts = data?.contracts.filter(c => c.renewal_alert) || [];
  const pendingDeliveries = data?.deliveries.filter(d => d.status !== 'delivered') || [];
  const totalAlerts = data?.assets.reduce((s, a) => s + (a.alert_count || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Customer Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back — here&apos;s your account overview</p>
        </div>
        <div className="text-xs text-gray-500 bg-[#0f1629] border border-[#1e2a45] px-3 py-2 rounded-lg">
          Last updated: {new Date().toLocaleString('en-CA')}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Active Contracts</div>
          <div className="text-3xl font-bold text-white">{activeContracts.length}</div>
          {renewalAlerts.length > 0 && (
            <div className="text-amber-400 text-xs mt-1">⚠ {renewalAlerts.length} renewing soon</div>
          )}
        </div>
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Pending Deliveries</div>
          <div className="text-3xl font-bold text-white">{pendingDeliveries.length}</div>
          <div className="text-gray-500 text-xs mt-1">of {data?.deliveries.length || 0} total</div>
        </div>
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Outstanding CAD</div>
          <div className="text-3xl font-bold text-white">${(totalOwing / 1000).toFixed(0)}K</div>
          {overdue.length > 0 && (
            <div className="text-red-400 text-xs mt-1">⚠ {overdue.length} overdue</div>
          )}
        </div>
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">AI Alerts</div>
          <div className={`text-3xl font-bold ${totalAlerts > 0 ? 'text-amber-400' : 'text-green-400'}`}>{totalAlerts}</div>
          <div className="text-gray-500 text-xs mt-1">{data?.assets.length || 0} assets monitored</div>
        </div>
      </div>

      {/* Latest Deliveries */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Recent Deliveries</h2>
          <Link href="/deliveries" className="text-blue-400 text-sm hover:underline">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs uppercase border-b border-[#1e2a45]">
                <th className="pb-2 text-left">Product</th>
                <th className="pb-2 text-left">Volume</th>
                <th className="pb-2 text-left">Date</th>
                <th className="pb-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {(data?.deliveries || []).slice(0, 5).map(d => (
                <tr key={d.id} className="border-b border-[#1e2a45]/50">
                  <td className="py-2 text-gray-200">{d.product}</td>
                  <td className="py-2 text-gray-300">{Number(d.volume).toLocaleString()} {d.unit}</td>
                  <td className="py-2 text-gray-400">{new Date(d.delivery_date).toLocaleDateString('en-CA')}</td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      d.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                      d.status === 'in_transit' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>{d.status.replace('_', ' ')}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Outstanding Invoices + Asset Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Outstanding Invoices</h2>
            <Link href="/invoices" className="text-blue-400 text-sm hover:underline">View all →</Link>
          </div>
          {outstanding.slice(0, 4).map(inv => (
            <div key={inv.id} className="flex items-center justify-between py-2 border-b border-[#1e2a45]/50">
              <div>
                <div className="text-gray-200 text-sm">INV-{String(inv.id).padStart(4, '0')}</div>
                <div className="text-gray-500 text-xs">Due {new Date(inv.due_date).toLocaleDateString('en-CA')}</div>
              </div>
              <div className="text-right">
                <div className="text-white text-sm font-medium">${Number(inv.total_cad).toLocaleString('en-CA', { maximumFractionDigits: 0 })}</div>
                <span className={`text-xs ${inv.computed_status === 'overdue' ? 'text-red-400' : 'text-amber-400'}`}>
                  {inv.computed_status}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">AI Asset Monitoring</h2>
            <Link href="/monitoring" className="text-blue-400 text-sm hover:underline">View all →</Link>
          </div>
          <div className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-3 mb-3 text-xs text-amber-400">
            ⚠ Live integration unavailable — set OPERATIONS_API_URL to connect
          </div>
          {(data?.assets || []).slice(0, 4).map(a => (
            <div key={a.id} className="flex items-center justify-between py-2 border-b border-[#1e2a45]/50">
              <div>
                <div className="text-gray-200 text-sm">{a.asset_name}</div>
                <div className="text-gray-500 text-xs capitalize">{a.asset_type}</div>
              </div>
              <div className="flex items-center gap-3">
                {a.alert_count > 0 && (
                  <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded">{a.alert_count} alerts</span>
                )}
                <div className={`text-sm font-bold ${a.health_score >= 90 ? 'text-green-400' : a.health_score >= 75 ? 'text-amber-400' : 'text-red-400'}`}>
                  {a.health_score}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
