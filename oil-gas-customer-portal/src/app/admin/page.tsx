'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  const [stats, setStats] = useState({ customers: 0, contracts: 0, deliveries: 0, invoices: 0 });

  useEffect(() => {
    Promise.all([
      fetch('/api/contracts').then(r => r.json()),
      fetch('/api/deliveries').then(r => r.json()),
      fetch('/api/invoices').then(r => r.json()),
    ]).then(([c, d, i]) => {
      setStats({ customers: 3, contracts: c.contracts?.length || 0, deliveries: d.deliveries?.length || 0, invoices: i.invoices?.length || 0 });
    });
  }, []);

  const adminLinks = [
    { href: '/admin/users', label: 'Users', icon: '👥', desc: 'Manage customer accounts' },
    { href: '/admin/roles', label: 'Roles', icon: '🔑', desc: 'Permission management' },
    { href: '/admin/audit-log', label: 'Audit Log', icon: '📝', desc: 'All system actions' },
    { href: '/admin/feature-flags', label: 'Feature Flags', icon: '🚩', desc: 'Toggle features per module' },
    { href: '/admin/system-config', label: 'System Config', icon: '⚙️', desc: 'Environment and settings' },
    { href: '/admin/reports', label: 'Admin Reports', icon: '📊', desc: 'Aggregate reporting' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-gray-400 mt-1">System overview and administrative controls</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Customers', value: stats.customers },
          { label: 'Contracts', value: stats.contracts },
          { label: 'Deliveries', value: stats.deliveries },
          { label: 'Invoices', value: stats.invoices },
        ].map(s => (
          <div key={s.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-gray-500 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {adminLinks.map(l => (
          <Link key={l.href} href={l.href} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5 hover:border-blue-600/40 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{l.icon}</span>
              <span className="text-white font-medium">{l.label}</span>
            </div>
            <div className="text-gray-500 text-sm">{l.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
