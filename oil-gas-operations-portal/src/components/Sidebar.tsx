'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const overviewItems = [
  { href: '/', label: 'Command Center', icon: '⚡' },
  { href: '/use-cases', label: 'Use Case Registry', icon: '📋' },
  { href: '/departments', label: 'Department Directory', icon: '🏢' },
  { href: '/ai-mapping', label: 'AI Technology Mapping', icon: '🗺️' },
  { href: '/bot', label: 'AI Bot Assistant', icon: '🤖' },
  { href: '/rag', label: 'RAG Knowledge Base', icon: '📚' },
  { href: '/jobs', label: 'Jobs / Demo Runner', icon: '⚙️' },
  { href: '/historical-db', label: 'Historical DB Viewer', icon: '📊' },
  { href: '/graphs', label: 'Graph Visualization', icon: '🕸️' },
  { href: '/logs', label: 'Logs & Tracking', icon: '📋' },
];

const upstreamItems = [
  { href: '/upstream', label: 'Upstream Dashboard', icon: '🛢️' },
  { href: '/upstream/exploration', label: 'Seismic & Exploration', icon: '🔭' },
  { href: '/upstream/drilling', label: 'Drilling Operations', icon: '⚙️' },
  { href: '/upstream/reservoir', label: 'Reservoir Management', icon: '🧪' },
  { href: '/upstream/production', label: 'Production Engineering', icon: '📊' },
  { href: '/upstream/well-integrity', label: 'Well Integrity', icon: '🔩' },
  { href: '/upstream/hse', label: 'HSE Management', icon: '⛑️' },
];

const midstreamItems = [
  { href: '/midstream', label: 'Midstream Dashboard', icon: '🔗' },
  { href: '/midstream/pipeline', label: 'Pipeline Operations', icon: '〰️' },
  { href: '/midstream/compression', label: 'Compression Mgmt', icon: '🔄' },
  { href: '/midstream/gas-processing', label: 'Gas Processing', icon: '💨' },
  { href: '/midstream/storage', label: 'Storage Operations', icon: '🗄️' },
  { href: '/midstream/scada', label: 'SCADA & Control', icon: '🖥️' },
  { href: '/midstream/metering', label: 'Custody Transfer Metering', icon: '📏' },
];

const downstreamItems = [
  { href: '/downstream', label: 'Downstream Dashboard', icon: '🏭' },
  { href: '/downstream/refining', label: 'Refinery Operations', icon: '⚗️' },
  { href: '/downstream/process', label: 'Process Optimization', icon: '🔬' },
  { href: '/downstream/quality', label: 'Product Quality', icon: '✅' },
  { href: '/downstream/distribution', label: 'Distribution & Logistics', icon: '🚛' },
  { href: '/downstream/trading', label: 'Commercial & Trading', icon: '📈' },
  { href: '/downstream/environmental', label: 'Environmental Compliance', icon: '🌱' },
];

const aiItems = [
  { href: '/ai/digital-twin', label: 'Digital Twin Hub', icon: '🤖' },
  { href: '/ai/iot-sensors', label: 'IoT Sensor Network', icon: '📡' },
  { href: '/ai/computer-vision', label: 'Computer Vision Center', icon: '👁️' },
  { href: '/ai/image-classification', label: 'Image Classification', icon: '🖼️' },
  { href: '/ai/object-detection', label: 'Object Detection', icon: '🎯' },
  { href: '/ai/segmentation', label: 'Image Segmentation', icon: '🗂️' },
  { href: '/ai/noise-cleaning', label: 'Signal Noise Cleaning', icon: '🌊' },
  { href: '/ai/statistical-ml', label: 'Statistical ML Models', icon: '📉' },
  { href: '/ai/machine-learning', label: 'ML Models', icon: '🧠' },
  { href: '/ai/rag', label: 'RAG Knowledge Base', icon: '📚' },
  { href: '/ai/agents', label: 'Agentic AI', icon: '🕵️' },
  { href: '/ai/expai', label: 'ExpAI Center', icon: '🔬' },
  { href: '/ai/resai', label: 'ResAI Center', icon: '🛡️' },
  { href: '/ai/conversational', label: 'Conversational AI', icon: '💬' },
  { href: '/ai/generative', label: 'Generative AI', icon: '✨' },
];

const dataItems = [
  { href: '/data/pipeline', label: 'Data Pipeline', icon: '🔀' },
  { href: '/data/types', label: 'Data Types Registry', icon: '📦' },
  { href: '/data/visualization', label: 'Visualization Studio', icon: '📊' },
  { href: '/data/feature-engineering', label: 'Feature Engineering', icon: '⚒️' },
  { href: '/data/normalization', label: 'Normalization & Scaling', icon: '⚖️' },
  { href: '/data/quality', label: 'Data Quality', icon: '🔍' },
];

const engineeringItems = [
  { href: '/brd', label: 'BRD', icon: '📄' },
  { href: '/product-management', label: 'Product Management', icon: '🗂' },
  { href: '/test-management', label: 'Test Management', icon: '🧪' },
  { href: '/deployment', label: 'Deployment', icon: '🚀' },
  { href: '/code-metrics', label: 'Code Metrics', icon: '📐' },
  { href: '/tech-stack', label: 'Tech Stack', icon: '🛠️' },
  { href: '/tools', label: 'Tool Registry', icon: '🔧' },
  { href: '/file-alignment', label: 'File Alignment', icon: '🔗' },
];

const adminItems = [
  { href: '/admin', label: 'Admin Hub', icon: '⚡' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/roles', label: 'Roles', icon: '🔑' },
  { href: '/admin/audit-log', label: 'Audit Log', icon: '📝' },
  { href: '/admin/feature-flags', label: 'Feature Flags', icon: '🚩' },
  { href: '/admin/system-config', label: 'System Config', icon: '⚙️' },
  { href: '/admin/reports', label: 'Reports', icon: '📊' },
];

const customerItems = [
  { href: '/customer', label: 'Customer Portal', icon: '🏠' },
  { href: '/customer/profile', label: 'Profile', icon: '👤' },
  { href: '/customer/requests', label: 'Requests', icon: '📬' },
  { href: '/customer/invoices', label: 'Invoices', icon: '🧾' },
  { href: '/customer/documents', label: 'Documents', icon: '📁' },
  { href: '/customer/notifications', label: 'Notifications', icon: '🔔' },
  { href: '/customer/support', label: 'Support', icon: '🆘' },
];

const salesItems = [
  { href: '/sales', label: 'Sales Hub', icon: '💼' },
  { href: '/sales/leads', label: 'Leads', icon: '🎯' },
  { href: '/sales/pipeline', label: 'Pipeline', icon: '📊' },
  { href: '/sales/quotes', label: 'Quotes', icon: '💬' },
  { href: '/sales/proposals', label: 'Proposals', icon: '📄' },
  { href: '/sales/accounts', label: 'Accounts', icon: '🏢' },
  { href: '/sales/activities', label: 'Activities', icon: '📅' },
  { href: '/sales/reports', label: 'Reports', icon: '📈' },
];

type NavItem = { href: string; label: string; icon: string };

function NavSection({ title, items, pathname }: { title: string; items: NavItem[]; pathname: string }) {
  return (
    <div className="mb-4">
      <div className="mb-1 px-2 text-xs text-amber-500/70 uppercase tracking-wider font-semibold">{title}</div>
      {items.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        return (
          <Link key={item.href} href={item.href}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg mb-0.5 text-xs transition-colors ${
              isActive
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-gray-400 hover:bg-[#1e2a45] hover:text-gray-200'
            }`}>
            <span className="w-4 text-center">{item.icon}</span>
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-[#0a0e1a] border-r border-[#1e2a45] flex flex-col overflow-y-auto z-50">
      <div className="p-4 border-b border-[#1e2a45] flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center text-black font-bold text-sm">⛽</div>
          <div>
            <div className="text-amber-400 font-bold text-sm">Oil & Gas Portal</div>
            <div className="text-gray-500 text-xs">Operations Command Center</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-3 px-2 overflow-y-auto">
        <NavSection title="── Overview ──" items={overviewItems} pathname={pathname} />
        <NavSection title="── Upstream ──" items={upstreamItems} pathname={pathname} />
        <NavSection title="── Midstream ──" items={midstreamItems} pathname={pathname} />
        <NavSection title="── Downstream ──" items={downstreamItems} pathname={pathname} />
        <NavSection title="── AI / ML ──" items={aiItems} pathname={pathname} />
        <NavSection title="── Data ──" items={dataItems} pathname={pathname} />
        <NavSection title="── Engineering ──" items={engineeringItems} pathname={pathname} />
        <NavSection title="── Admin ──" items={adminItems} pathname={pathname} />
        <NavSection title="── Customer ──" items={customerItems} pathname={pathname} />
        <NavSection title="── Sales ──" items={salesItems} pathname={pathname} />
      </nav>

      <div className="p-3 border-t border-[#1e2a45] flex-shrink-0">
        <div className="text-xs text-gray-600">Oil & Gas Operations Portal v1.0</div>
        <div className="text-xs text-gray-700">Port 8384 · ogo_ prefix</div>
      </div>
    </aside>
  );
}
