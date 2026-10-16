'use client';
import { useEffect, useState } from 'react';

const CDU_FLOW_NODES = [
  { id: 'desalting', label: 'Crude Desalting', x: 20, width: 110 },
  { id: 'cdu', label: 'Atmospheric Distillation (CDU)', x: 165, width: 160 },
  { id: 'vdu', label: 'Vacuum Distillation (VDU)', x: 370, width: 150 },
  { id: 'naphtha', label: 'Naphtha Stabilization', x: 565, width: 130 },
  { id: 'rundown', label: 'Product Rundown', x: 740, width: 110 },
];

const CDU_PRODUCTS = [
  { cut: 'Naphtha', range: 'IBP–180°C', use: 'Gasoline blending, petrochemical feed' },
  { cut: 'Kerosene/Jet', range: '150–260°C', use: 'Aviation turbine fuel (ATF)' },
  { cut: 'Gas Oil/Diesel', range: '200–370°C', use: 'Diesel blending, heating oil' },
  { cut: 'Atmospheric Residue', range: '370°C+', use: 'VDU feed or fuel oil' },
];

const VDU_PRODUCTS = [
  { cut: 'LVGO', desc: 'Light Vacuum Gas Oil', use: 'Hydrocracker feed' },
  { cut: 'HVGO', desc: 'Heavy Vacuum Gas Oil', use: 'FCC feed' },
  { cut: 'Vacuum Residue', desc: 'Vacuum bottoms', use: 'Coker feed, asphalt, bunker fuel' },
];

const FCC_STEPS = [
  { step: '1', name: 'Riser Reaction', detail: 'Feed contacts hot catalyst (700°C) in riser → rapid cracking reactions (< 5 sec)', output: 'Cracked products + spent catalyst' },
  { step: '2', name: 'Product Separation', detail: 'Cyclones separate catalyst from vapors → distillation in main fractionator', output: 'FCC gasoline, LPG, LCO, HCO, slurry' },
  { step: '3', name: 'Stripper', detail: 'Steam strips remaining hydrocarbons from spent catalyst', output: 'Stripped catalyst' },
  { step: '4', name: 'Regenerator', detail: 'Air burns coke off catalyst at 720°C → regenerated catalyst recycled to riser', output: 'Hot regenerated catalyst + flue gas' },
];

const AI_MODELS = [
  { model: 'Desalter Efficiency Optimizer', step: 'Desalting', type: 'ML', input: 'Wash water rate, mix valve ΔP, temp', output: 'Optimal desalter setpoints → <1 PTB salt' },
  { model: 'Corrosion Rate Predictor', step: 'Desalting', type: 'ML', input: 'Salt content, temperature, chloride', output: 'Overhead condenser corrosion rate → inhibitor schedule' },
  { model: 'Cut Point Optimizer', step: 'CDU', type: 'ML Real-time', input: 'Crude blend properties, product demand', output: 'Pump-around & draw rates → max value yield' },
  { model: 'Column Stability Monitor', step: 'CDU', type: 'ML', input: 'Tray temperatures', output: 'Flood/weep detection → stability alert' },
  { model: 'Fouling Rate Predictor', step: 'CDU', type: 'ML', input: 'Heat exchanger skin temperatures', output: 'Predicted cleaning schedule' },
  { model: 'Vacuum Level Controller', step: 'VDU', type: 'ML+PID', input: 'Vacuum pressure, HVGO draw rate', output: 'Optimal vacuum setpoint → max HVGO yield' },
  { model: 'Color Spec Predictor', step: 'VDU', type: 'ML', input: 'VDU operating conditions', output: 'VGO color/contamination prediction' },
  { model: 'Catalyst Deactivation Model', step: 'FCC', type: 'ML Regression', input: 'Feed metals, time, E-cat properties', output: 'MAT activity prediction → catalyst addition rate' },
  { model: 'FCC Yield Predictor', step: 'FCC', type: 'ML', input: 'Feed props, catalyst activity, operating conditions', output: 'Product yields before batch execution' },
  { model: 'Regenerator Temp Controller', step: 'FCC', type: 'ML+MPC', input: 'Regenerator sensors, coke on catalyst', output: 'Optimal air rate, avoid afterburning' },
  { model: 'Catalyst Temp Profile Optimizer', step: 'Hydrocracker', type: 'ML+MPC', input: 'Bed temperature profiles', output: 'Hot spot management → extended cycle' },
  { model: 'H₂ Consumption Predictor', step: 'Hydrocracker', type: 'ML', input: 'Feed properties (N, S, density)', output: 'H₂ consumption for refinery H₂ balance' },
  { model: 'Product Quality Predictor (HCK)', step: 'Hydrocracker', type: 'ML Real-time', input: 'Operating conditions', output: 'Cetane index, cloud point, density (no lab wait)' },
];

const KPIS = [
  { name: 'CDU Throughput', unit: 'bpd', target: '200,000–300,000', stream: 'CDU' },
  { name: 'Outlet Salt Content', unit: 'PTB', target: '< 1', stream: 'Desalting' },
  { name: 'BS&W', unit: '%', target: '< 0.1', stream: 'Desalting' },
  { name: 'Naphtha Yield', unit: '%', target: '15–25', stream: 'CDU' },
  { name: 'HVGO Yield', unit: '%', target: '20–30', stream: 'VDU' },
  { name: 'FCC Conversion', unit: '%', target: '70–80', stream: 'FCC' },
  { name: 'FCC Gasoline Yield', unit: '%', target: '40–50', stream: 'FCC' },
  { name: 'FCC Coke Yield', unit: '%', target: '4–8', stream: 'FCC' },
  { name: 'Hydrocracker Conversion', unit: '%', target: '60–95', stream: 'HCK' },
  { name: 'Product Sulphur (ULSD)', unit: 'ppm', target: '< 15', stream: 'HCK' },
];

export default function RefiningProcessPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedStep, setExpandedStep] = useState<string | null>('desalting');

  useEffect(() => {}, []);

  const tabs = ['overview', 'cdu-vdu', 'fcc', 'hydrocracker', 'ai-models', 'kpis'];
  const tabLabels: Record<string, string> = {
    overview: 'Overview', 'cdu-vdu': 'CDU/VDU Detail', fcc: 'FCC Process', hydrocracker: 'Hydrocracker/HT', 'ai-models': 'AI Models', kpis: 'KPIs'
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded text-xs font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30">P-DS-01</span>
          <span className="text-gray-500 text-sm">Downstream / Refining</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Crude Distillation Process (CDU/VDU)</h1>
        <p className="text-gray-400 text-sm mt-1">
          Crude desalting → atmospheric distillation → vacuum distillation → FCC/Hydrocracker conversion → product rundown
        </p>
      </div>

      {/* SVG Flow */}
      <div className="bg-[#0d1424] border border-[#1e2a45] rounded-xl p-6 overflow-x-auto">
        <h2 className="text-white font-semibold mb-4">Process Flow Diagram</h2>
        <svg width="900" height="110" viewBox="0 0 900 110" className="min-w-[860px]">
          {/* Connectors */}
          {CDU_FLOW_NODES.slice(0, -1).map((node, i) => {
            const next = CDU_FLOW_NODES[i + 1];
            const x1 = node.x + node.width;
            const x2 = next.x;
            return (
              <g key={`conn-${i}`}>
                <line x1={x1} y1="45" x2={x2} y2="45" stroke="#374151" strokeWidth="2" />
                <polygon points={`${x2},41 ${x2 - 8},37 ${x2 - 8},49`} fill="#374151" />
              </g>
            );
          })}
          {/* Nodes */}
          {CDU_FLOW_NODES.map((node, i) => (
            <g key={node.id}>
              <rect x={node.x} y="20" width={node.width} height="50" rx="6"
                fill="#111827" stroke={i === 0 ? '#92400e' : i === 1 ? '#f59e0b' : i === 2 ? '#d97706' : i === 3 ? '#b45309' : '#92400e'}
                strokeWidth="1.5" />
              <text x={node.x + node.width / 2} y="42" textAnchor="middle" fill="white" fontSize="9" fontWeight="600">
                {node.label.length > 20 ? node.label.substring(0, 18) + '…' : node.label}
              </text>
              {node.label.includes('(') && (
                <text x={node.x + node.width / 2} y="56" textAnchor="middle" fill="#9ca3af" fontSize="8">
                  {node.label.match(/\(([^)]+)\)/)?.[1] ?? ''}
                </text>
              )}
            </g>
          ))}
          {/* CDU products arrow */}
          <line x1="245" y1="70" x2="245" y2="92" stroke="#f59e0b" strokeWidth="1.5" />
          <text x="248" y="102" fill="#f59e0b" fontSize="7">Naphtha · Kero · Diesel · Residue</text>
          {/* VDU products arrow */}
          <line x1="445" y1="70" x2="445" y2="92" stroke="#d97706" strokeWidth="1.5" />
          <text x="448" y="102" fill="#d97706" fontSize="7">LVGO · HVGO · Vac Residue</text>
        </svg>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#1e2a45] overflow-x-auto">
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === t ? 'text-amber-400 border-b-2 border-amber-500' : 'text-gray-400 hover:text-white'}`}>
            {tabLabels[t]}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0d1424] border border-[#1e2a45] rounded-xl p-5">
            <h3 className="text-white font-semibold mb-3">Process Purpose</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              The Crude Distillation Unit (CDU) separates crude oil into distinct fractions by boiling point using atmospheric pressure.
              The heavier atmospheric residue (370°C+) is further processed in the Vacuum Distillation Unit (VDU) at 10–50 mmHg absolute
              pressure to avoid thermal cracking, yielding valuable gas oil fractions for conversion units.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { k: 'CDU Capacity', v: '200,000–300,000 bpd' },
                { k: 'Feed', v: 'Desalted crude' },
                { k: 'CDU Pressure', v: '1.2 bar' },
                { k: 'Fired Heater Outlet', v: '350°C' },
                { k: 'VDU Pressure', v: '10–50 mmHg' },
                { k: 'Watson K Factor', v: 'Kw = T_MeABP^(1/3) / SG_60' },
              ].map(({ k, v }) => (
                <div key={k} className="bg-[#0a0e1a] rounded-lg p-3 border border-[#1e2a45]">
                  <div className="text-gray-500 text-xs">{k}</div>
                  <div className="text-amber-400 text-sm font-medium mt-0.5">{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#0d1424] border border-[#1e2a45] rounded-xl p-5">
            <h3 className="text-white font-semibold mb-3">Process Steps</h3>
            <div className="space-y-2">
              {['Crude Desalting', 'Atmospheric Distillation (CDU)', 'Vacuum Distillation (VDU)', 'FCC (Fluid Catalytic Cracking)', 'Hydrocracker/Hydrotreater'].map((step, i) => (
                <div key={step} className="flex items-center gap-3 p-2 rounded bg-[#0a0e1a] border border-[#1e2a45] cursor-pointer hover:border-amber-500/40 transition-colors"
                  onClick={() => setExpandedStep(expandedStep === step ? null : step)}>
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold">{i + 1}</span>
                  <span className="text-white text-sm">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CDU/VDU Tab */}
      {activeTab === 'cdu-vdu' && (
        <div className="space-y-6">
          {/* Step 1: Desalting */}
          <div className="bg-[#0d1424] border border-[#1e2a45] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold">1</span>
              <h3 className="text-white font-semibold">Step 1: Crude Desalting</h3>
            </div>
            <p className="text-gray-400 text-sm mb-3">
              <strong className="text-gray-200">Purpose:</strong> Remove salt (NaCl, MgCl₂, CaCl₂) to &lt;1 PTB (pounds of salt per thousand barrels) to prevent corrosion and fouling downstream.
            </p>
            <div className="bg-[#0a0e1a] rounded-lg p-3 border border-[#1e2a45] mb-3">
              <div className="text-amber-400 text-xs font-semibold mb-1">Electrostatic Desalting Process</div>
              <div className="text-gray-400 text-sm">
                Mix crude with wash water → electric field (electrostatic desalter) → salt + water droplets coalesce →
                settle to bottom → desalted crude exits top
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Target Salt', value: '< 1 PTB' },
                { label: 'Wash Water', value: '3–8 vol%' },
                { label: 'Temperature', value: '120–150°C' },
                { label: 'BS&W Out', value: '< 0.1%' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[#0a0e1a] rounded p-2 border border-[#1e2a45] text-center">
                  <div className="text-gray-500 text-xs">{label}</div>
                  <div className="text-amber-400 font-semibold text-sm">{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: CDU */}
          <div className="bg-[#0d1424] border border-[#1e2a45] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold">2</span>
              <h3 className="text-white font-semibold">Step 2: Atmospheric Distillation (CDU)</h3>
            </div>
            <p className="text-gray-400 text-sm mb-3">
              Feed: Desalted crude (200,000–300,000 bpd). Column: 1.2 bar, 350°C fired heater outlet temperature.
            </p>
            <div className="text-xs font-semibold text-gray-400 mb-2">CDU PRODUCT CUT POINTS</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1e2a45]">
                    {['Product Cut', 'Cut Point Range', 'Primary Use'].map(h => (
                      <th key={h} className="text-left text-gray-400 font-medium py-2 px-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CDU_PRODUCTS.map((p) => (
                    <tr key={p.cut} className="border-b border-[#1e2a45]/50">
                      <td className="py-2 px-3 text-amber-400 font-medium">{p.cut}</td>
                      <td className="py-2 px-3 text-blue-400 font-mono text-xs">{p.range}</td>
                      <td className="py-2 px-3 text-gray-300">{p.use}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 bg-[#0a0e1a] rounded p-3 border border-amber-500/20">
              <span className="text-amber-400 text-xs font-semibold">⚡ Watson K Factor: </span>
              <span className="text-gray-300 text-xs font-mono">Kw = T_MeABP^(1/3) / SG_60 </span>
              <span className="text-gray-500 text-xs">— where T_MeABP is mean average boiling point in Rankine, used for crude characterization</span>
            </div>
          </div>

          {/* Step 3: VDU */}
          <div className="bg-[#0d1424] border border-[#1e2a45] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold">3</span>
              <h3 className="text-white font-semibold">Step 3: Vacuum Distillation (VDU)</h3>
            </div>
            <p className="text-gray-400 text-sm mb-3">
              Feed: Atmospheric residue (370°C+). Operating pressure: 10–50 mmHg absolute (vacuum) to boil heavy fractions
              at lower temperatures, avoiding thermal cracking.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1e2a45]">
                    {['Product', 'Description', 'Downstream Use'].map(h => (
                      <th key={h} className="text-left text-gray-400 font-medium py-2 px-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {VDU_PRODUCTS.map((p) => (
                    <tr key={p.cut} className="border-b border-[#1e2a45]/50">
                      <td className="py-2 px-3 text-amber-400 font-semibold">{p.cut}</td>
                      <td className="py-2 px-3 text-gray-300">{p.desc}</td>
                      <td className="py-2 px-3 text-blue-400">{p.use}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* FCC Tab */}
      {activeTab === 'fcc' && (
        <div className="space-y-6">
          <div className="bg-[#0d1424] border border-[#1e2a45] rounded-xl p-5">
            <h3 className="text-white font-semibold mb-3">Step 4: Fluid Catalytic Cracking (FCC)</h3>
            <p className="text-gray-400 text-sm mb-4">
              <strong className="text-gray-200">Purpose:</strong> Convert heavy HVGO to lighter, more valuable products (gasoline, LPG).
              Zeolite-based catalyst (Y-zeolite + ZSM-5 for octane). E-cat properties: MAT activity, metals (Ni+V ppm), surface area m²/g.
            </p>
            <div className="space-y-3">
              {FCC_STEPS.map((step) => (
                <div key={step.step} className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold flex-shrink-0">{step.step}</span>
                    <div className="flex-1">
                      <div className="text-white font-medium text-sm mb-1">{step.name}</div>
                      <div className="text-gray-400 text-xs mb-2">{step.detail}</div>
                      <div className="text-amber-400/80 text-xs"><span className="text-gray-500">Output: </span>{step.output}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { k: 'Riser Temperature', v: '700°C' },
                { k: 'Regenerator Temperature', v: '720°C' },
                { k: 'FCC Gasoline Yield', v: '40–50%' },
                { k: 'Coke Yield', v: '4–8%' },
                { k: 'Catalyst Makeup', v: 'tons/day (continuous)' },
                { k: 'Catalyst Type', v: 'Y-Zeolite + ZSM-5' },
              ].map(({ k, v }) => (
                <div key={k} className="bg-[#0a0e1a] rounded p-3 border border-[#1e2a45]">
                  <div className="text-gray-500 text-xs">{k}</div>
                  <div className="text-amber-400 font-semibold text-sm">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hydrocracker Tab */}
      {activeTab === 'hydrocracker' && (
        <div className="space-y-6">
          <div className="bg-[#0d1424] border border-[#1e2a45] rounded-xl p-5">
            <h3 className="text-white font-semibold mb-3">Step 5: Hydrocracker / Hydrotreater (HCK/HT)</h3>
            <p className="text-gray-400 text-sm mb-4">
              <strong className="text-gray-200">Purpose:</strong> Upgrade VGO to premium diesel and jet fuel; remove sulphur, nitrogen,
              and metals from products. Catalyst: Ni-Mo or Co-Mo on alumina.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg p-4">
                <div className="text-amber-400 text-xs font-semibold mb-2">OPERATING CONDITIONS</div>
                <div className="space-y-2">
                  {[
                    { k: 'H₂ Partial Pressure', v: '150–200 bar' },
                    { k: 'Temperature Range', v: '350–420°C' },
                    { k: 'Catalyst', v: 'Ni-Mo / Co-Mo on Al₂O₃' },
                    { k: 'ULSD Sulphur Spec', v: '< 15 ppm' },
                    { k: 'Diesel Cetane Index', v: '> 40 (typically 50+)' },
                  ].map(({ k, v }) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-gray-400 text-sm">{k}</span>
                      <span className="text-amber-400 text-sm font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg p-4">
                <div className="text-amber-400 text-xs font-semibold mb-2">CATALYST LIFECYCLE</div>
                <div className="text-gray-400 text-sm mb-3">
                  Linear temperature increase to maintain conversion as catalyst ages over a 2–4 year cycle.
                </div>
                {/* SOR vs EOR Timeline */}
                <div className="relative h-12">
                  <div className="absolute top-4 left-0 right-0 h-2 bg-gradient-to-r from-green-500/50 via-yellow-500/50 to-red-500/50 rounded-full" />
                  <div className="absolute top-0 left-0 text-green-400 text-xs">SOR 350°C</div>
                  <div className="absolute top-0 right-0 text-red-400 text-xs">EOR 420°C</div>
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 text-gray-500 text-xs">Catalyst Cycle ←→</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Models Tab */}
      {activeTab === 'ai-models' && (
        <div className="bg-[#0d1424] border border-[#1e2a45] rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">AI Model Integration Map — CDU/VDU/FCC/HCK</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e2a45]">
                  {['Model Name', 'Process Step', 'Type', 'Data Input', 'Output / Action'].map(h => (
                    <th key={h} className="text-left text-gray-400 font-medium py-2 px-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {AI_MODELS.map((m) => (
                  <tr key={m.model} className="border-b border-[#1e2a45]/50 hover:bg-[#1e2a45]/20 transition-colors">
                    <td className="py-2 px-3 text-amber-400 font-medium text-xs">⚡ {m.model}</td>
                    <td className="py-2 px-3 text-gray-300 text-xs">{m.step}</td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400">{m.type}</span>
                    </td>
                    <td className="py-2 px-3 text-gray-400 text-xs max-w-xs">{m.input}</td>
                    <td className="py-2 px-3 text-green-400 text-xs max-w-xs">{m.output}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* KPIs Tab */}
      {activeTab === 'kpis' && (
        <div className="bg-[#0d1424] border border-[#1e2a45] rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Process KPIs — CDU/VDU/FCC/HCK</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
            {KPIS.map((kpi) => (
              <div key={kpi.name} className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg p-3">
                <div className="text-gray-500 text-xs mb-1">{kpi.name}</div>
                <div className="text-amber-400 font-bold text-lg">{kpi.target}</div>
                <div className="text-gray-600 text-xs">{kpi.unit}</div>
                <div className="mt-1">
                  <span className="px-1.5 py-0.5 rounded text-xs bg-[#1e2a45] text-gray-400">{kpi.stream}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
