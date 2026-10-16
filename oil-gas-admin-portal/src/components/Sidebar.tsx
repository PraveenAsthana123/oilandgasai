'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const nav = [
  {
    section: 'Operations Admin',
    items: [
      { label: 'Command Center', href: '/', icon: '⚡' },
      { label: 'Users', href: '/users', icon: '👥' },
      { label: 'Roles & Permissions', href: '/roles', icon: '🔐' },
      { label: 'Audit Log', href: '/audit-log', icon: '📋' },
      { label: 'Feature Flags', href: '/feature-flags', icon: '🚩' },
      { label: 'System Config', href: '/system-config', icon: '⚙️' },
      { label: 'Reports', href: '/reports', icon: '📊' },
      { label: 'Approvals', href: '/approvals', icon: '✅' },
      { label: 'Sessions', href: '/sessions', icon: '🖥️' },
    ],
  },
  {
    section: 'Regulatory & Compliance',
    items: [
      { label: 'Compliance Dashboard', href: '/regulatory', icon: '🏛️' },
      { label: 'Permits & Licenses', href: '/permits', icon: '📄' },
      { label: 'Safety Incidents', href: '/incidents', icon: '⚠️' },
      { label: 'Inspections', href: '/inspections', icon: '🔍' },
      { label: 'Environmental (EMS)', href: '/ems', icon: '🌿' },
      { label: 'Standards Library', href: '/standards', icon: '📚' },
    ],
  },
  {
    section: 'AI Governance',
    items: [
      { label: 'Model Governance', href: '/ai-governance', icon: '🤖' },
      { label: 'AI Risk Register', href: '/ai-risk', icon: '🎯' },
      { label: 'Data Governance', href: '/data-governance', icon: '🗄️' },
      { label: 'Integrations', href: '/integrations', icon: '🔗' },
    ],
  },
  {
    section: 'Platform Engineering',
    items: [
      { label: 'BRD', href: '/brd', icon: '📝' },
      { label: 'Product Management', href: '/product-management', icon: '🗺️' },
      { label: 'Test Management', href: '/test-management', icon: '🧪' },
      { label: 'Deployment', href: '/deployment', icon: '🚀' },
      { label: 'Code Metrics', href: '/code-metrics', icon: '💻' },
      { label: 'Tech Stack', href: '/tech-stack', icon: '🔧' },
      { label: 'Tools', href: '/tools', icon: '🛠️' },
      { label: 'File Alignment', href: '/file-alignment', icon: '📐' },
    ],
  },
  {
    section: 'Admin',
    items: [
      { label: 'Admin Overview', href: '/admin', icon: '🏠' },
      { label: 'Admin Users', href: '/admin/users', icon: '👤' },
      { label: 'Admin Roles', href: '/admin/roles', icon: '🔑' },
      { label: 'Admin Audit', href: '/admin/audit-log', icon: '🗒️' },
      { label: 'Feature Flags', href: '/admin/feature-flags', icon: '🏳️' },
      { label: 'System Config', href: '/admin/system-config', icon: '⚙️' },
      { label: 'Admin Reports', href: '/admin/reports', icon: '📈' },
    ],
  },
  {
    section: 'My Account',
    items: [
      { label: 'Profile', href: '/customer/profile', icon: '👤' },
      { label: 'Requests', href: '/customer/requests', icon: '📬' },
      { label: 'Invoices', href: '/customer/invoices', icon: '💰' },
      { label: 'Documents', href: '/customer/documents', icon: '📁' },
      { label: 'Notifications', href: '/customer/notifications', icon: '🔔' },
      { label: 'Support', href: '/customer/support', icon: '💬' },
    ],
  },
  {
    section: 'Sales',
    items: [
      { label: 'Sales Overview', href: '/sales', icon: '💼' },
      { label: 'Leads', href: '/sales/leads', icon: '🎯' },
      { label: 'Pipeline', href: '/sales/pipeline', icon: '📈' },
      { label: 'Quotes', href: '/sales/quotes', icon: '💲' },
      { label: 'Proposals', href: '/sales/proposals', icon: '📋' },
      { label: 'Accounts', href: '/sales/accounts', icon: '🏢' },
      { label: 'Activities', href: '/sales/activities', icon: '📅' },
      { label: 'Sales Reports', href: '/sales/reports', icon: '📊' },
    ],
  },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-[#0f1629] border-r border-[#1e2a45] flex flex-col overflow-y-auto">
      <div className="p-4 border-b border-[#1e2a45]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center text-white font-bold text-sm">OG</div>
          <div>
            <div className="text-white font-semibold text-sm">Oil &amp; Gas Admin</div>
            <div className="text-gray-400 text-xs">Enterprise Portal</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-2">
        {nav.map(group => (
          <div key={group.section} className="mb-4">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1">{group.section}</div>
            {group.items.map(item => {
              const active = path === item.href || (item.href !== '/' && path.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm mb-0.5 transition-colors ${
                    active
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'text-gray-300 hover:bg-[#1e2a45] hover:text-white'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="p-3 border-t border-[#1e2a45]">
        <div className="text-xs text-gray-500">v1.0.0 · Port 8383</div>
      </div>
    </aside>
  );
}
