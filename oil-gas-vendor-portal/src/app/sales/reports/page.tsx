'use client';
export default function SalesReportsPage() {
  const metrics = [
    { label: 'Total Pipeline Value', value: '$5.4M', change: '+12%' },
    { label: 'Deals Closed YTD', value: '8', change: '+3' },
    { label: 'Average Deal Size', value: '$263K', change: '-5%' },
    { label: 'Win Rate', value: '62%', change: '+8%' },
    { label: 'Avg Sales Cycle', value: '45 days', change: '-3 days' },
    { label: 'Revenue YTD', value: '$2.1M', change: '+18%' },
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Sales Reports</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
            <div className="text-2xl font-bold text-white">{m.value}</div>
            <div className="text-gray-400 text-sm mt-1">{m.label}</div>
            <div className={`text-xs mt-1 ${m.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{m.change} vs last period</div>
          </div>
        ))}
      </div>
    </div>
  );
}
