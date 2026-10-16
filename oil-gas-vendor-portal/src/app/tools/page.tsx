'use client';
export default function ToolRegistryPage() {
  const tools = [
    { name: 'PostgreSQL', category: 'Database', status: 'active', env: 'DATABASE_URL', purpose: 'Primary data store for all ogv_ tables' },
    { name: 'Ollama', category: 'AI', status: 'active', env: 'OLLAMA_URL', purpose: 'Local LLM inference for AI assistant and RFQ drafts' },
    { name: 'ChromaDB', category: 'Vector DB', status: 'configurable', env: 'CHROMA_URL', purpose: 'RAG embeddings (set CHROMA_URL to enable)' },
    { name: 'Docker', category: 'Infrastructure', status: 'active', env: null, purpose: 'Container packaging and deployment' },
    { name: 'Next.js 14', category: 'Framework', status: 'active', env: null, purpose: 'Full-stack React framework, App Router' },
    { name: 'Tailwind CSS', category: 'Styling', status: 'active', env: null, purpose: 'Dark theme utility-first CSS' },
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Tool Registry</h1>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#1e2a45]"><tr>{['Tool', 'Category', 'Env Var', 'Purpose', 'Status'].map((h) => <th key={h} className="text-left px-4 py-3 text-gray-400 text-xs">{h}</th>)}</tr></thead>
          <tbody>
            {tools.map((t) => (
              <tr key={t.name} className="border-t border-[#1e2a45]">
                <td className="px-4 py-3 text-white font-medium">{t.name}</td>
                <td className="px-4 py-3 text-purple-400">{t.category}</td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{t.env || '—'}</td>
                <td className="px-4 py-3 text-gray-300 max-w-xs">{t.purpose}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full border ${t.status === 'active' ? 'bg-green-900/30 text-green-400 border-green-700' : 'bg-yellow-900/30 text-yellow-400 border-yellow-700'}`}>{t.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
