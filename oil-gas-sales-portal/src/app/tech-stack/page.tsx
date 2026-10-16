'use client';

const STACK = [
  { layer: 'Framework', tech: 'Next.js 14 (App Router)', status: 'active', notes: 'Server components + API routes' },
  { layer: 'Language', tech: 'TypeScript 5.5', status: 'active', notes: 'Strict mode enabled' },
  { layer: 'Styling', tech: 'Tailwind CSS 3.4', status: 'active', notes: 'Dark theme: bg-[#0a0e1a]' },
  { layer: 'Database', tech: 'PostgreSQL (pg pool)', status: 'active', notes: 'Auto-create tables on start' },
  { layer: 'AI/LLM', tech: 'Ollama (llama3.2)', status: 'active', notes: 'Local inference, 30s timeout, fallback to template' },
  { layer: 'Containerization', tech: 'Docker (node:20-alpine)', status: 'active', notes: 'Non-root user, EXPOSE 8382' },
  { layer: 'Build Output', tech: 'Next.js standalone', status: 'active', notes: 'output: standalone for Docker' },
];

const ADRS = [
  { id: 'ADR-001', title: 'Use Next.js 14 App Router', status: 'accepted', date: '2026-10-16' },
  { id: 'ADR-002', title: 'PostgreSQL with pg pool (no ORM)', status: 'accepted', date: '2026-10-16' },
  { id: 'ADR-003', title: 'Local Ollama over cloud LLM', status: 'accepted', date: '2026-10-16' },
  { id: 'ADR-004', title: 'force-dynamic + nodejs runtime on all API routes', status: 'accepted', date: '2026-10-16' },
];

export default function TechStackPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-white">Tech Stack</h1>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-xs text-slate-500 border-b border-[#1e2a45] bg-[#0a0e1a]"><th className="text-left px-4 py-2">Layer</th><th className="text-left px-4 py-2">Technology</th><th className="text-left px-4 py-2">Status</th><th className="text-left px-4 py-2">Notes</th></tr></thead>
          <tbody>
            {STACK.map(s => (
              <tr key={s.layer} className="border-b border-[#1e2a45]/40">
                <td className="px-4 py-2 text-slate-400 text-xs">{s.layer}</td>
                <td className="px-4 py-2 text-white font-medium text-xs">{s.tech}</td>
                <td className="px-4 py-2"><span className="text-xs bg-emerald-800 text-emerald-300 px-1.5 rounded">{s.status}</span></td>
                <td className="px-4 py-2 text-slate-400 text-xs">{s.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1e2a45]"><h2 className="text-sm font-semibold text-white">Architecture Decision Records (ADRs)</h2></div>
        <table className="w-full text-sm">
          <thead><tr className="text-xs text-slate-500 border-b border-[#1e2a45] bg-[#0a0e1a]"><th className="text-left px-4 py-2">ID</th><th className="text-left px-4 py-2">Decision</th><th className="text-left px-4 py-2">Status</th><th className="text-left px-4 py-2">Date</th></tr></thead>
          <tbody>
            {ADRS.map(a => (
              <tr key={a.id} className="border-b border-[#1e2a45]/40">
                <td className="px-4 py-2 text-blue-400 text-xs">{a.id}</td>
                <td className="px-4 py-2 text-slate-300 text-xs">{a.title}</td>
                <td className="px-4 py-2"><span className="text-xs bg-emerald-800 text-emerald-300 px-1.5 rounded">{a.status}</span></td>
                <td className="px-4 py-2 text-slate-500 text-xs">{a.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
