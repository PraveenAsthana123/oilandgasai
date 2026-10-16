'use client';

export default function SystemConfigPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-white">System Configuration</h1>
      <p className="text-slate-400 text-sm">Portal-wide settings and integrations</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[
          { label: 'DATABASE_URL', value: process.env.DATABASE_URL ? '● configured' : '○ not set', status: !!process.env.DATABASE_URL },
          { label: 'OLLAMA_URL', value: process.env.OLLAMA_URL || 'http://localhost:11434 (default)', status: true },
          { label: 'Portal Port', value: '8382', status: true },
          { label: 'Environment', value: process.env.NODE_ENV || 'development', status: true },
        ].map(c => (
          <div key={c.label} className="bg-[#0f1629] border border-[#1e2a45] rounded p-3 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">{c.label}</div>
              <div className="text-sm text-white mt-0.5">{c.value}</div>
            </div>
            <div className={`w-2 h-2 rounded-full ${c.status ? 'bg-emerald-500' : 'bg-red-500'}`} />
          </div>
        ))}
      </div>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
        <h2 className="text-sm font-semibold text-white mb-3">Environment Variables Required</h2>
        <div className="space-y-2 text-xs font-mono">
          {['DATABASE_URL=postgresql://user:pass@host:5432/ogsales', 'OLLAMA_URL=http://localhost:11434 (optional)'].map(e => (
            <div key={e} className="bg-[#0a0e1a] border border-[#1e2a45] rounded px-3 py-2 text-slate-300">{e}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
