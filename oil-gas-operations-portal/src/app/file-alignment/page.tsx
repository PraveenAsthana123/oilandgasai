'use client';
export default function FileAlignmentPage() {
  const imports = [
    { file: 'src/app/layout.tsx', imports: ['globals.css', '@/components/Sidebar'], status: 'ok' },
    { file: 'src/components/Sidebar.tsx', imports: ['next/link', 'next/navigation'], status: 'ok' },
    { file: 'src/lib/db.ts', imports: ['pg'], status: 'ok' },
    { file: 'src/app/api/*/route.ts', imports: ['@/lib/db'], status: 'ok' },
    { file: 'src/app/page.tsx', imports: ['react (useEffect/useState)'], status: 'ok' },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">File Alignment</h1>
        <p className="text-gray-400 text-sm mt-1">Dependency map · Breaking change tracker · API contract registry · Compatibility status</p></div>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <h2 className="font-semibold text-white mb-3">Critical File Dependencies</h2>
        <div className="space-y-2">
          {imports.map((imp) => (
            <div key={imp.file} className="flex items-center gap-3 text-xs border border-[#1e2a45]/50 rounded-lg p-3">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${imp.status === 'ok' ? 'bg-green-400' : 'bg-red-400'}`}></span>
              <span className="font-mono text-amber-400">{imp.file}</span>
              <span className="text-gray-500">→ imports →</span>
              <span className="text-gray-300">{imp.imports.join(', ')}</span>
              <span className="ml-auto text-green-400">{imp.status}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <h2 className="font-semibold text-white mb-3">API Contract Registry</h2>
        <div className="space-y-1 text-xs">
          {[
            { route: 'GET /api/health', contract: '{ status, portal, version, db }', breaking: false },
            { route: 'GET/POST /api/init', contract: '{ ok, tables_created, seeded }', breaking: false },
            { route: 'GET /api/use-cases', contract: '{ data[], count } — query: stream, department, ai_type', breaking: false },
            { route: 'GET /api/departments', contract: '{ data[], count }', breaking: false },
            { route: 'GET /api/digital-twins', contract: '{ data[], count }', breaking: false },
            { route: 'GET /api/sensors', contract: '{ data[], count } — query: stream', breaking: false },
            { route: 'POST /api/ai/agents', contract: '{ task_id, status, confidence, response }', breaking: false },
            { route: 'POST /api/ai/rag', contract: '{ query, answer, sources, _mock? }', breaking: false },
          ].map((a) => (
            <div key={a.route} className="flex items-center gap-3 border border-[#1e2a45]/40 rounded px-3 py-2">
              <span className="font-mono text-blue-400 text-xs whitespace-nowrap">{a.route}</span>
              <span className="text-gray-500 text-xs">→</span>
              <span className="text-gray-400 text-xs">{a.contract}</span>
              <span className={`ml-auto text-xs ${a.breaking ? 'text-red-400' : 'text-green-400'}`}>{a.breaking ? 'BREAKING' : 'stable'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
