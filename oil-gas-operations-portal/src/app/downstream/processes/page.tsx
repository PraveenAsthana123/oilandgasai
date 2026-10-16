'use client';
import { useEffect, useState } from 'react';

const MAIN_FLOW = [
  { id: 'crude-receipt', label: 'Crude Receipt', x: 20, color: '#92400e' },
  { id: 'cdu', label: 'Crude Distillation (CDU)', x: 160, color: '#b45309' },
  { id: 'vdu', label: 'Vacuum Distillation (VDU)', x: 320, color: '#d97706' },
  { id: 'conversion', label: 'Conversion Units', x: 480, color: '#f59e0b' },
  { id: 'treating', label: 'Treating', x: 640, color: '#d97706' },
  { id: 'blending', label: 'Blending', x: 780, color: '#b45309' },
  { id: 'distribution', label: 'Product Distribution', x: 910, color: '#92400e' },
];

const CONVERSION_BRANCHES = [
  { label: 'FCC', sub: 'Gasoline · LCO · Slurry', color: '#ef4444' },
  { label: 'Hydrocracker', sub: 'Diesel · Jet Fuel · Naphtha', color: '#f97316' },
  { label: 'Coker', sub: 'Coke · Gas Oil · Naphtha', color: '#eab308' },
  { label: 'Reformer', sub: 'High-Octane Reformate', color: '#22c55e' },
  { label: 'Isomerization', sub: 'C5/C6 Isomerate', color: '#06b6d4' },
  { label: 'Alkylation', sub: 'Alkylate (High Octane)', color: '#8b5cf6' },
];

const PROCESS_INVENTORY = [
  { id: 'P-DS-01', name: 'Crude Distillation (CDU/VDU)', stream: 'Downstream', subProcesses: 5, aiModels: 8, kpis: 'Cut yield %, energy kJ/bbl, CDU throughput bpd', status: 'Active' },
  { id: 'P-DS-02', name: 'Process Optimization & Crude Blending', stream: 'Downstream', subProcesses: 4, aiModels: 5, kpis: 'Refinery margin $/bbl, LP iterations/day, blend error %', status: 'Active' },
  { id: 'P-DS-03', name: 'Product Quality Control', stream: 'Downstream', subProcesses: 5, aiModels: 6, kpis: 'Lab TAT hrs, spec compliance %, NIR accuracy %', status: 'Active' },
  { id: 'P-DS-04', name: 'Product Distribution', stream: 'Downstream', subProcesses: 5, aiModels: 4, kpis: 'Loading rack utilization %, delivery on-time %, truck queue min', status: 'Active' },
  { id: 'P-DS-05', name: 'Commercial & Trading', stream: 'Downstream', subProcesses: 5, aiModels: 6, kpis: 'Crude procurement $/bbl, crack spread $/bbl, PnL $MM', status: 'Active' },
  { id: 'P-DS-06', name: 'Environmental Compliance', stream: 'Downstream', subProcesses: 5, aiModels: 5, kpis: 'SO2 ppm, NOx ppm, GHG tCO2e/yr, wastewater oil ppm', status: 'Active' },
];

export default function DownstreamProcessMapPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { setLoaded(true); }, []);

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">DOWNSTREAM</span>
          <span className="text-gray-500 text-sm">Process Engineering</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Downstream Master Process Map</h1>
        <p className="text-gray-400 text-sm mt-1">
          Refinery process flow from crude receipt through product distribution — 6 main processes · 34 AI models deployed
        </p>
      </div>

      {/* Main Flow SVG */}
      <div className="bg-[#0d1424] border border-[#1e2a45] rounded-xl p-6 overflow-x-auto">
        <h2 className="text-white font-semibold mb-4">Main Downstream Process Flow</h2>
        <svg width="1060" height="150" viewBox="0 0 1060 150" className="min-w-[1000px]">
          {/* Connecting arrows between main nodes */}
          {MAIN_FLOW.slice(0, -1).map((node, i) => {
            const next = MAIN_FLOW[i + 1];
            const x1 = node.x + (i === 0 ? 90 : i === 1 ? 120 : i === 2 ? 120 : i === 3 ? 110 : i === 4 ? 80 : 90);
            const x2 = next.x;
            return (
              <g key={`arrow-${i}`}>
                <line x1={x1} y1="55" x2={x2} y2="55" stroke="#374151" strokeWidth="2" />
                <polygon points={`${x2},51 ${x2-8},47 ${x2-8},59`} fill="#374151" />
              </g>
            );
          })}
          {/* Main flow boxes */}
          {MAIN_FLOW.map((node) => (
            <g key={node.id} className="cursor-pointer" onClick={() => setSelected(selected === node.id ? null : node.id)}>
              <rect
                x={node.x} y="30"
                width={node.id === 'crude-receipt' ? 90 : node.id === 'cdu' ? 120 : node.id === 'vdu' ? 120 : node.id === 'conversion' ? 110 : node.id === 'treating' ? 80 : node.id === 'blending' ? 90 : 110}
                height="50" rx="6"
                fill={selected === node.id ? '#1e2a45' : '#111827'}
                stroke={node.color} strokeWidth={selected === node.id ? 2 : 1.5}
              />
              <text
                x={node.x + (node.id === 'crude-receipt' ? 45 : node.id === 'cdu' ? 60 : node.id === 'vdu' ? 60 : node.id === 'conversion' ? 55 : node.id === 'treating' ? 40 : node.id === 'blending' ? 45 : 55)}
                y="52" textAnchor="middle" fill="white" fontSize="9" fontWeight="600"
              >
                {node.label.split('(')[0].trim()}
              </text>
              {node.label.includes('(') && (
                <text
                  x={node.x + (node.id === 'cdu' ? 60 : node.id === 'vdu' ? 60 : 55)}
                  y="65" textAnchor="middle" fill="#9ca3af" fontSize="8"
                >
                  {node.label.match(/\(([^)]+)\)/)?.[1] ?? ''}
                </text>
              )}
            </g>
          ))}
          {/* CDU→VDU residue arrow going down */}
          <line x1="280" y1="80" x2="280" y2="105" stroke="#6b7280" strokeWidth="1.5" strokeDasharray="4,2" />
          <text x="285" y="118" fill="#6b7280" fontSize="7">Atmospheric Residue 370°C+</text>
          {/* Conversion branch indicator */}
          <line x1="535" y1="80" x2="535" y2="105" stroke="#f59e0b" strokeWidth="1.5" />
          <text x="540" y="118" fill="#f59e0b" fontSize="7">6 Conversion Units ↓</text>
          {/* Legend */}
          <rect x="5" y="130" width="8" height="8" fill="#f59e0b" rx="1" />
          <text x="16" y="138" fill="#9ca3af" fontSize="7">Main Flow</text>
          <rect x="80" y="130" width="8" height="8" fill="none" stroke="#6b7280" strokeWidth="1" strokeDasharray="2,1" rx="1" />
          <text x="91" y="138" fill="#9ca3af" fontSize="7">Product Streams</text>
        </svg>
      </div>

      {/* Conversion Units Branch */}
      <div className="bg-[#0d1424] border border-[#1e2a45] rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4">Conversion Unit Details <span className="text-amber-400 text-sm">(branches from CDU/VDU)</span></h2>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {CONVERSION_BRANCHES.map((branch) => (
            <div key={branch.label} className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg p-3 hover:border-amber-500/40 transition-colors">
              <div className="font-semibold text-sm mb-1" style={{ color: branch.color }}>{branch.label}</div>
              <div className="text-gray-400 text-xs leading-relaxed">{branch.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Process Inventory Table */}
      <div className="bg-[#0d1424] border border-[#1e2a45] rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4">Downstream Process Inventory</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e2a45]">
                {['Process ID', 'Process Name', 'Stream', 'Sub-Processes', 'AI Models', 'Key KPIs', 'Status'].map(h => (
                  <th key={h} className="text-left text-gray-400 font-medium py-2 px-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PROCESS_INVENTORY.map((p, i) => (
                <tr key={p.id} className={`border-b border-[#1e2a45]/50 hover:bg-[#1e2a45]/20 transition-colors ${loaded ? 'opacity-100' : 'opacity-0'}`}
                  style={{ transitionDelay: `${i * 60}ms` }}>
                  <td className="py-3 px-3 text-amber-400 font-mono text-xs">{p.id}</td>
                  <td className="py-3 px-3 text-white font-medium">{p.name}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30">{p.stream}</span>
                  </td>
                  <td className="py-3 px-3 text-gray-300">{p.subProcesses}</td>
                  <td className="py-3 px-3 text-blue-400">{p.aiModels}</td>
                  <td className="py-3 px-3 text-gray-400 text-xs max-w-xs">{p.kpis}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400">{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'P-DS-01: CDU/VDU Refining', href: '/downstream/refining/process', icon: '🏭' },
          { label: 'P-DS-02: Process Optimization', href: '/downstream/process/detail', icon: '⚙️' },
          { label: 'P-DS-03: Quality Control', href: '/downstream/quality/process', icon: '🔬' },
          { label: 'P-DS-04: Distribution', href: '/downstream/distribution/process', icon: '🚛' },
          { label: 'P-DS-05: Commercial & Trading', href: '/downstream/trading/process', icon: '📈' },
          { label: 'P-DS-06: Environmental', href: '/downstream/environmental/process', icon: '🌿' },
        ].map((link) => (
          <a key={link.href} href={link.href}
            className="bg-[#0d1424] border border-[#1e2a45] rounded-xl p-4 hover:border-amber-500/50 hover:bg-[#1e2a45]/30 transition-all group flex items-center gap-3">
            <span className="text-2xl">{link.icon}</span>
            <div>
              <div className="text-white font-medium text-sm group-hover:text-amber-400 transition-colors">{link.label}</div>
              <div className="text-gray-500 text-xs mt-0.5">View process detail →</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
