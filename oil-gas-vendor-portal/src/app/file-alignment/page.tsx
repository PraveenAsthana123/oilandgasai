'use client';
export default function FileAlignmentPage() {
  const apiContracts = [
    { endpoint: 'GET /api/health', response: '{ status, portal, version, db }', breaking: false },
    { endpoint: 'GET /api/vendors', response: '{ vendors: [] }', breaking: false },
    { endpoint: 'POST /api/vendors', response: '{ vendor }', breaking: false },
    { endpoint: 'GET /api/rfq', response: '{ rfqs: [] }', breaking: false },
    { endpoint: 'POST /api/rfq', response: '{ rfq }', breaking: false },
    { endpoint: 'GET /api/bids', response: '{ bids: [] }', breaking: false },
    { endpoint: 'POST /api/bids', response: '{ bid }', breaking: false },
    { endpoint: 'GET /api/purchase-orders', response: '{ purchase_orders: [] }', breaking: false },
    { endpoint: 'GET /api/invoices', response: '{ invoices: [] }', breaking: false },
    { endpoint: 'POST /api/invoices', response: '{ invoice }', breaking: false },
    { endpoint: 'GET /api/performance', response: '{ on_time_rate, quality_rate, ... }', breaking: false },
    { endpoint: 'GET /api/compliance-docs', response: '{ compliance_docs: [] }', breaking: false },
    { endpoint: 'GET /api/milestones', response: '{ milestones: [] }', breaking: false },
    { endpoint: 'GET /api/disputes', response: '{ disputes: [] }', breaking: false },
    { endpoint: 'POST /api/ai-assist', response: '{ response, model, timestamp }', breaking: false },
    { endpoint: 'GET/POST /api/init', response: '{ status, seeded }', breaking: false },
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">File Alignment</h1>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
        <h2 className="text-white font-semibold mb-3">API Contract Registry</h2>
        <p className="text-gray-400 text-xs mb-3">All {apiContracts.length} API routes documented — no breaking changes</p>
        <div className="space-y-1">
          {apiContracts.map((c) => (
            <div key={c.endpoint} className="flex gap-4 text-xs py-1 border-b border-[#1e2a45] last:border-0">
              <span className="text-purple-400 font-mono w-56 flex-shrink-0">{c.endpoint}</span>
              <span className="text-gray-400 flex-1">{c.response}</span>
              <span className={c.breaking ? 'text-red-400' : 'text-green-400'}>{c.breaking ? '⚠ Breaking' : '✓ Stable'}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
        <h2 className="text-white font-semibold mb-3">Dependency Map</h2>
        <div className="text-xs text-gray-400 space-y-1">
          <div>All pages → fetch() → /api/* routes → src/lib/db.ts → PostgreSQL</div>
          <div>AI pages → /api/ai-assist → src/lib/ollama.ts → Ollama localhost:11434</div>
          <div>Layout → all pages (dark theme, navigation)</div>
          <div>DB init → all API routes (CREATE TABLE IF NOT EXISTS on first request)</div>
        </div>
      </div>
    </div>
  );
}
