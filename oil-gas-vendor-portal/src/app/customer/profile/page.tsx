'use client';
export default function CustomerProfilePage() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-white">My Profile</h1>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-purple-900/50 rounded-full flex items-center justify-center text-3xl">👤</div>
          <div><div className="text-white font-semibold text-lg">John Smith</div><div className="text-gray-400">Procurement Manager</div></div>
        </div>
        {[['Email', 'j.smith@northernenergy.ca'], ['Phone', '+1 (780) 555-0123'], ['Company', 'Northern Energy Services'], ['Role', 'Vendor Representative']].map(([k, v]) => (
          <div key={k} className="flex justify-between py-2 border-b border-[#1e2a45]">
            <span className="text-gray-400 text-sm">{k}</span><span className="text-white text-sm">{v}</span>
          </div>
        ))}
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg text-sm">Edit Profile</button>
      </div>
    </div>
  );
}
