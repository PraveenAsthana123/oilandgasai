'use client';
import { useEffect, useState } from 'react';

interface UseCase {
  id: number;
  stream: string;
  department: string;
  use_case_name: string;
  ai_type: string;
  technology: string;
  model_name: string;
  data_input: string;
  output_type: string;
  business_value: string;
  status: string;
}

const STATUS_COLOR: Record<string, string> = {
  deployed: 'text-green-400 bg-green-500/10 border-green-500/30',
  active: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  planned: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  development: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
};

const STREAM_COLOR: Record<string, string> = {
  upstream: 'text-amber-400 bg-amber-500/10',
  midstream: 'text-blue-400 bg-blue-500/10',
  downstream: 'text-green-400 bg-green-500/10',
  'cross-cutting': 'text-purple-400 bg-purple-500/10',
};

export default function UseCasesPage() {
  const [data, setData] = useState<UseCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStream, setFilterStream] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterAI, setFilterAI] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<UseCase | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filterStream) params.set('stream', filterStream);
    if (filterDept) params.set('department', filterDept);
    if (filterAI) params.set('ai_type', filterAI);
    fetch(`/api/use-cases?${params}`).then(r => r.json()).then(d => {
      setData(d.data || []);
      setLoading(false);
    });
  }, [filterStream, filterDept, filterAI]);

  const filtered = data.filter(uc =>
    !search || uc.use_case_name.toLowerCase().includes(search.toLowerCase()) ||
    uc.technology.toLowerCase().includes(search.toLowerCase()) ||
    uc.department.toLowerCase().includes(search.toLowerCase())
  );

  const streams = ['', 'upstream', 'midstream', 'downstream', 'cross-cutting'];
  const aiTypes = ['', 'Deep Learning', 'Statistical ML', 'Digital Twin', 'Computer Vision', 'RAG', 'IoT', 'Reinforcement Learning'];

  const streamCounts = data.reduce((acc: Record<string, number>, uc) => {
    acc[uc.stream] = (acc[uc.stream] || 0) + 1;
    return acc;
  }, {});

  const deployedCount = data.filter(d => d.status === 'deployed').length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Use Case Registry</h1>
          <p className="text-gray-400 text-sm mt-1">All AI/ML use cases across Upstream · Midstream · Downstream · Cross-cutting</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-amber-400">{data.length}</div>
          <div className="text-xs text-gray-500">Total Use Cases</div>
          <div className="text-xs text-green-400">{deployedCount} deployed</div>
        </div>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(streamCounts).map(([s, c]) => (
          <button key={s} onClick={() => setFilterStream(filterStream === s ? '' : s)}
            className={`px-3 py-1 rounded-full text-xs border transition-colors ${
              filterStream === s ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : `${STREAM_COLOR[s] || ''} border-current/30`
            }`}>
            {s}: {c}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-4 gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search use cases..."
          className="bg-[#0f1629] border border-[#1e2a45] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50" />
        <select value={filterStream} onChange={e => setFilterStream(e.target.value)}
          className="bg-[#0f1629] border border-[#1e2a45] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50">
          {streams.map(s => <option key={s} value={s}>{s || 'All Streams'}</option>)}
        </select>
        <select value={filterAI} onChange={e => setFilterAI(e.target.value)}
          className="bg-[#0f1629] border border-[#1e2a45] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50">
          {aiTypes.map(t => <option key={t} value={t}>{t || 'All AI Types'}</option>)}
        </select>
        <input value={filterDept} onChange={e => setFilterDept(e.target.value)} placeholder="Filter by department..."
          className="bg-[#0f1629] border border-[#1e2a45] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50" />
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading use cases from database...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <div className="text-4xl mb-3">📋</div>
          <p>No use cases found. <a href="/" className="text-amber-400 underline">Seed the database</a> first.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-400 border-b border-[#1e2a45]">
                {['ID', 'Stream', 'Department', 'Use Case', 'AI Type', 'Technology', 'Model', 'Data Input', 'Output', 'Business Value', 'Status'].map(h => (
                  <th key={h} className="text-left py-2 px-2 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((uc) => (
                <tr key={uc.id} onClick={() => setSelected(selected?.id === uc.id ? null : uc)}
                  className="border-b border-[#1e2a45]/50 hover:bg-[#1e2a45]/30 cursor-pointer transition-colors">
                  <td className="py-2 px-2 text-gray-500">{uc.id}</td>
                  <td className="py-2 px-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${STREAM_COLOR[uc.stream] || ''}`}>{uc.stream}</span>
                  </td>
                  <td className="py-2 px-2 text-gray-300 max-w-[120px] truncate">{uc.department}</td>
                  <td className="py-2 px-2 text-white font-medium max-w-[160px]">{uc.use_case_name}</td>
                  <td className="py-2 px-2 text-amber-400/80 max-w-[120px] truncate">{uc.ai_type}</td>
                  <td className="py-2 px-2 text-gray-300 max-w-[140px] truncate">{uc.technology}</td>
                  <td className="py-2 px-2 text-blue-400/80 max-w-[100px] truncate font-mono">{uc.model_name}</td>
                  <td className="py-2 px-2 text-gray-400 max-w-[120px] truncate">{uc.data_input}</td>
                  <td className="py-2 px-2 text-gray-400 max-w-[120px] truncate">{uc.output_type}</td>
                  <td className="py-2 px-2 text-green-400/80 max-w-[160px] truncate">{uc.business_value}</td>
                  <td className="py-2 px-2">
                    <span className={`px-2 py-0.5 rounded border text-xs ${STATUS_COLOR[uc.status] || ''}`}>{uc.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail panel */}
      {selected && (
        <div className="bg-[#0f1629] border border-amber-500/30 rounded-xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">{selected.use_case_name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded text-xs ${STREAM_COLOR[selected.stream] || ''}`}>{selected.stream}</span>
                <span className="text-gray-400 text-xs">{selected.department}</span>
              </div>
            </div>
            <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white text-xl">×</button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><div className="text-gray-500 text-xs mb-1">AI Type</div><div className="text-amber-400">{selected.ai_type}</div></div>
            <div><div className="text-gray-500 text-xs mb-1">Technology</div><div className="text-white">{selected.technology}</div></div>
            <div><div className="text-gray-500 text-xs mb-1">Model</div><div className="text-blue-400 font-mono text-xs">{selected.model_name}</div></div>
            <div><div className="text-gray-500 text-xs mb-1">Status</div><span className={`px-2 py-0.5 rounded border text-xs ${STATUS_COLOR[selected.status] || ''}`}>{selected.status}</span></div>
            <div><div className="text-gray-500 text-xs mb-1">Data Input</div><div className="text-gray-300 text-xs">{selected.data_input}</div></div>
            <div><div className="text-gray-500 text-xs mb-1">Output Type</div><div className="text-gray-300 text-xs">{selected.output_type}</div></div>
            <div className="col-span-2"><div className="text-gray-500 text-xs mb-1">Business Value</div><div className="text-green-400 text-xs">{selected.business_value}</div></div>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-600 text-right">Showing {filtered.length} of {data.length} use cases • Click any row for details</div>
    </div>
  );
}
