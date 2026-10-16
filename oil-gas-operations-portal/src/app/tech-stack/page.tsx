'use client';
export default function TechStackPage() {
  const stack = [
    { layer: 'Frontend', tech: 'Next.js 14 App Router', version: '14.2.35', status: 'active', purpose: 'SSR + API routes, TypeScript, Tailwind CSS dark theme' },
    { layer: 'Database', tech: 'PostgreSQL', version: '15+', status: 'active', purpose: 'All operational data, sensor logs, AI results via pg v8' },
    { layer: 'AI / LLM', tech: 'Ollama + llama3.2', version: 'llama3.2', status: 'active', purpose: 'Local LLM for agents, RAG generation, no cloud cost' },
    { layer: 'Vector DB', tech: 'ChromaDB', version: 'v0.4+', status: 'configured', purpose: 'Embedding storage for RAG knowledge base (CHROMA_URL env)' },
    { layer: 'Containerization', tech: 'Docker', version: '24+', status: 'active', purpose: 'Non-root, standalone build, port 8384, env-var config' },
    { layer: 'Styling', tech: 'Tailwind CSS', version: '3.x', status: 'active', purpose: 'Dark theme: #0a0e1a / #0f1629 / amber-500 accent' },
    { layer: 'Language', tech: 'TypeScript', version: '5.x', status: 'active', purpose: 'Strict typing, bundler module resolution' },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Tech Stack</h1>
        <p className="text-gray-400 text-sm mt-1">Package.json-backed dependency registry · API integration status · Architecture decisions</p></div>
      <div className="overflow-x-auto bg-[#0f1629] border border-[#1e2a45] rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-[#1e2a45]">
              {['Layer', 'Technology', 'Version', 'Status', 'Purpose'].map(h => (
                <th key={h} className="text-left py-3 px-4 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stack.map((s) => (
              <tr key={s.tech} className="border-b border-[#1e2a45]/50 hover:bg-[#1e2a45]/20">
                <td className="py-3 px-4 text-amber-400/80">{s.layer}</td>
                <td className="py-3 px-4 text-white font-medium">{s.tech}</td>
                <td className="py-3 px-4 font-mono text-blue-400 text-xs">{s.version}</td>
                <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded text-xs ${s.status === 'active' ? 'text-green-400 bg-green-500/10' : 'text-amber-400 bg-amber-500/10'}`}>{s.status}</span></td>
                <td className="py-3 px-4 text-gray-400 text-xs">{s.purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
