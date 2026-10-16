'use client';

const DEPS = {
  'next': '14.2.5',
  'react': '^18',
  'react-dom': '^18',
  'pg': '^8.12.0',
  'typescript': '^5',
  'tailwindcss': '^3.4.1',
  'lucide-react': '^0.400.0',
  'autoprefixer': '^10.0.1',
  'postcss': '^8',
};

const ADRs = [
  { id: 'ADR-001', title: 'Next.js 14 App Router', status: 'accepted', rationale: 'Server components, built-in routing, output:standalone for Docker' },
  { id: 'ADR-002', title: 'PostgreSQL with pg pool', status: 'accepted', rationale: 'Reliable ACID-compliant DB, JSONB for flexible schemas, pg pool for efficiency' },
  { id: 'ADR-003', title: 'Ollama for local AI', status: 'accepted', rationale: 'No API key costs, privacy-compliant, llama3.2 model adequate for governance analysis' },
  { id: 'ADR-004', title: 'Tailwind CSS dark theme', status: 'accepted', rationale: 'Consistent dark UI without custom CSS overhead' },
  { id: 'ADR-005', title: 'ChromaDB for RAG', status: 'proposed', rationale: 'Vector storage for regulatory document retrieval — pending CHROMA_URL configuration' },
];

export default function TechStackPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Tech Stack</h1>
        <p className="text-gray-400 text-sm mt-1">Dependency registry from package.json · API integrations · Architecture Decision Records</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
          <h2 className="text-white font-semibold mb-3">Dependencies</h2>
          <div className="space-y-1">
            {Object.entries(DEPS).map(([name, ver]) => (
              <div key={name} className="flex items-center justify-between bg-[#0a0e1a] rounded px-3 py-1.5">
                <code className="text-green-400 text-xs">{name}</code>
                <span className="text-gray-400 text-xs">{ver}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
          <h2 className="text-white font-semibold mb-3">Architecture Decisions (ADRs)</h2>
          <div className="space-y-3">
            {ADRs.map(adr => (
              <div key={adr.id} className="bg-[#0a0e1a] rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-mono">{adr.id}</span>
                    <span className="text-white text-sm font-medium">{adr.title}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded ${adr.status === 'accepted' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{adr.status}</span>
                </div>
                <div className="text-gray-400 text-xs">{adr.rationale}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
