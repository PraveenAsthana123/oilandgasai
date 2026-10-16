'use client';
import { useEffect, useState } from 'react';

const QUALITY_FLOW = [
  { id: 'sampling', label: 'Sampling', x: 20, width: 90 },
  { id: 'lab', label: 'Lab Analysis', x: 150, width: 110 },
  { id: 'spec', label: 'Spec Check', x: 310, width: 100 },
  { id: 'adjust', label: 'Blend Adjustment', x: 460, width: 130 },
  { id: 'release', label: 'Release for Sale', x: 640, width: 120 },
  { id: 'coa', label: 'Certificate of Analysis', x: 810, width: 150 },
];

const PRODUCT_TESTS: Record<string, { test: string; spec: string; method: string }[]> = {
  'Gasoline': [
    { test: 'RON (Research Octane Number)', spec: '≥ 87 / 91 / 93', method: 'ASTM D2699' },
    { test: 'MON (Motor Octane Number)', spec: '≥ 82 / 84 / 85', method: 'ASTM D2700' },
    { test: 'RVP (Reid Vapour Pressure)', spec: 'Seasonal 7–15 psi', method: 'ASTM D323' },
    { test: 'Distillation D86', spec: 'T10 < 70°C, T90 < 190°C', method: 'ASTM D86' },
    { test: 'Benzene Content', spec: '< 1 vol%', method: 'ASTM D3606' },
    { test: 'Sulphur Content', spec: '< 10 ppm (Tier 3)', method: 'ASTM D5453' },
  ],
  'Diesel': [
    { test: 'Cetane Index', spec: '≥ 40', method: 'ASTM D976' },
    { test: 'Cloud Point', spec: 'Seasonal (−15°C to +5°C)', method: 'ASTM D2500' },
    { test: 'CFPP', spec: 'Seasonal', method: 'ASTM D6371' },
    { test: 'Flash Point', spec: '> 52°C', method: 'ASTM D93' },
    { test: 'Kinematic Viscosity', spec: '1.9–4.1 cSt @40°C', method: 'ASTM D445' },
    { test: 'Sulphur Content (ULSD)', spec: '< 15 ppm', method: 'ASTM D5453' },
    { test: 'Lubricity (HFRR)', spec: '< 520 µm wear scar', method: 'ASTM D6079' },
  ],
  'Jet Fuel': [
    { test: 'Freezing Point', spec: '< −47°C (Jet A-1)', method: 'ASTM D5972' },
    { test: 'Flash Point', spec: '> 38°C', method: 'ASTM D56' },
    { test: 'Thermal Stability (JFTOT)', spec: 'T ≤ 260°C, TDR ≤ 3', method: 'ASTM D3241' },
    { test: 'Density', spec: '775–840 kg/m³ @15°C', method: 'ASTM D4052' },
    { test: 'Aromatics Content', spec: '≤ 25 vol%', method: 'ASTM D1319' },
  ],
  'Crude Oil': [
    { test: 'API Gravity', spec: 'Varies by grade (20–45°API)', method: 'ASTM D287' },
    { test: 'BS&W', spec: '< 0.5%', method: 'ASTM D4007' },
    { test: 'Salt Content', spec: '< 20 PTB pipeline', method: 'ASTM D3230' },
    { test: 'RVP', spec: 'Pipeline spec ≤ 103 kPa', method: 'ASTM D323' },
    { test: 'Viscosity', spec: 'Pumpable temp range', method: 'ASTM D445' },
    { test: 'Sulphur Content', spec: 'Per contract', method: 'ASTM D4294' },
    { test: 'Pour Point', spec: 'Above pipeline MAOP temp', method: 'ASTM D97' },
  ],
};

const AI_MODELS = [
  { model: 'NIR Prediction Model', type: 'ML (PLS/Neural Net)', desc: 'Trained on thousands of matched lab + NIR spectra pairs → predicts most properties in < 1 min vs 2–4 hr full lab analysis', application: 'All products' },
  { model: 'Spec Violation Predictor', type: 'ML Classification', desc: 'Uses upstream process conditions (CDU temperatures, FCC operating conditions) → alert blend controller before product goes off-spec', application: 'Real-time monitoring' },
  { model: 'Out-of-Spec Root Cause Analyzer', type: 'ML + RAG', desc: 'Searches historical incident database (vector similarity) for similar quality issues and their resolutions → ranked root causes + recommended actions', application: 'Quality incident response' },
  { model: 'Blend Optimizer (Quality)', type: 'LP + ML', desc: 'Given current component inventory and quality specs, solves blend recipe that meets all product specs at minimum cost', application: 'Blending operations' },
];

export default function QualityProcessPage() {
  const [activeProduct, setActiveProduct] = useState('Gasoline');
  const [activeTab, setActiveTab] = useState('lims');

  useEffect(() => {}, []);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded text-xs font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30">P-DS-03</span>
          <span className="text-gray-500 text-sm">Downstream / Quality Control</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Product Quality Control Process</h1>
        <p className="text-gray-400 text-sm mt-1">LIMS workflow · NIR prediction · Spec compliance · CoA generation</p>
      </div>

      {/* Flow SVG */}
      <div className="bg-[#0d1424] border border-[#1e2a45] rounded-xl p-6 overflow-x-auto">
        <svg width="1000" height="90" viewBox="0 0 1000 90" className="min-w-[960px]">
          {QUALITY_FLOW.slice(0, -1).map((node, i) => {
            const next = QUALITY_FLOW[i + 1];
            const x1 = node.x + node.width;
            const x2 = next.x;
            return (
              <g key={`conn-${i}`}>
                <line x1={x1} y1="40" x2={x2} y2="40" stroke="#374151" strokeWidth="2" />
                <polygon points={`${x2},36 ${x2 - 8},32 ${x2 - 8},44`} fill="#374151" />
              </g>
            );
          })}
          {QUALITY_FLOW.map((node, i) => (
            <g key={node.id}>
              <rect x={node.x} y="15" width={node.width} height="50" rx="6"
                fill="#111827"
                stroke={i === 2 ? '#ef4444' : i === 3 ? '#f59e0b' : i === 5 ? '#22c55e' : '#374151'}
                strokeWidth={i === 2 || i === 5 ? 2 : 1.5} />
              <text x={node.x + node.width / 2} y="40" textAnchor="middle" fill="white" fontSize="9" fontWeight="600">
                {node.label.length > 18 ? node.label.substring(0, 17) + '…' : node.label}
              </text>
              {i === 2 && <text x={node.x + node.width / 2} y="54" textAnchor="middle" fill="#ef4444" fontSize="7">Gate</text>}
              {i === 5 && <text x={node.x + node.width / 2} y="54" textAnchor="middle" fill="#22c55e" fontSize="7">CoA</text>}
            </g>
          ))}
          {/* Feedback loop: spec fail → adjust */}
          <path d="M 460,65 Q 390,85 310,65" stroke="#ef4444" strokeWidth="1.5" fill="none" strokeDasharray="4,2" />
          <polygon points="310,65 318,61 318,69" fill="#ef4444" />
          <text x="370" y="82" textAnchor="middle" fill="#ef4444" fontSize="7">Off-spec → adjust blend</text>
        </svg>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#1e2a45]">
        {[
          { id: 'lims', label: 'LIMS Workflow' },
          { id: 'tests', label: 'Test Methods by Product' },
          { id: 'ai', label: 'AI Models' },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === t.id ? 'text-amber-400 border-b-2 border-amber-500' : 'text-gray-400 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* LIMS Tab */}
      {activeTab === 'lims' && (
        <div className="space-y-4">
          <div className="bg-[#0d1424] border border-[#1e2a45] rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">Laboratory Information Management System (LIMS) Workflow</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
              {[
                { step: '1', label: 'Sample Receipt', icon: '🧪', detail: 'Barcode scan, sample registration, priority assignment' },
                { step: '2', label: 'Test Assignment', icon: '📋', detail: 'Automatic test suite by product type from method list' },
                { step: '3', label: 'Analysis', icon: '⚗️', detail: 'Analyst performs tests per ASTM/IP methods' },
                { step: '4', label: 'Result Entry', icon: '💻', detail: 'Results entered or auto-imported from instruments' },
                { step: '5', label: 'QC Review', icon: '🔍', detail: 'Supervisor reviews outliers, confirms result validity' },
                { step: '6', label: 'LIMS Release', icon: '✅', detail: 'Approved results released to process engineers + CoA' },
              ].map((s) => (
                <div key={s.step} className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg p-3 hover:border-amber-500/30 transition-colors">
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <div className="text-amber-400 text-xs font-semibold mb-0.5">Step {s.step}</div>
                  <div className="text-white text-sm font-medium mb-1">{s.label}</div>
                  <div className="text-gray-500 text-xs">{s.detail}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { k: 'Full Lab TAT', v: '2–4 hours' },
                { k: 'NIR TAT', v: '< 1 minute' },
                { k: 'Spec Compliance Target', v: '> 99.5%' },
              ].map(({ k, v }) => (
                <div key={k} className="bg-[#0a0e1a] rounded-lg p-3 border border-[#1e2a45] text-center">
                  <div className="text-gray-500 text-xs">{k}</div>
                  <div className="text-amber-400 font-bold text-lg">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tests Tab */}
      {activeTab === 'tests' && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {Object.keys(PRODUCT_TESTS).map(p => (
              <button key={p} onClick={() => setActiveProduct(p)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${activeProduct === p ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'bg-[#1e2a45]/40 text-gray-400 border border-[#1e2a45] hover:text-white'}`}>
                {p}
              </button>
            ))}
          </div>
          <div className="bg-[#0d1424] border border-[#1e2a45] rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">{activeProduct} — Quality Test Suite</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1e2a45]">
                    {['Test', 'Specification', 'ASTM Method'].map(h => (
                      <th key={h} className="text-left text-gray-400 font-medium py-2 px-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PRODUCT_TESTS[activeProduct].map((t) => (
                    <tr key={t.test} className="border-b border-[#1e2a45]/50 hover:bg-[#1e2a45]/20 transition-colors">
                      <td className="py-2 px-3 text-white">{t.test}</td>
                      <td className="py-2 px-3 text-amber-400 font-mono text-xs">{t.spec}</td>
                      <td className="py-2 px-3 text-blue-400 font-mono text-xs">{t.method}</td>
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
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-white font-medium">{m.model}</span>
                    <span className="px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400">{m.type}</span>
                    <span className="px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400">{m.application}</span>
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
