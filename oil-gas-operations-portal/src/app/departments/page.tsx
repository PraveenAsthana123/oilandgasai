'use client';
import { useEffect, useState } from 'react';

interface Department {
  id: number;
  name: string;
  stream: string;
  head_count: number;
  key_kpis: string[] | string;
  ai_use_cases: string[] | string;
}

const STREAM_COLOR: Record<string, string> = {
  upstream: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  midstream: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  downstream: 'text-green-400 bg-green-500/10 border-green-500/30',
  'cross-cutting': 'text-purple-400 bg-purple-500/10 border-purple-500/30',
};

export default function DepartmentsPage() {
  const [data, setData] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetch('/api/departments').then(r => r.json()).then(d => {
      setData(d.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = data.filter(d => !filter || d.stream === filter);
  const totalHeads = data.reduce((s, d) => s + (d.head_count || 0), 0);

  const parseJson = (val: string[] | string): string[] => {
    if (Array.isArray(val)) return val;
    try { return JSON.parse(val); } catch { return []; }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Department Directory</h1>
          <p className="text-gray-400 text-sm mt-1">All 24 departments across Upstream · Midstream · Downstream · Cross-cutting</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-amber-400">{data.length}</div>
          <div className="text-xs text-gray-500">Departments</div>
          <div className="text-xs text-gray-400">{totalHeads} total headcount</div>
        </div>
      </div>

      {/* Stream filter */}
      <div className="flex gap-2">
        {['', 'upstream', 'midstream', 'downstream', 'cross-cutting'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${filter === s ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-[#0f1629] border border-[#1e2a45] text-gray-400 hover:text-white'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading departments...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <div className="text-4xl mb-3">🏢</div>
          <p>No departments found. <a href="/" className="text-amber-400 underline">Seed the database</a> first.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((dept) => {
            const kpis = parseJson(dept.key_kpis);
            const useCases = parseJson(dept.ai_use_cases);
            return (
              <div key={dept.id} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4 hover:border-amber-500/20 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-white text-sm">{dept.name}</div>
                    <span className={`px-2 py-0.5 rounded-full text-xs border mt-1 inline-block ${STREAM_COLOR[dept.stream] || ''}`}>{dept.stream}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-amber-400">{dept.head_count}</div>
                    <div className="text-xs text-gray-500">headcount</div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="text-xs text-gray-500 mb-1.5">Key KPIs</div>
                  <div className="flex flex-wrap gap-1">
                    {kpis.slice(0, 3).map((kpi, i) => (
                      <span key={i} className="text-xs bg-[#1e2a45] text-gray-300 px-2 py-0.5 rounded">{kpi}</span>
                    ))}
                    {kpis.length > 3 && <span className="text-xs text-gray-500">+{kpis.length - 3} more</span>}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 mb-1.5">AI Use Cases</div>
                  <div className="flex flex-wrap gap-1">
                    {useCases.slice(0, 2).map((uc, i) => (
                      <span key={i} className="text-xs text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded">{uc}</span>
                    ))}
                    {useCases.length > 2 && <span className="text-xs text-gray-500">+{useCases.length - 2} more</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
