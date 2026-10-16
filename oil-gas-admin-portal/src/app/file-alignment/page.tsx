'use client';
const contracts = [
  { route: '/api/health', method: 'GET', returns: '{status,portal,version,db,ollama}', breaking: false },
  { route: '/api/init', method: 'GET/POST', returns: '{ok,message,tables}', breaking: false },
  { route: '/api/users', method: 'GET/POST', returns: 'User[]', breaking: false },
  { route: '/api/users/[id]', method: 'PATCH/DELETE', returns: 'User', breaking: false },
  { route: '/api/compliance', method: 'GET/PATCH', returns: 'ComplianceRow[]', breaking: false },
  { route: '/api/incidents', method: 'GET/POST', returns: '{incidents,trif,total_hours}', breaking: false },
  { route: '/api/ai-models', method: 'GET', returns: 'AIModel[]', breaking: false },
  { route: '/api/approvals', method: 'GET/PATCH', returns: 'Approval[]', breaking: false },
];
export default function FileAlignmentPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-2">File Alignment</h1>
      <p className="text-gray-400 text-sm mb-6">Dependency map · API contract registry · Breaking change tracker · Backward/forward compatibility</p>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-[#1e2a45]">{['Route','Method','Response Shape','Breaking Change'].map(h=><th key={h} className="text-left text-gray-400 text-xs font-medium px-4 py-3 uppercase">{h}</th>)}</tr></thead>
          <tbody>{contracts.map(c=><tr key={c.route} className="border-b border-[#1e2a45] hover:bg-[#0a0e1a]">
            <td className="px-4 py-3 font-mono text-xs text-blue-400">{c.route}</td>
            <td className="px-4 py-3 text-gray-400 text-xs">{c.method}</td>
            <td className="px-4 py-3 font-mono text-xs text-green-400">{c.returns}</td>
            <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded ${c.breaking?'bg-red-500/20 text-red-400':'bg-green-500/20 text-green-400'}`}>{c.breaking?'Yes':'No'}</span></td>
          </tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
