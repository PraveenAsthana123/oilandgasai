'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navSections = [
  {
    label: '── Sales ──',
    items: [
      { href: '/', label: '⚡ Command Center' },
      { href: '/leads', label: '👥 Lead Management' },
      { href: '/pipeline', label: '🔄 Opportunity Pipeline' },
      { href: '/quotes', label: '📋 Quote Management' },
      { href: '/proposals', label: '📄 Proposal Builder' },
      { href: '/accounts', label: '🏢 Accounts' },
      { href: '/activities', label: '📅 Activity Log' },
      { href: '/contracts', label: '📝 Contracts' },
      { href: '/pricing', label: '💰 Pricing Engine' },
      { href: '/forecasting', label: '📈 Revenue Forecasting' },
      { href: '/competitors', label: '🎯 Competitive Intel' },
      { href: '/reports', label: '📊 Sales Reports' },
    ],
  },
  {
    label: '── Operations Context ──',
    items: [
      { href: '/streams', label: '🛢️ Stream Product Catalog' },
      { href: '/use-cases', label: '🤖 AI Use Cases' },
      { href: '/roi-calculator', label: '🧮 ROI Calculator' },
    ],
  },
  {
    label: '── Customer Management ──',
    items: [
      { href: '/customers', label: '🏭 Customer Directory' },
      { href: '/customer-360', label: '🔭 Customer 360' },
    ],
  },
  {
    label: '── Engineering ──',
    items: [
      { href: '/brd', label: '📋 BRD' },
      { href: '/product-management', label: '🗂️ Product Mgmt' },
      { href: '/test-management', label: '🧪 Test Management' },
      { href: '/deployment', label: '🚀 Deployment' },
      { href: '/code-metrics', label: '📐 Code Metrics' },
      { href: '/tech-stack', label: '⚙️ Tech Stack' },
      { href: '/tools', label: '🔧 Tools' },
      { href: '/file-alignment', label: '🗃️ File Alignment' },
    ],
  },
  {
    label: '── Admin ──',
    items: [
      { href: '/admin', label: '🛡️ Admin Dashboard' },
      { href: '/admin/users', label: '👤 Users' },
      { href: '/admin/roles', label: '🔑 Roles' },
      { href: '/admin/audit-log', label: '📜 Audit Log' },
      { href: '/admin/feature-flags', label: '🚩 Feature Flags' },
      { href: '/admin/system-config', label: '⚙️ System Config' },
      { href: '/admin/reports', label: '📊 Admin Reports' },
    ],
  },
  {
    label: '── My Account ──',
    items: [
      { href: '/customer', label: '👤 My Dashboard' },
      { href: '/customer/profile', label: '📋 Profile' },
      { href: '/customer/requests', label: '📬 Requests' },
      { href: '/customer/invoices', label: '💳 Invoices' },
      { href: '/customer/documents', label: '📁 Documents' },
      { href: '/customer/notifications', label: '🔔 Notifications' },
      { href: '/customer/support', label: '🎫 Support' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 min-h-screen bg-[#0f1629] border-r border-[#1e2a45] flex flex-col">
      <div className="p-4 border-b border-[#1e2a45]">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⛽</span>
          <div>
            <div className="font-bold text-white text-sm leading-tight">Oil & Gas</div>
            <div className="text-emerald-400 text-xs">Sales Portal</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        {navSections.map((section) => (
          <div key={section.label} className="mb-2">
            <div className="px-4 py-1 text-xs text-slate-500 font-medium uppercase tracking-wider">{section.label}</div>
            {section.items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-1.5 text-sm transition-colors ${
                    active
                      ? 'bg-emerald-500/20 text-emerald-400 border-r-2 border-emerald-500'
                      : 'text-slate-300 hover:bg-[#1e2a45] hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="p-3 border-t border-[#1e2a45] text-xs text-slate-500">
        Oil & Gas Sales Portal v1.0 · Port 8382
      </div>
    </aside>
  );
}
