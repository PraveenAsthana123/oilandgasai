'use client';

export default function ProfilePage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-white">My Profile</h1>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 text-2xl font-bold">J</div>
          <div>
            <div className="text-xl font-bold text-white">Jennifer Walsh</div>
            <div className="text-sm text-slate-400">Senior Procurement Manager</div>
            <div className="text-xs text-blue-400 mt-0.5">Husky Energy — Upstream</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[['Email', 'j.walsh@husky.ca'], ['Phone', '+1 403-555-0101'], ['Company', 'Husky Energy'], ['Role', 'Procurement Manager'], ['Since', 'January 2024'], ['Account Status', 'Active']].map(([l, v]) => (
            <div key={l as string}>
              <div className="text-xs text-slate-400">{l as string}</div>
              <div className="text-sm text-white mt-0.5">{v as string}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
