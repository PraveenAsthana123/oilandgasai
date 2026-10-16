'use client';
const quotes = [
  { id: 'QUO-001', client: 'Syncrude Canada', value: 850000, status: 'sent', expiry: '2026-11-15' },
  { id: 'QUO-002', client: 'Pembina Pipeline', value: 320000, status: 'accepted', expiry: '2026-10-31' },
  { id: 'QUO-003', client: 'Cenovus Energy', value: 1250000, status: 'draft', expiry: '2026-12-01' },
];
export default function SalesQuotesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Quotes</h1>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm">+ New Quote</button>
      </div>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#1e2a45]"><tr>{['Quote #', 'Client', 'Value CAD', 'Expiry', 'Status'].map((h) => <th key={h} className="text-left px-4 py-3 text-gray-400 text-xs">{h}</th>)}</tr></thead>
          <tbody>
            {quotes.map((q) => (
              <tr key={q.id} className="border-t border-[#1e2a45]">
                <td className="px-4 py-3 text-purple-400">{q.id}</td>
                <td className="px-4 py-3 text-white">{q.client}</td>
                <td className="px-4 py-3 text-white font-medium">${q.value.toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-400">{q.expiry}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full border ${q.status === 'accepted' ? 'bg-green-900/30 text-green-400 border-green-700' : q.status === 'sent' ? 'bg-blue-900/30 text-blue-400 border-blue-700' : 'bg-gray-800 text-gray-400 border-gray-700'}`}>{q.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
