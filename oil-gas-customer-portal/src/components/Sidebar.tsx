'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const accountItems = [
  { href: '/', label: 'Dashboard', icon: '⊞' },
  { href: '/profile', label: 'Account Profile', icon: '👤' },
  { href: '/contracts', label: 'My Contracts', icon: '📄' },
  { href: '/deliveries', label: 'Delivery Tracking', icon: '🚛' },
  { href: '/invoices', label: 'Invoices & Billing', icon: '🧾' },
  { href: '/quality-certs', label: 'Quality Certificates', icon: '🏆' },
  { href: '/documents', label: 'My Documents', icon: '📁' },
  { href: '/requests', label: 'Service Requests', icon: '🔧' },
  { href: '/notifications', label: 'Notification Prefs', icon: '🔔' },
  { href: '/support', label: 'Help Center', icon: '💬' },
  { href: '/monitoring', label: 'Asset Monitoring', icon: '📡' },
  { href: '/reports', label: 'My Reports', icon: '📊' },
  { href: '/portal-guide', label: 'Portal Guide', icon: '📖' },
];

const engineeringItems = [
  { href: '/brd', label: 'BRD', icon: '📋' },
  { href: '/product-management', label: 'Product Management', icon: '🗺' },
  { href: '/test-management', label: 'Test Management', icon: '🧪' },
  { href: '/deployment', label: 'Deployment', icon: '🚀' },
  { href: '/code-metrics', label: 'Code Metrics', icon: '📈' },
  { href: '/tech-stack', label: 'Tech Stack', icon: '🔩' },
  { href: '/tools', label: 'Tool Registry', icon: '🛠' },
  { href: '/file-alignment', label: 'File Alignment', icon: '🔗' },
];

const adminItems = [
  { href: '/admin', label: 'Admin Dashboard', icon: '⚡' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/roles', label: 'Roles', icon: '🔑' },
  { href: '/admin/audit-log', label: 'Audit Log', icon: '📝' },
  { href: '/admin/feature-flags', label: 'Feature Flags', icon: '🚩' },
  { href: '/admin/system-config', label: 'System Config', icon: '⚙️' },
  { href: '/admin/reports', label: 'Admin Reports', icon: '📊' },
];

const salesItems = [
  { href: '/sales', label: 'Sales Dashboard', icon: '💼' },
  { href: '/sales/leads', label: 'Leads', icon: '🎯' },
  { href: '/sales/pipeline', label: 'Pipeline', icon: '🔄' },
  { href: '/sales/quotes', label: 'Quotes', icon: '💬' },
  { href: '/sales/proposals', label: 'Proposals', icon: '📄' },
  { href: '/sales/accounts', label: 'Accounts', icon: '🏢' },
  { href: '/sales/activities', label: 'Activities', icon: '📅' },
  { href: '/sales/reports', label: 'Sales Reports', icon: '📈' },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  const linkClass = (href: string) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg mb-1 text-sm transition-colors ${
      isActive(href)
        ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
        : 'text-gray-400 hover:bg-[#1e2a45] hover:text-gray-200'
    }`;

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#0f1629] border-r border-[#1e2a45] flex flex-col overflow-y-auto z-50">
      <div className="p-4 border-b border-[#1e2a45]">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">⛽</div>
          <div>
            <div className="text-blue-400 font-bold text-sm">Oil & Gas Portal</div>
            <div className="text-gray-500 text-xs">Customer Self-Service</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-2">
        <div className="mb-2 px-2 text-xs text-gray-500 uppercase tracking-wider">My Account</div>
        {accountItems.map((item) => (
          <Link key={item.href} href={item.href} className={linkClass(item.href)}>
            <span className="w-5 text-center">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}

        <div className="mt-6 mb-2 px-2 text-xs text-gray-500 uppercase tracking-wider">Platform Engineering</div>
        {engineeringItems.map((item) => (
          <Link key={item.href} href={item.href} className={linkClass(item.href)}>
            <span className="w-5 text-center">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}

        <div className="mt-6 mb-2 px-2 text-xs text-gray-500 uppercase tracking-wider">Admin</div>
        {adminItems.map((item) => (
          <Link key={item.href} href={item.href} className={linkClass(item.href)}>
            <span className="w-5 text-center">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}

        <div className="mt-6 mb-2 px-2 text-xs text-gray-500 uppercase tracking-wider">Sales</div>
        {salesItems.map((item) => (
          <Link key={item.href} href={item.href} className={linkClass(item.href)}>
            <span className="w-5 text-center">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-[#1e2a45]">
        <div className="text-xs text-gray-600">Oil & Gas Customer Portal v1.0</div>
        <div className="text-xs text-gray-700">Port 8385 · ogcu_ prefix</div>
      </div>
    </aside>
  );
}
