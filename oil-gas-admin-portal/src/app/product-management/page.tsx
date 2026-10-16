'use client';
const features = [
  { id: 'F-001', title: 'Real ChromaDB RAG integration', status: 'backlog', priority: 'high', sprint: 'Sprint 2' },
  { id: 'F-002', title: 'Full auth middleware with NextAuth', status: 'backlog', priority: 'high', sprint: 'Sprint 2' },
  { id: 'F-003', title: 'Real-time IoT dashboard via MQTT', status: 'backlog', priority: 'medium', sprint: 'Sprint 3' },
  { id: 'F-004', title: 'Regulatory compliance audit AI assistant', status: 'backlog', priority: 'medium', sprint: 'Sprint 3' },
  { id: 'F-005', title: 'Digital twin asset visualization', status: 'backlog', priority: 'low', sprint: 'Sprint 4' },
];
export default function ProductMgmtPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-2">Product Management</h1>
      <p className="text-gray-400 text-sm mb-6">Roadmap · Feature Backlog · Sprint Board · Product Metrics</p>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-[#1e2a45]">{['ID','Feature','Priority','Sprint','Status'].map(h=><th key={h} className="text-left text-gray-400 text-xs font-medium px-4 py-3 uppercase">{h}</th>)}</tr></thead>
          <tbody>{features.map(f=><tr key={f.id} className="border-b border-[#1e2a45] hover:bg-[#0a0e1a]">
            <td className="px-4 py-3 font-mono text-xs text-gray-400">{f.id}</td>
            <td className="px-4 py-3 text-white text-sm">{f.title}</td>
            <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded ${f.priority==='high'?'bg-red-500/20 text-red-400':f.priority==='medium'?'bg-yellow-500/20 text-yellow-400':'bg-gray-500/20 text-gray-400'}`}>{f.priority}</span></td>
            <td className="px-4 py-3 text-gray-400 text-sm">{f.sprint}</td>
            <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">{f.status}</span></td>
          </tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
