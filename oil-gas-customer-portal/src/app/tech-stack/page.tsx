'use client';

const STACK = [
  { layer: 'Frontend', tech: 'Next.js 14 (App Router)', version: '14.2.35', status: 'active' },
  { layer: 'Language', tech: 'TypeScript', version: '^5', status: 'active' },
  { layer: 'Styling', tech: 'Tailwind CSS', version: '^3.4.17', status: 'active' },
  { layer: 'Database', tech: 'PostgreSQL', version: '14+', status: 'active' },
  { layer: 'DB Client', tech: 'node-postgres (pg)', version: '^8.22.0', status: 'active' },
  { layer: 'AI Model', tech: 'Ollama llama3.2', version: 'latest', status: 'configured' },
  { layer: 'Container', tech: 'Docker (node:20-alpine)', version: '20-alpine', status: 'active' },
  { layer: 'Vector DB', tech: 'ChromaDB', version: 'latest', status: 'not_configured' },
];

const ADRS = [
  { id: 'ADR-001', decision: 'Use Next.js 14 App Router with force-dynamic API routes', rationale: 'Ensures fresh data on every request, no stale cache for financial data', status: 'accepted' },
  { id: 'ADR-002', decision: 'PostgreSQL with CREATE TABLE IF NOT EXISTS on first request', rationale: 'Zero-friction deployment — no manual migration step required', status: 'accepted' },
  { id: 'ADR-003', decision: 'Ollama llama3.2 for AI FAQ assistant', rationale: 'Local-first AI reduces cost and latency; no API key management', status: 'accepted' },
  { id: 'ADR-004', decision: 'Dark theme with bg-[#0a0e1a] base palette', rationale: 'Industry-standard for operational/monitoring dashboards; reduces eye strain on 24/7 ops screens', status: 'accepted' },
];

export default function TechStackPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Tech Stack</h1>
        <p className="text-gray-400 mt-1">Dependencies, integrations, and architecture decisions</p>
      </div>

      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1e2a45]"><h2 className="text-white font-semibold">Technology Registry</h2></div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e2a45] text-gray-500 text-xs uppercase">
              <th className="px-4 py-3 text-left">Layer</th>
              <th className="px-4 py-3 text-left">Technology</th>
              <th className="px-4 py-3 text-left">Version</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {STACK.map(s => (
              <tr key={s.tech} className="border-b border-[#1e2a45]/50">
                <td className="px-4 py-3 text-gray-500">{s.layer}</td>
                <td className="px-4 py-3 text-gray-200">{s.tech}</td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{s.version}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    s.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    s.status === 'configured' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>{s.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
        <h2 className="text-white font-semibold mb-4">Architecture Decision Records (ADRs)</h2>
        <div className="space-y-3">
          {ADRS.map(adr => (
            <div key={adr.id} className="border border-[#1e2a45] rounded-lg p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-blue-400 text-xs font-mono">{adr.id}</span>
                <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded">{adr.status}</span>
              </div>
              <div className="text-gray-200 text-sm font-medium">{adr.decision}</div>
              <div className="text-gray-500 text-xs mt-1">{adr.rationale}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
