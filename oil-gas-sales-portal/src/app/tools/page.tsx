'use client';

const TOOLS = [
  { name: 'PostgreSQL', category: 'Database', status: 'active', env: 'DATABASE_URL', vendor: 'PostgreSQL Global Dev Group' },
  { name: 'Ollama', category: 'AI/LLM', status: 'active', env: 'OLLAMA_URL', vendor: 'Ollama Inc.' },
  { name: 'Next.js', category: 'Framework', status: 'active', env: '—', vendor: 'Vercel' },
  { name: 'Tailwind CSS', category: 'Styling', status: 'active', env: '—', vendor: 'Tailwind Labs' },
  { name: 'Docker', category: 'Containerization', status: 'active', env: '—', vendor: 'Docker Inc.' },
  { name: 'ChromaDB', category: 'Vector DB', status: 'not_configured', env: 'CHROMA_URL', vendor: 'Chroma' },
];

export default function ToolsPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-white">Tool Registry</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOOLS.map(t => (
          <div key={t.name} className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-white">{t.name}</div>
              <span className={`text-xs px-2 py-0.5 rounded ${t.status === 'active' ? 'bg-emerald-800 text-emerald-300' : 'bg-slate-700 text-slate-400'}`}>
                {t.status === 'active' ? '🟢 active' : '⚪ not configured'}
              </span>
            </div>
            <div className="text-xs text-blue-400">{t.category}</div>
            <div className="text-xs text-slate-400 mt-1">{t.vendor}</div>
            {t.env !== '—' && <div className="text-xs font-mono text-slate-500 mt-1">{t.env}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
