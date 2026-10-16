'use client';
export default function TechStackPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Tech Stack</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { category: 'Frontend', items: [{ name: 'Next.js 14', role: 'App Router, RSC', status: 'active' }, { name: 'React 18', role: 'UI library', status: 'active' }, { name: 'TypeScript 5', role: 'Type safety', status: 'active' }, { name: 'Tailwind CSS 3', role: 'Styling', status: 'active' }] },
          { category: 'Backend', items: [{ name: 'Next.js API Routes', role: 'REST API', status: 'active' }, { name: 'PostgreSQL', role: 'Primary database', status: 'active' }, { name: 'pg (node-postgres)', role: 'DB client', status: 'active' }] },
          { category: 'AI / ML', items: [{ name: 'Ollama', role: 'Local LLM inference', status: 'active' }, { name: 'llama3.2', role: 'Default model', status: 'active' }, { name: 'ChromaDB', role: 'Vector store (configured)', status: 'configurable' }] },
          { category: 'Infrastructure', items: [{ name: 'Docker', role: 'Containerization', status: 'active' }, { name: 'Node 22', role: 'Runtime', status: 'active' }, { name: 'Port 8386', role: 'HTTP', status: 'active' }] },
        ].map((section) => (
          <div key={section.category} className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
            <h2 className="text-purple-400 font-semibold mb-3">{section.category}</h2>
            <div className="space-y-2">
              {section.items.map((item) => (
                <div key={item.name} className="flex justify-between items-center text-sm">
                  <div><span className="text-white">{item.name}</span><span className="text-gray-500 text-xs ml-2">— {item.role}</span></div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${item.status === 'active' ? 'bg-green-900/30 text-green-400 border-green-700' : 'bg-yellow-900/30 text-yellow-400 border-yellow-700'}`}>{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
        <h2 className="text-white font-semibold mb-3">Architecture Decision Records</h2>
        <div className="space-y-2">
          {[['ADR-001', 'Use Next.js 14 App Router', 'Server components, streaming, built-in API routes reduces complexity vs separate Express API'], ['ADR-002', 'PostgreSQL over MongoDB', 'Relational data (POs, invoices, bids) fits SQL well; JSONB handles flexible fields'], ['ADR-003', 'Ollama for AI', 'Local inference: zero API costs, privacy, no rate limits, works offline']].map(([id, title, rationale]) => (
            <div key={id} className="p-3 bg-[#1e2a45] rounded">
              <div className="flex gap-2 text-sm"><span className="text-purple-400 font-mono">{id}</span><span className="text-white font-medium">{title}</span></div>
              <div className="text-gray-500 text-xs mt-1">{rationale}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
