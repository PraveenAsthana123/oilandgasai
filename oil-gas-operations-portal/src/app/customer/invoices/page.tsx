'use client';
export default function Page() {
  const title = 'customer/invoices'.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Customer Portal';
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">{title === 'Customer' ? 'Customer Portal' : title}</h1>
        <p className="text-gray-400 text-sm mt-1">Customer self-service section</p></div>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-8 text-center">
        <div className="text-4xl mb-3">👤</div>
        <p className="text-gray-400">Customer portal section — ogo_support_ticket table</p>
      </div>
    </div>
  );
}
