'use client';
export default function DeploymentPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Deployment</h1>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-5 space-y-4">
        <h2 className="text-white font-semibold">Docker Deployment</h2>
        <div className="bg-[#0a0e1a] rounded p-3 font-mono text-sm text-green-300">
          <div># Build image</div>
          <div>docker build -t oil-gas-vendor-portal .</div>
          <div className="mt-2"># Run container</div>
          <div>docker run -d -p 8386:8386 \</div>
          <div>&nbsp;&nbsp;-e DATABASE_URL=postgresql://user:pass@host/db \</div>
          <div>&nbsp;&nbsp;-e OLLAMA_URL=http://localhost:11434 \</div>
          <div>&nbsp;&nbsp;--name ogv-portal \</div>
          <div>&nbsp;&nbsp;oil-gas-vendor-portal</div>
          <div className="mt-2"># Health check</div>
          <div>curl http://localhost:8386/api/health</div>
        </div>
        <h2 className="text-white font-semibold">Environment Variables</h2>
        <div className="space-y-2">
          {[['DATABASE_URL', 'PostgreSQL connection string', 'Required'], ['OLLAMA_URL', 'Ollama API base URL', 'Default: http://localhost:11434'], ['CHROMA_URL', 'ChromaDB for RAG', 'Default: http://localhost:8000'], ['NODE_ENV', 'production | development', 'Default: development'], ['PORT', 'Server port', 'Default: 8386']].map(([k, desc, def]) => (
            <div key={k} className="flex gap-3 text-sm"><span className="text-purple-400 font-mono w-32 flex-shrink-0">{k}</span><span className="text-gray-400 flex-1">{desc}</span><span className="text-gray-500 text-xs">{def}</span></div>
          ))}
        </div>
        <h2 className="text-white font-semibold">Deployment History</h2>
        <div className="space-y-2">
          {[{ version: 'v1.0.0', date: '2026-10-16', status: 'live', notes: 'Initial production release — 35 pages, 15 DB tables' }].map((d) => (
            <div key={d.version} className="flex justify-between items-center p-3 bg-[#1e2a45] rounded">
              <div><div className="text-white font-medium">{d.version}</div><div className="text-gray-500 text-xs">{d.notes}</div></div>
              <div className="text-right"><div className="text-green-400 text-xs">{d.date}</div><span className="text-xs bg-green-900/30 border border-green-700 text-green-400 px-2 py-0.5 rounded-full">{d.status}</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
