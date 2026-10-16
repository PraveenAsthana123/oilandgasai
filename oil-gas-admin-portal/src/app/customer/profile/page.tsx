'use client';
export default function ProfilePage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-2">My Profile</h1>
      <p className="text-gray-400 text-sm mb-6">Account details, role, and MFA configuration</p>
      <div className="max-w-lg bg-[#0f1629] border border-[#1e2a45] rounded-xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 text-2xl font-bold">A</div>
          <div>
            <div className="text-white text-xl font-semibold">Admin User</div>
            <div className="text-gray-400 text-sm">admin@oilgas.com</div>
            <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded mt-1 inline-block">admin</span>
          </div>
        </div>
        <div className="space-y-3">
          {[{l:'Name',v:'Admin User'},{l:'Email',v:'admin@oilgas.com'},{l:'Role',v:'Admin'},{l:'MFA',v:'Enabled'},{l:'Last Login',v:new Date().toLocaleString()}].map(f=>(
            <div key={f.l} className="flex items-center justify-between py-2 border-b border-[#1e2a45]">
              <span className="text-gray-400 text-sm">{f.l}</span>
              <span className="text-white text-sm">{f.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
