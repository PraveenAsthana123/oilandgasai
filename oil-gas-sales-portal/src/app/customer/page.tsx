'use client';
import Link from 'next/link';

const customerPages = [
  { href: '/customer/profile', label: 'My Profile', desc: 'Account details and preferences', icon: '👤' },
  { href: '/customer/requests', label: 'My Requests', desc: 'Service requests and proposals', icon: '📬' },
  { href: '/customer/invoices', label: 'Invoices', desc: 'Billing and payment history', icon: '💳' },
  { href: '/customer/documents', label: 'Documents', desc: 'Contracts and agreements', icon: '📁' },
  { href: '/customer/notifications', label: 'Notifications', desc: 'Alerts and updates', icon: '🔔' },
  { href: '/customer/support', label: 'Support', desc: 'Submit and track support tickets', icon: '🎫' },
];

export default function CustomerDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Account</h1>
        <p className="text-slate-400 text-sm mt-1">Customer self-service portal</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customerPages.map(p => (
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
