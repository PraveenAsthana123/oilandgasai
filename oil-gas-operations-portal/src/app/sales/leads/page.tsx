'use client';
export default function Page() {
  const title = 'sales/leads'.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">{title}</h1>
        <p className="text-gray-400 text-sm mt-1">Sales section — ogo_lead / ogo_opportunity tables</p></div>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-8 text-center">
        <div className="text-4xl mb-3">💼</div>
        <p className="text-gray-400">Sales data from ogo_lead and ogo_opportunity tables. Add data via POST /api/sales.</p>
      </div>
    </div>
  );
}
