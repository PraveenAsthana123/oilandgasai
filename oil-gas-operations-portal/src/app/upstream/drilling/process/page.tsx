'use client';
import { useEffect, useState } from 'react';

const STEPS = [
  {
    step: 1,
    name: 'Rig Mobilization',
    color: '#6b7280',
    depth_range: 'Pre-spud',
    activities: ['Contract rig selection and scoring', 'Rig move logistics (road permits, pilot cars)', 'BOP function test (annular + pipe rams + shear rams)', 'Pre-spud checklist sign-off (20-point)', 'Crew safety induction and drills'],
    inputs: 'Rig contract, well program, site survey, BOP test procedure',
    outputs: 'Pre-spud inspection sign-off, BOP test certificate, spud date confirmation',
    equipment: 'Drilling rig (land/offshore), BOP stack, crown block, drawworks, top drive',
    ai: [
      { name: 'Rig Selection ML', desc: 'Scores available rigs on availability, spec match (hook load/depth rating), day rate, local content — recommends top 3', type: 'ML Scoring' },
      { name: 'Spud Date Optimizer', desc: 'Optimizes spud date against rig schedule, weather windows, permit availability', type: 'Scheduling ML' },
    ],
    kpis: [
      { label: 'Mob Cost', target: '<$400K', unit: 'CAD' },
      { label: 'Days from Contract to Spud', target: '<30 days', unit: 'days' },
      { label: 'BOP Test Pass', target: '100%', unit: 'First time' },
    ],
    duration: '5–15 days',
  },
  {
    step: 2,
    name: 'Surface Section (0–500 m)',
    color: '#f59e0b',
    depth_range: '0–500 m MD',
    activities: ['Cellar excavation and conductor running (30")', 'Drill 26" hole for surface casing (20")', 'Run and cement 13-3/8" surface casing', 'Wait on cement (WOC) — 8 hrs minimum', 'BOP installation on casing head', 'Pressure test wellhead'],
    inputs: 'Well program casing design, cement design, conductor driving log',
    outputs: 'Casing tally, cement job report, pressure test record, wellhead installation report',
    equipment: 'Casing running tool, cementing unit, centralizers, float shoe/collar',
    ai: [
      { name: 'Casing Point Selector', desc: 'ML from offset well pore pressure/fracture gradient data — selects optimal casing seat depth', type: 'ML Classification' },
      { name: 'Cement Volume Optimizer', desc: 'Calculates exact cement volumes (lead/tail slurry) with density for zonal isolation', type: 'Engineering ML' },
    ],
    kpis: [
      { label: 'Casing Seat Depth', target: 'As designed ±5m', unit: 'm MD' },
      { label: 'Cement Top (CBL/VDL)', target: 'At surface', unit: 'm' },
      { label: 'WOB', target: '20–30 kN', unit: 'kN' },
    ],
    duration: '3–7 days',
  },
  {
    step: 3,
    name: 'Intermediate Section (500–2500 m)',
    color: '#8b5cf6',
    depth_range: '500–2500 m MD',
    activities: ['Drill intermediate hole (12-1/4")', 'KOP (kick-off point) depth reached — begin directional build', 'Angle build (typically 3–5°/30m dogleg severity)', 'Intermediate casing (9-5/8") run and cemented', 'Drill-off tests for WOB/RPM optimization'],
    inputs: 'Directional survey plan (BHA design, KOP depth, landing target), mud program',
    outputs: 'Directional survey files (WITS/WITSML), daily drilling report (DDR), NPT report',
    equipment: 'PDC bit, RSS (Rotary Steerable System) or motor, MWD tool, mud gas separator',
    ai: [
      { name: 'ROP Optimizer', desc: 'Real-time ML: inputs WOB/RPM/ECD/lithology → outputs optimal drilling parameters every 30 sec. Reduced NPT by 18% in field trials.', type: 'Real-Time ML' },
      { name: 'Downhole Vibration Detector', desc: 'FFT analysis of surface torque/WOB signal — classifies bit bounce, lateral vibration, whirl, stick-slip → recommends parameter adjustment', type: 'Signal Processing + ML' },
      { name: 'Stuck Pipe Predictor', desc: 'ML classification model (30-min advance warning). Features: torque/drag trend, hole cleaning indicator, ECD, formation type. Kaggle: machine-maintenance dataset (equipment failure proxy).', type: 'ML Classification' },
    ],
    kpis: [
      { label: 'ROP', target: '>25 m/hr', unit: 'm/hr' },
      { label: 'NPT (Non-Productive Time)', target: '<5%', unit: '%' },
      { label: 'Vibration Index', target: '<0.3', unit: 'normalized' },
      { label: 'Torque Trend', target: 'Stable ±10%', unit: 'kN·m' },
    ],
    kaggle: 'machine-maintenance dataset — equipment failure patterns proxy for stuck pipe / BHA failure events',
    duration: '10–25 days',
  },
  {
    step: 4,
    name: 'Reservoir Section (Target Zone)',
    color: '#22c55e',
    depth_range: '2500 m → TD',
    activities: ['Drill through pay zone (8-1/2" or 6" hole)', 'LWD (Logging While Drilling) — continuous GR/resistivity/neutron/density real-time', 'Real-time geosteering — adjust trajectory to stay in zone', 'Monitor mud gas for oil/gas shows', 'Chromatograph analysis per connection'],
    inputs: 'Geological prognosis (expected GR/resistivity at reservoir), geosteering target window (TVD band)',
    outputs: 'LWD log file (DLIS/LAS), mud log, gas show record, geosteering trajectory plot',
    equipment: 'MWD/LWD BHA (GR/resistivity/neutron/density sensors), PDC bit, mud gas separator, chromatograph',
    ai: [
      { name: 'Geosteering AI', desc: 'ML using real-time LWD GR/resistivity to predict reservoir top/base and steer bit to stay in zone. Reduce out-of-zone drilling.', type: 'ML Regression' },
      { name: 'Formation Evaluation AI', desc: 'Predict porosity/permeability/fluid type from real-time LWD data — before wireline (saves rig time)', type: 'ML Ensemble' },
      { name: 'Gas Show Analyzer', desc: 'Statistical ML on gas chromatograph readings (C1–C5 ratios) — classifies fluid type as oil/condensate/gas/brine', type: 'Statistical ML' },
    ],
    kpis: [
      { label: 'Time-in-Zone', target: '>85%', unit: '%' },
      { label: 'Oil/Water Contact Depth', target: 'Per prognosis ±2m TVD', unit: 'm TVD' },
      { label: 'Net Pay Thickness', target: 'As prognosed', unit: 'm' },
      { label: 'Permeability', target: '>100 mD (target zone)', unit: 'mD' },
    ],
    kaggle: 'well-logs dataset (GR/RHOB/NPHI/DT columns — exact LWD data types used in geosteering AI training)',
    duration: '8–20 days',
  },
  {
    step: 5,
    name: 'Formation Evaluation (Wireline)',
    color: '#3b82f6',
    depth_range: 'At TD',
    activities: ['Pull drillstring to surface', 'Run wireline logging suite (GR/SP/resistivity/density/neutron/sonic/FMI image)', 'MDT (Modular Dynamic Tester) — downhole fluid sampling and pressure points', 'Conventional coring if planned (cut and retrieve core barrel)', 'Interpret logs for net pay/porosity/saturation'],
    inputs: 'Mud log, LWD composite, geological prognosis, core point selection',
    outputs: 'Wireline LAS files, MDT fluid sample report, core barrel (if cut), petrophysical interpretation report',
    equipment: 'Wireline truck, MDT tool, core barrel, radioactive source (RHOB — requires radiation permit)',
    ai: [
      { name: 'Facies Classification', desc: 'ML on log suite (GR/RHOB/NPHI/DT) → predicts rock type (sand/shale/carbonate/tight) at every 0.1m depth point', type: 'ML Classifier' },
      { name: 'Fluid Typing', desc: 'ML distinguishes oil/gas/water from resistivity + neutron + density crossplot. Reduces ambiguous log interpretation.', type: 'ML Classifier' },
      { name: 'Petrophysical Model', desc: 'Regression computes Vsh (volume shale), Phi (porosity), Sw (water saturation) using Archie equation and linear regressions', type: 'Regression + Physics' },
    ],
    formula: "Archie's Equation: Sw = (a × Rw / (Phi^m × Rt))^(1/n)",
    formula_vars: 'Sw = water saturation; Rw = formation water resistivity; Phi = porosity; Rt = true formation resistivity; a, m, n = Archie coefficients (typically a=1, m=2, n=2)',
    kpis: [
      { label: 'Net Pay', target: 'As prognosed ±20%', unit: 'm' },
      { label: 'Average Porosity', target: '>12%', unit: '%' },
      { label: 'Water Saturation Sw', target: '<50% (oil zone)', unit: '%' },
      { label: 'Permeability from NMR', target: '>50 mD', unit: 'mD' },
    ],
    kaggle: 'well-facies dataset (well log facies classification labels — used to train facies ML model)',
    duration: '3–7 days',
  },
  {
    step: 6,
    name: 'Total Depth & Suspension / P&A',
    color: '#ef4444',
    depth_range: 'TD decision',
    activities: ['Final well depth decision (suspend vs. abandon)', 'Run production casing (7" or 5-1/2") and cement — if suspending', 'Perforation gun selection for completion', 'Plug and abandon procedure if dry hole (cement plugs per regulatory)', 'AFE final closeout — cost vs budget'],
    inputs: 'Formation evaluation report, economics re-run, partner approval',
    outputs: 'Suspension program (cement plugs, wellhead lock), or P&A report, final well cost report',
    equipment: 'Cement unit, perforation guns, bridge plugs, wellhead cap',
    ai: [
      { name: 'Completion Optimization', desc: 'ML recommends perforation intervals and frac stage count/placement based on log analysis and analogue results', type: 'ML Optimizer' },
      { name: 'Well Economics AI', desc: 'Recalculates NPV/IRR/payback with actual formation data vs. prognosis — informs suspend/abandon decision', type: 'Economic ML' },
    ],
    kpis: [
      { label: 'Final Well Cost', target: 'Within ±15% AFE', unit: 'CAD' },
      { label: 'NPV vs Prognosis', target: '>$0M variance', unit: 'CAD M' },
      { label: 'Reserve Booking', target: 'PRMS Proved', unit: 'MMboe' },
    ],
    duration: '3–10 days',
  },
];

const SUB_PROCESSES = [
  { id: 'SP-US-03-1', name: 'Rig Mobilization', purpose: 'Move rig to location and verify all equipment is operational before spud.', activities: ['Rig move with oversized load permits', 'Substructure assembly', 'Crown/travelling block inspection', 'BOP pressure test to MAASP', 'Crew safety orientation'], inputs: 'Rig contract, site survey', outputs: 'Pre-spud inspection cert, BOP test record', ai: 'Rig Selection ML', team: 'Drilling Engineering, Rig Contractor', duration: '5–15 days', failures: ['BOP test failure', 'Road weight restriction', 'Equipment shortage'], actions: ['Backup BOP rubber stocks', 'Pre-survey roads', 'Spare tool inventory'] },
  { id: 'SP-US-03-2', name: 'Conductor & Cellar', purpose: 'Establish structural support and shallow hole isolation before drilling.', activities: ['Cellar excavation (2m × 2m × 2m)', 'Drive or drill 30" conductor', 'Weld casing head on conductor', 'Test annular space'], inputs: 'Shallow hazard report, conductor design', outputs: 'Conductor depth log, casing head installation report', ai: 'Shallow Hazard Analyzer', team: 'Field Operations, Civil', duration: '1–3 days', failures: ['Loose formation wash-out', 'Shallow gas', 'Conductor off-vertical'], actions: ['Oversize conductor program', 'Gas detection sensors', 'Inclinometer survey'] },
  { id: 'SP-US-03-3', name: 'Surface Casing', purpose: 'Isolate fresh water aquifers and install BOP foundation.', activities: ['Drill 26" hole to casing point', 'Run 20" surface casing', 'Cement with returns to surface', 'Install casing spool and BOP'], inputs: 'Casing seat selection from ML, cement design', outputs: 'CBL/VDL log, cement job report, BOP test', ai: 'Casing Point Selector ML, Cement Volume Optimizer', team: 'Drilling Engineering', duration: '2–5 days', failures: ['Lost circulation during cement', 'Short cement (CBL poor bond)', 'WOC time overrun'], actions: ['Foamed cement program', 'CBL pass/fail gate before proceeding', 'Extended WOC schedule'] },
  { id: 'SP-US-03-4', name: 'Intermediate Casing', purpose: 'Isolate trouble zones and prepare wellbore for reservoir drilling.', activities: ['Drill 12-1/4" to intermediate casing point', 'Conditioning mud', 'Run 9-5/8" casing with centralizers', 'Cement to required height'], inputs: 'Pore pressure/fracture gradient prognosis, mud design', outputs: 'Daily drilling report, intermediate casing tally, CBL', ai: 'ROP Optimizer, Stuck Pipe Predictor, Vibration Detector', team: 'Drilling Engineering, Mud Engineer', duration: '8–18 days', failures: ['Differential sticking', 'Lost circulation', 'Casing running difficulties'], actions: ['ECD management, lubricant program', 'LCM (loss control material) preloaded', 'Pre-condition wellbore before casing run'] },
  { id: 'SP-US-03-5', name: 'Horizontal Build Section', purpose: 'Build inclination from vertical to target landing angle (typically 85–92°).', activities: ['KOP reached', 'RSS or motor activated', 'Build angle at designed DLS (dogleg severity)', 'Land at reservoir entry point'], inputs: 'Directional plan, target coordinates (northing/easting/TVD)', outputs: 'Real-time directional survey, landing confirmation', ai: 'RSS Trajectory Optimizer, Real-Time Geosteering (pre-reservoir)', team: 'Directional Driller, Drilling Engineer', duration: '5–12 days', failures: ['Tortuosity (excessive doglegs)', 'Lateral placement miss', 'Tool failure mid-build'], actions: ['DLS monitoring every survey', 'Contingency wellpath', 'Backup RSS tool on location'] },
  { id: 'SP-US-03-6', name: 'Reservoir Member Drilling', purpose: 'Drill horizontal lateral through productive reservoir zone, maximizing net pay contact.', activities: ['Enter reservoir at planned TVD', 'Continuous LWD while drilling', 'Geosteering adjustments', 'Monitor gas shows and chromatograph', 'Reach TD (total depth) or planned lateral length'], inputs: 'Geological model, geosteering steering targets, mud parameters', outputs: 'LWD composite log, mud log, geosteering trajectory, gas show record', ai: 'Geosteering AI, Formation Eval AI, Gas Show Analyzer', team: 'Geosteering Geologist, Directional Driller, MWD Engineer', duration: '8–20 days', failures: ['Exit reservoir (out-of-zone)', 'Torque/drag too high', 'LWD tool failure'], actions: ['Geosteering adjustment in <1 hr', 'Lubricant batch treatment', 'Backup LWD tool on standby'] },
  { id: 'SP-US-03-7', name: 'Wireline Logging', purpose: 'Acquire definitive formation evaluation data before completion decision.', activities: ['POOH (pull out of hole) drillstring', 'Run logging suite (GR/SP/resistivity/RHOB/NPHI/DT/FMI)', 'MDT fluid sampling at reservoir intervals', 'Log QC and data transmission to office'], inputs: 'LWD log (for depth correlation), mud log, geological prognosis', outputs: 'LAS file (wireline), MDT fluid sample analysis, petrophysical interpretation', ai: 'Facies Classification ML, Fluid Typing ML, Archie Petrophysical Model', team: 'Wireline Crew, Petrophysicist', duration: '3–7 days', failures: ['Tool stuck in hole', 'Hole cave-in while logging', 'Radioactive source incident'], actions: ['Wellbore condition criteria before POOH', 'Open-hole time limit protocol', 'Radiation safety officer onsite'] },
  { id: 'SP-US-03-8', name: 'Coring', purpose: 'Recover physical rock samples for laboratory analysis (PVT, porosity, permeability, SCAL).', activities: ['Select core interval from LWD/mud log', 'Run core barrel (PDC or diamond core bit)', 'Cut and retrieve core at surface', 'Preserve and ship to lab'], inputs: 'Core point selection, core barrel inventory', outputs: 'Core barrel (preserved), core photos, core gamma log', ai: 'Core Interval Selector ML', team: 'Core Service Company, Geologist', duration: '1–3 days/core', failures: ['Core jamming (no recovery)', 'Core barrel stuck in hole', 'Core contamination with OBM'], actions: ['Core catcher optimization', 'Jarring program on stuck barrel', 'Rubber sleeve barrel for OBM wells'] },
  {
    id: 'SP-US-03-9', name: 'Well Control Response (Emergency)',
    purpose: 'Detect and control subsurface fluid influx to prevent blowout.',
    activities: ['Normal drilling (monitoring pit gain, flow check)', 'Influx detected → flow check (stop pumps, monitor)', 'Well shut-in → close annular BOP', 'Kill procedure → circulate heavy mud (driller\'s method or wait-and-weight)', 'Resume drilling with higher mud weight'],
    inputs: 'Pit gain alert, flow after pump shut-down, SPP (standpipe pressure) change',
    outputs: 'Well control report, kill sheet, post-well control audit',
    ai: ['Influx Early Warning ML — detects pit gain 3x earlier than manual monitoring', 'Kill Mud Weight Calculator — automatic kill density from SIDPP/SICP readings'],
    team: 'Company Man, Driller, Mud Engineer, Toolpusher',
    duration: '4–48 hrs (event-driven)',
    failures: ['Delayed influx detection', 'Wrong kill mud weight', 'BOP failure'],
    actions: ['Real-time pit volume trending AI', 'Auto kill sheet on SIDPP/SICP reading', 'Monthly BOP test + certification'],
    is_emergency: true,
  },
];

export default function DrillingProcessPage() {
  const [openSub, setOpenSub] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/upstream/process?section=drilling').catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="font-mono text-xs text-amber-400 bg-amber-900/20 border border-amber-800/40 px-2 py-1 rounded">P-US-03</span>
          <h1 className="text-2xl font-bold text-white">Drilling Operations Process</h1>
        </div>
        <p className="text-gray-400 text-sm">
          Full well lifecycle · Rig Mobilization → Surface Section → Intermediate Section → Reservoir Section → Formation Evaluation → TD & Suspension
        </p>
      </div>

      {/* SVG Flow */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4">Drilling Process Flow</h2>
        <div className="overflow-x-auto">
          <svg width="960" height="160" viewBox="0 0 960 160" className="block min-w-[700px]">
            <rect width="960" height="160" fill="#0a0e1a" rx="12" />
            <defs>
              <marker id="arrd" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#374151" />
              </marker>
            </defs>
            {[
              { x: 10, label: 'Rig\nMob', color: '#6b7280' },
              { x: 170, label: 'Surface\nSection', color: '#f59e0b' },
              { x: 330, label: 'Intermediate\nSection', color: '#8b5cf6' },
              { x: 490, label: 'Reservoir\nSection', color: '#22c55e' },
              { x: 650, label: 'Formation\nEval', color: '#3b82f6' },
              { x: 810, label: 'TD &\nSuspend', color: '#ef4444' },
            ].map((node, i, arr) => (
              <g key={node.label}>
                {i < arr.length - 1 && (
                  <line x1={node.x + 135} y1={80} x2={arr[i + 1].x} y2={80}
                    stroke="#374151" strokeWidth="2" markerEnd="url(#arrd)" />
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
        {STEPS.map(step => (
          <div key={step.step} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden"
            style={{ borderLeftColor: step.color, borderLeftWidth: 4 }}>
            <div className="flex items-center gap-4 p-5 border-b border-[#1e2a45]">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ backgroundColor: step.color + '33', color: step.color, border: `1px solid ${step.color}` }}>
                {step.step}
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Step {step.step}: {step.name}</h3>
                <div className="flex gap-3 text-xs text-gray-400">
                  <span>Duration: {step.duration}</span>
                  <span>Depth: {step.depth_range}</span>
                </div>
              </div>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Input</div>
                  <div className="text-sm text-gray-300 bg-[#0a0e1a] border border-[#1e2a45] rounded p-3">{step.inputs}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Activities</div>
                  <ul className="space-y-1">
                    {step.activities.map((a, i) => (
                      <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5 flex-shrink-0">▸</span><span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Output</div>
                  <div className="text-sm text-gray-300 bg-[#0a0e1a] border border-[#1e2a45] rounded p-3">{step.outputs}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Equipment</div>
                  <div className="text-sm text-gray-300">{step.equipment}</div>
                </div>
              </div>
              <div className="space-y-4">
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
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">KPIs</div>
                  <div className="space-y-1">
                    {step.kpis.map(kpi => (
                      <div key={kpi.label} className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">{kpi.label}</span>
                        <span className="text-white font-mono">{kpi.target} <span className="text-gray-500">{kpi.unit}</span></span>
                      </div>
                    ))}
                  </div>
                </div>
                {step.formula && (
                  <div>
                    <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">Key Formula</div>
                    <div className="bg-blue-900/10 border border-blue-800/30 rounded p-3">
                      <code className="text-blue-300 text-xs font-mono">{step.formula}</code>
                      {step.formula_vars && <div className="text-xs text-gray-400 mt-2">{step.formula_vars}</div>}
                    </div>
                  </div>
                )}
                {step.kaggle && (
                  <div className="text-xs text-blue-400 bg-blue-900/10 border border-blue-800/30 rounded p-2">
                    📊 Demo Dataset: {step.kaggle}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sub-process accordion */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4">Sub-process Detail (P-US-03) — includes Well Control Emergency Procedure</h2>
        <div className="space-y-2">
          {SUB_PROCESSES.map(sp => (
            <div key={sp.id} className={`border rounded-lg overflow-hidden ${sp.is_emergency ? 'border-red-700/50' : 'border-[#1e2a45]'}`}>
              <button
                onClick={() => setOpenSub(openSub === sp.id ? null : sp.id)}
                className={`w-full flex items-center justify-between px-4 py-3 hover:bg-[#131d35] transition-colors text-left ${sp.is_emergency ? 'bg-red-900/10' : 'bg-[#0a0e1a]'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-amber-400">{sp.id}</span>
                  <span className={`text-sm font-medium ${sp.is_emergency ? 'text-red-300' : 'text-white'}`}>
                    {sp.is_emergency ? '🚨 EMERGENCY: ' : ''}{sp.name}
                  </span>
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
                      <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Inputs → Outputs</div>
                      <div className="text-gray-300 text-xs">{sp.inputs}</div>
                      <div className="text-amber-300 text-xs mt-1">→ {sp.outputs}</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-purple-400 uppercase tracking-wider mb-1">⚡ AI Models</div>
                      <div className="text-purple-300 text-xs">
                        {Array.isArray(sp.ai) ? sp.ai.map((a, i) => <div key={i}>{a}</div>) : sp.ai}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Team</div>
                      <div className="text-gray-300 text-xs">{sp.team}</div>
                    </div>
                    <div>
                      <div className="text-xs text-red-400 uppercase tracking-wider mb-1">Common Failures</div>
                      <ul>{sp.failures.map((f, i) => <li key={i} className="text-red-300 text-xs">• {f}</li>)}</ul>
                    </div>
                    <div>
                      <div className="text-xs text-green-400 uppercase tracking-wider mb-1">Corrective Actions</div>
                      <ul>{sp.actions.map((a, i) => <li key={i} className="text-green-300 text-xs">✓ {a}</li>)}</ul>
                    </div>
                  </div>
                  {sp.is_emergency && (
                    <div className="col-span-2 bg-red-900/10 border border-red-800/30 rounded p-3">
                      <div className="text-xs text-red-400 font-semibold mb-2">Well Control Escalation Flowchart</div>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {['Normal Drilling', 'Pit Gain / Flow Alert', 'Flow Check (Stop Pumps)', 'Shut-In (Close BOP)', 'Calculate Kill Mud Weight', 'Circulate Kill Mud', 'Well Dead → Resume'].map((step, i, arr) => (
                          <span key={step} className="flex items-center gap-1">
                            <span className={`px-2 py-1 rounded ${i === 1 || i === 3 ? 'bg-red-900/40 text-red-300 border border-red-700/40' : 'bg-[#0a0e1a] text-gray-300 border border-[#1e2a45]'}`}>{step}</span>
                            {i < arr.length - 1 && <span className="text-gray-600">→</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
