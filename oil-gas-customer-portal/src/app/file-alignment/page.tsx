'use client';

const API_CONTRACTS = [
  { route: 'GET /api/health', response: '{ status, portal, version, port, db }', consumers: ['All pages — startup check'], breaking: false },
  { route: 'GET/POST /api/init', response: '{ status, schema, seeded }', consumers: ['Dashboard — auto-init on load'], breaking: false },
  { route: 'GET /api/contracts', response: '{ contracts[] }', consumers: ['Contracts page', 'Dashboard'], breaking: false },
  { route: 'GET /api/deliveries', response: '{ deliveries[] }', consumers: ['Deliveries page', 'Dashboard'], breaking: false },
  { route: 'GET /api/invoices', response: '{ invoices[] }', consumers: ['Invoices page', 'Dashboard'], breaking: false },
  { route: 'PATCH /api/invoices/[id]/pay', response: '{ status, message, invoice_id }', consumers: ['Invoices page — Pay Now'], breaking: false },
  { route: 'GET /api/quality-certs', response: '{ certs[] }', consumers: ['Quality Certs page'], breaking: false },
  { route: 'GET/POST /api/service-requests', response: '{ requests[] } / { request }', consumers: ['Requests page'], breaking: false },
  { route: 'GET/POST /api/support', response: '{ tickets[] } / { ticket }', consumers: ['Support page'], breaking: false },
  { route: 'POST /api/ai-faq', response: '{ answer, model } | { _mock, _reason }', consumers: ['Support page — AI assistant'], breaking: false },
  { route: 'GET /api/monitoring/assets', response: '{ assets[], summary, _mock? }', consumers: ['Monitoring page', 'Dashboard'], breaking: false },
];

export default function FileAlignmentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">File Alignment</h1>
        <p className="text-gray-400 mt-1">API contract registry and dependency map</p>
      </div>

      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1e2a45]">
          <h2 className="text-white font-semibold">API Contract Registry</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e2a45] text-gray-500 text-xs uppercase">
              <th className="px-4 py-3 text-left">Route</th>
              <th className="px-4 py-3 text-left">Response Shape</th>
              <th className="px-4 py-3 text-left">Consumers</th>
              <th className="px-4 py-3 text-left">Breaking?</th>
            </tr>
          </thead>
          <tbody>
            {API_CONTRACTS.map(c => (
              <tr key={c.route} className="border-b border-[#1e2a45]/50">
                <td className="px-4 py-3 text-blue-400 font-mono text-xs whitespace-nowrap">{c.route}</td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{c.response}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{c.consumers.join(', ')}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs ${c.breaking ? 'text-red-400' : 'text-green-400'}`}>{c.breaking ? 'Yes' : 'No'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
