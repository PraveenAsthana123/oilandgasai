'use client';
import Link from 'next/link';

const adminPages = [
  { href: '/admin/users', label: 'User Management', desc: 'Manage sales reps, managers, admins', icon: '👤' },
  { href: '/admin/roles', label: 'Roles & Permissions', desc: 'Role-based access control', icon: '🔑' },
  { href: '/admin/audit-log', label: 'Audit Log', desc: 'All system actions tracked', icon: '📜' },
  { href: '/admin/feature-flags', label: 'Feature Flags', desc: 'Toggle features per tenant', icon: '🚩' },
  { href: '/admin/system-config', label: 'System Config', desc: 'Portal configuration', icon: '⚙️' },
  { href: '/admin/reports', label: 'Admin Reports', desc: 'Usage and activity reports', icon: '📊' },
];

export default function AdminPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">System administration — Oil & Gas Sales Portal</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {adminPages.map(p => (
          <Link key={p.href} href={p.href} className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4 hover:border-emerald-500/40 transition-colors">
            <div className="text-2xl mb-2">{p.icon}</div>
            <div className="font-semibold text-white">{p.label}</div>
            <div className="text-xs text-slate-400 mt-1">{p.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
