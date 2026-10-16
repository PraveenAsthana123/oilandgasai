'use client';
export default function Page() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-2">Notifications</h1>
      <p className="text-gray-400 text-sm mb-6">Customer self-service — notifications management</p>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-8 text-center">
        <div className="text-gray-500 text-sm">No notifications found. Initialize the database from the Command Center to seed sample data.</div>
      </div>
    </div>
  );
}
