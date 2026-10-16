'use client';
export default function DeploymentPage() {
  const envVars = [
    { key: 'DATABASE_URL', required: true, desc: 'PostgreSQL connection string', example: 'postgresql://user:pass@host:5432/db' },
    { key: 'OLLAMA_URL', required: false, desc: 'Ollama API base URL', example: 'http://localhost:11434' },
    { key: 'CHROMA_URL', required: false, desc: 'ChromaDB vector DB URL', example: 'http://localhost:8000' },
    { key: 'PORT', required: false, desc: 'Server port (default 8384)', example: '8384' },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Deployment</h1>
        <p className="text-gray-400 text-sm mt-1">Pipeline stages · Deployment history · Env var checklist · Docker config · Rollback</p></div>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <h2 className="font-semibold text-white mb-3">Docker Build & Run</h2>
        <div className="space-y-2 font-mono text-xs bg-[#0a0e1a] p-4 rounded-lg text-green-400">
          <div className="text-gray-500"># Build image</div>
          <div>docker build -t oil-gas-operations-portal .</div>
          <div className="mt-2 text-gray-500"># Run container</div>
          <div>docker run -p 8384:8384 \</div>
          <div className="pl-4">-e DATABASE_URL=postgresql://... \</div>
          <div className="pl-4">-e OLLAMA_URL=http://localhost:11434 \</div>
          <div className="pl-4">oil-gas-operations-portal</div>
          <div className="mt-2 text-gray-500"># Health check</div>
          <div>curl http://localhost:8384/api/health</div>
        </div>
      </div>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <h2 className="font-semibold text-white mb-3">Environment Variables</h2>
        <table className="w-full text-xs">
          <thead><tr className="text-gray-400 border-b border-[#1e2a45]">
            {['Variable', 'Required', 'Description', 'Example'].map(h => <th key={h} className="text-left py-2 px-2 font-medium">{h}</th>)}
          </tr></thead>
          <tbody>{envVars.map(e => (
            <tr key={e.key} className="border-b border-[#1e2a45]/50">
              <td className="py-2 px-2 font-mono text-amber-400">{e.key}</td>
              <td className="py-2 px-2"><span className={e.required ? 'text-red-400' : 'text-gray-400'}>{e.required ? 'Yes' : 'Optional'}</span></td>
              <td className="py-2 px-2 text-gray-300">{e.desc}</td>
              <td className="py-2 px-2 font-mono text-blue-400/70">{e.example}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
