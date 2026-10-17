'use client';
import { useEffect, useState } from 'react';

export default function StorageProcessPage() {
  const [openStep, setOpenStep] = useState<number | null>(0);
  const [_data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch('/api/midstream/storage').then(r => r.json()).then(d => setData(d.metrics));
  }, []);

  const tankTypes = [
    { type: 'Fixed Roof Tank (FRT)', products: 'Crude oil, asphalt, heavy products', vapour: 'Breathing + working losses to atmosphere (need vapour recovery)', pressure: 'Near atmospheric (typically ±8 mbar)', max: '150,000 m³' },
    { type: 'External Floating Roof Tank (EFRT)', products: 'Crude oil, gasoline, naphtha', vapour: 'Floating roof eliminates vapour space — minimal losses', pressure: 'Atmospheric — open top with floating pontoon', max: '300,000 m³' },
    { type: 'Internal Floating Roof Tank (IFRT)', products: 'Gasoline, solvents, light crude', vapour: 'Fixed outer roof + internal float — best vapour control', pressure: 'Near atmospheric', max: '100,000 m³' },
    { type: 'Pressurized Sphere / Bullet', products: 'LPG (propane, butane), ammonia', vapour: 'Fully pressurized — zero vapour loss', pressure: '8–18 bar (LPG vapour pressure)', max: '2,000 m³' },
    { type: 'Underground Salt Cavern', products: 'LPG, natural gas, crude oil (strategic reserve)', vapour: 'Fully enclosed — brine displacement injection/withdrawal', pressure: 'Formation pressure (100–200 bar)', max: '1,000,000 m³ equivalent' },
    { type: 'Lined Pit / Produced Water Pond', products: 'Produced water, drilling waste', vapour: 'Open evaporation — regulatory controlled', pressure: 'Atmospheric', max: 'Site-specific' },
  ];

  const gaugingMethods = [
    { method: 'Manual Innage Gauge (Dip)', accuracy: '±5–10 mm', standard: 'API 3.1A', desc: 'Weighted tape lowered to bottom — reads liquid depth directly. Reference method for custody transfer disputes.' },
    { method: 'Manual Outage Gauge', accuracy: '±5–10 mm', standard: 'API 3.1B', desc: 'Measures distance from reference point to liquid surface — calculates innage by subtraction.' },
    { method: 'Servo Level Gauge', accuracy: '±1 mm', standard: 'API 3.1B / IEC 61511', desc: 'Motorized float on wire servo-driven to liquid surface. Continuous automatic measurement. Industry standard for fiscal custody.' },
    { method: 'Radar (non-contact)', accuracy: '±1–3 mm', standard: 'IEC 60079 (EEx)', desc: 'Microwave pulse reflected from liquid surface — no moving parts, excellent for heavy/viscous products.' },
    { method: 'Guided Wave Radar (GWR)', accuracy: '±2 mm', standard: 'IEC 60079', desc: 'Radar pulse guided along probe — measures liquid level and interface (water-oil interface in crude tanks).' },
    { method: 'Hydrostatic (Bubbler/DP)', accuracy: '±3–5 mm equivalent', standard: 'API 3.3', desc: 'Measures hydrostatic pressure at tank bottom → converts to level via product density. No moving parts in product.' },
  ];

  const steps = [
    {
      num: 1,
      title: 'Receipt',
      icon: '📥',
      input: 'Product arriving from pipeline, ship, truck, or rail — at custody transfer meter',
      activities: [
        'Activate receiving tank: confirm tank is ready (not full, safe temperature, product compatibility)',
        'Line up: open inlet valve, confirm drain valve closed, vent valve position correct',
        'Record opening gauge on receiving tank: manual + automatic (servo/radar) measurement',
        'Monitor receipt rate and running total via fiscal meter',
        'Concurrent quality sampling: gravity, temperature, BS&W, RVP, sulphur',
        'Record closing gauge when receipt complete',
        'Calculate received volume: closing – opening gauges, corrected to standard conditions',
      ],
      equipment: ['Fiscal meter (turbine, Coriolis, ultrasonic)', 'Servo level gauge + backup radar', 'Automatic sampler (composite over receipt duration)', 'Temperature transmitters (multi-point for stratification)', 'Pressure transmitter'],
      formulas: [
        { name: 'Gross Observed Volume (GOV)', formula: 'GOV = (Closing gauge volume − Opening gauge volume) × Shell correction factor', desc: 'Shell correction accounts for tank shell thermal expansion. From API 2.7 calibration tables.' },
        { name: 'Gross Standard Volume (GSV)', formula: 'GSV = GOV × CTL × CPL', desc: 'CTL = volume correction for temperature (API Table 6A/6B); CPL = correction for pressure compressibility (typically 1.000 for crude at moderate pressure).' },
        { name: 'Net Standard Volume (NSV)', formula: 'NSV = GSV × (1 − BS&W fraction)', desc: 'BS&W = basic sediment and water (measured by centrifuge or Karl Fischer). NSV = net oil/product, excluding water and solids.' },
      ],
      ai: [
        { name: 'Receipt Volume Reconciler', tech: 'Statistical comparison + ML anomaly detection', desc: 'Compares fiscal meter volume vs tank gauge delta — flags discrepancies >0.1% for investigation (may indicate meter drift, gauge error, or unaccounted transfer)' },
      ],
      kpis: ['Measurement uncertainty % (target ≤ 0.35%)', 'Receipt volume reconciliation error % (target <0.1%)', 'Sampling representativeness (composite sample per 1,000 bbl minimum)', 'Receipt rate (m³/hr vs nominated)'],
      regulatory: ['API MPMS Chapter 17 (marine measurement)', 'API MPMS Chapter 3 (tank gauging)', 'AER Directive 017'],
    },
    {
      num: 2,
      title: 'Tank Gauging',
      icon: '📏',
      input: 'Tank contents at rest (static) for custody determination, or continuous monitoring during operations',
      activities: [
        'Static gauging: product must be at rest ≥30 minutes after transfer before custody gauge',
        'Multi-point temperature measurement: upper, middle, lower to detect stratification',
        'Interface gauging: measure oil-water interface level (free water below oil)',
        'Tank shell temperature for shell correction factor calculation',
        'Water bottom measurement: manual water-finding paste on gauge line',
        'Reference gauge height verification: top reference point correct and unobstructed',
        'Record all gauge data in custody transfer ticket with timestamps',
      ],
      equipment: ['Servo level gauge (primary)', 'Radar gauge (backup)', 'Multi-point temperature transmitters (minimum 5 points per API 7.4)', 'Water finding paste', 'Calibrated gauge tape (NIST traceable)', 'Thermometer (certified, NIST traceable)'],
      ai: [
        { name: 'Stratification Detector', tech: 'ML on multi-point temperature profile', desc: 'Identifies thermal stratification layers in crude tanks from temperature gradient — detects density layers that could cause unexpected volume calculation error or rollover risk' },
        { name: 'Gauge Accuracy Monitor', tech: 'Statistical drift detection', desc: 'Tracks agreement between servo gauge and radar backup over time — detects servo float fouling or radar signal degradation before significant measurement error occurs' },
      ],
      kpis: ['Gauge repeatability (±1 mm for servo — API 3.1B requirement)', 'Servo/radar agreement (Δ <3 mm at any level)', 'Temperature profile completeness (all 5 probes functional)', 'Water interface measurement frequency (daily minimum for active tanks)'],
      regulatory: ['API MPMS Chapter 3.1A (manual gauging)', 'API MPMS Chapter 3.1B (automatic gauging)', 'API 7.4 (temperature determination)', 'ISO 4268 (petroleum liquids — manual sampling)'],
    },
    {
      num: 3,
      title: 'Product Quality Management',
      icon: '🔬',
      input: 'Composite sample from receipt/delivery, periodic tank samples for monitoring',
      activities: [
        'Laboratory analysis: API gravity (ASTM D4052), BS&W (ASTM D4007/D4006), RVP (ASTM D323), sulphur (ASTM D4294)',
        'Issue Certificate of Analysis (CoA) for each product batch',
        'Verify product meets pipeline specification for onward transmission',
        'Blending management: blend tanks to achieve target product grade',
        'Off-spec product management: segregate, reprocess, or downgrade',
        'Contamination investigation: identify source of any quality deviation',
        'Sample retention: retain composite samples for 30 days minimum for dispute resolution',
      ],
      equipment: ['Density meter (Anton Paar DMA5000)', 'BS&W centrifuge', 'RVP tester (Reid bomb)', 'Sulphur analyser (XRF or UV fluorescence)', 'Viscometer', 'Gas chromatograph (for condensate / NGL)', 'LIMS (Laboratory Information Management System)'],
      productSpecs: [
        { spec: 'Crude Oil (pipeline)', param: 'BS&W <0.5%, API 18–50°, sulphur <per grade, RVP <14 psi', std: 'API 5L pipe spec + contract' },
        { spec: 'Condensate (natural)', param: 'API >45°, RVP <11 psi, sulphur <per spec, no free water', std: 'ASTM D1655 + contract' },
        { spec: 'LPG Propane (HD-5)', param: 'C3 ≥95%, C2 ≤0.5%, C4 ≤2.5%, H2S <5 ppm, water absent', std: 'GPA 2140 / ASTM D2163' },
        { spec: 'NGL Mix', param: 'Composition per contract, RVP per class, no free water', std: 'GPA 2261 + contract' },
      ],
      ai: [
        { name: 'Blending Optimizer', tech: 'LP (Linear Programming) optimization', desc: 'Determines optimal blend ratio of available tank stocks to achieve target product spec (API, sulphur, viscosity) while minimizing higher-value component use and cycle time' },
        { name: 'Off-Spec Risk Predictor', tech: 'ML classification', desc: 'Predicts probability of off-spec product based on inlet quality trend, blend history, and laboratory backlog — triggers early warning to operations before CoA results are available' },
      ],
      kpis: ['CoA issue time (hours from sample receipt to report — target <4 hr)', 'Off-spec volume ratio % per month', 'Sample representativeness score (composite sample coverage %)', 'Lab turnaround time (hours)', 'Specification compliance % (all product delivered in-spec)'],
    },
    {
      num: 4,
      title: 'Inventory Management',
      icon: '📊',
      input: 'Real-time tank gauge data, receipt/delivery schedule, product pricing, strategic reserve requirements',
      activities: [
        'Daily inventory report: product by grade, tank by tank, reconcile all movements',
        'Stratification monitoring: detect density layers in crude tanks — schedule mixing pump if needed',
        'Evaporation loss calculation: API 2521 (fixed roof), API 2517 (floating roof)',
        'Minimum working inventory: ensure buffer above pump minimum suction level',
        'Strategic reserve compliance: regulatory minimum stock days (varies by jurisdiction)',
        'Product aging: FIFO (first-in first-out) where product has shelf life (avoidance of stale LPG)',
        'Tank rotation: ensure all tanks cycled to maintain tank integrity test schedule compliance',
      ],
      tankInventoryLevels: [
        { level: 'Emergency / Suction Minimum', pct: '5–10%', desc: 'Below this: pump cavitation, loss of suction. Operations stop immediately.' },
        { level: 'Minimum Working Inventory', pct: '15–20%', desc: 'Regulatory / operational minimum. Triggers immediate procurement action.' },
        { level: 'Target Operating Range', pct: '40–70%', desc: 'Normal operating band — balanced for receipt flexibility and drawdown capacity.' },
        { level: 'Maximum Operating Level', pct: '85–90%', desc: 'Maximum before freeboard safety margin is compromised. Triggers delivery stop.' },
        { level: 'Overfill Alarm', pct: '95%', desc: 'High-high level alarm. Auto-shutdown of receipt. Emergency response initiated.' },
      ],
      ai: [
        { name: 'Inventory Level Optimizer', tech: 'ML + LP optimization', desc: 'Minimizes tank turnovers (each turnover causes vapour loss and mechanical wear) by optimizing receipt/delivery scheduling — balances inventory levels across tank farm to minimize total working inventory while meeting all delivery commitments' },
        { name: 'Evaporation Loss Predictor', tech: 'Statistical ML from API equations + weather data', desc: 'Predicts evaporative losses from fixed-roof and floating-roof tanks based on product type, tank geometry, temperature, wind speed, and fill level — enables more accurate loss accounting and identifies tanks with abnormal losses (seal damage on floating roof)' },
        { name: 'Rollover Risk Monitor', tech: 'Physics-based + ML model', desc: 'For LNG tanks: monitors density stratification from multi-point temperature and density probes → calculates rollover risk (auto-mixing/spontaneous boiloff when layers equilibrate) — critical safety hazard in LNG storage' },
      ],
      kaggle: 'environmental-telemetry dataset (temperature, humidity, wind speed — directly applicable to evaporative loss prediction model training for floating roof tanks)',
      kpis: ['Inventory accuracy % (physical vs book, target ≥99.7%)', 'Unaccounted-for losses (UFL) % per month', 'Strategic reserve days (regulatory minimum compliance)', 'Tank utilization % (avoid chronic under/over-utilization)', 'Rollover events (LNG) — target zero', 'Tank turnover rate per year'],
    },
    {
      num: 5,
      title: 'Drawdown / Transfer',
      icon: '📤',
      input: 'Delivery nomination, custody transfer measurement system ready, receiving party confirmed',
      activities: [
        'Pre-transfer: confirm receiving line/vessel/pipeline is lined up and ready',
        'Opening gauge on delivery tank: servo + manual backup',
        'Transfer: start pump, ramp to nominated rate, monitor pressure/flow',
        'Maintain free water drain: remove water accumulated below oil during transfer',
        'Quality sample: composite automatic sampler running throughout transfer',
        'Monitor BS&W probe: divert if water cut rises above spec',
        'Closing gauge at completion of transfer: both parties witness or confirm',
        'Volume calculation: as per receipt process (GOV → GSV → NSV)',
      ],
      pumpTypes: [
        { type: 'Centrifugal pump', use: 'High-flow, moderate-head applications — crude oil, condensate, NGL pipeline injection' },
        { type: 'Positive displacement (gear)', use: 'High-viscosity products — heavy crude, asphalt, wax-bearing oil' },
        { type: 'Submerged turbine pump (STP)', use: 'LPG / pressurized products — below-ground pump in pressurized bullet' },
        { type: 'In-line booster pump', use: 'Boosting to overcome discharge head on long transfer lines' },
      ],
      ai: [
        { name: 'Transfer Rate Optimizer', tech: 'ML + flow assurance model', desc: 'Adjusts pump speed and back-pressure valve to maintain optimal transfer rate while avoiding cavitation (minimum suction head) and pipeline pressure limits — maximizes transfer rate within equipment constraints' },
        { name: 'BS&W Breakthrough Detector', tech: 'ML on inline BS&W probe + temperature data', desc: 'Detects rising water cut trend early in transfer — predicts when BS&W will exceed spec (0.5%) and triggers automatic divert to slop tank before off-spec product reaches fiscal meter' },
      ],
      kpis: ['Transfer rate (m³/hr vs nominated)', 'Pump efficiency % (hydraulic)', 'Transfer volume accuracy % (fiscal meter vs gauge)', 'BS&W in delivered product % (must be in-spec)', 'Pump availability % (unplanned trips)'],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <span className="text-amber-400 font-mono text-sm font-bold bg-amber-500/10 px-2 py-0.5 rounded">P-MS-05</span>
          <h1 className="text-2xl font-bold text-white">Storage Operations Process</h1>
        </div>
        <p className="text-gray-400 text-sm">
          Tank farm and storage operations — Receipt, Gauging, Quality, Inventory Management, Drawdown
        </p>
        <div className="flex gap-4 mt-2 text-xs text-gray-500">
          <span>⚙️ 5 process steps</span>
          <span>🤖 7 AI models</span>
          <span>📊 Kaggle: environmental-telemetry (weather data for evaporation model)</span>
        </div>
      </div>

      {/* SVG Flow */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-6 overflow-x-auto">
        <h2 className="text-xs font-semibold text-amber-400 mb-4 uppercase tracking-wider">Storage Operations Flow</h2>
        <svg viewBox="0 0 960 120" className="w-full min-w-[700px]" style={{ height: 120 }}>
          <defs>
            <marker id="arrowS" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#d97706" />
            </marker>
          </defs>
          {[
            { x: 10, label: 'Receipt', sub: 'Step 1', step: '1' },
            { x: 200, label: 'Tank Gauging', sub: 'Step 2', step: '2' },
            { x: 390, label: 'Product Quality', sub: 'Step 3', step: '3' },
            { x: 575, label: 'Inventory', sub: 'Mgmt Step 4', step: '4' },
            { x: 755, label: 'Drawdown/', sub: 'Transfer Step 5', step: '5' },
          ].map((n, i) => (
            <g key={i}>
              <rect x={n.x} y={25} width={160} height={65} rx="8" fill="#0a0e1a" stroke="#d97706" strokeWidth="1.5" />
              <foreignObject x={n.x + 4} y={28} width={152} height={59}>
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <span style={{ fontSize: 9, color: '#d97706', fontWeight: 700 }}>Step {n.step}</span>
                  <span style={{ fontSize: 11, color: '#f3f4f6', fontWeight: 600, marginTop: 2 }}>{n.label}</span>
                  <span style={{ fontSize: 9, color: '#9ca3af' }}>{n.sub}</span>
                </div>
              </foreignObject>
              {i < 4 && (
                <line x1={n.x + 163} y1={57} x2={n.x + 193} y2={57} stroke="#d97706" strokeWidth="2" markerEnd="url(#arrowS)" />
              )}
            </g>
          ))}
          {/* Custody Transfer box at end */}
          <rect x={920} y={35} width={35} height={45} rx="6" fill="#0a0e1a" stroke="#9ca3af" strokeWidth="1" />
          <foreignObject x={921} y={37} width={33} height={41}>
            <div className="flex flex-col items-center justify-center h-full text-center">
              <span style={{ fontSize: 8, color: '#9ca3af' }}>Custody</span>
            </div>
          </foreignObject>
          <line x1={917} y1={57} x2={918} y2={57} stroke="#d97706" strokeWidth="2" markerEnd="url(#arrowS)" />
        </svg>
      </div>

      {/* Tank Types Reference Table */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <h2 className="text-sm font-semibold text-amber-400 mb-3 uppercase tracking-wider">Tank Types Reference</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-400 border-b border-[#1e2a45]">
                <th className="pb-2 text-left pr-3">Tank Type</th>
                <th className="pb-2 text-left pr-3">Products</th>
                <th className="pb-2 text-left pr-3">Vapour Control</th>
                <th className="pb-2 text-left pr-3">Pressure</th>
                <th className="pb-2 text-left">Max Size</th>
              </tr>
            </thead>
            <tbody>
              {tankTypes.map((t, i) => (
                <tr key={i} className="border-b border-[#1e2a45]/50">
                  <td className="py-2 pr-3 text-white font-medium">{t.type}</td>
                  <td className="py-2 pr-3 text-gray-400">{t.products}</td>
                  <td className="py-2 pr-3 text-gray-500">{t.vapour}</td>
                  <td className="py-2 pr-3 text-amber-400">{t.pressure}</td>
                  <td className="py-2 text-gray-400">{t.max}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gauging Methods */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <h2 className="text-sm font-semibold text-amber-400 mb-3 uppercase tracking-wider">Tank Gauging Methods — API Standards</h2>
        <div className="grid grid-cols-2 gap-3">
          {gaugingMethods.map((gm, i) => (
            <div key={i} className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg p-3">
              <div className="flex items-start justify-between mb-1">
                <div className="text-sm font-medium text-white">{gm.method}</div>
                <span className="text-xs text-amber-400 shrink-0 ml-2">{gm.accuracy}</span>
              </div>
              <div className="text-xs text-gray-500 mb-1">{gm.standard}</div>
              <div className="text-xs text-gray-400">{gm.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Process Steps */}
      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.num} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
            <button
              onClick={() => setOpenStep(openStep === step.num ? null : step.num)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-[#1e2a45]/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{step.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold text-xs">Step {step.num}</span>
                    <span className="text-white font-semibold text-sm">{step.title}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{step.input}</div>
                </div>
              </div>
              <span className="text-gray-400 text-xs shrink-0 ml-4">{openStep === step.num ? '▲' : '▼'}</span>
            </button>

            {openStep === step.num && (
              <div className="border-t border-[#1e2a45] p-4 space-y-4">
                <div>
                  <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">Input</div>
                  <div className="text-sm text-gray-300">{step.input}</div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Activities</div>
                  <ul className="space-y-1">
                    {step.activities.map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="text-amber-500 shrink-0 mt-0.5">•</span>{a}
                      </li>
                    ))}
                  </ul>
                </div>

                {'equipment' in step && step.equipment && (
                  <div>
                    <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Equipment</div>
                    <div className="grid grid-cols-2 gap-1">
                      {step.equipment.map((e, i) => (
                        <div key={i} className="text-xs text-gray-400 bg-[#0a0e1a] border border-[#1e2a45] rounded px-2 py-1">{e}</div>
                      ))}
                    </div>
                  </div>
                )}

                {'formulas' in step && step.formulas && (
                  <div>
                    <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Measurement Formulas (API Standard)</div>
                    <div className="space-y-2">
                      {step.formulas.map((f, i) => (
                        <div key={i} className="bg-[#0a0e1a] border border-amber-500/20 rounded-lg p-3">
                          <div className="text-xs text-amber-400 font-semibold mb-1">{f.name}</div>
                          <div className="font-mono text-xs text-green-400 mb-1 break-all">{f.formula}</div>
                          <div className="text-xs text-gray-500">{f.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {'productSpecs' in step && step.productSpecs && (
                  <div>
                    <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Product Specifications</div>
                    <div className="space-y-2">
                      {step.productSpecs.map((ps, i) => (
                        <div key={i} className="bg-[#0a0e1a] border border-[#1e2a45] rounded p-2 text-xs">
                          <div className="text-white font-medium">{ps.spec}</div>
                          <div className="text-amber-400 mt-0.5">{ps.param}</div>
                          <div className="text-gray-500 mt-0.5">Standard: {ps.std}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {'tankInventoryLevels' in step && step.tankInventoryLevels && (
                  <div>
                    <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Tank Inventory Level Thresholds</div>
                    <div className="space-y-2">
                      {step.tankInventoryLevels.map((lvl, i) => (
                        <div key={i} className="flex items-start gap-3 bg-[#0a0e1a] border border-[#1e2a45] rounded p-2">
                          <div className="shrink-0 w-48">
                            <div className="text-xs text-white font-medium">{lvl.level}</div>
                            <div className="text-xs text-amber-400 font-bold">{lvl.pct}</div>
                          </div>
                          <div className="text-xs text-gray-400">{lvl.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {'pumpTypes' in step && step.pumpTypes && (
                  <div>
                    <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Transfer Pump Types</div>
                    <div className="space-y-1">
                      {step.pumpTypes.map((pt, i) => (
                        <div key={i} className="flex items-start gap-3 text-xs">
                          <span className="text-amber-400 font-medium shrink-0 w-40">{pt.type}</span>
                          <span className="text-gray-400">{pt.use}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">AI Integration</div>
                  <div className="space-y-2">
                    {step.ai.map((ai, i) => (
                      <div key={i} className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-amber-400 text-sm">⚡</span>
                          <span className="text-amber-400 font-semibold text-sm">{ai.name}</span>
                          <span className="text-xs text-gray-500 bg-[#0a0e1a] px-2 py-0.5 rounded">{ai.tech}</span>
                        </div>
                        <div className="text-xs text-gray-400">{ai.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {'kaggle' in step && step.kaggle && (
                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
                    <div className="text-xs font-semibold text-blue-400 mb-1">📊 Kaggle Dataset Reference</div>
                    <div className="text-xs text-gray-400">{step.kaggle}</div>
                  </div>
                )}

                <div>
                  <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">KPIs</div>
                  <div className="grid grid-cols-2 gap-1">
                    {step.kpis.map((kpi, i) => (
                      <div key={i} className="text-xs text-gray-400 bg-[#0a0e1a] border border-[#1e2a45] rounded px-2 py-1">📈 {kpi}</div>
                    ))}
                  </div>
                </div>

                {'regulatory' in step && step.regulatory && (
                  <div>
                    <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Regulatory Standards</div>
                    <div className="flex flex-wrap gap-1">
                      {step.regulatory.map((r, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded">{r}</span>
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
  );
}
