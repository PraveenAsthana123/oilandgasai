'use client';
export default function Page() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-2">Sales Accounts</h1>
      <p className="text-gray-400 text-sm mb-6">Sales accounts — management and tracking</p>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-8 text-center">
        <div className="text-gray-500 text-sm">No accounts data found. Initialize the database from the Command Center to seed sample data.</div>
        <a href="/sales/leads" className="text-red-400 hover:text-red-300 text-sm mt-3 block">← Back to Leads</a>
      </div>
    </div>
  );
}
