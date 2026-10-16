'use client';
const history = [
  { v: 'v1.0.0', date: '2025-01-10', env: 'production', by: 'admin@oilgas.com', status: 'success', notes: 'Initial deployment — all 18 API routes, 34+ pages' },
];
export default function DeploymentPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-2">Deployment</h1>
      <p className="text-gray-400 text-sm mb-6">Pipeline stages · Deployment history · Env var checklist · Docker config · Rollback procedures</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
          <h2 className="text-white font-semibold mb-3">Docker Configuration</h2>
          <pre className="text-xs text-green-400 bg-[#0a0e1a] rounded-lg p-3 overflow-x-auto">{`docker build -t oil-gas-admin-portal .
docker run -d \\
  -p 8383:8383 \\
  -e DATABASE_URL=postgresql://... \\
  -e OLLAMA_URL=http://host:11434 \\
  --name oil-gas-admin \\
  oil-gas-admin-portal`}</pre>
        </div>
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
          <h2 className="text-white font-semibold mb-3">Required Env Vars</h2>
          <div className="space-y-2">
            {[{k:'DATABASE_URL',req:true},{k:'OLLAMA_URL',req:false},{k:'CHROMA_URL',req:false},{k:'SMTP_HOST',req:false}].map(e=>(
              <div key={e.k} className="flex items-center justify-between bg-[#0a0e1a] rounded px-3 py-1.5">
                <code className="text-blue-400 text-xs">{e.k}</code>
                <span className={`text-xs ${e.req?'text-red-400':'text-gray-500'}`}>{e.req?'Required':'Optional'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1e2a45]"><h2 className="text-white font-semibold">Deployment History</h2></div>
        <table className="w-full">
          <thead><tr className="border-b border-[#1e2a45]">{['Version','Date','Env','Deployed By','Status','Notes'].map(h=><th key={h} className="text-left text-gray-400 text-xs font-medium px-4 py-3 uppercase">{h}</th>)}</tr></thead>
          <tbody>{history.map(d=><tr key={d.v} className="border-b border-[#1e2a45]">
            <td className="px-4 py-3 text-white font-mono text-sm">{d.v}</td>
            <td className="px-4 py-3 text-gray-400 text-sm">{d.date}</td>
            <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">{d.env}</span></td>
            <td className="px-4 py-3 text-gray-400 text-sm">{d.by}</td>
            <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded">{d.status}</span></td>
            <td className="px-4 py-3 text-gray-400 text-xs">{d.notes}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
