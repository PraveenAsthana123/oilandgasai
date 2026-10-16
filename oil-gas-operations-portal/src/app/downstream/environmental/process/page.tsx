'use client';
import { useEffect, useState } from 'react';

const ENV_FLOW = [
  { id: 'monitoring', label: 'Monitoring', x: 20, width: 100 },
  { id: 'reporting', label: 'Reporting', x: 165, width: 100 },
  { id: 'compliance', label: 'Compliance Check', x: 315, width: 130 },
  { id: 'corrective', label: 'Corrective Action', x: 500, width: 130 },
  { id: 'submission', label: 'Regulatory Submission', x: 685, width: 150 },
  { id: 'audit', label: 'Audit', x: 890, width: 80 },
];

const EMISSIONS_SOURCES = [
  { source: 'Fired Heaters / Boilers', pollutants: 'SO₂, NOₓ, CO, PM2.5, CO₂', monitoring: 'CEMS + periodic stack tests', regulation: 'ECCC, provincial AER/BCOGC' },
  { source: 'FCC Regenerator', pollutants: 'SO₂, NOₓ, CO, PM2.5, metals', monitoring: 'Continuous CEMS', regulation: 'Refinery BACT limits' },
  { source: 'Coker / Flare', pollutants: 'VOCs, CO₂, black smoke (PM)', monitoring: 'CV camera + CEMS for flare', regulation: 'Smokeless operation requirement' },
  { source: 'Cooling Towers', pollutants: 'VOCs (HEX compounds), Legionella risk', monitoring: 'Periodic grab samples', regulation: 'Provincial WQO' },
  { source: 'Storage Tanks', pollutants: 'VOCs, BTEX', monitoring: 'LDAR (Leak Detection & Repair)', regulation: 'NPRI reporting threshold' },
  { source: 'Wastewater Treatment', pollutants: 'H₂S (odour), VOCs', monitoring: 'Online H₂S analyzer', regulation: 'Odour complaint threshold' },
];

const CEMS_DATA = [
  { parameter: 'SO₂', limit: '< 500 mg/m³', avg: '1-hour rolling', reportingFreq: 'Daily auto-submit' },
  { parameter: 'NOₓ', limit: '< 200 mg/m³', avg: '1-hour rolling', reportingFreq: 'Daily auto-submit' },
  { parameter: 'CO', limit: '< 100 mg/m³', avg: '1-hour rolling', reportingFreq: 'Daily auto-submit' },
  { parameter: 'PM2.5', limit: '< 50 mg/m³', avg: 'Stack test (quarterly)', reportingFreq: 'Quarterly' },
  { parameter: 'CO₂ (GHG)', limit: 'Regulated by threshold', avg: 'Annual inventory', reportingFreq: 'Annual ECCC' },
];

const WASTEWATER_STEPS = [
  { step: 'API Separator', purpose: 'Gravity separation — removes free oil (droplet size > 150 µm)', output: 'Oil < 150 mg/L (TSS reduced)' },
  { step: 'DAF (Dissolved Air Flotation)', purpose: 'Air micro-bubbles float emulsified oil and suspended solids', output: 'Oil < 50 mg/L' },
  { step: 'Biotreatment', purpose: 'Activated sludge or fixed film — biological oxidation of dissolved organics', output: 'BOD < 30 mg/L, phenol < 0.5 ppm' },
  { step: 'Final Polishing', purpose: 'Sand filter or membrane → removes residual TSS', output: 'TSS < 30 mg/L (AER discharge limit)' },
  { step: 'Discharge', purpose: 'Compliance monitoring — online sensors + grab samples before release', output: 'AER WQO compliance' },
];

const AI_MODELS = [
  { model: 'Flare Analyzer (CV)', type: 'Computer Vision', desc: 'Thermal camera + visible camera analysis of flare flame → estimates combustion efficiency from flame shape/color/temperature; detects black smoke onset → triggers steam injection adjustment' },
  { model: 'Emission Forecaster', type: 'ML', desc: 'Predicts emission rates from process conditions (heater duty, fuel composition, operating mode) → alerts operator before regulatory limit is reached, enabling proactive control action' },
  { model: 'NOₓ Optimizer', type: 'ML + Controller', desc: 'Minimizes NOₓ from combustion equipment by adjusting excess air ratio and burner configuration. Operates within DCS as a setpoint optimizer' },
  { model: 'Biotreatment Optimizer', type: 'ML', desc: 'Adjusts nutrient dosing, aeration rate, and hydraulic retention time in biological treatment to maintain effluent quality despite varying influent loading' },
  { model: 'Spill Risk Predictor', type: 'Statistical ML', desc: 'Uses weather forecast (rain, temperature), containment inventory levels, and equipment condition to predict probability of containment overflow → early warning' },
];

export default function EnvironmentalProcessPage() {
  const [activeTab, setActiveTab] = useState('emissions');

  useEffect(() => {}, []);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded text-xs font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30">P-DS-06</span>
          <span className="text-gray-500 text-sm">Downstream / Environmental</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Environmental Compliance Process</h1>
        <p className="text-gray-400 text-sm mt-1">CEMS monitoring · GHG inventory · Flare management · Wastewater treatment · AER/ECCC compliance</p>
      </div>

      {/* Flow SVG */}
      <div className="bg-[#0d1424] border border-[#1e2a45] rounded-xl p-6 overflow-x-auto">
        <svg width="1010" height="90" viewBox="0 0 1010 90" className="min-w-[970px]">
          {ENV_FLOW.slice(0, -1).map((node, i) => {
            const next = ENV_FLOW[i + 1];
            const x1 = node.x + node.width;
            const x2 = next.x;
            return (
              <g key={`c-${i}`}>
                <line x1={x1} y1="40" x2={x2} y2="40" stroke="#374151" strokeWidth="2" />
                <polygon points={`${x2},36 ${x2 - 8},32 ${x2 - 8},44`} fill="#374151" />
              </g>
            );
          })}
          {ENV_FLOW.map((node, i) => (
            <g key={node.id}>
              <rect x={node.x} y="15" width={node.width} height="50" rx="6"
                fill="#111827"
                stroke={i === 2 ? '#ef4444' : i === 3 ? '#f59e0b' : i === 4 ? '#22c55e' : '#374151'}
                strokeWidth={i === 2 || i === 4 ? 2 : 1.5} />
              <text x={node.x + node.width / 2} y="40" textAnchor="middle" fill="white" fontSize="9" fontWeight="600">
                {node.label.length > 16 ? node.label.substring(0, 15) + '…' : node.label}
              </text>
              {i === 2 && <text x={node.x + node.width / 2} y="54" textAnchor="middle" fill="#ef4444" fontSize="7">Gate</text>}
            </g>
          ))}
          {/* Non-compliance loop */}
          <path d="M 500,65 Q 410,85 315,65" stroke="#ef4444" strokeWidth="1.5" fill="none" strokeDasharray="4,2" />
          <polygon points="315,65 323,61 323,69" fill="#ef4444" />
          <text x="410" y="82" textAnchor="middle" fill="#ef4444" fontSize="7">Non-compliance → corrective action</text>
        </svg>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#1e2a45]">
        {[
          { id: 'emissions', label: 'Emissions Monitoring' },
          { id: 'cems', label: 'CEMS Data' },
          { id: 'wastewater', label: 'Wastewater Treatment' },
          { id: 'ai', label: 'AI Models' },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === t.id ? 'text-amber-400 border-b-2 border-amber-500' : 'text-gray-400 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Emissions Monitoring */}
      {activeTab === 'emissions' && (
        <div className="space-y-4">
          <div className="bg-[#0d1424] border border-[#1e2a45] rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">Emission Sources &amp; Monitoring</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1e2a45]">
                    {['Emission Source', 'Pollutants', 'Monitoring Method', 'Regulatory Framework'].map(h => (
                      <th key={h} className="text-left text-gray-400 font-medium py-2 px-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {EMISSIONS_SOURCES.map((s) => (
                    <tr key={s.source} className="border-b border-[#1e2a45]/50 hover:bg-[#1e2a45]/20 transition-colors">
                      <td className="py-2 px-3 text-amber-400 font-medium">{s.source}</td>
                      <td className="py-2 px-3 text-gray-300 text-xs">{s.pollutants}</td>
                      <td className="py-2 px-3 text-blue-400 text-xs">{s.monitoring}</td>
                      <td className="py-2 px-3 text-gray-400 text-xs">{s.regulation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { k: 'NPRI Reporting Threshold', v: '> 10 tonne/yr per substance' },
              { k: 'GHG Reporting (ECCC)', v: '> 10,000 tCO₂e/yr (facility)' },
              { k: 'LDAR Survey Freq.', v: 'Quarterly (operating equipment)' },
              { k: 'Flare Combustion Target', v: '> 98% efficiency (smokeless)' },
            ].map(({ k, v }) => (
              <div key={k} className="bg-[#0d1424] border border-[#1e2a45] rounded-lg p-3">
                <div className="text-gray-500 text-xs mb-1">{k}</div>
                <div className="text-amber-400 font-semibold text-sm">{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CEMS Tab */}
      {activeTab === 'cems' && (
        <div className="bg-[#0d1424] border border-[#1e2a45] rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Continuous Emissions Monitoring System (CEMS) Parameters</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e2a45]">
                  {['Parameter', 'Regulatory Limit', 'Averaging Period', 'Reporting Frequency'].map(h => (
                    <th key={h} className="text-left text-gray-400 font-medium py-2 px-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CEMS_DATA.map((c) => (
                  <tr key={c.parameter} className="border-b border-[#1e2a45]/50">
                    <td className="py-2 px-3 text-amber-400 font-medium font-mono">{c.parameter}</td>
                    <td className="py-2 px-3 text-red-400 font-mono text-xs">{c.limit}</td>
                    <td className="py-2 px-3 text-gray-300 text-xs">{c.avg}</td>
                    <td className="py-2 px-3 text-blue-400 text-xs">{c.reportingFreq}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Wastewater Tab */}
      {activeTab === 'wastewater' && (
        <div className="space-y-4">
          <div className="bg-[#0d1424] border border-[#1e2a45] rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">Wastewater Treatment Train</h3>
            <div className="space-y-3">
              {WASTEWATER_STEPS.map((s, i) => (
                <div key={s.step} className="flex items-start gap-3 bg-[#0a0e1a] rounded-lg p-4 border border-[#1e2a45]">
                  <span className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold flex-shrink-0">{i + 1}</span>
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm mb-0.5">{s.step}</div>
                    <div className="text-gray-400 text-xs mb-1">{s.purpose}</div>
                    <div className="text-green-400 text-xs"><span className="text-gray-500">Output: </span>{s.output}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-[#0a0e1a] rounded-lg p-3 border border-amber-500/20">
              <div className="text-amber-400 text-xs font-semibold mb-1">AER DISCHARGE LIMITS (Alberta)</div>
              <div className="flex gap-4 flex-wrap">
                {[
                  { p: 'Oil', v: '< 15 mg/L' },
                  { p: 'Phenol', v: '< 0.5 mg/L' },
                  { p: 'TSS', v: '< 30 mg/L' },
                  { p: 'BOD', v: '< 30 mg/L' },
                ].map(({ p, v }) => (
                  <div key={p} className="text-sm"><span className="text-gray-400">{p}: </span><span className="text-amber-400 font-mono">{v}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Models */}
      {activeTab === 'ai' && (
        <div className="space-y-4">
          {AI_MODELS.map((m) => (
            <div key={m.model} className="bg-[#0d1424] border border-[#1e2a45] rounded-xl p-4 hover:border-amber-500/30 transition-colors">
              <div className="flex items-start gap-3">
                <span className="text-amber-400 text-lg">⚡</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-white font-medium">{m.model}</span>
                    <span className="px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400">{m.type}</span>
                  </div>
                  <div className="text-gray-400 text-sm">{m.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
