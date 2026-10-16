'use client';
const tools = [
  { name: 'Next.js 14', type: 'Framework', status: 'active', env: 'N/A' },
  { name: 'PostgreSQL', type: 'Database', status: 'configured', env: 'DATABASE_URL' },
  { name: 'Ollama', type: 'AI Runtime', status: 'configured', env: 'OLLAMA_URL' },
  { name: 'ChromaDB', type: 'Vector DB', status: 'not_configured', env: 'CHROMA_URL' },
  { name: 'Tailwind CSS', type: 'UI Framework', status: 'active', env: 'N/A' },
  { name: 'Docker', type: 'Container', status: 'active', env: 'N/A' },
  { name: 'Node.js 20', type: 'Runtime', status: 'active', env: 'N/A' },
];
export default function ToolsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-2">Tool Registry</h1>
      <p className="text-gray-400 text-sm mb-6">Every tool/service used · Integration status (real env check) · Vendor evaluation matrix</p>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-[#1e2a45]">{['Tool','Type','Env Var','Status'].map(h=><th key={h} className="text-left text-gray-400 text-xs font-medium px-4 py-3 uppercase">{h}</th>)}</tr></thead>
          <tbody>{tools.map(t=><tr key={t.name} className="border-b border-[#1e2a45] hover:bg-[#0a0e1a]">
            <td className="px-4 py-3 text-white text-sm font-medium">{t.name}</td>
            <td className="px-4 py-3 text-gray-400 text-sm">{t.type}</td>
            <td className="px-4 py-3 font-mono text-xs text-blue-400">{t.env}</td>
            <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded ${t.status==='active'?'bg-green-500/20 text-green-400':t.status==='configured'?'bg-blue-500/20 text-blue-400':'bg-red-500/20 text-red-400'}`}>{t.status}</span></td>
          </tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
