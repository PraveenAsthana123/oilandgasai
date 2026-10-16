'use client';
export default function ToolRegistryPage() {
  const tools = [
    { name: 'Next.js 14', category: 'Framework', status: 'active', env: 'N/A', purpose: 'Full-stack React framework, App Router' },
    { name: 'PostgreSQL', category: 'Database', status: 'active', env: 'DATABASE_URL', purpose: 'Primary data store, all ogo_ tables' },
    { name: 'Ollama', category: 'AI', status: 'configured', env: 'OLLAMA_URL', purpose: 'Local LLM inference, llama3.2 model' },
    { name: 'ChromaDB', category: 'Vector DB', status: 'configured', env: 'CHROMA_URL', purpose: 'Embedding storage for RAG' },
    { name: 'Tailwind CSS', category: 'Styling', status: 'active', env: 'N/A', purpose: 'Utility-first CSS, dark theme' },
    { name: 'Docker', category: 'Infrastructure', status: 'active', env: 'PORT=8384', purpose: 'Container packaging, non-root user' },
    { name: 'TypeScript', category: 'Language', status: 'active', env: 'N/A', purpose: 'Type-safe development, strict mode' },
    { name: 'pg (node-postgres)', category: 'Library', status: 'active', env: 'DATABASE_URL', purpose: 'PostgreSQL client for Node.js' },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Tool Registry</h1>
        <p className="text-gray-400 text-sm mt-1">Every tool/service used · Integration status · Vendor evaluation</p></div>
      <div className="grid grid-cols-2 gap-4">
        {tools.map((t) => (
          <div key={t.name} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4 flex items-start gap-3">
            <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${t.status === 'active' ? 'bg-green-400' : 'bg-amber-400'}`}></div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div className="font-medium text-white text-sm">{t.name}</div>
                <span className="text-xs text-amber-400/70 bg-amber-500/10 px-2 py-0.5 rounded ml-2">{t.category}</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">{t.purpose}</div>
              {t.env !== 'N/A' && <div className="text-xs font-mono text-blue-400/70 mt-1">env: {t.env}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
