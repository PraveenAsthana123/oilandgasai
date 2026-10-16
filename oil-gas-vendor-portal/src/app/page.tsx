'use client';
import { useEffect, useState } from 'react';

interface DashData {
  rfq_count: number;
  active_po_value: number;
  pending_invoices: number;
  performance_score: number;
  compliance_alerts: number;
  upcoming_milestones: number;
  recent_pos: { po_number: string; title: string; amount_cad: number; status: string }[];
  recent_invoices: { invoice_number: string; total_cad: number; status: string }[];
}

const statusColor: Record<string, string> = {
  open: 'text-blue-400',
  complete: 'text-green-400',
  'in-progress': 'text-yellow-400',
  issued: 'text-purple-400',
  paid: 'text-green-400',
  submitted: 'text-yellow-400',
  disputed: 'text-red-400',
  approved: 'text-green-400',
};

export default function Dashboard() {
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize DB first, then load data
    fetch('/api/init').then(() => {
      Promise.all([
        fetch('/api/rfq').then((r) => r.json()),
        fetch('/api/purchase-orders').then((r) => r.json()),
        fetch('/api/invoices').then((r) => r.json()),
        fetch('/api/performance').then((r) => r.json()),
        fetch('/api/compliance-docs').then((r) => r.json()),
        fetch('/api/milestones').then((r) => r.json()),
      ]).then(([rfqData, poData, invData, perfData, compData, milData]) => {
        const openRfqs = (rfqData.rfqs || []).filter((r: { status: string }) => r.status === 'open').length;
        const activePOs = (poData.purchase_orders || [])
          .filter((p: { status: string }) => ['issued', 'in-progress'].includes(p.status))
          .reduce((s: number, p: { amount_cad: number }) => s + parseFloat(String(p.amount_cad || 0)), 0);
        const pendingInv = (invData.invoices || []).filter((i: { status: string }) => i.status === 'submitted').length;
        const expiring = (compData.compliance_docs || []).filter((d: { status: string }) => ['expired', 'expiring_soon'].includes(d.status)).length;
        const upcoming = (milData.milestones || []).filter((m: { status: string }) => m.status === 'pending').length;

        setData({
          rfq_count: openRfqs,
          active_po_value: activePOs,
          pending_invoices: pendingInv,
          performance_score: perfData.overall_score || 0,
          compliance_alerts: expiring,
          upcoming_milestones: upcoming,
          recent_pos: (poData.purchase_orders || []).slice(0, 5),
          recent_invoices: (invData.invoices || []).slice(0, 5),
        });
        setLoading(false);
      });
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-purple-400 animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  const kpis = [
    { label: 'Open RFQs', value: data!.rfq_count, unit: '', icon: '📋', color: 'border-blue-500' },
    { label: 'Active POs Value', value: `$${(data!.active_po_value / 1000).toFixed(0)}K`, unit: 'CAD', icon: '📦', color: 'border-purple-500' },
    { label: 'Pending Invoices', value: data!.pending_invoices, unit: '', icon: '🧾', color: 'border-yellow-500' },
    { label: 'Performance Score', value: data!.performance_score.toFixed(1), unit: '/ 5.0', icon: '⭐', color: 'border-green-500' },
    { label: 'Compliance Alerts', value: data!.compliance_alerts, unit: '', icon: '⚠️', color: data!.compliance_alerts > 0 ? 'border-red-500' : 'border-green-500' },
    { label: 'Upcoming Milestones', value: data!.upcoming_milestones, unit: '', icon: '🎯', color: 'border-cyan-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Vendor Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Northern Energy Services — Approved Vendor</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className={`bg-[#0f1629] border ${k.color} rounded-lg p-4`}>
            <div className="text-2xl mb-1">{k.icon}</div>
            <div className="text-2xl font-bold text-white">{k.value}</div>
            {k.unit && <div className="text-xs text-gray-400">{k.unit}</div>}
            <div className="text-xs text-gray-500 mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent POs */}
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
          <h2 className="text-white font-semibold mb-3">Recent Purchase Orders</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-xs">
                <th className="text-left pb-2">PO #</th>
                <th className="text-left pb-2">Title</th>
                <th className="text-right pb-2">Value CAD</th>
                <th className="text-right pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {data!.recent_pos.map((po) => (
                <tr key={po.po_number} className="border-t border-[#1e2a45]">
                  <td className="py-2 text-purple-400">{po.po_number}</td>
                  <td className="py-2 text-gray-300 truncate max-w-[120px]">{po.title}</td>
                  <td className="py-2 text-right text-white">${Number(po.amount_cad).toLocaleString()}</td>
                  <td className={`py-2 text-right capitalize ${statusColor[po.status] || 'text-gray-400'}`}>{po.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Invoices */}
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
          <h2 className="text-white font-semibold mb-3">Recent Invoices</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-xs">
                <th className="text-left pb-2">Invoice #</th>
                <th className="text-right pb-2">Total CAD</th>
                <th className="text-right pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {data!.recent_invoices.map((inv) => (
                <tr key={inv.invoice_number} className="border-t border-[#1e2a45]">
                  <td className="py-2 text-purple-400">{inv.invoice_number}</td>
                  <td className="py-2 text-right text-white">${Number(inv.total_cad).toLocaleString()}</td>
                  <td className={`py-2 text-right capitalize ${statusColor[inv.status] || 'text-gray-400'}`}>{inv.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
        <h2 className="text-white font-semibold mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { href: '/rfq', label: '📋 View Open RFQs' },
            { href: '/invoices', label: '🧾 Submit Invoice' },
            { href: '/compliance', label: '📄 Update Compliance Docs' },
            { href: '/bids', label: '🏷️ My Bids' },
            { href: '/performance', label: '⭐ Performance Scorecard' },
            { href: '/ai-assistant', label: '🤖 AI Assistant' },
          ].map((action) => (
            <a
              key={action.href}
              href={action.href}
              className="bg-[#1e2a45] hover:bg-purple-900/30 hover:border-purple-500 border border-[#1e2a45] text-white text-sm px-4 py-2 rounded-lg transition-colors"
            >
              {action.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
