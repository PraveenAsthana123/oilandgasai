'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface ProcessRow {
  process_id: string;
  process_name: string;
  department: string;
  step_count: number;
  sub_process_count: number;
  status: string;
  avg_cycle_time: string;
  ai_models: string[];
  detail_url: string;
}

const STATUS_COLOR: Record<string, string> = {
  active: 'text-green-400 bg-green-900/30 border-green-700',
  drilling: 'text-amber-400 bg-amber-900/30 border-amber-700',
  exploration: 'text-blue-400 bg-blue-900/30 border-blue-700',
  abandoned: 'text-gray-400 bg-gray-900/30 border-gray-700',
};

const FLOW_NODES = [
  { label: 'Exploration', x: 30, color: '#3b82f6', href: '/upstream/exploration/process', status: 'exploration' },
  { label: 'Well Planning', x: 170, color: '#f59e0b', href: '/upstream/reservoir/process', status: 'active' },
  { label: 'Drilling', x: 310, color: '#f59e0b', href: '/upstream/drilling/process', status: 'drilling' },
  { label: 'Completion', x: 450, color: '#22c55e', href: '/upstream/production/process', status: 'active' },
  { label: 'Production', x: 590, color: '#22c55e', href: '/upstream/production/process', status: 'active' },
  { label: 'Abandonment', x: 730, color: '#6b7280', href: '/upstream/well-integrity/process', status: 'abandoned' },
];

export default function UpstreamProcessesPage() {
  const [data, setData] = useState<{ enriched: ProcessRow[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/upstream/processes')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const rows: ProcessRow[] = data?.enriched ?? [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Upstream Master Process Map</h1>
        <p className="text-gray-400 text-sm mt-1">
          BPM overview of all upstream processes · Exploration → Production → Abandonment
        </p>
      </div>

      {/* SVG Process Flow */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4">Upstream Process Flow</h2>
        <div className="overflow-x-auto">
          <svg width="900" height="200" viewBox="0 0 900 200" className="block">
            {/* Background */}
            <rect width="900" height="200" fill="#0a0e1a" rx="12" />

            {/* Connector arrows */}
            {FLOW_NODES.slice(0, -1).map((node, i) => (
              <g key={`arrow-${i}`}>
                <line
                  x1={node.x + 120}
                  y1={100}
                  x2={FLOW_NODES[i + 1].x}
                  y2={100}
                  stroke="#374151"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
              </g>
            ))}

            {/* Arrowhead marker */}
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#374151" />
              </marker>
            </defs>

            {/* Boxes */}
            {FLOW_NODES.map((node, i) => (
              <g key={`node-${i}`}>
                <a href={node.href}>
                  <rect
                    x={node.x}
                    y={70}
                    width={120}
                    height={60}
                    rx="8"
                    fill={node.color + '22'}
                    stroke={node.color}
                    strokeWidth="2"
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  />
                  <text
                    x={node.x + 60}
                    y={96}
                    textAnchor="middle"
                    fill={node.color}
                    fontSize="11"
                    fontWeight="600"
                  >
                    {node.label}
                  </text>
                  <text
                    x={node.x + 60}
                    y={114}
                    textAnchor="middle"
                    fill="#9ca3af"
                    fontSize="9"
                  >
                    Click for detail
                  </text>
                </a>
                {/* Step number */}
                <circle cx={node.x + 60} cy={50} r={14} fill={node.color + '33'} stroke={node.color} strokeWidth="1" />
                <text x={node.x + 60} y={55} textAnchor="middle" fill={node.color} fontSize="11" fontWeight="700">
                  {i + 1}
                </text>
              </g>
            ))}

            {/* Legend */}
            <g transform="translate(10, 160)">
              {[
                { color: '#3b82f6', label: 'Exploration' },
                { color: '#f59e0b', label: 'Drilling/Planning' },
                { color: '#22c55e', label: 'Active/Producing' },
                { color: '#6b7280', label: 'Abandoned' },
              ].map((l, i) => (
                <g key={l.label} transform={`translate(${i * 180}, 0)`}>
                  <rect width="12" height="12" rx="2" fill={l.color + '44'} stroke={l.color} />
                  <text x="16" y="10" fill="#9ca3af" fontSize="10">{l.label}</text>
                </g>
              ))}
            </g>
          </svg>
        </div>
      </div>

      {/* Process Inventory Table */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4">Process Inventory</h2>
        {loading ? (
          <div className="text-gray-400 text-sm animate-pulse">Loading processes…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e2a45] text-gray-400">
                  <th className="text-left py-3 pr-4 font-medium">Process ID</th>
                  <th className="text-left py-3 pr-4 font-medium">Process Name</th>
                  <th className="text-center py-3 pr-4 font-medium">Sub-processes</th>
                  <th className="text-left py-3 pr-4 font-medium">Department</th>
                  <th className="text-left py-3 pr-4 font-medium">AI Models</th>
                  <th className="text-center py-3 pr-4 font-medium">Status</th>
                  <th className="text-left py-3 pr-4 font-medium">Avg Cycle Time</th>
                  <th className="text-center py-3 font-medium">Go to Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2a45]">
                {rows.map(row => (
                  <tr key={row.process_id} className="hover:bg-[#131d35] transition-colors">
                    <td className="py-3 pr-4 font-mono text-amber-400 text-xs">{row.process_id}</td>
                    <td className="py-3 pr-4 text-white font-medium">{row.process_name}</td>
                    <td className="py-3 pr-4 text-center">
                      <span className="text-white font-bold">{row.sub_process_count}</span>
                      <span className="text-gray-500 text-xs ml-1">sub-processes</span>
                    </td>
                    <td className="py-3 pr-4 text-gray-300 text-xs">{row.department}</td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-1">
                        {(row.ai_models || []).slice(0, 2).map(m => (
                          <span key={m} className="text-xs bg-purple-900/40 border border-purple-700/50 text-purple-300 px-2 py-0.5 rounded">
                            ⚡ {m}
                          </span>
                        ))}
                        {(row.ai_models || []).length > 2 && (
                          <span className="text-xs text-gray-500">+{(row.ai_models || []).length - 2} more</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-center">
                      <span className={`text-xs px-2 py-1 rounded border font-medium capitalize ${STATUS_COLOR[row.status] || STATUS_COLOR.active}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-400 text-xs">{row.avg_cycle_time}</td>
                    <td className="py-3 text-center">
                      <Link
                        href={row.detail_url}
                        className="text-xs text-amber-400 hover:text-amber-300 border border-amber-700/50 hover:border-amber-500 px-3 py-1.5 rounded transition-colors"
                      >
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sub-process detail cards */}
      <div className="grid grid-cols-1 gap-4">
        <h2 className="text-white font-semibold">Sub-process Index</h2>
        {[
          {
            id: 'P-US-01', name: 'Exploration & Geoscience', href: '/upstream/exploration/process',
            subs: ['Seismic Acquisition', 'Seismic Processing', 'Geological Interpretation', 'Prospect Ranking', 'Resource Estimation', 'License Acquisition'],
          },
          {
            id: 'P-US-02', name: 'Well Planning & Design', href: '/upstream/reservoir/process',
            subs: ['Well Program Design', 'Directional Planning', 'Casing Design', 'Mud Program', 'Completion Design', 'Cost Estimation'],
          },
          {
            id: 'P-US-03', name: 'Drilling Operations', href: '/upstream/drilling/process',
            subs: ['Rig Mobilization', 'Spud & Surface Section', 'Intermediate Section', 'Reservoir Section', 'Formation Evaluation', 'Well Control'],
          },
          {
            id: 'P-US-04', name: 'Well Completion & Testing', href: '/upstream/production/process',
            subs: ['Perforation', 'Fracture Stimulation', 'Sand Control', 'Well Testing', 'Production Testing', 'Wellhead Installation'],
          },
          {
            id: 'P-US-05', name: 'Production Operations', href: '/upstream/production/process',
            subs: ['Wellhead Management', 'Artificial Lift', 'Separation', 'Dehydration', 'Metering', 'Export'],
          },
          {
            id: 'P-US-06', name: 'Well Integrity & HSE', href: '/upstream/well-integrity/process',
            subs: ['Barrier Verification', 'Corrosion Monitoring', 'PTW System', 'Incident Response', 'Environmental Compliance', 'Emergency Response'],
          },
        ].map(proc => (
          <div key={proc.id} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-amber-400 bg-amber-900/20 border border-amber-800/40 px-2 py-1 rounded">{proc.id}</span>
                <span className="text-white font-semibold">{proc.name}</span>
              </div>
              <Link href={proc.href} className="text-xs text-amber-400 hover:underline">
                View Full Process →
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {proc.subs.map(sub => (
                <span key={sub} className="text-xs bg-[#0a0e1a] border border-[#1e2a45] text-gray-300 px-3 py-1 rounded-full">
                  {sub}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
