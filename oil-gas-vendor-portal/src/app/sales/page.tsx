'use client';
export default function SalesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Sales Overview</h1>
      <div className="grid grid-cols-4 gap-4">
        {[{ label: 'Active Leads', value: '5', color: 'border-blue-500' }, { label: 'Pipeline Value', value: '$5.4M', color: 'border-green-500' }, { label: 'Open Quotes', value: '3', color: 'border-yellow-500' }, { label: 'Won YTD', value: '$2.1M', color: 'border-purple-500' }].map((k) => (
          <div key={k.label} className={`bg-[#0f1629] border ${k.color} rounded-lg p-4`}>
            <div className="text-3xl font-bold text-white">{k.value}</div>
            <div className="text-gray-400 text-sm mt-1">{k.label}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[{ href: '/sales/leads', label: '🎯 Leads' }, { href: '/sales/pipeline', label: '📈 Pipeline' }, { href: '/sales/quotes', label: '📋 Quotes' }, { href: '/sales/accounts', label: '🏢 Accounts' }].map((item) => (
          <a key={item.href} href={item.href} className="bg-[#0f1629] border border-[#1e2a45] hover:border-purple-500 rounded-lg p-3 text-center text-white text-sm">{item.label}</a>
        ))}
      </div>
    </div>
  );
}
