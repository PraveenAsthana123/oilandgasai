'use client';
export default function CustomerRequestsPage() {
  const requests = [
    { id: 'REQ-001', subject: 'RFQ Extension Request', status: 'open', date: '2026-10-14' },
    { id: 'REQ-002', subject: 'Compliance Document Renewal', status: 'resolved', date: '2026-10-05' },
    { id: 'REQ-003', subject: 'Invoice Query - INV-2026-005', status: 'pending', date: '2026-10-12' },
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">My Requests</h1>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#1e2a45]"><tr>{['ID', 'Subject', 'Date', 'Status'].map((h) => <th key={h} className="text-left px-4 py-3 text-gray-400 text-xs">{h}</th>)}</tr></thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-t border-[#1e2a45]">
                <td className="px-4 py-3 text-purple-400">{r.id}</td>
                <td className="px-4 py-3 text-white">{r.subject}</td>
                <td className="px-4 py-3 text-gray-400">{r.date}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full border ${r.status === 'resolved' ? 'bg-green-900/30 text-green-400 border-green-700' : r.status === 'open' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700' : 'bg-blue-900/30 text-blue-400 border-blue-700'}`}>{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
