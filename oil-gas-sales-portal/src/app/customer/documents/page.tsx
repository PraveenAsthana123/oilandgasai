'use client';

const DOCS = [
  { name: 'Master Service Agreement 2026.pdf', type: 'MSA', size: '1.2 MB', date: '2026-01-15' },
  { name: 'Technical Specifications v2.pdf', type: 'Technical', size: '3.4 MB', date: '2026-03-20' },
  { name: 'SLA and Support Agreement.pdf', type: 'SLA', size: '0.8 MB', date: '2026-01-15' },
  { name: 'Data Processing Agreement.pdf', type: 'DPA', size: '0.5 MB', date: '2026-02-01' },
];

export default function DocumentsPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-white">Documents</h1>
      <div className="space-y-2">
        {DOCS.map(d => (
          <div key={d.name} className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-3 flex items-center gap-4">
            <span className="text-2xl">📄</span>
            <div className="flex-1">
              <div className="text-sm font-medium text-white">{d.name}</div>
              <div className="text-xs text-slate-400 mt-0.5">{d.type} · {d.size} · {d.date}</div>
            </div>
            <button className="text-xs text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded hover:bg-emerald-500/10">Download</button>
          </div>
        ))}
      </div>
    </div>
  );
}
