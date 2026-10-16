'use client';

const TOOLS = [
  { name: 'PostgreSQL', category: 'Database', integration: 'DATABASE_URL', status: 'active', purpose: 'Primary data store for all portal data' },
  { name: 'Ollama (llama3.2)', category: 'AI', integration: 'OLLAMA_URL', status: 'configured', purpose: 'Local AI for FAQ and support assistant' },
  { name: 'ChromaDB', category: 'Vector DB', integration: 'CHROMA_URL', status: 'not_configured', purpose: 'Vector embeddings for RAG knowledge base' },
  { name: 'Next.js 14', category: 'Framework', integration: 'built-in', status: 'active', purpose: 'App Router + API routes + standalone build' },
  { name: 'Tailwind CSS', category: 'Styling', integration: 'built-in', status: 'active', purpose: 'Dark theme utility-first CSS' },
  { name: 'Docker', category: 'Container', integration: 'Dockerfile', status: 'active', purpose: 'Containerized deployment, non-root, port 8385' },
  { name: 'TypeScript', category: 'Language', integration: 'built-in', status: 'active', purpose: 'Type safety across all API routes and pages' },
  { name: 'Nodemailer', category: 'Notifications', integration: 'SMTP_URL', status: 'not_configured', purpose: 'Email delivery for invoice/delivery alerts' },
];

export default function ToolsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Tool Registry</h1>
        <p className="text-gray-400 mt-1">All tools and services used, with integration status</p>
      </div>

      <div className="grid gap-3">
        {TOOLS.map(t => (
          <div key={t.name} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4 flex items-start justify-between">
            <div className="flex gap-4">
              <div className="bg-[#1e2a45] px-3 py-1 rounded text-xs text-gray-400 self-start mt-0.5">{t.category}</div>
              <div>
                <div className="text-white font-medium text-sm">{t.name}</div>
                <div className="text-gray-500 text-xs mt-0.5">{t.purpose}</div>
                <div className="text-gray-600 text-xs mt-0.5">Integration: <span className="font-mono text-blue-400/70">{t.integration}</span></div>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded text-xs whitespace-nowrap ml-4 ${
              t.status === 'active' ? 'bg-green-500/20 text-green-400' :
              t.status === 'configured' ? 'bg-blue-500/20 text-blue-400' :
              'bg-amber-500/20 text-amber-400'
            }`}>{t.status.replace('_', ' ')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
