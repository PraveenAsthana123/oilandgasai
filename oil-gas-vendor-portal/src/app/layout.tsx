'use client';
import './globals.css';
import Link from 'next/link';
import { useState } from 'react';

const navSections = [
  {
    label: 'Vendor Self-Service',
    icon: '🏭',
    items: [
      { href: '/', label: 'Dashboard' },
      { href: '/profile', label: 'My Profile' },
      { href: '/registration', label: 'Registration' },
      { href: '/rfq', label: 'RFQ / RFP' },
      { href: '/bids', label: 'My Bids' },
      { href: '/purchase-orders', label: 'Purchase Orders' },
      { href: '/invoices', label: 'Invoices' },
      { href: '/performance', label: 'Performance' },
      { href: '/compliance', label: 'Compliance Docs' },
      { href: '/safety', label: 'Safety Pre-Qual' },
      { href: '/contracts', label: 'My Contracts' },
      { href: '/disputes', label: 'Disputes' },
      { href: '/milestones', label: 'Milestones' },
      { href: '/documents', label: 'Documents' },
      { href: '/notifications', label: 'Notifications' },
      { href: '/support', label: 'Support' },
    ],
  },
  {
    label: 'Procurement Intel',
    icon: '📊',
    items: [
      { href: '/market-rates', label: 'Market Rate Benchmarking' },
      { href: '/ai-assistant', label: 'AI Assistant' },
    ],
  },
  {
    label: 'My Account',
    icon: '👤',
    items: [
      { href: '/customer', label: 'Overview' },
      { href: '/customer/profile', label: 'Profile' },
      { href: '/customer/requests', label: 'Requests' },
      { href: '/customer/invoices', label: 'Invoices' },
      { href: '/customer/documents', label: 'Documents' },
      { href: '/customer/notifications', label: 'Notifications' },
      { href: '/customer/support', label: 'Support' },
    ],
  },
  {
    label: 'Sales',
    icon: '💼',
    items: [
      { href: '/sales', label: 'Overview' },
      { href: '/sales/leads', label: 'Leads' },
      { href: '/sales/pipeline', label: 'Pipeline' },
      { href: '/sales/quotes', label: 'Quotes' },
      { href: '/sales/proposals', label: 'Proposals' },
      { href: '/sales/accounts', label: 'Accounts' },
      { href: '/sales/activities', label: 'Activities' },
      { href: '/sales/reports', label: 'Reports' },
    ],
  },
  {
    label: 'Admin',
    icon: '⚙️',
    items: [
      { href: '/admin', label: 'Admin Dashboard' },
      { href: '/admin/users', label: 'Users' },
      { href: '/admin/roles', label: 'Roles' },
      { href: '/admin/audit-log', label: 'Audit Log' },
      { href: '/admin/feature-flags', label: 'Feature Flags' },
      { href: '/admin/system-config', label: 'System Config' },
      { href: '/admin/reports', label: 'Reports' },
    ],
  },
  {
    label: 'Platform Engineering',
    icon: '🔧',
    items: [
      { href: '/brd', label: 'BRD' },
      { href: '/product-management', label: 'Product Management' },
      { href: '/test-management', label: 'Test Management' },
      { href: '/deployment', label: 'Deployment' },
      { href: '/code-metrics', label: 'Code Metrics' },
      { href: '/tech-stack', label: 'Tech Stack' },
      { href: '/tools', label: 'Tool Registry' },
      { href: '/file-alignment', label: 'File Alignment' },
    ],
  },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggle = (label: string) =>
    setCollapsed((p) => ({ ...p, [label]: !p[label] }));

  return (
    <html lang="en">
      <body className="flex min-h-screen bg-[#0a0e1a] text-white">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-14'
          } flex-shrink-0 bg-[#0f1629] border-r border-[#1e2a45] flex flex-col transition-all duration-300 overflow-hidden`}
        >
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-[#1e2a45]">
            {sidebarOpen && (
              <div>
                <div className="text-purple-400 font-bold text-sm">⛽ OGV Portal</div>
                <div className="text-gray-500 text-xs">Oil & Gas Vendor</div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-400 hover:text-white p-1 rounded"
            >
              {sidebarOpen ? '◀' : '▶'}
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto py-2">
            {navSections.map((section) => (
              <div key={section.label} className="mb-1">
                <button
                  onClick={() => toggle(section.label)}
                  className="w-full flex items-center justify-between px-4 py-2 text-xs text-gray-400 hover:text-white uppercase tracking-wider"
                >
                  <span>
                    {section.icon} {sidebarOpen ? section.label : ''}
                  </span>
                  {sidebarOpen && (
                    <span>{collapsed[section.label] ? '▶' : '▼'}</span>
                  )}
                </button>
                {!collapsed[section.label] &&
                  section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center px-4 py-1.5 text-sm text-gray-300 hover:bg-[#1e2a45] hover:text-purple-300 transition-colors"
                    >
                      {sidebarOpen ? item.label : item.label[0]}
                    </Link>
                  ))}
              </div>
            ))}
          </nav>

          {/* Footer */}
          {sidebarOpen && (
            <div className="p-3 border-t border-[#1e2a45] text-xs text-gray-500">
              OGV Portal v1.0 · Port 8386
            </div>
          )}
        </aside>

        {/* Main */}
        <main className="flex-1 flex flex-col overflow-auto">
          <header className="bg-[#0f1629] border-b border-[#1e2a45] px-6 py-3 flex items-center justify-between">
            <h1 className="text-purple-400 font-semibold text-sm">Oil & Gas Vendor Portal</h1>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="bg-green-900/30 text-green-400 px-2 py-0.5 rounded-full border border-green-800">
                ● Connected
              </span>
              <span>vendor@oilgas.com</span>
            </div>
          </header>
          <div className="flex-1 p-6">{children}</div>
        </main>
      </body>
    </html>
  );
}
