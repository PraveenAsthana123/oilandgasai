'use client';
import { useEffect, useState } from 'react';

export default function CodeMetricsPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/code-metrics').then(r => r.json()).then(d => { setMetrics(d); setLoading(false); });
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-white">Code Metrics</h1>
      <p className="text-slate-400 text-sm">Real filesystem scan of src/ — file count, lines, dependencies</p>
      {loading ? <div className="text-slate-400">Scanning codebase...</div> : metrics ? (
        <>
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-[#0f1629] border border-[#1e2a45] rounded p-3"><div className="text-xs text-slate-400">TypeScript Files</div><div className="text-xl font-bold text-white">{metrics.fileCount}</div></div>
            <div className="bg-[#0f1629] border border-[#1e2a45] rounded p-3"><div className="text-xs text-slate-400">Total Lines</div><div className="text-xl font-bold text-emerald-400">{metrics.lineCount?.toLocaleString()}</div></div>
            <div className="bg-[#0f1629] border border-[#1e2a45] rounded p-3"><div className="text-xs text-slate-400">Dependencies</div><div className="text-xl font-bold text-blue-400">{metrics.depCount}</div></div>
            <div className="bg-[#0f1629] border border-[#1e2a45] rounded p-3"><div className="text-xs text-slate-400">TODO Count</div><div className="text-xl font-bold text-yellow-400">{metrics.todoCount}</div></div>
          </div>
          <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
            <h2 className="text-sm font-semibold text-white mb-3">Dependencies (from package.json)</h2>
            <div className="flex flex-wrap gap-2">
              {(metrics.deps || []).map((d: string) => <span key={d} className="text-xs bg-[#1e2a45] text-slate-300 px-2 py-0.5 rounded">{d}</span>)}
            </div>
          </div>
          <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
            <h2 className="text-sm font-semibold text-white mb-3">Largest Files</h2>
            <div className="space-y-1">
              {(metrics.largestFiles || []).map((f: any) => (
                <div key={f.file} className="flex justify-between text-xs">
                  <span className="text-slate-400 font-mono">{f.file}</span>
                  <span className="text-emerald-400">{f.lines} lines</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : <div className="text-red-400">Failed to load code metrics.</div>}
    </div>
  );
}
