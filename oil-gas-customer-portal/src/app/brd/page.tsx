'use client';

const REQUIREMENTS = [
  { id: 'REQ-001', category: 'Auth', description: 'Customer self-service login and session management', priority: 'Must Have', status: 'In Scope' },
  { id: 'REQ-002', category: 'Contracts', description: 'View active contracts with renewal alerts 90 days prior', priority: 'Must Have', status: 'In Scope' },
  { id: 'REQ-003', category: 'Deliveries', description: 'Real-time delivery tracking: scheduled/in-transit/delivered', priority: 'Must Have', status: 'In Scope' },
  { id: 'REQ-004', category: 'Invoices', description: 'Invoice management with CAD totals, HST 13%, and pay-now', priority: 'Must Have', status: 'In Scope' },
  { id: 'REQ-005', category: 'Quality', description: 'Assay report access with API gravity, sulphur %, BTU content', priority: 'Must Have', status: 'In Scope' },
  { id: 'REQ-006', category: 'Monitoring', description: 'Read-only AI asset monitoring dashboard with health scores', priority: 'Should Have', status: 'In Scope' },
  { id: 'REQ-007', category: 'AI', description: 'Ollama llama3.2-powered FAQ and support assistant', priority: 'Should Have', status: 'In Scope' },
  { id: 'REQ-008', category: 'Payments', description: 'Live payment gateway integration (Stripe/Moneris)', priority: 'Could Have', status: 'Out of Scope (v1)' },
  { id: 'REQ-009', category: 'Notifications', description: 'Notification preference management per channel', priority: 'Should Have', status: 'In Scope' },
  { id: 'REQ-010', category: 'Reports', description: 'Customer-scoped reports: delivery, invoice, request history', priority: 'Must Have', status: 'In Scope' },
];

export default function BrdPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Business Requirements Document</h1>
        <p className="text-gray-400 mt-1">Requirements, stakeholders, scope, and acceptance criteria</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          <h3 className="text-white font-semibold mb-3">Project Overview</h3>
          <div className="space-y-2 text-sm text-gray-400">
            <div><span className="text-gray-300">Name:</span> Oil & Gas Customer Portal</div>
            <div><span className="text-gray-300">Version:</span> 1.0.0</div>
            <div><span className="text-gray-300">Port:</span> 8385</div>
            <div><span className="text-gray-300">DB Prefix:</span> ogcu_</div>
            <div><span className="text-gray-300">Stack:</span> Next.js 14, PostgreSQL, Ollama</div>
          </div>
        </div>
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          <h3 className="text-white font-semibold mb-3">Stakeholders</h3>
          <div className="space-y-1 text-sm text-gray-400">
            <div>🏢 Oil & Gas operators (customers)</div>
            <div>⚙️ Operations team (internal)</div>
            <div>💼 Account managers (sales)</div>
            <div>🔧 IT / Platform engineering</div>
            <div>📊 Finance / Billing team</div>
          </div>
        </div>
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          <h3 className="text-white font-semibold mb-3">MoSCoW Summary</h3>
          <div className="space-y-1 text-sm">
            <div className="text-red-400">Must Have: 5 requirements</div>
            <div className="text-amber-400">Should Have: 4 requirements</div>
            <div className="text-blue-400">Could Have: 1 requirement</div>
            <div className="text-gray-500">Won&apos;t Have: Live payment gateway (v1)</div>
          </div>
        </div>
      </div>

      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1e2a45]">
          <h2 className="text-white font-semibold">Requirements Register</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e2a45] text-gray-500 text-xs uppercase">
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-left">Priority</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {REQUIREMENTS.map(r => (
              <tr key={r.id} className="border-b border-[#1e2a45]/50">
                <td className="px-4 py-3 text-blue-400 font-mono text-xs">{r.id}</td>
                <td className="px-4 py-3 text-gray-300">{r.category}</td>
                <td className="px-4 py-3 text-gray-400">{r.description}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    r.priority === 'Must Have' ? 'bg-red-500/20 text-red-400' :
                    r.priority === 'Should Have' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>{r.priority}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs ${r.status === 'In Scope' ? 'text-green-400' : 'text-gray-500'}`}>{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
