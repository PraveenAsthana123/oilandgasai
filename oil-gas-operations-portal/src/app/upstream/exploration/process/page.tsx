'use client';
import { useEffect, useState } from 'react';

interface ProcessData {
  detail?: {
    steps?: StepDetail[];
  };
}

interface StepDetail {
  step: number;
  name: string;
  inputs?: string;
  activities?: string;
  outputs?: string;
  equipment?: string;
  ai?: string;
  kpis?: string;
  duration?: string;
  data_volume?: string;
  formula?: string;
  decision_criteria?: string;
  gate_owners?: string;
}

const STEPS_STATIC = [
  {
    step: 1,
    name: 'Seismic Acquisition',
    inputs: 'Survey design, permits, GPS coordinates, receiver positions',
    activities: ['Deploy geophones/hydrophones', 'Record shot points (vibroseis onshore / airgun offshore)', 'Quality check field data in real time', 'Write observer logs and field QC reports'],
    outputs: 'Raw seismic field records (SEG-D format), observer logs, field QC reports',
    equipment: 'Vibroseis trucks (onshore), airguns (offshore), geophones/hydrophones, recording trucks',
    ai: [
      { name: 'AI Noise Filtering', desc: 'Deep Learning U-Net denoising — removes ground roll + multiples', type: 'DL' },
      { name: 'Survey Optimization', desc: 'ML selects optimal shot point patterns to maximize coverage', type: 'ML' },
    ],
    kpis: [
      { label: 'Signal-to-Noise Ratio', target: '>20 dB', unit: 'dB' },
      { label: 'Fold Coverage', target: '>60x', unit: 'x' },
      { label: 'Receiver Uptime', target: '>98%', unit: '%' },
      { label: 'Cost per km²', target: '<$50K', unit: 'CAD/km²' },
    ],
    data_volume: '1–50 TB per survey',
    duration: '2–12 weeks',
    regulatory: 'Crown land permit, Heritage Act clearance, environmental assessment',
    color: '#3b82f6',
  },
  {
    step: 2,
    name: 'Seismic Data Processing',
    inputs: 'Raw SEG-D field records, geometry files, velocity data',
    activities: ['Demultiplexing and geometry QC', 'Noise attenuation (FX deconvolution, radon transform)', 'Velocity analysis and NMO correction', 'CMP stacking and post-stack migration', 'Pre-stack depth migration (PSDM) if warranted'],
    outputs: 'Processed seismic volume (SEG-Y), velocity model, processing QC reports',
    equipment: 'HPC cluster (GPU-accelerated), Petrel / Kingdom / SeiSee processing software',
    ai: [
      { name: 'Deep Learning Denoising', desc: 'U-Net removes multiples + random noise; trained on labeled noise pairs', type: 'DL' },
      { name: 'Velocity Model Building', desc: 'Full Waveform Inversion (FWI) — iteratively updates velocity from wavefield residuals', type: 'FWI' },
      { name: 'Automatic Gain Control', desc: 'AGC optimization preserves amplitude for AVO analysis', type: 'Signal' },
    ],
    kpis: [
      { label: 'Stack Response Quality', target: 'QC score >85', unit: '/100' },
      { label: 'Velocity Uncertainty', target: '<±5%', unit: '%' },
      { label: 'Turnaround Time', target: '<10 weeks', unit: 'weeks' },
    ],
    kaggle: 'Well-logs dataset — used for synthetic seismic calibration and velocity ground-truth',
    duration: '4–16 weeks',
    color: '#8b5cf6',
  },
  {
    step: 3,
    name: 'Geological Interpretation',
    inputs: 'Processed seismic volumes, well logs, formation tops',
    activities: ['Horizon picking (key reflectors)', 'Fault interpretation and polygon mapping', 'Attribute analysis (amplitude, coherence, curvature)', 'Well-to-seismic tie (synthetic seismogram)', '3D geological modeling (Petrel/RMS)'],
    outputs: 'Interpreted horizons, fault framework, structural maps, attribute volumes, geological model',
    equipment: 'Petrel / RMS workstations, Geolog / Interactive Petrophysics for well correlation',
    ai: [
      { name: 'Automated Horizon Picking', desc: 'CNN trained on labeled horizon picks — achieves interpreter-quality speed at 100× manual rate', type: 'CNN' },
      { name: 'Fault Detection', desc: '3D CNN segmentation model — identifies fault planes from seismic amplitude gradients', type: '3D CNN' },
      { name: 'Seismic Facies Classification', desc: 'Unsupervised k-means / SOM clustering on attribute vectors to map depositional facies', type: 'Unsupervised ML' },
    ],
    kpis: [
      { label: 'Picking Consistency', target: '>95%', unit: '%' },
      { label: 'Well-to-Seismic Tie Correlation', target: '>0.70', unit: 'R²' },
      { label: 'Cycle Time', target: '<8 weeks', unit: 'weeks' },
    ],
    duration: '4–12 weeks',
    color: '#10b981',
  },
  {
    step: 4,
    name: 'Prospect Generation',
    inputs: 'Geological interpretation, analogues, basin model',
    activities: ['Trap definition (structural / stratigraphic / combination)', 'Reservoir characterization (porosity, permeability prediction)', 'Source rock evaluation (TOC, maturity)', 'Seal analysis (column height estimation)', 'Play fairway mapping'],
    outputs: 'Prospect inventory, play maps, risk matrix, analogues database',
    equipment: 'Petrel / Basin modeling software (Temis, PetroMod)',
    ai: [
      { name: 'Play Fairway Analysis', desc: 'ML similarity matching against producing analogues — scores play risk by sub-element', type: 'ML' },
      { name: 'Reservoir Quality Prediction', desc: 'ML regression from seismic attributes (amplitude, AVO) to porosity/permeability', type: 'ML Regression' },
      { name: 'RAG Knowledge Query', desc: 'Retrieval-Augmented Generation over historical well result database — surfaces analogous results', type: 'RAG / LLM' },
    ],
    kpis: [
      { label: 'Prospect Count', target: '>10 ranked', unit: 'prospects' },
      { label: 'Mean Prospect Size', target: '>20 MMboe', unit: 'MMboe' },
      { label: 'Play Risk', target: '<40%', unit: '% chance failure' },
      { label: 'Exploration Portfolio IRR', target: '>15%', unit: '%' },
    ],
    duration: '4–8 weeks',
    color: '#f59e0b',
  },
  {
    step: 5,
    name: 'Prospect Ranking',
    inputs: 'Prospect inventory, economic parameters (oil price, CAPEX, OPEX, royalty), risk assessments',
    activities: ['Probabilistic resource estimation (Monte Carlo P10/P50/P90)', 'Economic modeling (NPV, IRR, profitability index)', 'Portfolio optimization (efficient frontier)', 'Risked value (EMV) ranking'],
    outputs: 'Ranked prospect list, resource report, portfolio optimization recommendation',
    equipment: 'Crystal Ball / @Risk Monte Carlo tools, Aucerna economics platform',
    ai: [
      { name: 'Monte Carlo Simulation', desc: '50,000+ iterations for resource uncertainty — samples from P10/P50/P90 distributions per geological parameter', type: 'Statistical ML' },
      { name: 'Economic Portfolio Optimizer', desc: 'LP + ML optimization — selects drill portfolio maximizing risked NPV under budget constraint', type: 'LP + ML' },
      { name: 'Peer Analogue Ranking', desc: 'ML similarity scoring against 500+ global drilled analogues for calibrated POGs', type: 'ML' },
    ],
    formula: 'EMV = (POGs × NPVsuccess) − ((1 − POGs) × Drilling Cost)',
    formula_vars: 'POGs = Probability of Geological Success; NPVsuccess = net present value if reservoir discovered; Drilling Cost = dry hole cost',
    kpis: [
      { label: 'EMV (Expected Monetary Value)', target: '>$20M', unit: 'CAD' },
      { label: 'POGs', target: '>25%', unit: '%' },
      { label: 'Risked Resource', target: '>15 MMboe', unit: 'MMboe' },
    ],
    duration: '2–4 weeks',
    color: '#ef4444',
  },
  {
    step: 6,
    name: 'Drill / No-Drill Decision Gate',
    inputs: 'Ranked prospect list, budget approval, rig availability',
    activities: ['Investment committee (IC) presentation', 'JV/partner alignment and approval', 'Regulatory pre-application filing', 'Rig contract execution', 'AFE (Authority for Expenditure) preparation'],
    outputs: 'Drill decision (approved / deferred / dropped), AFE, regulatory application (AER/NUPEC)',
    decision_criteria: [
      { criterion: 'POGs threshold', threshold: '≥25%', notes: 'Below this: drop or defer' },
      { criterion: 'NPV@10%', threshold: '>$0M', notes: 'Risk-adjusted NPV must be positive' },
      { criterion: 'Gross resource', threshold: '>20 MMboe', notes: 'Minimum viable size' },
      { criterion: 'Strategic fit rating', threshold: '≥3/5', notes: 'Aligned with corporate play focus' },
    ],
    gate_owners: 'VP Exploration, CFO (wells >$10M), Board (wells >$50M)',
    ai: [
      { name: 'Decision Support AI', desc: 'Ollama LLM: "Given this prospect\'s characteristics: {data}, provide an investment recommendation with risk assessment"', type: 'Ollama LLM' },
    ],
    duration: '2–6 weeks',
    color: '#22c55e',
  },
];

const SUB_PROCESSES = [
  {
    id: 'SP-US-01-1', name: 'Seismic Acquisition', purpose: 'Collect raw subsurface energy reflection data to image geological structure at depth.',
    activities: ['Design shot pattern and receiver layout', 'Obtain land access + permits', 'Deploy recording equipment', 'Execute source activation (vibroseis/airgun)', 'Real-time QC of field records', 'Demob and land reinstatement'],
    inputs: 'Survey design document, land access permits, equipment manifest', outputs: 'Raw SEG-D files, observer logs, field QC report, geometry database',
    ai: 'Survey Optimizer ML, AI Field QC anomaly detector', team: 'Geophysics, Land, Field Operations', duration: '2–12 weeks', failures: ['Permit delays', 'Equipment downtime', 'Weather shutdown'], actions: ['Pre-permit land agents', 'Spare equipment kit', 'Weather window scheduling'],
  },
  {
    id: 'SP-US-01-2', name: 'Seismic Processing', purpose: 'Transform raw field records into interpretable subsurface images using signal processing and inversion.',
    activities: ['QC and load raw data', 'Geometry application', 'Deconvolution and noise suppression', 'Velocity analysis', 'NMO + stacking', 'Migration (PSTM or PSDM)'],
    inputs: 'Raw SEG-D, geometry file, velocity picks from offset wells', outputs: 'Processed SEG-Y volume, velocity cube, migration QC report',
    ai: 'DL Denoiser, FWI velocity builder', team: 'Processing Geophysics (in-house or contractor)', duration: '4–16 weeks', failures: ['Poor velocity model', 'Migration artifacts', 'Near-surface statics'], actions: ['FWI velocity QC gates', 'Independent processor QC', 'Static correction workflow'],
  },
  {
    id: 'SP-US-01-3', name: 'Geological Interpretation', purpose: 'Build structural and stratigraphic framework from seismic data tied to well control.',
    activities: ['Well-to-seismic tie (synthetic)', 'Horizon and fault picking', 'Attribute extraction', 'Depth conversion', '3D model construction'],
    inputs: 'SEG-Y volume, well log LAS files, formation top picks', outputs: 'Interpreted project (Petrel), structural maps (depth), attribute maps',
    ai: 'CNN horizon picker, 3D fault CNN, facies classifier', team: 'Geoscience team', duration: '4–12 weeks', failures: ['Depth conversion error', 'Mis-tie at wells', 'Fault shadow zones'], actions: ['Multiple velocity scenarios', 'Iterate synthetic seismogram tie', 'FWI for near-well velocities'],
  },
  {
    id: 'SP-US-01-4', name: 'Prospect Generation', purpose: 'Identify and characterize viable drilling targets within the play fairway.',
    activities: ['Map closure on interpreted horizons', 'Compute gross rock volume (GRV)', 'Estimate net/gross from analogues', 'Evaluate charge risk (basin model)', 'Rank by play element risk'],
    inputs: 'Structural maps, PetroMod basin model output, analogue database', outputs: 'Prospect inventory table, risk matrix, closure maps, GRV distributions',
    ai: 'Play Fairway ML, RAG historical well query', team: 'Exploration Geoscience + Basin Modeling', duration: '4–8 weeks', failures: ['Charge risk underestimation', 'Trap geometry error', 'Reservoir quality overestimate'], actions: ['Blind test predictions against discovered fields', 'Sensitivity on depth conversion', 'Log analogue calibration'],
  },
  {
    id: 'SP-US-01-5', name: 'Resource Estimation', purpose: 'Quantify prospective resources using probabilistic methods for economic evaluation.',
    activities: ['Define input distributions (GRV, N/G, porosity, Sw, FVF)', 'Run Monte Carlo simulation (P10/P50/P90)', 'Classify resources per PRMS 2018', 'Prepare resource report'],
    inputs: 'Prospect geometry, petrophysical analogues, PVT parameters', outputs: 'Resource distribution table (P10/P50/P90 MMboe), PRMS classification, uncertainty tornado chart',
    ai: 'Monte Carlo ML, Economic EMV calculator', team: 'Reserves Engineering + Exploration Geoscience', duration: '1–2 weeks', failures: ['Input distribution bias', 'Correlation not captured', 'PRMS misclassification'], actions: ['Peer review of distributions', 'Copula-based correlations', 'Reserves auditor review'],
  },
  {
    id: 'SP-US-01-6', name: 'License Acquisition', purpose: 'Secure mineral rights and regulatory approvals to drill the identified prospect.',
    activities: ['Crown land nomination / bid round participation', 'Farmout / JV negotiation', 'Regulatory application (AER drilling approval)', 'Heritage/environmental clearance'],
    inputs: 'Drill decision approval, prospect location coordinates, AFE budget', outputs: 'Mineral rights certificate, JOA (Joint Operating Agreement), AER drilling approval',
    ai: 'Bid optimization ML, regulatory timeline predictor', team: 'Land, Legal, External Affairs', duration: '4–24 weeks', failures: ['Bid loss on Crown sale', 'Heritage objection', 'Environmental review delay'], actions: ['Multiple bid scenarios', 'Pre-consult with heritage body', 'Early environmental scoping'],
  },
];

export default function ExplorationProcessPage() {
  const [data, setData] = useState<ProcessData | null>(null);
  const [openSub, setOpenSub] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/upstream/process?section=exploration')
      .then(r => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  void data; // used for DB record enrichment if needed

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="font-mono text-xs text-amber-400 bg-amber-900/20 border border-amber-800/40 px-2 py-1 rounded">P-US-01</span>
          <h1 className="text-2xl font-bold text-white">Exploration & Geoscience Process</h1>
        </div>
        <p className="text-gray-400 text-sm">
          End-to-end upstream exploration workflow · Seismic Acquisition → Data Processing → Interpretation → Prospect Generation → Ranking → Drill/No-Drill Gate
        </p>
      </div>

      {/* SVG Flow */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4">Process Flow — 6 Steps</h2>
        <div className="overflow-x-auto">
          <svg width="960" height="160" viewBox="0 0 960 160" className="block min-w-[700px]">
            <rect width="960" height="160" fill="#0a0e1a" rx="12" />
            <defs>
              <marker id="arr2" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#374151" />
              </marker>
            </defs>
            {[
              { x: 10, label: 'Seismic\nAcquisition', color: '#3b82f6' },
              { x: 170, label: 'Data\nProcessing', color: '#8b5cf6' },
              { x: 330, label: 'Geological\nInterpretation', color: '#10b981' },
              { x: 490, label: 'Prospect\nGeneration', color: '#f59e0b' },
              { x: 650, label: 'Prospect\nRanking', color: '#ef4444' },
              { x: 810, label: 'Drill/No-Drill\nDecision', color: '#22c55e' },
            ].map((node, i, arr) => (
              <g key={node.label}>
                {i < arr.length - 1 && (
                  <line x1={node.x + 135} y1={80} x2={arr[i + 1].x} y2={80}
                    stroke="#374151" strokeWidth="2" markerEnd="url(#arr2)" />
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
      <div className="space-y-6">
        {STEPS_STATIC.map(step => (
          <div key={step.step} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
            {/* Step header */}
            <div className="flex items-center gap-4 p-5 border-b border-[#1e2a45]" style={{ borderLeftColor: step.color, borderLeftWidth: 4 }}>
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ backgroundColor: step.color + '33', color: step.color, border: `1px solid ${step.color}` }}>
                {step.step}
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Step {step.step}: {step.name}</h3>
                <span className="text-xs text-gray-400">Duration: {step.duration}</span>
                {step.data_volume && <span className="text-xs text-gray-500 ml-3">Data: {step.data_volume}</span>}
              </div>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Left column */}
              <div className="space-y-4">
                {/* Input */}
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Input</div>
                  <div className="text-sm text-gray-300 bg-[#0a0e1a] border border-[#1e2a45] rounded p-3">{step.inputs}</div>
                </div>
                {/* Activities */}
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Activities</div>
                  <ul className="space-y-1">
                    {(Array.isArray(step.activities) ? step.activities : [step.activities as unknown as string]).map((a: string, i: number) => (
                      <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5 flex-shrink-0">▸</span>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Output */}
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Output</div>
                  <div className="text-sm text-gray-300 bg-[#0a0e1a] border border-[#1e2a45] rounded p-3">{step.outputs}</div>
                </div>
                {/* Equipment */}
                {step.equipment && (
                  <div>
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Equipment</div>
                    <div className="text-sm text-gray-300">{step.equipment}</div>
                  </div>
                )}
                {/* Regulatory */}
                {step.regulatory && (
                  <div>
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Regulatory Requirements</div>
                    <div className="text-sm text-amber-300 bg-amber-900/10 border border-amber-800/30 rounded p-2">{step.regulatory}</div>
                  </div>
                )}
              </div>

              {/* Right column */}
              <div className="space-y-4">
                {/* AI Integration */}
                <div>
                  <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">⚡ AI Integration</div>
                  <div className="space-y-2">
                    {(Array.isArray(step.ai) ? step.ai : []).map((ai: { name: string; desc: string; type: string }) => (
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

                {/* KPIs */}
                {step.kpis && (
                  <div>
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">KPIs</div>
                    <div className="space-y-1">
                      {(Array.isArray(step.kpis) ? step.kpis : []).map((kpi: { label: string; target: string; unit: string }) => (
                        <div key={kpi.label} className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">{kpi.label}</span>
                          <span className="text-white font-mono">{kpi.target} <span className="text-gray-500">{kpi.unit}</span></span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Formula */}
                {step.formula && (
                  <div>
                    <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">Key Formula</div>
                    <div className="bg-blue-900/10 border border-blue-800/30 rounded p-3">
                      <code className="text-blue-300 text-xs font-mono">{step.formula}</code>
                      {step.formula_vars && <div className="text-xs text-gray-400 mt-2">{step.formula_vars}</div>}
                    </div>
                  </div>
                )}

                {/* Decision criteria (step 6) */}
                {step.decision_criteria && (
                  <div>
                    <div className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-2">Decision Criteria</div>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-[#1e2a45] text-gray-500">
                          <th className="text-left pb-1">Criterion</th>
                          <th className="text-left pb-1">Threshold</th>
                          <th className="text-left pb-1">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(step.decision_criteria as Array<{criterion: string; threshold: string; notes: string}>).map((c) => (
                          <tr key={c.criterion} className="border-b border-[#1e2a45]">
                            <td className="py-1 text-gray-300">{c.criterion}</td>
                            <td className="py-1 text-amber-400 font-mono">{c.threshold}</td>
                            <td className="py-1 text-gray-500">{c.notes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {step.gate_owners && (
                      <div className="mt-2 text-xs text-green-400">Gate Owners: {step.gate_owners}</div>
                    )}
                  </div>
                )}

                {/* Kaggle ref */}
                {step.kaggle && (
                  <div className="text-xs text-blue-400 bg-blue-900/10 border border-blue-800/30 rounded p-2">
                    📊 Demo Data: {step.kaggle}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sub-process accordion */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4">Sub-process Detail (P-US-01)</h2>
        <div className="space-y-2">
          {SUB_PROCESSES.map(sp => (
            <div key={sp.id} className="border border-[#1e2a45] rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenSub(openSub === sp.id ? null : sp.id)}
                className="w-full flex items-center justify-between px-4 py-3 bg-[#0a0e1a] hover:bg-[#131d35] transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-amber-400">{sp.id}</span>
                  <span className="text-white text-sm font-medium">{sp.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">{sp.duration}</span>
                  <span className="text-gray-400">{openSub === sp.id ? '▲' : '▼'}</span>
                </div>
              </button>
              {openSub === sp.id && (
                <div className="p-4 bg-[#0f1629] border-t border-[#1e2a45] grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Purpose</div>
                      <div className="text-gray-300">{sp.purpose}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Key Activities</div>
                      <ol className="list-decimal list-inside space-y-0.5">
                        {sp.activities.map((a, i) => <li key={i} className="text-gray-300">{a}</li>)}
                      </ol>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Inputs</div>
                      <div className="text-gray-300">{sp.inputs}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Outputs</div>
                      <div className="text-gray-300">{sp.outputs}</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-purple-400 uppercase tracking-wider mb-1">⚡ AI Models</div>
                      <div className="text-purple-300">{sp.ai}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Responsible Team</div>
                      <div className="text-gray-300">{sp.team}</div>
                    </div>
                    <div>
                      <div className="text-xs text-red-400 uppercase tracking-wider mb-1">Common Failures</div>
                      <ul className="space-y-0.5">
                        {sp.failures.map((f, i) => <li key={i} className="text-red-300 text-xs">• {f}</li>)}
                      </ul>
                    </div>
                    <div>
                      <div className="text-xs text-green-400 uppercase tracking-wider mb-1">Corrective Actions</div>
                      <ul className="space-y-0.5">
                        {sp.actions.map((a, i) => <li key={i} className="text-green-300 text-xs">✓ {a}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
