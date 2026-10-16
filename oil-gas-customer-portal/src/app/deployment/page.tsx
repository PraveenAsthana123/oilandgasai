'use client';

const ENV_VARS = [
  { name: 'DATABASE_URL', required: true, description: 'PostgreSQL connection string', example: 'postgresql://user:pass@host:5432/db' },
  { name: 'OLLAMA_URL', required: false, description: 'Ollama API URL', example: 'http://localhost:11434', default: 'http://localhost:11434' },
  { name: 'OPERATIONS_API_URL', required: false, description: 'Live operations platform URL for asset monitoring', example: 'https://ops.internal.company.ca' },
  { name: 'CHROMA_URL', required: false, description: 'ChromaDB vector database URL', example: 'http://localhost:8000', default: 'http://localhost:8000' },
];

const PIPELINE_STAGES = [
  { stage: 'Build', tool: 'Docker (node:20-alpine)', status: 'green', note: 'npm run build → standalone output' },
  { stage: 'Test', tool: 'Next.js lint + type check', status: 'green', note: 'TypeScript strict mode' },
  { stage: 'Image', tool: 'Docker EXPOSE 8385', status: 'green', note: 'Non-root nextjs user' },
  { stage: 'Deploy', tool: 'docker run -p 8385:8385', status: 'green', note: 'All config via env vars' },
  { stage: 'Health Check', tool: 'GET /api/health', status: 'green', note: 'Returns db: connected/disconnected' },
];

export default function DeploymentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Deployment</h1>
        <p className="text-gray-400 mt-1">Pipeline stages, environment configuration, and Docker setup</p>
      </div>

      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
        <h2 className="text-white font-semibold mb-4">Quick Start</h2>
        <div className="bg-[#0a0e1a] rounded-lg p-4 font-mono text-sm text-green-400 space-y-1">
          <div>docker build -t oil-gas-customer-portal .</div>
          <div>docker run -p 8385:8385 \</div>
          <div className="pl-6">-e DATABASE_URL=postgresql://... \</div>
          <div className="pl-6">-e OLLAMA_URL=http://host.docker.internal:11434 \</div>
          <div className="pl-6">oil-gas-customer-portal</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Pipeline Stages</h2>
          {PIPELINE_STAGES.map(s => (
            <div key={s.stage} className="flex items-start gap-3 py-3 border-b border-[#1e2a45]/50">
              <span className="text-green-400 mt-0.5">✓</span>
              <div>
                <div className="text-gray-200 text-sm font-medium">{s.stage}</div>
                <div className="text-gray-500 text-xs">{s.tool} — {s.note}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Environment Variables</h2>
          {ENV_VARS.map(v => (
            <div key={v.name} className="py-3 border-b border-[#1e2a45]/50">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-blue-400 font-mono text-xs">{v.name}</span>
                {v.required ? (
                  <span className="text-red-400 text-xs">required</span>
                ) : (
                  <span className="text-gray-500 text-xs">optional</span>
                )}
              </div>
              <div className="text-gray-400 text-xs">{v.description}</div>
              {v.default && <div className="text-gray-600 text-xs">Default: {v.default}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
