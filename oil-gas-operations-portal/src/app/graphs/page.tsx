'use client';

import { useState } from 'react';

type Node = { id: string; label: string; x: number; y: number; color: string; type: string; status?: string };
type Edge = { from: string; to: string; label?: string };

const TABS = ['Asset Network', 'AI Model Dependency Map', 'Alert Propagation'];

// Asset Network
const ASSET_NODES: Node[] = [
  { id: 'w1', label: 'Well A-01', x: 80, y: 120, color: '#10b981', type: 'well', status: 'healthy' },
  { id: 'w2', label: 'Well A-02', x: 80, y: 220, color: '#f59e0b', type: 'well', status: 'warning' },
  { id: 'w3', label: 'Well B-01', x: 80, y: 320, color: '#10b981', type: 'well', status: 'healthy' },
  { id: 's1', label: 'Separator S1', x: 220, y: 170, color: '#3b82f6', type: 'separator', status: 'healthy' },
  { id: 's2', label: 'Separator S2', x: 220, y: 300, color: '#10b981', type: 'separator', status: 'healthy' },
  { id: 'c1', label: 'Compressor C1', x: 360, y: 120, color: '#f59e0b', type: 'compressor', status: 'warning' },
  { id: 'p1', label: 'Pipeline P-01', x: 360, y: 260, color: '#10b981', type: 'pipeline', status: 'healthy' },
  { id: 'r1', label: 'Refinery R1', x: 500, y: 200, color: '#ef4444', type: 'refinery', status: 'critical' },
  { id: 't1', label: 'Terminal T1', x: 600, y: 120, color: '#10b981', type: 'terminal', status: 'healthy' },
  { id: 't2', label: 'Distribution D1', x: 600, y: 300, color: '#10b981', type: 'terminal', status: 'healthy' },
];

const ASSET_EDGES: Edge[] = [
  { from: 'w1', to: 's1', label: 'flow' },
  { from: 'w2', to: 's1', label: 'flow' },
  { from: 'w3', to: 's2', label: 'flow' },
  { from: 's1', to: 'c1', label: 'gas' },
  { from: 's1', to: 'p1', label: 'oil' },
  { from: 's2', to: 'p1', label: 'oil' },
  { from: 'c1', to: 'r1', label: 'gas' },
  { from: 'p1', to: 'r1', label: 'crude' },
  { from: 'r1', to: 't1', label: 'products' },
  { from: 'r1', to: 't2', label: 'products' },
];

// AI Model Dependency
const AI_NODES: Node[] = [
  { id: 'd1', label: 'Well Logs CSV', x: 60, y: 60, color: '#6b7280', type: 'dataset' },
  { id: 'd2', label: 'Drilling Params', x: 60, y: 160, color: '#6b7280', type: 'dataset' },
  { id: 'd3', label: 'ILI Pipe Data', x: 60, y: 260, color: '#6b7280', type: 'dataset' },
  { id: 'd4', label: 'IoT Telemetry', x: 60, y: 360, color: '#6b7280', type: 'dataset' },
  { id: 'm1', label: 'Stuck Pipe ML', x: 230, y: 100, color: '#f59e0b', type: 'model' },
  { id: 'm2', label: 'ROP Optimizer', x: 230, y: 200, color: '#3b82f6', type: 'model' },
  { id: 'm3', label: 'Corrosion Pred', x: 230, y: 310, color: '#8b5cf6', type: 'model' },
  { id: 'm4', label: 'Anomaly Det', x: 230, y: 400, color: '#10b981', type: 'model' },
  { id: 'dept1', label: 'Drilling Eng', x: 420, y: 150, color: '#f59e0b', type: 'dept' },
  { id: 'dept2', label: 'Pipeline Int', x: 420, y: 310, color: '#8b5cf6', type: 'dept' },
  { id: 'dept3', label: 'Monitoring', x: 420, y: 400, color: '#10b981', type: 'dept' },
  { id: 'expai', label: 'ExpAI Center', x: 580, y: 240, color: '#ec4899', type: 'platform' },
];

const AI_EDGES: Edge[] = [
  { from: 'd1', to: 'm1', label: 'trains' },
  { from: 'd2', to: 'm1', label: 'feeds' },
  { from: 'd2', to: 'm2', label: 'trains' },
  { from: 'd3', to: 'm3', label: 'trains' },
  { from: 'd4', to: 'm4', label: 'feeds' },
  { from: 'm1', to: 'dept1', label: 'serves' },
  { from: 'm2', to: 'dept1', label: 'serves' },
  { from: 'm3', to: 'dept2', label: 'serves' },
  { from: 'm4', to: 'dept3', label: 'serves' },
  { from: 'dept1', to: 'expai', label: 'explains' },
  { from: 'dept2', to: 'expai', label: 'explains' },
];

// Alert propagation
const ALERT_NODES: Node[] = [
  { id: 'src', label: 'Well A-02\n(ALERT)', x: 80, y: 200, color: '#ef4444', type: 'alert' },
  { id: 'sep', label: 'Separator S1', x: 220, y: 200, color: '#f59e0b', type: 'propagated' },
  { id: 'comp', label: 'Compressor C1', x: 360, y: 120, color: '#f97316', type: 'propagated' },
  { id: 'pipe', label: 'Pipeline P-01', x: 360, y: 280, color: '#fbbf24', type: 'propagated' },
  { id: 'ref', label: 'Refinery R1', x: 500, y: 200, color: '#fbbf24', type: 'propagated' },
  { id: 'ok1', label: 'Well A-01', x: 80, y: 80, color: '#10b981', type: 'ok' },
  { id: 'ok2', label: 'Well B-01', x: 80, y: 320, color: '#10b981', type: 'ok' },
];

const ALERT_EDGES: Edge[] = [
  { from: 'src', to: 'sep', label: 'propagates' },
  { from: 'sep', to: 'comp', label: 'cascades' },
  { from: 'sep', to: 'pipe', label: 'cascades' },
  { from: 'comp', to: 'ref', label: 'cascades' },
  { from: 'pipe', to: 'ref', label: 'cascades' },
];

function GraphSVG({
  nodes, edges, selectedId, onSelect,
}: {
  nodes: Node[]; edges: Edge[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <svg width="100%" viewBox="0 0 680 480" className="border border-[#1e2a45] rounded-xl bg-[#0a0e1a] cursor-pointer">
      {/* Edges */}
      {edges.map((e, i) => {
        const from = nodes.find(n => n.id === e.from);
        const to = nodes.find(n => n.id === e.to);
        if (!from || !to) return null;
        const mx = (from.x + to.x) / 2;
        const my = (from.y + to.y) / 2;
        return (
          <g key={i}>
            <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#1e2a45" strokeWidth="1.5"
              markerEnd="url(#arrow)" />
            {e.label && (
              <text x={mx} y={my - 4} fill="#6b7280" fontSize="7" textAnchor="middle">{e.label}</text>
            )}
          </g>
        );
      })}
      {/* Arrow marker */}
      <defs>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#4b5563" />
        </marker>
      </defs>
      {/* Nodes */}
      {nodes.map(n => (
        <g key={n.id} onClick={() => onSelect(n.id)} className="cursor-pointer">
          <circle cx={n.x} cy={n.y} r={selectedId === n.id ? 22 : 18}
            fill={n.color} opacity="0.2"
            stroke={n.color} strokeWidth={selectedId === n.id ? 2.5 : 1.5}
          />
          {n.status === 'critical' && (
            <circle cx={n.x + 14} cy={n.y - 14} r="5" fill="#ef4444" stroke="#0a0e1a" strokeWidth="1" />
          )}
          {n.status === 'warning' && (
            <circle cx={n.x + 14} cy={n.y - 14} r="5" fill="#f59e0b" stroke="#0a0e1a" strokeWidth="1" />
          )}
          <text x={n.x} y={n.y + 4} fill={n.color} fontSize="8" textAnchor="middle" fontWeight="600">
            {n.label.split('\n')[0].slice(0, 12)}
          </text>
          {n.label.includes('\n') && (
            <text x={n.x} y={n.y + 15} fill={n.color} fontSize="7" textAnchor="middle">
              {n.label.split('\n')[1]}
            </text>
          )}
          <text x={n.x} y={n.y + 27} fill="#6b7280" fontSize="6" textAnchor="middle">
            {n.type}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function GraphsPage() {
  const [tab, setTab] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  const graphData = [
    { nodes: ASSET_NODES, edges: ASSET_EDGES },
    { nodes: AI_NODES, edges: AI_EDGES },
    { nodes: ALERT_NODES, edges: ALERT_EDGES },
  ];

  const { nodes, edges } = graphData[tab];
  const selectedNode = nodes.find(n => n.id === selected);
  const connectedEdges = edges.filter(e => e.from === selected || e.to === selected);
  const connectedNodeIds = new Set(connectedEdges.flatMap(e => [e.from, e.to]).filter(id => id !== selected));
  const connectedNodes = nodes.filter(n => connectedNodeIds.has(n.id));

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs text-amber-500/70 uppercase tracking-wider mb-1">Operations</div>
        <h1 className="text-2xl font-bold text-white">Graph Visualization</h1>
        <p className="text-gray-400 text-sm mt-1">
          Asset network topology · AI model dependencies · Alert propagation — pure SVG, no external libs
        </p>
      </div>

      <div className="flex gap-1">
        {TABS.map((t, i) => (
          <button key={i} onClick={() => { setTab(i); setSelected(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === i
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-gray-400 hover:bg-[#1e2a45] border border-transparent'
            }`}>{t}</button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs flex-wrap">
        {tab === 0 && (
          <>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> Healthy</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> Warning</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Critical</span>
          </>
        )}
        {tab === 1 && (
          <>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gray-500 inline-block" /> Dataset</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> Model</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Department</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-pink-500 inline-block" /> Platform</span>
          </>
        )}
        {tab === 2 && (
          <>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Alert Source</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-500 inline-block" /> Propagated</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> Unaffected</span>
          </>
        )}
        <span className="text-gray-600">Click a node for details</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <GraphSVG nodes={nodes} edges={edges} selectedId={selected} onSelect={setSelected} />
        </div>

        {/* Detail panel */}
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          {selectedNode ? (
            <div>
              <div className="font-semibold text-white mb-1">{selectedNode.label}</div>
              <div className="text-xs text-gray-500 mb-3">Type: <span className="text-amber-400 capitalize">{selectedNode.type}</span></div>
              {selectedNode.status && (
                <div className="text-xs mb-3">
                  Status: <span className={`font-semibold ${
                    selectedNode.status === 'healthy' ? 'text-green-400' :
                    selectedNode.status === 'warning' ? 'text-amber-400' : 'text-red-400'
                  } capitalize`}>{selectedNode.status}</span>
                </div>
              )}
              {connectedNodes.length > 0 && (
                <div>
                  <div className="text-xs text-gray-500 mb-2">Connected Nodes ({connectedNodes.length}):</div>
                  <div className="space-y-1">
                    {connectedNodes.map(cn => {
                      const edge = connectedEdges.find(e => e.from === cn.id || e.to === cn.id);
                      return (
                        <div key={cn.id} className="flex items-center justify-between">
                          <button onClick={() => setSelected(cn.id)}
                            className="text-xs text-blue-400 hover:text-blue-300 underline">{cn.label}</button>
                          {edge?.label && <span className="text-xs text-gray-600">{edge.label}</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-600 text-sm py-8">
              Click any node in the graph to see its details and connections
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
