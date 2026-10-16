'use client';

const USERS = [
  { id: 1, name: 'Alice Chen', email: 'alice.chen@company.com', role: 'sales_rep', status: 'active', deals: 4, revenue: '$4.8M' },
  { id: 2, name: 'Bob Martin', email: 'bob.martin@company.com', role: 'sales_rep', status: 'active', deals: 3, revenue: '$3.2M' },
  { id: 3, name: 'Carol Lee', email: 'carol.lee@company.com', role: 'sales_manager', status: 'active', deals: 6, revenue: '$7.1M' },
  { id: 4, name: 'David Singh', email: 'd.singh@company.com', role: 'admin', status: 'active', deals: 0, revenue: '—' },
];

const roleColors: Record<string, string> = { admin: 'bg-red-900 text-red-300', sales_manager: 'bg-purple-800 text-purple-300', sales_rep: 'bg-blue-800 text-blue-300', viewer: 'bg-slate-700 text-slate-300' };

export default function UsersPage() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-slate-400 text-sm mt-1">Sales team members and access control</p>
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm">+ Invite User</button>
      </div>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 border-b border-[#1e2a45] bg-[#0a0e1a]">
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Role</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Active Deals</th>
              <th className="text-left px-4 py-3">Pipeline</th>
            </tr>
          </thead>
          <tbody>
            {USERS.map(u => (
              <tr key={u.id} className="border-b border-[#1e2a45]/40 hover:bg-[#1e2a45]/20">
                <td className="px-4 py-3 font-medium text-white">{u.name}</td>
                <td className="px-4 py-3 text-slate-400">{u.email}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${roleColors[u.role]}`}>{u.role}</span></td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-xs bg-emerald-800 text-emerald-300">{u.status}</span></td>
                <td className="px-4 py-3 text-slate-300">{u.deals}</td>
                <td className="px-4 py-3 text-emerald-400">{u.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
