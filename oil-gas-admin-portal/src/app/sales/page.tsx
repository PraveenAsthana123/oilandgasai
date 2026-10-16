'use client';
import Link from 'next/link';
const pages = [
  { href: '/sales/leads', label: 'Leads', desc: 'New and qualified leads from oil & gas companies' },
  { href: '/sales/pipeline', label: 'Pipeline', desc: 'Active opportunities by stage' },
  { href: '/sales/quotes', label: 'Quotes', desc: 'Quote builder and pricing' },
  { href: '/sales/proposals', label: 'Proposals', desc: 'Proposal builder and tracking' },
  { href: '/sales/accounts', label: 'Accounts', desc: 'Customer accounts and contacts' },
  { href: '/sales/activities', label: 'Activities', desc: 'Calls, emails, meetings, tasks' },
  { href: '/sales/reports', label: 'Sales Reports', desc: 'Pipeline value, win rate, revenue by account' },
];
export default function SalesPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-2">Sales Overview</h1>
      <p className="text-gray-400 text-sm mb-6">Sales section — leads, pipeline, quotes, proposals, accounts, activities</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pages.map(p => (
          <Link key={p.href} href={p.href} className="bg-[#0f1629] border border-[#1e2a45] hover:border-red-500/40 rounded-xl p-5 transition-colors">
            <div className="text-white font-medium mb-1">{p.label}</div>
            <div className="text-gray-400 text-sm">{p.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
