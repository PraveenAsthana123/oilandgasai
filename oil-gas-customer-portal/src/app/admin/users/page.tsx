'use client';

const USERS = [
  { id: 1, name: 'James Whitfield', email: 'j.whitfield@suncor-demo.ca', company: 'Suncor Energy Inc.', role: 'customer', status: 'active', last_login: '2026-10-15' },
  { id: 2, name: 'Sandra Kowalski', email: 's.kowalski@imperialoil-demo.ca', company: 'Imperial Oil Ltd.', role: 'customer', status: 'active', last_login: '2026-10-14' },
  { id: 3, name: 'Raj Mehta', email: 'r.mehta@cnr-demo.ca', company: 'Canadian Natural Resources', role: 'customer', status: 'active', last_login: '2026-10-13' },
  { id: 4, name: 'Admin User', email: 'admin@oilgasportal.ca', company: 'Internal', role: 'admin', status: 'active', last_login: '2026-10-16' },
];

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-gray-400 mt-1">Customer accounts and access control</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">+ Add User</button>
      </div>

      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e2a45] text-gray-500 text-xs uppercase">
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Company</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Last Login</th>
            </tr>
          </thead>
          <tbody>
            {USERS.map(u => (
              <tr key={u.id} className="border-b border-[#1e2a45]/50 hover:bg-[#1e2a45]/30">
                <td className="px-4 py-3">
                  <div className="text-gray-200 font-medium">{u.name}</div>
                  <div className="text-gray-500 text-xs">{u.email}</div>
                </td>
                <td className="px-4 py-3 text-gray-400">{u.company}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>{u.role}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-green-400 text-xs">● {u.status}</span>
                </td>
                <td className="px-4 py-3 text-gray-500">{u.last_login}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
