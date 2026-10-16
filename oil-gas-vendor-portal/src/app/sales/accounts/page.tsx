'use client';
const accounts = [
  { name: 'Enbridge Inc.', type: 'Midstream', revenue: 2400000, contacts: 3, status: 'active' },
  { name: 'CNRL', type: 'Upstream E&P', revenue: 1800000, contacts: 5, status: 'active' },
  { name: 'Cenovus Energy', type: 'Integrated', revenue: 950000, contacts: 2, status: 'prospect' },
  { name: 'TC Energy', type: 'Midstream', revenue: 1200000, contacts: 4, status: 'active' },
];
export default function SalesAccountsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Accounts</h1>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#1e2a45]"><tr>{['Account', 'Type', 'Annual Revenue CAD', 'Contacts', 'Status'].map((h) => <th key={h} className="text-left px-4 py-3 text-gray-400 text-xs">{h}</th>)}</tr></thead>
          <tbody>
            {accounts.map((a) => (
              <tr key={a.name} className="border-t border-[#1e2a45]">
                <td className="px-4 py-3 text-white font-medium">{a.name}</td>
                <td className="px-4 py-3 text-gray-400">{a.type}</td>
                <td className="px-4 py-3 text-white">${a.revenue.toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-300">{a.contacts}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full border ${a.status === 'active' ? 'bg-green-900/30 text-green-400 border-green-700' : 'bg-yellow-900/30 text-yellow-400 border-yellow-700'}`}>{a.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
