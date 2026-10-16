'use client';
import { useEffect, useState } from 'react';

const STEPS = [
  {
    step: 1,
    name: 'Data Acquisition & Integration',
    color: '#3b82f6',
    activities: ['Well log integration (LAS file QC, depth alignment)', 'Core analysis import (porosity, permeability, SCAL)', 'PVT fluid sampling and laboratory analysis', 'Pressure transient testing (DST/MDT)', 'Production history compilation (oil/gas/water rates)'],
    inputs: 'LAS files, core reports, fluid sample lab results, production database export',
    outputs: 'Integrated project database, data quality report, well log composite, formation tops table',
    ai: [
      { name: 'Log Quality Control ML', desc: 'Flags depth shifts, bad hole intervals, cycle skipping in sonic, caliper-corrected density', type: 'Anomaly Detection' },
      { name: 'Data Gap Identifier', desc: 'Maps data coverage vs. required inputs — highlights wells with missing PVT or pressure data', type: 'ML Classification' },
    ],
    kpis: [{ label: 'Data Completeness', target: '>90%', unit: '%' }, { label: 'Well Coverage', target: '>1 well/km²', unit: 'density' }],
    duration: '2–4 weeks',
  },
  {
    step: 2,
    name: 'Static Geological Model',
    color: '#8b5cf6',
    activities: ['Horizon and fault interpretation (from seismic)', 'Structural gridding (corner-point geometry)', 'Facies modeling (object-based or SIS geostatistics)', 'Property population (porosity/permeability via kriging/co-kriging)', 'OOIP volumetric calculation'],
    inputs: 'Seismic interpretation (Petrel), well logs, core-calibrated petrophys, formation tops',
    outputs: '3D static model (Petrel/RMS), OOIP distribution P10/P50/P90, uncertainty realizations (100 runs)',
    ai: [
      { name: 'Geostatistical Property Predictor', desc: 'Co-kriging with seismic attribute (amplitude) as secondary variable — improves porosity distribution away from wells', type: 'Geostatistics + ML' },
      { name: 'Facies ML Classifier', desc: 'Neural network predicts facies between wells using seismic impedance and log attributes as training features', type: 'Neural Network' },
    ],
    formula: 'OOIP = V × φ × (1-Sw) / Boi  (stock tank barrels)',
    formula_vars: 'V = bulk rock volume (m³); φ = porosity fraction; Sw = water saturation fraction; Boi = initial oil formation volume factor (rb/stb)',
    kpis: [{ label: 'Model Cell Count', target: '<10M cells (for simulation speed)', unit: 'cells' }, { label: 'OOIP Uncertainty Range', target: 'P90/P10 ratio <3×', unit: 'ratio' }],
    duration: '4–12 weeks',
  },
  {
    step: 3,
    name: 'Dynamic Simulation Model',
    color: '#10b981',
    activities: ['Import static model into simulator (Eclipse/CMG/tNavigator)', 'Assign relative permeability curves (Kr) from SCAL', 'Define PVT equation of state (EOS) or black-oil tables', 'Model aquifer (Fetkovich / Aquifer fitting)', 'Grid upscaling (flow-based upscaling)'],
    inputs: 'Static model, SCAL report (Kr curves), PVT lab report, aquifer parameters',
    outputs: 'Initialized simulation model, pressure-volume check (material balance test)',
    ai: [
      { name: 'Upscaling Optimizer', desc: 'Flow-based upscaling transmissibility — preserves flow barriers (faults, baffles) in coarser simulation grid', type: 'Flow Simulation' },
      { name: 'PVT Matching ML', desc: 'Automated EOS regression to match laboratory measurements (Pb, GOR, viscosity, density vs. pressure)', type: 'Regression ML' },
    ],
    kpis: [{ label: 'Simulation Run Time', target: '<2 hrs/run', unit: 'hrs' }, { label: 'Material Balance Check Error', target: '<2%', unit: '%' }],
    duration: '4–8 weeks',
  },
  {
    step: 4,
    name: 'History Matching',
    color: '#f59e0b',
    activities: ['Define objective function (BHP + rate match)', 'Identify uncertain parameters (k multipliers, fault transmissibility, aquifer strength)', 'Adjust parameters iteratively (manual or automated)', 'Validate match (withheld well test data)', 'Document parameter uncertainty'],
    inputs: 'Production history (field-wide and per-well rates + BHP), injection history',
    outputs: 'History-matched model set (multiple realizations), match statistics, parameter posterior distributions',
    ai: [
      { name: 'Ensemble Kalman Filter (EnKF)', desc: 'Updates model parameter ensemble using production data as observations — parallel automated history matching with 50–200 realizations', type: 'Ensemble ML' },
      { name: 'Proxy Model (MCMC)', desc: 'Trains surrogate ML model of simulator (gradient-boosted) — enables 100,000× faster parameter sampling for uncertainty quantification', type: 'Surrogate ML' },
      { name: 'Parameter Sensitivity ML', desc: 'SHAP/tornado analysis identifies which parameters drive most forecast uncertainty — focuses matching effort', type: 'Explainability ML' },
    ],
    kpis: [{ label: 'BHP Match Error', target: '<50 psi RMS', unit: 'psi' }, { label: 'Rate Match Error', target: '<10% normalized RMS', unit: '%' }, { label: 'Well Count Matched', target: '>80% of producers', unit: '%' }],
    duration: '4–16 weeks',
  },
  {
    step: 5,
    name: 'Production Forecasting',
    color: '#ef4444',
    activities: ['Arps decline curve analysis (per well and aggregate)', 'Numerical simulation forecast (base case P50)', 'Monte Carlo uncertainty quantification (P10/P50/P90)', 'EOR screening (WAG/polymer/CO2/SAGD for heavy oil)', 'Plateau rate and decline prediction'],
    inputs: 'History-matched model(s), current well inventory, development drilling schedule',
    outputs: 'Production forecast (oil/gas/water m³/d by year × 30 years), reserve estimate (PRMS Proved/Probable/Possible), EOR screening report',
    ai: [
      { name: 'Decline Curve ML Fitter', desc: 'Fits Arps Exponential/Hyperbolic/Harmonic automatically per well — classifies decline regime from production data', type: 'Curve Fitting ML' },
      { name: 'Forecast Uncertainty Quantifier', desc: 'Propagates geological + operational uncertainty through simulator proxy — generates P10/P50/P90 fan forecast', type: 'Monte Carlo ML' },
      { name: 'EOR Screener', desc: 'ML analogue matching against 200+ EOR projects — recommends best EOR scheme based on API, viscosity, permeability, temperature, depth', type: 'Analogue ML' },
    ],
    formulas: [
      { eq: 'Exponential: q(t) = qi × e^(−Di×t)', note: 'b=0 — constant fractional decline' },
      { eq: 'Hyperbolic: q(t) = qi / (1 + b×Di×t)^(1/b)', note: '0<b<1 — decreasing fractional decline (most common tight oil)' },
      { eq: 'Harmonic: q(t) = qi / (1 + Di×t)', note: 'b=1 — special case hyperbolic' },
      { eq: 'Np(t) = (qi − q(t)) / Di  [Exponential]', note: 'Cumulative production' },
    ],
    kpis: [{ label: 'EUR (Estimated Ultimate Recovery)', target: 'P50 ±30% (P10/P90 range)', unit: 'MMboe' }, { label: 'Proved Reserves Confidence', target: 'P90 basis per PRMS', unit: 'classification' }, { label: 'Forecast Uncertainty', target: 'P90/P10 <2× at 5-yr horizon', unit: 'ratio' }],
    duration: '2–4 weeks',
  },
  {
    step: 6,
    name: 'Development Plan & Surveillance',
    color: '#22c55e',
    activities: ['Infill well location optimization (simulation + economics)', 'EOR pilot design and injection scheduling', 'Reservoir surveillance plan (pressure monitoring, tracer tests, 4D seismic)', 'Capital budget and NPV optimization', 'Annual reserve update schedule'],
    inputs: 'P50 simulation model, economic parameters, well inventory constraints, regulatory reserves report',
    outputs: 'Reservoir development plan document, capex/opex schedule, infill well AFEs, surveillance program',
    ai: [
      { name: 'Well Placement Optimizer', desc: 'Combines simulation proxy + genetic algorithm to place infill wells maximizing incremental NPV under budget constraint', type: 'Optimization ML' },
      { name: 'Analogue Reservoir Finder (RAG)', desc: 'RAG over 500 published reservoir studies — surfaces analogues by formation type, depth, permeability, drive mechanism for development plan benchmarking', type: 'RAG / LLM' },
      { name: '4D Seismic Interpreter', desc: 'Difference volume (repeat minus baseline survey) — detects fluid movement and bypassed pay', type: 'DL Seismic' },
    ],
    kpis: [{ label: 'Incremental Reserve Add', target: '>10% of base OOIP', unit: 'MMboe' }, { label: 'Development NPV@10%', target: '>$50M CAD', unit: 'CAD M' }, { label: 'Payout Period', target: '<5 years', unit: 'years' }],
    duration: '4–8 weeks',
  },
];

export default function ReservoirProcessPage() {
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);
  useEffect(() => { fetch('/api/upstream/process?section=reservoir').catch(() => {}); }, []);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="font-mono text-xs text-amber-400 bg-amber-900/20 border border-amber-800/40 px-2 py-1 rounded">P-US-02</span>
          <h1 className="text-2xl font-bold text-white">Reservoir Management Process</h1>
        </div>
        <p className="text-gray-400 text-sm">
          Static model → Dynamic simulation → History matching → Forecasting → Development planning
        </p>
      </div>

      {/* SVG Flow */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4">Reservoir Engineering Workflow</h2>
        <div className="overflow-x-auto">
          <svg width="960" height="160" viewBox="0 0 960 160" className="block min-w-[700px]">
            <rect width="960" height="160" fill="#0a0e1a" rx="12" />
            <defs>
              <marker id="arrr" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#374151" />
              </marker>
            </defs>
            {[
              { x: 10, label: 'Data\nAcquisition', color: '#3b82f6' },
              { x: 170, label: 'Static\nModel', color: '#8b5cf6' },
              { x: 330, label: 'Dynamic\nModel', color: '#10b981' },
              { x: 490, label: 'History\nMatch', color: '#f59e0b' },
              { x: 650, label: 'Forecast\nP10/P50/P90', color: '#ef4444' },
              { x: 810, label: 'Development\nPlan', color: '#22c55e' },
            ].map((node, i, arr) => (
              <g key={node.label}>
                {i < arr.length - 1 && (
                  <line x1={node.x + 135} y1={80} x2={arr[i + 1].x} y2={80}
                    stroke="#374151" strokeWidth="2" markerEnd="url(#arrr)" />
                )}
                <rect x={node.x} y={50} width={135} height={60} rx="8"
                  fill={node.color + '22'} stroke={node.color} strokeWidth="2" />
                {node.label.split('\n').map((line, li) => (
                  <text key={li} x={node.x + 67} y={li === 0 ? 76 : 92} textAnchor="middle"
                    fill={node.color} fontSize="11" fontWeight="600">{line}</text>
                ))}
                <circle cx={node.x + 67} cy={28} r={14} fill={node.color + '33'} stroke={node.color} strokeWidth="1" />
                <text x={node.x + 67} y={33} textAnchor="middle" fill={node.color} fontSize="11" fontWeight="700">{i + 1}</text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Step Cards */}
      <div className="space-y-4">
        {STEPS.map(step => (
          <div key={step.step} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden"
            style={{ borderLeftColor: step.color, borderLeftWidth: 4 }}>
            <button className="w-full flex items-center gap-4 p-5 text-left hover:bg-[#131d35] transition-colors"
              onClick={() => setOpenAccordion(openAccordion === step.step ? null : step.step)}>
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ backgroundColor: step.color + '33', color: step.color, border: `1px solid ${step.color}` }}>
                {step.step}
              </div>
              <div className="flex-1">
                <div className="text-white font-semibold">Step {step.step}: {step.name}</div>
                <div className="text-xs text-gray-400">Duration: {step.duration}</div>
              </div>
              <span className="text-gray-400">{openAccordion === step.step ? '▲' : '▼'}</span>
            </button>
            {openAccordion === step.step && (
              <div className="p-5 border-t border-[#1e2a45] grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Input</div>
                    <div className="text-sm text-gray-300 bg-[#0a0e1a] border border-[#1e2a45] rounded p-3">{step.inputs}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Activities</div>
                    <ul className="space-y-1">
                      {step.activities.map((a, i) => (
                        <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                          <span className="text-amber-500 mt-0.5 flex-shrink-0">▸</span><span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Output</div>
                    <div className="text-sm text-gray-300 bg-[#0a0e1a] border border-[#1e2a45] rounded p-3">{step.outputs}</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">⚡ AI Integration</div>
                    <div className="space-y-2">
                      {step.ai.map(ai => (
                        <div key={ai.name} className="bg-purple-900/10 border border-purple-800/30 rounded p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-purple-300 font-semibold">{ai.name}</span>
                            <span className="text-xs text-purple-600 bg-purple-900/40 px-1.5 py-0.5 rounded">{ai.type}</span>
                          </div>
                          <div className="text-xs text-gray-400">{ai.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">KPIs</div>
                    {step.kpis.map(kpi => (
                      <div key={kpi.label} className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-400">{kpi.label}</span>
                        <span className="text-white font-mono">{kpi.target} <span className="text-gray-500">{kpi.unit}</span></span>
                      </div>
                    ))}
                  </div>
                  {step.formula && (
                    <div className="bg-blue-900/10 border border-blue-800/30 rounded p-3">
                      <div className="text-xs text-blue-400 font-semibold mb-1">Formula</div>
                      <code className="text-blue-300 text-xs font-mono">{step.formula}</code>
                      {step.formula_vars && <div className="text-xs text-gray-400 mt-1">{step.formula_vars}</div>}
                    </div>
                  )}
                  {step.formulas && (
                    <div className="bg-blue-900/10 border border-blue-800/30 rounded p-3 space-y-2">
                      <div className="text-xs text-blue-400 font-semibold">Arps Decline Equations</div>
                      {step.formulas.map(f => (
                        <div key={f.eq}>
                          <code className="text-blue-300 text-xs font-mono block">{f.eq}</code>
                          <div className="text-xs text-gray-500">{f.note}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Material Balance Summary */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4">Key Reservoir Engineering Equations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Material Balance (Simplified)', eq: 'N = F / (Et + mEg + Efw)', vars: 'N=OOIP; F=underground withdrawal; Et=oil+dissolved gas expansion; m=gas cap ratio; Eg=gas cap expansion; Efw=formation+connate water compressibility' },
            { title: "Darcy's Law (Radial Flow)", eq: 'Q = (k × h × ΔP) / (141.2 × μ × B × ln(re/rw))', vars: 'k=permeability (mD); h=net pay (ft); ΔP=pressure drawdown (psi); μ=viscosity (cP); B=FVF; re=drainage radius; rw=wellbore radius' },
            { title: 'Productivity Index', eq: 'PI = Q / (Pe − Pwf)', vars: 'PI=productivity index (bbl/d/psi); Q=flow rate (bbl/d); Pe=reservoir pressure; Pwf=flowing BHP (psi)' },
          ].map(eq => (
            <div key={eq.title} className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg p-4">
              <div className="text-xs text-blue-400 font-semibold mb-2">{eq.title}</div>
              <code className="text-blue-300 text-xs font-mono block mb-2">{eq.eq}</code>
              <div className="text-xs text-gray-500">{eq.vars}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
