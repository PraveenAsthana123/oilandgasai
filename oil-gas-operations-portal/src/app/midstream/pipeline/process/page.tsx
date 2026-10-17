'use client';
import { useEffect, useState } from 'react';

export default function PipelineProcessPage() {
  const [openStep, setOpenStep] = useState<number | null>(0);
  const [openSub, setOpenSub] = useState<string | null>(null);
  const [_metrics, setMetrics] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch('/api/midstream/pipeline').then(r => r.json()).then(d => setMetrics(d.metrics));
  }, []);

  const steps = [
    {
      num: 1,
      title: 'Receipt / Injection Point',
      icon: '📥',
      input: 'Crude oil, condensate, NGL, or gas from upstream or processing plant',
      activities: [
        'Flow measurement (fiscal meter)',
        'Quality sampling: BS&W, API gravity, sulphur content, Reid Vapour Pressure (RVP)',
        'Contract volume verification against daily nominations',
        'LACT (Lease Automatic Custody Transfer) unit operation',
        'Divert to tank if product is off-spec (density, water, temperature out of range)',
      ],
      equipment: ['Ultrasonic flow meters', 'Densitometers', 'Sample probes & automatic samplers', 'LACT unit', 'Flow computers (Daniel, Emerson)', 'Separator / dehydrator'],
      ai: [
        { name: 'Quality Predictor', tech: 'ML regression', desc: 'Predicts product spec from inline density + viscosity measurement before lab result (8-hour lab turnaround reduced to 5-minute prediction)' },
        { name: 'Volume Anomaly Detector', tech: 'Statistical control chart', desc: 'Compares real-time flow rate vs scheduled nominations — flags deviations >2% for investigation' },
      ],
      kpis: ['Meter factor % (target 1.0000 ± 0.0025)', 'Measurement uncertainty % (≤ 0.35% liquid)', 'Off-spec volume (bbl/day)', 'Nomination accuracy %'],
      regulatory: ['NEB Measurement Regulation (Canada)', 'AER Directive 017 (Alberta)', 'API MPMS Chapter 5 (flow measurement)'],
    },
    {
      num: 2,
      title: 'Mainline Pumping / Compression',
      icon: '⚙️',
      input: 'Accepted product at inlet, pump/compressor operating parameters, suction conditions',
      activities: [
        'Speed control via VFD (Variable Frequency Drive) or throttle valve',
        'Surge protection and anti-surge controller (for gas compressors)',
        'Discharge pressure management — maintain scheduled line pack',
        'Seal system management: barrier fluid, seal gas, vent',
        'Continuous vibration monitoring on bearings and impeller',
        'Lube oil system health check (pressure, temperature, filter differential)',
      ],
      equipment: ['Centrifugal pumps / reciprocating compressors', 'Motor control center (MCC)', 'VFDs (Variable Frequency Drives)', 'Vibration sensors (accelerometers)', 'Seal gas / barrier fluid systems', 'Lube oil systems, oil coolers'],
      ai: [
        { name: 'Vibration Anomaly Detector', tech: 'FFT signal processing', desc: 'Performs real-time Fast Fourier Transform on accelerometer data → identifies bearing/impeller fault signatures before failure' },
        { name: 'Efficiency Optimizer', tech: 'ML operating point mapping', desc: 'Maps current operating point to hydraulic efficiency curve → recommends optimal speed to minimize energy per barrel' },
        { name: 'Predictive Maintenance', tech: 'ML — remaining useful life', desc: 'Combines vibration trend + temperature trend + oil analysis samples → estimates RUL and schedules proactive maintenance window' },
      ],
      kpis: ['Pump efficiency % (target >85%)', 'MTBF hours (Mean Time Between Failures)', 'Energy consumption kWh/bbl', 'Availability %', 'Surge events (target: 0/month)'],
      regulatory: ['API 610 (centrifugal pumps)', 'ASME PTC 10 (compressor performance)', 'ISO 10816 (vibration limits)'],
      kaggle: 'machine-maintenance dataset (rotational speed RPM, torque Nm, temperature K — exact analog for compressor/pump predictive maintenance)',
    },
    {
      num: 3,
      title: 'Pigging Operations',
      icon: '🐷',
      input: 'Pig launcher loaded, pressure/flow conditions confirmed, pig tracking system active',
      activities: [
        'Pre-pig inspection: launcher integrity, pig type selection, bypass valve confirmation',
        'Pig launch: pressurize launcher, equalize differential pressure, open kicker valve',
        'Real-time pig tracking via above-ground acoustic/magnetic signature detectors',
        'Receiver preparation: drain to tank, depressurize, bleed vents',
        'Pig receive: open bypass, allow pig entry, isolation valve close',
        'Post-run: debris collection, pig inspection, ILI data download',
      ],
      equipment: ['Pig launchers/receivers (barrel, trap)', 'Pig tracking units (ATAP, electronic markers)', 'Intelligent pigs: MFL for corrosion, UT for cracks, geometry/caliper', 'Data logging stations', 'Debris collection vessels'],
      pigTypes: [
        { type: 'Foam / Poly pig', purpose: 'Cleaning — remove wax, scale, liquid' },
        { type: 'Caliper pig', purpose: 'Geometry — detect dents, ovality' },
        { type: 'MFL Smart pig', purpose: 'Magnetic Flux Leakage — metal loss, corrosion' },
        { type: 'UT Smart pig', purpose: 'Ultrasonic — crack detection, SCC' },
        { type: 'Combined tool', purpose: 'MFL + caliper in single run' },
      ],
      defects: ['Internal corrosion', 'External corrosion', 'Mechanical damage (dent)', 'Weld defect (incomplete fusion, cracks)', 'SCC (Stress Corrosion Cracking)'],
      ai: [
        { name: 'ILI Data Analyzer', tech: 'CV + ML signal classification', desc: 'Classifies MFL signal patterns to identify metal loss features: corrosion pits, dents, weld anomalies — reduces analyst time 60%' },
        { name: 'Pig Run Scheduler', tech: 'ML corrosion rate model', desc: 'Determines optimal pig frequency from corrosion rate prediction + throughput scheduling to minimize cost vs risk' },
        { name: 'Pig Tracking AI', tech: 'Signal processing', desc: 'Locates pig in real-time from above-ground marker signals, predicts ETA at next marker, alerts on stuck-pig condition' },
      ],
      kpis: ['Feature detection rate %', 'Sizing accuracy (±10% for MFL — ASME B31.8 requirement)', 'Run completion %', 'Debris volume collected (kg)', 'Pig velocity deviation % from optimal'],
      regulatory: ['ASME B31.4/B31.8 (pipeline integrity)', 'CSA Z662 (Canada)', 'AER Directive 077'],
    },
    {
      num: 4,
      title: 'SCADA Monitoring & Control',
      icon: '🖥️',
      input: '20,000+ real-time data points from RTUs along the full pipeline corridor',
      activities: [
        'Continuous monitoring: pressure (every 30 seconds), flow, temperature, density',
        'Setpoint management: adjust delivery pressure targets, throughput nominations',
        'Alarm response: acknowledge, diagnose, take corrective action, verify resolution',
        'Leak detection scan: mass balance every 15 minutes + pressure wave analysis',
        'Pressure transient analysis: identify surges, water hammer events',
        'Daily operational reporting: throughput, downtime, alarm stats, energy KPIs',
      ],
      equipment: ['RTUs (Remote Terminal Units) — Emerson ROC, ABB', 'SCADA servers (dual-redundant hot standby)', 'HMI consoles (OSI Pi / Wonderware / Ignition)', 'Communication: satellite/fiber/licensed radio', 'Historian (OSI PI)'],
      alarmLevels: [
        { priority: 'P1 Emergency', color: 'red', desc: 'Safety — H2S alarm, fire/gas, ESD trigger' },
        { priority: 'P2 Critical', color: 'orange', desc: 'Production — high pressure, pump trip, line pack loss' },
        { priority: 'P3 High', color: 'yellow', desc: 'Equipment — vibration high, seal pressure' },
        { priority: 'P4 Low', color: 'blue', desc: 'Advisory — flow deviation, temperature trending' },
        { priority: 'P5 Information', color: 'gray', desc: 'Status change, mode switch, pump start' },
      ],
      leakDetection: [
        'Mass Balance: Qin − Qout − ΔStorage → leak volume estimate',
        'Pressure Point Analysis: correlation of pressure sensors along line',
        'Real-Time Transient Model (RTTM): hydraulic simulator compares actual vs model',
        'Statistical Process Control: CUSUM/EWMA on individual sensor readings',
      ],
      ai: [
        { name: 'Leak Detection System', tech: 'Statistical ML + pressure wave analysis', desc: 'Compares inlet vs outlet mass balance plus pressure transient signatures → calculates leak probability and estimated location (±500m)' },
        { name: 'Alarm Rationalization', tech: 'ML classification', desc: 'Classifies each alarm as nuisance/spurious/real → suppresses chattering alarms, prioritizes genuine safety events, reduces alarm load 40%' },
        { name: 'Anomaly Detection', tech: 'CUSUM/EWMA statistical control', desc: 'Detects gradual drift and step-change anomalies on all SCADA tag points before threshold alarm is triggered' },
      ],
      kaggle: 'environmental-telemetry dataset (ts, device, co, lpg, smoke, temp — directly analogous to SCADA sensor time series for anomaly detection training)',
      kpis: ['Leak detection sensitivity (% nominal flow)', 'False positive rate per month (target <2/month)', 'Alarm count per day (target <150 — ISA-18.2 guideline)', 'Alarm response time (minutes)', 'SCADA uptime % (target 99.9%)'],
      regulatory: ['ISA-18.2 Alarm Management Standard', 'NERC CIP (cybersecurity for OT)', 'API 1130 (computational pipeline monitoring)'],
    },
    {
      num: 5,
      title: 'Delivery / Offtake',
      icon: '📦',
      input: 'Scheduled nominations from shipper/receiver, product quality certificate, batch tracking data',
      activities: [
        'Nomination scheduling: match daily delivery volumes to shipper nominations',
        'Delivery measurement: fiscal meter reading, density/temperature correction',
        'Product quality certification: issue Certificate of Analysis (CoA)',
        'Tariff calculation: apply volume × tariff rate, generate invoice trigger',
        'Pipeline scheduling: manage batch splits for multi-product (crude, condensate, NGL)',
        'Interface contamination management: track and allocate contaminated volume',
      ],
      ai: [
        { name: 'Delivery Scheduler', tech: 'ML + Linear Programming optimization', desc: 'Optimizes batch sequences to minimize product contamination, minimize cycle time, and reduce pump starts while meeting all nominations' },
        { name: 'Batch Tracking', tech: 'ML density/flow signature matching', desc: 'Tracks product batch interfaces using inline density and flow signatures — alerts when interface arrives at delivery point' },
      ],
      kpis: ['Delivery accuracy % vs nomination (target >98%)', 'Interface contamination volume (bbl/month, minimize)', 'Cycle time (days)', 'Pump starts per day (minimize for equipment life)'],
      regulatory: ['API MPMS Chapter 18 (delivery measurement)', 'NEB tariff regulations'],
    },
    {
      num: 6,
      title: 'Custody Transfer',
      icon: '📋',
      input: 'Metered volume data, proving results, quality certificates from all delivery points',
      activities: [
        'Meter proving: small volume prover (SVP) or piston prover to establish current meter factor',
        'Meter factor calculation: MF = Prover volume / Meter indicated volume',
        'Volume statement generation: correct indicated volume to standard conditions (15°C, 101.325 kPa)',
        'Invoice triggering: send confirmed volume + quality to shipper billing system',
        'Dispute management: investigate volume discrepancies, resolve with shipper/receiver',
        'Regulatory reporting: submit monthly volume statements to NEB/AER',
      ],
      formulas: [
        { name: 'Volume at Standard Conditions', formula: 'Qstd = Q_indicated × CTL × CPL × MF', desc: 'CTL = Correction for Temperature of Liquid (API 11.1); CPL = Correction for Pressure of Liquid (API 11.2); MF = Meter Factor' },
        { name: 'Mass Flow', formula: 'M = Q_std × ρ_std', desc: 'ρ_std = density at standard conditions (15°C, 101.325 kPa) from lab analysis' },
        { name: 'Combined Measurement Uncertainty', formula: 'U_combined = √(u₁² + u₂² + u₃² + ... + uₙ²)', desc: 'Root-sum-of-squares of all component uncertainty contributions (flow meter, density meter, temperature, pressure, proving)' },
      ],
      ai: [
        { name: 'Meter Drift Predictor', tech: 'ML trend analysis', desc: 'Tracks meter factor trend over successive prove runs → predicts when meter will drift outside tolerance before next scheduled prove, triggering early prove' },
        { name: 'Uncertainty Analyzer', tech: 'Monte Carlo simulation', desc: 'Computes combined measurement uncertainty from all meter components per ISO 17089 — automatically flags when uncertainty budget exceeds 0.35% limit' },
      ],
      kpis: ['Meter factor (target 1.0000 ± 0.0025)', 'Measurement uncertainty ≤ 0.35% liquid, ≤ 1% gas', 'Prove frequency (monthly / quarterly based on factor stability)', 'Unaccounted-for gas/liquid %', 'Dispute resolution time (days)'],
      regulatory: ['API MPMS Chapter 4 (meter proving)', 'API MPMS Chapter 5 (flow measurement)', 'AER Directive 017 (Alberta metering)', 'ISO 17089 (uncertainty calculation)'],
    },
  ];

  const subProcessAccordion = [
    {
      id: 'receipt-quality',
      title: 'Receipt Quality Check',
      content: 'Incoming product must meet pipeline specification: BS&W < 0.5%, API gravity 18–45°, H2S < 10 ppm (crude), water dew point per pipeline spec (gas). Off-spec product is diverted to surge tank for reprocessing. Quality is confirmed by both inline analyser (continuous) and composite sampler (grab sample every 15 min, composited over 24h, sent to lab).',
    },
    {
      id: 'lact',
      title: 'LACT Operation',
      content: 'The Lease Automatic Custody Transfer (LACT) unit is the fiscal transfer point for liquids. Components: inlet strainer → BS&W probe → diverter valve (if off-spec) → positive displacement or turbine meter → sample probe → flow computer. The LACT unit issues a meter ticket for every batch. Meter factor applied from most recent small volume prove. All data transmitted to SCADA in real time.',
    },
    {
      id: 'batch-scheduling',
      title: 'Batch Scheduling',
      content: 'Multi-product pipelines carry sequential batches of different products. The batch scheduler must determine: sequence (heavier products minimize contamination at interfaces), batch size (minimum 5,000 bbl to limit proportional interface), launch timing, and receiver allocation. Interface contamination (mixed product at batch boundary) is allocated back to shippers based on interface volume and downstream product specs.',
    },
    {
      id: 'ili-procedure',
      title: 'ILI (Intelligent Pig) Run Procedure',
      content: '1. Pre-run: check launcher/receiver trap dimensions, confirm product is pig-compatible, review SCADA notification to all affected parties. 2. Tool preparation: calibrate MFL sensor array, verify battery life, verify data memory. 3. Run launch: pressure up launcher, open launching valve at optimal pig velocity (0.5–2.5 m/s for MFL accuracy). 4. Real-time tracking: track pig via above-ground detector system every 10–20 km. 5. Pig receive: prepare receiver, verify pig arrival, collect debris. 6. Data download: send raw tool data to ILI vendor for analysis. 7. Reporting: ILI vendor provides anomaly list, severity classification (immediate repair vs. monitor), ASME B31.8S assessment.',
    },
    {
      id: 'emergency-shutdown',
      title: 'Emergency Shutdown Procedure (ESD) — Decision Tree',
      isTree: true,
      tree: [
        { level: 0, text: 'Abnormal pressure event detected (SCADA alarm P1)', color: 'red' },
        { level: 1, text: '→ Isolate affected pipeline segment (close block valves at both ends)', color: 'orange' },
        { level: 1, text: '→ Notify SCADA Control Room Supervisor', color: 'orange' },
        { level: 2, text: '→ Leak confirmed? → Notify Regulator (NEB/AER) within 1 hour', color: 'yellow' },
        { level: 2, text: '→ No leak → Investigate root cause (instrument fault? pressure surge?)', color: 'blue' },
        { level: 3, text: '→ Begin leak investigation: aerial patrol + amine wax survey + line walking', color: 'yellow' },
        { level: 3, text: '→ Repair approved → Execute repair under pipeline code', color: 'green' },
        { level: 4, text: '→ Post-repair: pressure test to 1.25× MAOP for min 4 hours', color: 'green' },
        { level: 4, text: '→ Return to service: pressurize slowly, restore flow, update SCADA', color: 'green' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <span className="text-amber-400 font-mono text-sm font-bold bg-amber-500/10 px-2 py-0.5 rounded">P-MS-03</span>
          <h1 className="text-2xl font-bold text-white">Pipeline Operations Process</h1>
        </div>
        <p className="text-gray-400 text-sm">
          Pipeline Transmission — full operational process from receipt to custody transfer
        </p>
        <div className="flex gap-4 mt-2 text-xs text-gray-500">
          <span>⚙️ 6 process steps</span>
          <span>🤖 10 AI models</span>
          <span>📊 Kaggle: machine-maintenance, environmental-telemetry</span>
        </div>
      </div>

      {/* SVG Process Flow */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-6 overflow-x-auto">
        <h2 className="text-xs font-semibold text-amber-400 mb-4 uppercase tracking-wider">Pipeline Operations Flow</h2>
        <svg viewBox="0 0 960 120" className="w-full min-w-[700px]" style={{ height: 120 }}>
          <defs>
            <marker id="arrowP" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#d97706" />
            </marker>
          </defs>
          {[
            { x: 10, label: 'Receipt/', sub: 'Injection', step: 1 },
            { x: 170, label: 'Mainline', sub: 'Pumping', step: 2 },
            { x: 330, label: 'Pigging', sub: 'Operations', step: 3 },
            { x: 490, label: 'SCADA', sub: 'Monitoring', step: 4 },
            { x: 650, label: 'Delivery/', sub: 'Offtake', step: 5 },
            { x: 810, label: 'Custody', sub: 'Transfer', step: 6 },
          ].map((n, i) => (
            <g key={i}>
              <rect x={n.x} y={25} width={140} height={65} rx="8" fill="#0a0e1a" stroke="#d97706" strokeWidth="1.5" />
              <foreignObject x={n.x + 4} y={28} width={132} height={59}>
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <span style={{ fontSize: 9, color: '#d97706', fontWeight: 700 }}>Step {n.step}</span>
                  <span style={{ fontSize: 11, color: '#f3f4f6', fontWeight: 600, marginTop: 2 }}>{n.label}</span>
                  <span style={{ fontSize: 9, color: '#9ca3af' }}>{n.sub}</span>
                </div>
              </foreignObject>
              {i < 5 && (
                <line x1={n.x + 145} y1={57} x2={n.x + 163} y2={57} stroke="#d97706" strokeWidth="2" markerEnd="url(#arrowP)" />
              )}
            </g>
          ))}
        </svg>
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
                {/* Input */}
                <div>
                  <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">Input</div>
                  <div className="text-sm text-gray-300">{step.input}</div>
                </div>

                {/* Activities */}
                <div>
                  <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Activities</div>
                  <ul className="space-y-1">
                    {step.activities.map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="text-amber-500 mt-0.5 shrink-0">•</span>
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Equipment */}
                {step.equipment && (
                  <div>
                    <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Equipment</div>
                    <div className="grid grid-cols-2 gap-1">
                      {step.equipment.map((e, i) => (
                        <div key={i} className="text-xs text-gray-400 bg-[#0a0e1a] border border-[#1e2a45] rounded px-2 py-1">{e}</div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pig Types */}
                {'pigTypes' in step && step.pigTypes && (
                  <div>
                    <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Types of Pigs</div>
                    <div className="space-y-1">
                      {step.pigTypes.map((pt, i) => (
                        <div key={i} className="flex items-start gap-3 text-xs">
                          <span className="text-amber-400 font-medium shrink-0 w-28">{pt.type}</span>
                          <span className="text-gray-400">{pt.purpose}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2">
                      <div className="text-xs font-semibold text-amber-400 mb-1">ILI Defect Classification</div>
                      <div className="flex flex-wrap gap-1">
                        {step.defects?.map((d, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded">{d}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Alarm Levels (for SCADA step) */}
                {'alarmLevels' in step && step.alarmLevels && (
                  <div>
                    <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Alarm Priority Levels (ISA-18.2)</div>
                    <div className="space-y-1">
                      {step.alarmLevels.map((al, i) => (
                        <div key={i} className="flex items-start gap-3 text-xs">
                          <span className={`font-bold shrink-0 w-24 ${al.color === 'red' ? 'text-red-400' : al.color === 'orange' ? 'text-orange-400' : al.color === 'yellow' ? 'text-yellow-400' : al.color === 'blue' ? 'text-blue-400' : 'text-gray-400'}`}>{al.priority}</span>
                          <span className="text-gray-400">{al.desc}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3">
                      <div className="text-xs font-semibold text-amber-400 mb-1">Leak Detection Methods</div>
                      <ul className="space-y-1">
                        {step.leakDetection?.map((ld, i) => (
                          <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                            <span className="text-amber-500 shrink-0">•</span>{ld}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Formulas (for Custody Transfer step) */}
                {'formulas' in step && step.formulas && (
                  <div>
                    <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Key Formulas</div>
                    <div className="space-y-2">
                      {step.formulas.map((f, i) => (
                        <div key={i} className="bg-[#0a0e1a] border border-amber-500/20 rounded-lg p-3">
                          <div className="text-xs text-amber-400 font-semibold mb-1">{f.name}</div>
                          <div className="font-mono text-sm text-green-400 mb-1">{f.formula}</div>
                          <div className="text-xs text-gray-500">{f.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Integration */}
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

                {/* Kaggle ref */}
                {'kaggle' in step && step.kaggle && (
                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
                    <div className="text-xs font-semibold text-blue-400 mb-1">📊 Kaggle Dataset Reference</div>
                    <div className="text-xs text-gray-400">{step.kaggle}</div>
                  </div>
                )}

                {/* KPIs */}
                <div>
                  <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">KPIs</div>
                  <div className="grid grid-cols-2 gap-1">
                    {step.kpis.map((kpi, i) => (
                      <div key={i} className="text-xs text-gray-400 bg-[#0a0e1a] border border-[#1e2a45] rounded px-2 py-1">📈 {kpi}</div>
                    ))}
                  </div>
                </div>

                {/* Regulatory */}
                {step.regulatory && (
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

      {/* Sub-process Accordion */}
      <div>
        <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">Sub-Process Procedures</h2>
        <div className="space-y-2">
          {subProcessAccordion.map((sp) => (
            <div key={sp.id} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenSub(openSub === sp.id ? null : sp.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-[#1e2a45]/30 transition-colors"
              >
                <span className="text-white font-medium text-sm">{sp.title}</span>
                <span className="text-gray-400 text-xs">{openSub === sp.id ? '▲' : '▼'}</span>
              </button>
              {openSub === sp.id && (
                <div className="border-t border-[#1e2a45] p-4">
                  {sp.isTree && sp.tree ? (
                    <div className="space-y-1">
                      {sp.tree.map((node, i) => (
                        <div
                          key={i}
                          className={`text-xs py-1.5 px-3 rounded ${
                            node.color === 'red' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            node.color === 'orange' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                            node.color === 'yellow' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                            node.color === 'blue' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            'bg-green-500/10 text-green-400 border border-green-500/20'
                          }`}
                          style={{ marginLeft: node.level * 24 }}
                        >
                          {node.text}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400 leading-relaxed">{sp.content}</div>
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
