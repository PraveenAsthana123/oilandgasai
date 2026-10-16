'use client';

const API_CONTRACTS = [
  { route: 'GET /api/health', response: '{ status, portal, version, db }', consumers: ['Dashboard', 'Deployment page'] },
  { route: 'GET/POST /api/init', response: '{ status, message }', consumers: ['Dashboard seed button'] },
  { route: 'GET/POST /api/leads', response: 'ogs_lead[]', consumers: ['Leads page', 'Dashboard'] },
  { route: 'GET/POST /api/opportunities', response: 'ogs_opportunity[]', consumers: ['Pipeline', 'Forecasting'] },
  { route: 'GET/POST /api/quotes', response: 'ogs_quote[]', consumers: ['Quotes page'] },
  { route: 'GET/POST /api/contracts', response: 'ogs_contract[]', consumers: ['Contracts page'] },
  { route: 'GET/POST /api/accounts', response: 'ogs_account[]', consumers: ['Accounts', 'Dashboard', 'Customers', 'C360'] },
  { route: 'POST /api/proposals/generate', response: '{ status, proposal }', consumers: ['Proposals page'] },
  { route: 'GET /api/roi-calculator', response: '{ inputs, results }', consumers: ['ROI Calculator'] },
  { route: 'GET /api/reports/sales', response: '{ leads, opportunities, accounts, contracts, summary }', consumers: ['Reports', 'Admin Reports'] },
];

export default function FileAlignmentPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-white">File Alignment</h1>
      <p className="text-slate-400 text-sm">API contract registry and consumer mapping</p>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-500 border-b border-[#1e2a45] bg-[#0a0e1a]">
              <th className="text-left px-4 py-3">Route</th>
              <th className="text-left px-4 py-3">Response Shape</th>
              <th className="text-left px-4 py-3">Consumers</th>
            </tr>
          </thead>
          <tbody>
            {API_CONTRACTS.map(c => (
              <tr key={c.route} className="border-b border-[#1e2a45]/40 hover:bg-[#1e2a45]/20">
                <td className="px-4 py-2 font-mono text-emerald-400">{c.route}</td>
                <td className="px-4 py-2 font-mono text-slate-400">{c.response}</td>
                <td className="px-4 py-2">
                  <div className="flex flex-wrap gap-1">
                    {c.consumers.map(cc => <span key={cc} className="bg-[#1e2a45] text-slate-300 px-1.5 py-0.5 rounded">{cc}</span>)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
