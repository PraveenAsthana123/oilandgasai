'use client';
import { useEffect, useState } from 'react';

interface Summary { vendors: Record<string, string>; rfqs: Record<string, string>; bids: Record<string, string>; purchase_orders: Record<string, string>; invoices: Record<string, string>; disputes: Record<string, string>; }

export default function AdminDashboard() {
  const [data, setData] = useState<Summary | null>(null);

  useEffect(() => {
    fetch('/api/admin/reports').then((r) => r.json()).then((d) => setData(d.summary));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Platform overview — vendor management and procurement intelligence</p>
      </div>

      {data && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'Total Vendors', value: data.vendors.count, sub: `${data.vendors.approved} approved`, color: 'border-purple-500' },
            { label: 'Active RFQs', value: data.rfqs.open, sub: `${data.rfqs.count} total`, color: 'border-blue-500' },
            { label: 'Total Bids', value: data.bids.count, sub: `$${Number(data.bids.total_value || 0).toLocaleString()} CAD`, color: 'border-cyan-500' },
            { label: 'Purchase Orders', value: data.purchase_orders.count, sub: `${data.purchase_orders.complete} complete`, color: 'border-green-500' },
            { label: 'Invoices', value: data.invoices.count, sub: `${data.invoices.paid} paid`, color: 'border-yellow-500' },
            { label: 'Open Disputes', value: data.disputes.open, sub: `${data.disputes.count} total`, color: 'border-red-500' },
          ].map((k) => (
            <div key={k.label} className={`bg-[#0f1629] border ${k.color} rounded-lg p-4`}>
              <div className="text-3xl font-bold text-white">{k.value}</div>
              <div className="text-xs text-gray-500 mt-1">{k.sub}</div>
              <div className="text-gray-400 text-sm mt-2">{k.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {[
          { href: '/admin/users', label: '👥 Manage Users', desc: 'View and manage vendor accounts' },
          { href: '/admin/roles', label: '🔑 Roles & Permissions', desc: 'Configure role-based access' },
          { href: '/admin/audit-log', label: '📋 Audit Log', desc: 'System activity and changes' },
          { href: '/admin/feature-flags', label: '🚩 Feature Flags', desc: 'Toggle features on/off' },
          { href: '/admin/system-config', label: '⚙️ System Config', desc: 'View system configuration' },
          { href: '/admin/reports', label: '📊 Reports', desc: 'Platform analytics and exports' },
        ].map((item) => (
          <a key={item.href} href={item.href}
            className="bg-[#0f1629] border border-[#1e2a45] hover:border-purple-500 rounded-lg p-4 transition-colors">
            <div className="text-white font-medium">{item.label}</div>
            <div className="text-gray-500 text-sm mt-1">{item.desc}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
