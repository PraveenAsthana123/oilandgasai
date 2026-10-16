'use client';
import { useEffect, useState } from 'react';

const LP_FLOW_NODES = [
  { id: 'assay', label: 'Crude Assay Database', x: 20, width: 140 },
  { id: 'lp', label: 'Linear Program (LP)', x: 200, width: 130 },
  { id: 'recipe', label: 'Blend Recipe', x: 375, width: 100 },
  { id: 'execution', label: 'Blend Execution', x: 520, width: 115 },
  { id: 'quality', label: 'Quality Verification', x: 685, width: 130 },
  { id: 'order', label: 'Crude Order Next Cycle', x: 870, width: 145 },
];

const LP_CONSTRAINTS = [
  { name: 'CDU Capacity', type: 'Hard', value: '≤ 200,000 bbl/day' },
  { name: 'Distillation spec', type: 'Product', value: 'D86 T10/T50/T90 within spec' },
  { name: 'Viscosity', type: 'Product', value: 'Within pipeline/CDU limits' },
  { name: 'Pour Point', type: 'Product', value: 'Above minimum pumpable temp' },
  { name: 'Tank Capacity', type: 'Logistical', value: 'Crude tank inventory ≤ capacity' },
  { name: 'Crude Availability', type: 'Commercial', value: 'Per contract term volumes' },
  { name: 'Desalter Salt Tolerance', type: 'Equipment', value: '< 1 PTB at blended salt content' },
  { name: 'Furnace Duty', type: 'Equipment', value: 'Blended viscosity drives preheat duty' },
];

const APC_VARIABLES = [
  { type: 'Manipulated Variable (MV)', name: 'CDU flash zone temperature', range: '340–365°C' },
  { type: 'Manipulated Variable (MV)', name: 'Reflux ratio (per draw)', range: '1.5–4.5' },
  { type: 'Manipulated Variable (MV)', name: 'Pump-around duties', range: '50–300 MW' },
  { type: 'Manipulated Variable (MV)', name: 'Product draw rates', range: 'Per product demand' },
  { type: 'Controlled Variable (CV)', name: 'Naphtha endpoint (T90)', range: '175–185°C' },
  { type: 'Controlled Variable (CV)', name: 'Diesel flash point', range: '> 55°C' },
  { type: 'Controlled Variable (CV)', name: 'Residue viscosity', range: '< 380 cSt @50°C' },
  { type: 'Disturbance Variable (DV)', name: 'Crude blend API gravity', range: '20–45°API' },
];

const AI_MODELS = [
  { model: 'Property Blending Model', type: 'ML Nonlinear', desc: 'Handles nonlinear blending for octane, viscosity, pour point (volumetric blending is not linear)', status: 'Active' },
  { model: 'Crude Price Forecaster', type: 'LSTM', desc: 'Time-series model on WTI/Brent/WCS historical prices → 30-day forward price with confidence intervals', status: 'Active' },
  { model: 'Digital Twin–Assisted MPC', type: 'DT + MPC', desc: 'Real-time process simulator calibrated to actual plant → predict column profiles → optimize setpoints over 1-hr prediction horizon', status: 'Active' },
  { model: 'Constraint Softening ML', type: 'ML', desc: 'When multiple constraints are simultaneously active, ML decides which to relax (least-cost constraint violation)', status: 'Active' },
  { model: 'Crude Margin Optimizer', type: 'LP + ML', desc: 'Given refinery configuration + product demand + crude prices, selects optimal crude slate to maximize gross margin', status: 'Active' },
];

export default function ProcessDetailPage() {
  const [activeTab, setActiveTab] = useState('lp');
  const [showFormula, setShowFormula] = useState(false);

  useEffect(() => {}, []);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded text-xs font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30">P-DS-02</span>
          <span className="text-gray-500 text-sm">Downstream / Process Optimization</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Process Optimization & Crude Blending</h1>
        <p className="text-gray-400 text-sm mt-1">
          LP-based crude blend optimization · Advanced Process Control (MPC) · Digital Twin integration
        </p>
      </div>

      {/* Flow SVG */}
      <div className="bg-[#0d1424] border border-[#1e2a45] rounded-xl p-6 overflow-x-auto">
        <h2 className="text-white font-semibold mb-4">Crude Blending Optimization Process Flow</h2>
        <svg width="1060" height="90" viewBox="0 0 1060 90" className="min-w-[1000px]">
          {LP_FLOW_NODES.slice(0, -1).map((node, i) => {
            const next = LP_FLOW_NODES[i + 1];
            const x1 = node.x + node.width;
            const x2 = next.x;
            return (
              <g key={`conn-${i}`}>
                <line x1={x1} y1="40" x2={x2} y2="40" stroke="#374151" strokeWidth="2" />
                <polygon points={`${x2},36 ${x2 - 8},32 ${x2 - 8},44`} fill="#374151" />
              </g>
            );
          })}
          {LP_FLOW_NODES.map((node, i) => (
            <g key={node.id}>
              <rect x={node.x} y="15" width={node.width} height="50" rx="6"
                fill="#111827"
                stroke={i === 1 ? '#f59e0b' : i === 4 ? '#22c55e' : '#374151'}
                strokeWidth={i === 1 ? 2 : 1.5} />
              <text x={node.x + node.width / 2} y="37" textAnchor="middle" fill="white" fontSize="9" fontWeight="600">
                {node.label.length > 18 ? node.label.substring(0, 17) + '…' : node.label}
              </text>
              {i === 1 && <text x={node.x + node.width / 2} y="52" textAnchor="middle" fill="#f59e0b" fontSize="8">⚡ AI-Powered</text>}
            </g>
          ))}
        </svg>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#1e2a45]">
        {[
          { id: 'lp', label: 'LP Formulation' },
          { id: 'apc', label: 'APC / MPC' },
          { id: 'ai', label: 'AI Models' },
          { id: 'constraints', label: 'Constraints' },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === t.id ? 'text-amber-400 border-b-2 border-amber-500' : 'text-gray-400 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* LP Formulation Tab */}
      {activeTab === 'lp' && (
        <div className="space-y-6">
          <div className="bg-[#0d1424] border border-[#1e2a45] rounded-xl p-5">
            <h3 className="text-white font-semibold mb-3">Crude Blending Linear Program (LP) Model</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-[#0a0e1a] border border-amber-500/30 rounded-lg p-4 col-span-1">
                <div className="text-amber-400 text-xs font-semibold mb-2">OBJECTIVE</div>
                <div className="text-gray-300 text-sm">Maximize refinery margin</div>
                <div className="text-gray-500 text-xs mt-1">(Product value − Crude cost − Operating cost)</div>
              </div>
              <div className="bg-[#0a0e1a] border border-blue-500/30 rounded-lg p-4 col-span-1">
                <div className="text-blue-400 text-xs font-semibold mb-2">DECISION VARIABLES</div>
                <div className="text-gray-300 text-sm">Volume of each crude in blend (bbl)</div>
                <div className="text-gray-500 text-xs mt-1">Typically 3–8 crude grades simultaneously</div>
              </div>
              <div className="bg-[#0a0e1a] border border-green-500/30 rounded-lg p-4 col-span-1">
                <div className="text-green-400 text-xs font-semibold mb-2">RUN FREQUENCY</div>
                <div className="text-gray-300 text-sm">Daily (24-hr cycles)</div>
                <div className="text-gray-500 text-xs mt-1">Re-run when crude prices or product demand changes</div>
              </div>
            </div>

            <button onClick={() => setShowFormula(!showFormula)}
              className="flex items-center gap-2 text-amber-400 text-sm hover:text-amber-300 transition-colors mb-3">
              <span>{showFormula ? '▼' : '▶'}</span>
              {showFormula ? 'Hide' : 'Show'} LP Mathematical Formulation
            </button>

            {showFormula && (
              <div className="bg-[#060a14] border border-[#1e2a45] rounded-lg p-4 font-mono text-sm">
                <div className="text-green-400 mb-3">{/* LP Formulation */}</div>
                <div className="text-amber-400 mb-1">Maximize:</div>
                <div className="text-gray-300 mb-3 pl-4">
                  Σ(product_i × price_i) − Σ(crude_j × cost_j) − operating_cost
                </div>
                <div className="text-amber-400 mb-1">Subject to:</div>
                <div className="text-gray-300 pl-4 space-y-1">
                  <div>Σ(crude_j) ≤ CDU_capacity  <span className="text-gray-500 text-xs">[200,000 bbl/day]</span></div>
                  <div>spec_constraints(blend_property) ∈ [min, max]  <span className="text-gray-500 text-xs">[distillation, visc, pour point]</span></div>
                  <div>crude_j ≤ contract_volume_j  <span className="text-gray-500 text-xs">[term contract limits]</span></div>
                  <div>tank_level_j ≤ tank_capacity_j  <span className="text-gray-500 text-xs">[storage constraints]</span></div>
                  <div>crude_j ≥ 0  <span className="text-gray-500 text-xs">[non-negativity]</span></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* APC/MPC Tab */}
      {activeTab === 'apc' && (
        <div className="space-y-6">
          <div className="bg-[#0d1424] border border-[#1e2a45] rounded-xl p-5">
            <h3 className="text-white font-semibold mb-2">Advanced Process Control (APC) — Model Predictive Control (MPC)</h3>
            <p className="text-gray-400 text-sm mb-4">
              MPC uses a process model to predict future behavior over a prediction horizon (typically 1–4 hours),
              then optimizes manipulated variables to meet product spec targets while respecting equipment limits.
              Runs every 1–5 minutes.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1e2a45]">
                    {['Variable Type', 'Variable Name', 'Typical Range'].map(h => (
                      <th key={h} className="text-left text-gray-400 font-medium py-2 px-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {APC_VARIABLES.map((v) => (
                    <tr key={v.name} className="border-b border-[#1e2a45]/50">
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-xs ${v.type.startsWith('Manipulated') ? 'bg-amber-500/20 text-amber-400' : v.type.startsWith('Controlled') ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                          {v.type.split('(')[0].trim()}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-white">{v.name}</td>
                      <td className="py-2 px-3 text-gray-400 font-mono text-xs">{v.range}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* AI Models Tab */}
      {activeTab === 'ai' && (
        <div className="space-y-4">
          {AI_MODELS.map((m) => (
            <div key={m.model} className="bg-[#0d1424] border border-[#1e2a45] rounded-xl p-4 hover:border-amber-500/30 transition-colors">
              <div className="flex items-start gap-3">
                <span className="text-amber-400 text-lg">⚡</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium">{m.model}</span>
                    <span className="px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400">{m.type}</span>
                    <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">{m.status}</span>
                  </div>
                  <div className="text-gray-400 text-sm">{m.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Constraints Tab */}
      {activeTab === 'constraints' && (
        <div className="bg-[#0d1424] border border-[#1e2a45] rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">LP Constraint Register</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e2a45]">
                  {['Constraint', 'Type', 'Value / Limit'].map(h => (
                    <th key={h} className="text-left text-gray-400 font-medium py-2 px-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {LP_CONSTRAINTS.map((c) => (
                  <tr key={c.name} className="border-b border-[#1e2a45]/50">
                    <td className="py-2 px-3 text-white">{c.name}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${c.type === 'Hard' ? 'bg-red-500/20 text-red-400' : c.type === 'Product' ? 'bg-green-500/20 text-green-400' : c.type === 'Equipment' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {c.type}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-gray-400 text-xs font-mono">{c.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
