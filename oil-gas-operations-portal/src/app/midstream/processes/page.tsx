'use client';
import { useEffect, useState } from 'react';

interface MidstreamProcess {
  process_id: string;
  stream: string;
  department: string;
  process_name: string;
  step_count: number;
  sub_process_count: number;
  status: string;
  avg_cycle_time: string;
  ai_models: string[];
  detail_url: string;
  sub_processes: string[];
}

interface ProcessesResponse {
  processes: MidstreamProcess[];
  enriched: MidstreamProcess[];
  total: number;
  _source: string;
}

export default function MidstreamProcessesPage() {
  const [data, setData] = useState<ProcessesResponse | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/midstream/processes')
      .then(r => r.json())
      .then((d: ProcessesResponse) => setData(d));
  }, []);

  const processes: MidstreamProcess[] = data?.enriched ?? [];

  const flowNodes = [
    { id: 'gathering', label: 'Gathering', sub: 'P-MS-01', x: 20 },
    { id: 'compression', label: 'Field Compression', sub: 'P-MS-01', x: 175 },
    { id: 'gas-processing', label: 'Gas Processing', sub: 'P-MS-02', x: 345 },
    { id: 'transmission', label: 'Transmission', sub: 'P-MS-03', x: 510 },
    { id: 'storage', label: 'Storage', sub: 'P-MS-05', x: 665 },
    { id: 'distribution', label: 'Distribution / Sales', sub: 'P-MS-06', x: 775 },
  ];

  const statusColor = (s: string) => {
    if (s === 'active') return 'text-green-400 bg-green-500/10';
    if (s === 'drilling') return 'text-blue-400 bg-blue-500/10';
    return 'text-gray-400 bg-gray-500/10';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Midstream Process Master Map</h1>
        <p className="text-gray-400 text-sm mt-1">
          End-to-end midstream value chain — Gathering → Processing → Transmission → Storage → Distribution
        </p>
      </div>

      {/* SVG Flow Diagram */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-6 overflow-x-auto">
        <h2 className="text-sm font-semibold text-amber-400 mb-4 uppercase tracking-wider">Midstream Value Chain Flow</h2>
        <svg viewBox="0 0 980 150" className="w-full min-w-[700px]" style={{ height: 150 }}>
          {/* Background */}
          <rect width="980" height="150" fill="transparent" />

          {/* Arrows between nodes */}
          {[135, 305, 470, 625, 750].map((x, i) => (
            <g key={i}>
              <line x1={x} y1={75} x2={x + 30} y2={75} stroke="#d97706" strokeWidth="2" markerEnd="url(#arrowAmber)" />
            </g>
          ))}

          {/* Arrow marker */}
          <defs>
            <marker id="arrowAmber" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#d97706" />
            </marker>
          </defs>

          {/* Process nodes */}
          {flowNodes.map((node) => (
            <g key={node.id}>
              <rect
                x={node.x}
                y={40}
                width={140}
                height={70}
                rx="8"
                fill="#0a0e1a"
                stroke="#d97706"
                strokeWidth="1.5"
              />
              <foreignObject x={node.x + 4} y={44} width={132} height={62}>
                <div
                  className="flex flex-col items-center justify-center h-full text-center px-1"
                >
                  <span className="text-amber-400 font-semibold" style={{ fontSize: 11 }}>{node.label}</span>
                  <span className="text-gray-500 mt-0.5" style={{ fontSize: 9 }}>{node.sub}</span>
                </div>
              </foreignObject>
            </g>
          ))}

          {/* Title */}
          <text x="490" y="18" textAnchor="middle" fill="#9ca3af" fontSize="11">Midstream Value Chain — 900px flow diagram</text>
        </svg>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Processes', value: '6', unit: 'P-MS-01 to P-MS-06', icon: '⚙️' },
          { label: 'Total Sub-Processes', value: '36', unit: 'across all processes', icon: '🔧' },
          { label: 'AI Models Deployed', value: '18', unit: 'ML / DL models', icon: '🤖' },
          { label: 'Source', value: data?._source ?? '—', unit: 'data origin', icon: '💾' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <div className="text-xl mb-2">{kpi.icon}</div>
            <div className="text-2xl font-bold text-white">{kpi.value}</div>
            <div className="text-xs text-gray-400">{kpi.unit}</div>
            <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Process Inventory Table */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <h2 className="text-sm font-semibold text-amber-400 mb-4 uppercase tracking-wider">Process Inventory — 6 Midstream Processes</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-[#1e2a45] text-gray-400 text-xs uppercase">
                <th className="pb-2 pr-4">ID</th>
                <th className="pb-2 pr-4">Process Name</th>
                <th className="pb-2 pr-4">Department</th>
                <th className="pb-2 pr-4">Steps</th>
                <th className="pb-2 pr-4">Sub-Processes</th>
                <th className="pb-2 pr-4">Cycle Time</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2">Detail</th>
              </tr>
            </thead>
            <tbody>
              {processes.map((proc) => (
                <tr key={proc.process_id} className="border-b border-[#1e2a45]/50 hover:bg-[#1e2a45]/30 transition-colors">
                  <td className="py-3 pr-4 text-amber-400 font-mono text-xs">{proc.process_id}</td>
                  <td className="py-3 pr-4 text-white font-medium">{proc.process_name}</td>
                  <td className="py-3 pr-4 text-gray-400 text-xs">{proc.department}</td>
                  <td className="py-3 pr-4 text-center">
                    <span className="text-amber-400 font-bold">{proc.step_count}</span>
                  </td>
                  <td className="py-3 pr-4 text-center">
                    <span className="text-blue-400 font-bold">{proc.sub_process_count}</span>
                  </td>
                  <td className="py-3 pr-4 text-gray-400 text-xs">{proc.avg_cycle_time}</td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusColor(proc.status)}`}>
                      {proc.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <a href={proc.detail_url} className="text-amber-400 hover:text-amber-300 text-xs underline">
                      View Process →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sub-Process Accordion */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">Sub-Process Detail</h2>
        {processes.map((proc) => (
          <div key={proc.process_id} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === proc.process_id ? null : proc.process_id)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-[#1e2a45]/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-amber-400 font-mono text-xs font-bold">{proc.process_id}</span>
                <span className="text-white font-medium text-sm">{proc.process_name}</span>
                <span className="text-gray-500 text-xs">{proc.sub_process_count} sub-processes</span>
              </div>
              <span className="text-gray-400 text-xs">{expanded === proc.process_id ? '▲ collapse' : '▼ expand'}</span>
            </button>
            {expanded === proc.process_id && (
              <div className="px-4 pb-4 border-t border-[#1e2a45]">
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {proc.sub_processes?.map((sp, i) => (
                    <div key={i} className="flex items-center gap-2 bg-[#0a0e1a] border border-[#1e2a45] rounded-lg p-2">
                      <span className="text-amber-500 text-xs font-bold">{i + 1}.</span>
                      <span className="text-gray-300 text-xs">{sp}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <div className="text-xs text-gray-500 mb-1">AI Models</div>
                  <div className="flex flex-wrap gap-1">
                    {proc.ai_models?.map((m) => (
                      <span key={m} className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded border border-amber-500/20">
                        ⚡ {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation to process detail pages */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { href: '/midstream/pipeline/process', icon: '〰️', label: 'P-MS-03: Pipeline Transmission', desc: 'Receipt → Pumping → Pigging → SCADA → Delivery → Custody Transfer' },
          { href: '/midstream/compression/process', icon: '🔄', label: 'P-MS-01: Compression & Gathering', desc: 'Slug Catcher → Field Separation → Compression → Gas Dehydration → Trunk Line' },
          { href: '/midstream/gas-processing/process', icon: '💨', label: 'P-MS-02: Gas Processing Plant', desc: 'Inlet Sep → Dehydration → Acid Gas → NGL Extraction → Fractionation' },
          { href: '/midstream/storage/process', icon: '🗄️', label: 'P-MS-05: Storage Operations', desc: 'Receipt → Tank Gauging → Quality → Inventory Mgmt → Drawdown → Custody' },
          { href: '/midstream/scada/process', icon: '🖥️', label: 'P-MS-04: SCADA & Control', desc: 'Alarm State Machine · Leak Detection · Cybersecurity Anomaly Detection' },
          { href: '/midstream/metering/process', icon: '📏', label: 'P-MS-06: Custody Transfer Metering', desc: 'Meter Selection → Proving → Measurement → Volume Statement → Reporting' },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="bg-[#0f1629] border border-[#1e2a45] hover:border-amber-500/40 rounded-xl p-4 transition-colors group"
          >
            <div className="text-2xl mb-2">{item.icon}</div>
            <div className="font-medium text-white group-hover:text-amber-400 transition-colors text-sm">{item.label}</div>
            <div className="text-xs text-gray-500 mt-1">{item.desc}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
