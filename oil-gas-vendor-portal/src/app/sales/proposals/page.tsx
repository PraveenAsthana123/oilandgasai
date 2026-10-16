'use client';
const proposals = [
  { id: 'PROP-001', title: 'Pipeline Inspection Services Proposal', client: 'Enbridge', value: 380000, status: 'submitted', date: '2026-10-10' },
  { id: 'PROP-002', title: 'Wellsite Maintenance Frame Agreement', client: 'CNRL', value: 920000, status: 'under_review', date: '2026-10-05' },
];
export default function SalesProposalsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Proposals</h1>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm">+ New Proposal</button>
      </div>
      <div className="space-y-3">
        {proposals.map((p) => (
          <div key={p.id} className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
            <div className="flex justify-between">
              <div><div className="text-purple-400 text-xs">{p.id}</div><div className="text-white font-medium">{p.title}</div><div className="text-gray-400 text-sm">{p.client} · ${p.value.toLocaleString()} CAD · {p.date}</div></div>
              <span className={`text-xs px-2 py-0.5 h-fit rounded-full border ${p.status === 'submitted' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700' : 'bg-blue-900/30 text-blue-400 border-blue-700'}`}>{p.status.replace('_', ' ')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
