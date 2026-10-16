'use client';
const ROADMAP = [
  { phase: 'MVP (v1.0)', items: ['Vendor registration', 'RFQ management', 'Bid submission', 'PO tracking', 'Invoice management', 'Compliance docs', 'AI assistant'], status: 'complete' },
  { phase: 'v1.1', items: ['Performance analytics dashboard', 'Milestone tracking', 'Dispute management', 'Market rate benchmarking'], status: 'complete' },
  { phase: 'v1.2 (Planned)', items: ['ERP integration (SAP)', 'Mobile responsive UI', 'DocuSign e-signature', 'Multi-language support'], status: 'planned' },
  { phase: 'v2.0 (Future)', items: ['Supplier diversity tracking', 'Carbon footprint module', 'AI-powered vendor matching', 'Blockchain-based compliance'], status: 'future' },
];
export default function ProductManagementPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Product Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ROADMAP.map((phase) => (
          <div key={phase.phase} className={`bg-[#0f1629] border rounded-lg p-4 ${phase.status === 'complete' ? 'border-green-700' : phase.status === 'planned' ? 'border-yellow-700' : 'border-[#1e2a45]'}`}>
            <div className="flex justify-between items-center mb-3">
              <div className="text-white font-semibold">{phase.phase}</div>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${phase.status === 'complete' ? 'bg-green-900/30 text-green-400 border-green-700' : phase.status === 'planned' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700' : 'bg-gray-800 text-gray-400 border-gray-700'}`}>{phase.status}</span>
            </div>
            <ul className="space-y-1">
              {phase.items.map((item) => <li key={item} className="text-gray-400 text-xs flex gap-2"><span>{phase.status === 'complete' ? '✓' : '○'}</span>{item}</li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
        <h2 className="text-white font-semibold mb-3">Current Sprint — Oct 2026</h2>
        <div className="space-y-2">
          {[{ task: 'Build complete portal with all 30+ pages', status: 'complete' }, { task: 'Wire Ollama AI to all AI endpoints', status: 'complete' }, { task: 'Seed DB with realistic O&G data', status: 'complete' }, { task: 'Standalone Docker build', status: 'complete' }].map((t) => (
            <div key={t.task} className="flex gap-2 text-sm"><span className={t.status === 'complete' ? 'text-green-400' : 'text-yellow-400'}>{t.status === 'complete' ? '✓' : '○'}</span><span className={t.status === 'complete' ? 'text-gray-400 line-through' : 'text-gray-300'}>{t.task}</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}
