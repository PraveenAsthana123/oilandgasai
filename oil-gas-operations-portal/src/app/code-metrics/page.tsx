'use client';
import { useEffect, useState } from 'react';

interface Metrics { file_count: number; line_count: number; size_kb: number; folder_tree: string[]; largest_files: string[]; dependencies: string[]; tech_debt: { todos: number; console_logs: number } }

export default function CodeMetricsPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    fetch('/api/code-metrics').then(r => r.json()).then(setMetrics).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Code Metrics</h1>
        <p className="text-gray-400 text-sm mt-1">Real fs scan of src/ — file count, line count, size, deps, tech debt</p></div>
      {metrics ? (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Source Files', value: metrics.file_count, icon: '📄' },
            { label: 'Lines of Code', value: metrics.line_count?.toLocaleString(), icon: '📝' },
            { label: 'Source Size', value: `${metrics.size_kb} KB`, icon: '💾' },
            { label: 'TODOs', value: metrics.tech_debt?.todos, icon: '⚠️' },
          ].map((k) => (
            <div key={k.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
              <div className="text-xl mb-2">{k.icon}</div>
              <div className="text-2xl font-bold text-white">{k.value}</div>
              <div className="text-xs text-gray-500 mt-1">{k.label}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">Loading code metrics... (requires /api/code-metrics)</div>
      )}
    </div>
  );
}
