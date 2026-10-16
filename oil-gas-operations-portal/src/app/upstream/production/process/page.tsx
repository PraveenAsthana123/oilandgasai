'use client';
import { useEffect, useState } from 'react';

const STEPS = [
  {
    step: 1,
    name: 'Wellbore & Wellhead Management',
    color: '#22c55e',
    icon: '🛢️',
    activities: ['Monitor wellhead pressure (FWHP) and temperature', 'Choke management — optimize production rate vs. reservoir management', 'Annulus pressure surveillance (A/B/C annulus)', 'Wellbore inflow performance analysis', 'Artificial lift optimization'],
    inputs: 'Real-time wellhead pressure/temperature SCADA, choke position, annulus pressure',
    outputs: 'Daily production report (BOPD/MMSCFD/BWPD), choke change log, annulus pressure trend',
    equipment: 'Christmas tree (wellhead), choke manifold, pressure transducer, RTU (Remote Terminal Unit)',
    ai: [
      { name: 'Virtual Flow Meter', desc: 'ML predicts individual well flow rate from wellhead pressure/temperature/choke size without a physical test separator. Reduces test separator requirement by 60%.', type: 'ML Regression' },
      { name: 'Inflow Performance AI', desc: 'Generates IPR curve from well test data — predicts optimal FWHP for maximum production', type: 'Nodal Analysis ML' },
    ],
    kpis: [
      { label: 'FWHP (Flowing Wellhead Pressure)', target: 'As per design ±50 psi', unit: 'psi' },
      { label: 'Annulus B Pressure', target: '<500 psi (indicator of tubing integrity)', unit: 'psi' },
      { label: 'Choke Size Optimization', target: 'Reservoir draw-down <500 psi/day', unit: 'psi/day' },
    ],
    duration: 'Continuous 24/7',
  },
  {
    step: 2,
    name: 'Flowline & Multiphase Flow Management',
    color: '#3b82f6',
    icon: '〰️',
    activities: ['Monitor multiphase flow (oil/gas/water fractions in line)', 'Hydrate inhibition — inject MEG or methanol at continuous rate', 'Corrosion inhibitor batch/continuous injection', 'Wax management (pigging schedule, pour point depressant)', 'Slugging detection and mitigation'],
    inputs: 'Flowline pressure/temperature profile, MEG injection pump telemetry, pig launcher status',
    outputs: 'Flowline integrity report, MEG consumption log, pig tracking record, corrosion coupon results',
    equipment: 'MEG injection pumps, chemical injection skid, pigging launcher/receiver, multiphase flowmeter',
    ai: [
      { name: 'Hydrate Prediction ML', desc: 'Calculates hydrate formation envelope from pressure/temperature/composition — alerts when operating point approaches hydrate curve with <2°C margin', type: 'Statistical ML + Phase Equilibrium' },
      { name: 'Corrosion Rate ML', desc: 'Predicts corrosion rate from water cut, pH, CO2/H2S partial pressure, velocity, inhibitor dose — optimizes chemical injection rate', type: 'ML Regression' },
      { name: 'Slug Flow Detector', desc: 'Time-series ML on flowline pressure signal — classifies flow regime (slug/churn/annular) and predicts slug arrival at separator', type: 'Time-Series ML' },
    ],
    kpis: [
      { label: 'MEG Injection Rate', target: 'As per hydrate inhibition model', unit: 'L/hr' },
      { label: 'Wax Appearance Temperature', target: 'Line temp >WAT + 5°C', unit: '°C margin' },
      { label: 'Flowline Integrity Score', target: '>90%', unit: '/100' },
    ],
    duration: 'Continuous',
  },
  {
    step: 3,
    name: '3-Phase Separation',
    color: '#f59e0b',
    icon: '⚗️',
    activities: ['Oil/gas/water separation in primary separator (HP/LP)', 'Emulsion treatment (heat + demulsifier)', 'BS&W measurement (centrifuge test)', 'Gas compression (field compression to sales line)', 'Free water knockout (FWKO) for produced water'],
    inputs: 'Inlet multiphase stream (oil + gas + water), demulsifier chemical',
    outputs: 'Separated oil (BS&W <0.5%), separated gas (to compressor), produced water (to disposal/injection)',
    equipment: '3-phase test separator, HP/LP separator, treater/heater-treater, free water knockout, compressor',
    ai: [
      { name: 'Separator Level Optimizer', desc: 'PID + ML control of oil/water interface level — minimizes oil carryunder in water and water carryover in oil simultaneously', type: 'Control ML' },
      { name: 'Emulsion Classifier', desc: 'ML from API gravity + water cut + temperature → predicts emulsion stability and optimal demulsifier type/dose', type: 'ML Classifier' },
      { name: 'Gas Compressor Optimizer', desc: 'Load balancing across parallel compressors — minimizes fuel gas consumption while meeting gas delivery target', type: 'Optimization ML' },
    ],
    kpis: [
      { label: 'BS&W (Basic Sediment & Water)', target: '<0.5%', unit: '%' },
      { label: 'GOR (Gas-Oil Ratio)', target: 'Stable ±5% day-over-day', unit: 'scf/bbl' },
      { label: 'Separator Uptime', target: '>99%', unit: '%' },
    ],
    duration: 'Continuous',
  },
  {
    step: 4,
    name: 'Dehydration & Gas Treating',
    color: '#8b5cf6',
    icon: '💧',
    activities: ['Glycol (TEG) absorption — removes water vapor from gas', 'Glycol regeneration — reboiler maintains TEG purity', 'Molecular sieve for deep dehydration (if LPG spec required)', 'H2S treating (amine scrubbing — MEA/DEA/MDEA)', 'Dew point monitoring per sales gas specification'],
    inputs: 'Wet gas from separator, TEG lean solution, amine lean solution',
    outputs: 'Sales-spec dry gas (water content <65 mg/m³ or per spec), H2S-free gas (<4 ppm or per spec)',
    equipment: 'TEG contactor column, TEG reboiler, amine absorber, amine stripper, chiller (for dew point control)',
    ai: [
      { name: 'Glycol Circulation Optimizer', desc: 'ML optimizes TEG circulation rate and reboiler temperature for minimum glycol losses while meeting dew point spec', type: 'Process Optimization ML' },
      { name: 'Dew Point Predictor', desc: 'Real-time prediction of hydrocarbon dew point from gas composition (chromatograph) — prevents spec violation before it occurs', type: 'Thermodynamic ML' },
      { name: 'H2S Trend Analyzer', desc: 'Time-series ML on amine system H2S loading — predicts amine degradation and optimal regeneration timing', type: 'Time-Series ML' },
    ],
    kpis: [
      { label: 'Water Content in Sales Gas', target: '<65 mg/m³', unit: 'mg/m³' },
      { label: 'Hydrocarbon Dew Point', target: '<−5°C at max sales pressure', unit: '°C' },
      { label: 'H2S in Sales Gas', target: '<4 ppm mol', unit: 'ppm' },
      { label: 'TEG Purity', target: '>99.5%', unit: '%' },
    ],
    duration: 'Continuous',
  },
  {
    step: 5,
    name: 'Fiscal Metering & Allocation',
    color: '#ef4444',
    icon: '📊',
    activities: ['Primary fiscal meter — orifice plate / turbine / ultrasonic for custody transfer', 'Allocation metering — allocate total production to individual wells/leases', 'Meter proving (bi-monthly — piston prover)', 'Uncertainty analysis per ISO 5168 / AGA 3', 'Production reporting to regulator (AER/NEB monthly)'],
    inputs: 'Separator output streams, meter factor from proving, gas composition (chromatograph)',
    outputs: 'Custody transfer measurement report, allocation factors by well, regulatory production submission',
    equipment: 'Fiscal metering skid (orifice/ultrasonic), piston prover, gas chromatograph, flow computer (OMNI/Sick)',
    ai: [
      { name: 'Meter Anomaly Detector', desc: 'Real-time ML on meter reading patterns — flags meter fouling, drift, or bypass condition before proving deadline', type: 'Anomaly Detection ML' },
      { name: 'Flow Computer Validator', desc: 'Cross-checks flow computer calculations against independent pressure/temperature/composition inputs — catches systematic bias', type: 'Validation ML' },
      { name: 'Production Allocation Optimizer', desc: 'LP optimization splits total measured field production to individual wells using well test ratios + virtual meter estimates. Kaggle: environmental-telemetry dataset (IoT sensor patterns proxy for metering signal anomaly detection).', type: 'LP + ML' },
    ],
    kpis: [
      { label: 'Meter Uncertainty', target: '<0.5% (fiscal)', unit: '%' },
      { label: 'Allocation Error', target: '<2%', unit: '%' },
      { label: 'Proving Frequency', target: 'Every 60 days', unit: 'days' },
    ],
    kaggle: 'environmental-telemetry dataset (co/lpg/smoke/temp/humidity columns — proxy for gas sensor/IoT metering anomaly detection)',
    duration: 'Monthly custody transfer + continuous monitoring',
  },
  {
    step: 6,
    name: 'Pipeline Export & Custody Transfer',
    color: '#10b981',
    icon: '🚢',
    activities: ['Pump/compress oil/gas to pipeline delivery point', 'Monitor inlet pipeline pressure and delivery rate', 'Custody transfer meter reading at pipeline tie-in (LACT unit for oil)', 'Tariff calculation and shipper scheduling', 'SCADA monitoring — emergency shutdown (ESD) readiness'],
    inputs: 'Metered oil/gas from facility, pipeline operating conditions (inlet pressure/temperature spec)',
    outputs: 'Pipeline delivery dockets, LACT (Lease Automatic Custody Transfer) ticket, tariff invoice',
    equipment: 'LACT unit (oil), custody transfer meter (gas), ESD system, pipeline pump, pig launcher',
    ai: [
      { name: 'Pipeline Pressure Optimizer', desc: 'LP optimization minimizes pump energy consumption while maintaining required delivery pressure', type: 'LP Optimization' },
      { name: 'ESD Risk Predictor', desc: 'ML flags pre-ESD conditions (abnormal pressure drop, high temperature) before automatic shutdown — enables operator intervention', type: 'Anomaly Detection ML' },
    ],
    kpis: [
      { label: 'Export Rate', target: 'As per sales agreement ±5%', unit: 'm³/day' },
      { label: 'Pipeline Inlet Pressure', target: 'Per tariff agreement', unit: 'kPa' },
      { label: 'Pump Efficiency', target: '>80%', unit: '%' },
    ],
    duration: 'Continuous',
  },
  {
    step: 7,
    name: 'Artificial Lift Management',
    color: '#f59e0b',
    icon: '🔧',
    activities: ['ESP (Electric Submersible Pump) monitoring — motor current, pump frequency, discharge pressure', 'Gas lift optimization — gas injection rate per well', 'Plunger lift — timer optimization for low rate wells', 'Rod pump (pumpjack) — stroke per minute and fluid level control'],
    inputs: 'Downhole gauge (pressure/temperature), surface motor data, gas injection rate',
    outputs: 'Artificial lift performance report, ESP intervention schedule, gas lift allocation',
    equipment: 'ESP motor/pump/seal/cable, gas lift mandrel/valve, plunger lift controller, pumpjack unit',
    ai: [
      { name: 'ESP Performance Monitor', desc: 'IoT + ML tracks pump efficiency, motor temperature trend, vibration signature — predicts motor failure 30 days in advance. Reduces unplanned ESP pulls by 40%.', type: 'IoT + Predictive ML' },
      { name: 'Gas Lift Optimizer', desc: 'For gas lift wells: ML allocates limited gas injection across well portfolio to maximize total fluid production (nonlinear optimization)', type: 'Optimization ML' },
    ],
    kpis: [
      { label: 'ESP Run Life', target: '>18 months', unit: 'months' },
      { label: 'Gas Lift Efficiency', target: '>1,000 scf/bbl lifted', unit: 'scf/bbl' },
      { label: 'Artificial Lift Uptime', target: '>97%', unit: '%' },
    ],
    duration: 'Continuous',
  },
  {
    step: 8,
    name: 'Produced Water Management',
    color: '#6b7280',
    icon: '♻️',
    activities: ['Water treatment — remove residual oil, solids, scale', 'Water injection for pressure support (waterflood)', 'Disposal well injection (Class II UIC or AER approved)', 'Water handling capacity management', 'Disposal well integrity monitoring'],
    inputs: 'Produced water from FWKO/treater, makeup water for injection, polymer/scale inhibitor chemicals',
    outputs: 'Treated water (oil-free per disposal spec), injection well rate/pressure log, water chemistry report',
    equipment: 'Induced Gas Flotation (IGF), hydrocyclone, water injection pump, disposal well plunger',
    ai: [
      { name: 'Scale Predictor', desc: 'Calculates scaling tendency (Langelier / Oddo-Tomson index) from mixed water chemistry — optimizes scale inhibitor dosing', type: 'Geochemical ML' },
      { name: 'Waterflood Optimizer', desc: 'Voidage replacement ratio optimization across injectors — maximizes reservoir pressure support with minimum water handling cost', type: 'Optimization ML' },
    ],
    kpis: [
      { label: 'Oil in Water (OIW)', target: '<30 mg/L (disposal)', unit: 'mg/L' },
      { label: 'Injection Pressure', target: '<Fracture Pressure', unit: 'kPa' },
      { label: 'Water Handling Capacity Utilization', target: '<90%', unit: '%' },
    ],
    duration: 'Continuous',
  },
];

export default function ProductionProcessPage() {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  useEffect(() => { fetch('/api/upstream/process?section=production').catch(() => {}); }, []);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="font-mono text-xs text-amber-400 bg-amber-900/20 border border-amber-800/40 px-2 py-1 rounded">P-US-05</span>
          <h1 className="text-2xl font-bold text-white">Production Operations Process</h1>
        </div>
        <p className="text-gray-400 text-sm">
          Full surface facilities chain · Wellbore → Wellhead → Flowline → Separator → Dehydration → Metering → Export
        </p>
      </div>

      {/* Wide SVG Flow */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4">Production Facilities Flow</h2>
        <div className="overflow-x-auto">
          <svg width="1100" height="150" viewBox="0 0 1100 150" className="block min-w-[900px]">
            <rect width="1100" height="150" fill="#0a0e1a" rx="12" />
            <defs>
              <marker id="arrp" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#374151" />
              </marker>
            </defs>
            {[
              { x: 5, label: 'Wellbore', color: '#22c55e' },
              { x: 125, label: 'Wellhead', color: '#3b82f6' },
              { x: 245, label: 'Flowline', color: '#f59e0b' },
              { x: 365, label: 'Manifold', color: '#8b5cf6' },
              { x: 485, label: 'Separator', color: '#ef4444' },
              { x: 605, label: 'Dehydration', color: '#06b6d4' },
              { x: 725, label: 'Metering', color: '#10b981' },
              { x: 845, label: 'Export', color: '#f59e0b' },
              { x: 965, label: 'Artificial\nLift', color: '#f59e0b' },
            ].map((node, i, arr) => (
              <g key={node.label}>
                {i < arr.length - 1 && (
                  <line x1={node.x + 105} y1={75} x2={arr[i + 1].x} y2={75}
                    stroke="#374151" strokeWidth="2" markerEnd="url(#arrp)" />
                )}
                <rect x={node.x} y={45} width={105} height={60} rx="6"
                  fill={node.color + '22'} stroke={node.color} strokeWidth="2" />
                {node.label.split('\n').map((line, li) => (
                  <text key={li} x={node.x + 52} y={li === 0 ? 71 : 86} textAnchor="middle"
                    fill={node.color} fontSize="10" fontWeight="600">{line}</text>
                ))}
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Step cards */}
      <div className="space-y-4">
        {STEPS.map(step => (
          <div key={step.step} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden"
            style={{ borderLeftColor: step.color, borderLeftWidth: 4 }}>
            <button className="w-full flex items-center gap-4 p-4 text-left hover:bg-[#131d35] transition-colors"
              onClick={() => setActiveStep(activeStep === step.step ? null : step.step)}>
              <span className="text-xl">{step.icon}</span>
              <div className="flex-1">
                <div className="text-white font-semibold">Step {step.step}: {step.name}</div>
                <div className="text-xs text-gray-400">{step.duration}</div>
              </div>
              <span className="text-gray-400 text-sm">{activeStep === step.step ? '▲' : '▼'}</span>
            </button>
            {activeStep === step.step && (
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
                        <li key={i} className="text-sm text-gray-300 flex gap-2">
                          <span className="text-amber-500 mt-0.5 flex-shrink-0">▸</span><span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Output</div>
                    <div className="text-sm text-gray-300 bg-[#0a0e1a] border border-[#1e2a45] rounded p-3">{step.outputs}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Equipment</div>
                    <div className="text-sm text-gray-300">{step.equipment}</div>
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
                  {step.kaggle && (
                    <div className="text-xs text-blue-400 bg-blue-900/10 border border-blue-800/30 rounded p-2">
                      📊 Demo Dataset: {step.kaggle}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
