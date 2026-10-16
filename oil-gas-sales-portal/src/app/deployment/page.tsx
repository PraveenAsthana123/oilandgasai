'use client';

export default function DeploymentPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-white">Deployment</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
          <h2 className="text-sm font-semibold text-white mb-3">Docker Deployment</h2>
          <div className="space-y-2 font-mono text-xs">
            {['docker build -t oil-gas-sales-portal .', 'docker run -p 8382:8382 \\', '  -e DATABASE_URL=postgresql://... \\', '  -e OLLAMA_URL=http://host:11434 \\', '  oil-gas-sales-portal'].map((cmd, i) => (
              <div key={i} className="bg-[#0a0e1a] border border-[#1e2a45] rounded px-3 py-1.5 text-slate-300">{cmd}</div>
            ))}
          </div>
        </div>
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
          <h2 className="text-sm font-semibold text-white mb-3">Environment Checklist</h2>
          <div className="space-y-2">
            {[['DATABASE_URL', 'required', 'PostgreSQL connection string'], ['OLLAMA_URL', 'optional', 'Defaults to http://localhost:11434'], ['NODE_ENV', 'auto', 'Set to production in Docker'], ['PORT', 'optional', 'Defaults to 8382']].map(([k, req, desc]) => (
              <div key={k as string} className="flex items-start gap-3">
                <span className={`text-xs px-1.5 py-0.5 rounded mt-0.5 ${req === 'required' ? 'bg-red-900 text-red-300' : 'bg-slate-700 text-slate-300'}`}>{req as string}</span>
                <div><div className="text-xs font-mono text-emerald-400">{k as string}</div><div className="text-xs text-slate-500">{desc as string}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
        <h2 className="text-sm font-semibold text-white mb-3">Health Check</h2>
        <div className="font-mono text-xs bg-[#0a0e1a] rounded p-3 text-slate-300">
          curl http://localhost:8382/api/health<br/>
          {"{ \"status\": \"ok\", \"portal\": \"oil-gas-sales-portal\", \"version\": \"1.0.0\", \"db\": \"connected\" }"}
        </div>
      </div>
    </div>
  );
}
