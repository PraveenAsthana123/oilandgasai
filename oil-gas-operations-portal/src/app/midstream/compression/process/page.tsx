'use client';
import { useEffect, useState } from 'react';

export default function CompressionProcessPage() {
  const [openStep, setOpenStep] = useState<number | null>(0);
  const [_data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch('/api/midstream/compression').then(r => r.json()).then(d => setData(d.metrics));
  }, []);

  const steps = [
    {
      num: 1,
      title: 'Slug Catcher',
      icon: '🌊',
      input: 'Multiphase flow (gas + liquid slugs) from gathering lines or long-distance pipeline',
      activities: [
        'Receive multiphase flow from wellhead / gathering manifold',
        'Separate large liquid slugs (condensate + produced water) before primary separation',
        'Level control: automatic drain to downstream vessels when liquid accumulates',
        'Slug volume prediction and capacity management',
        'Sample liquid for quality analysis (API, BS&W, sulphur)',
        'Vent control: ensure safe gas venting to flare/atmosphere within limits',
      ],
      equipment: ['Vessel slug catcher (finger / parking type)', 'Pipe bundle slug catcher (for large volumes)', 'Level transmitters (guided wave radar)', 'Automatic drain valves', 'Inlet pressure/temperature instrumentation'],
      slugCatcherTypes: [
        { type: 'Vessel (Finger) type', use: 'Low to moderate liquid volume, space-constrained sites' },
        { type: 'Vessel (Parking) type', use: 'High liquid capacity, offshore / large gathering systems' },
        { type: 'Pipe Bundle type', use: 'Very large slug volumes, typically for long-distance multiphase lines' },
      ],
      ai: [
        { name: 'Slug Volume Predictor', tech: 'ML regression on upstream flow params', desc: 'Predicts incoming slug volume from upstream pressure/flow patterns → pre-positions drain valves to prevent overflow' },
      ],
      kpis: ['Slug capture rate % (target 100%)', 'Liquid carryover to compressor % (target 0)', 'Vessel level % (maintain 30–70%)', 'Drain valve response time (seconds)'],
    },
    {
      num: 2,
      title: 'Field Separation (3-Phase)',
      icon: '⚗️',
      input: 'Degassed multiphase flow from slug catcher — gas + oil + water mixture',
      activities: [
        'Three-phase separation: gas (top), oil (middle), water (bottom)',
        'Wash section: water wash of oil layer to reduce emulsion',
        'Residence time control: ensure adequate time for phase separation',
        'Emulsion treatment: inject chemical demulsifier into oil leg',
        'Produced water quality check: total suspended solids, oil-in-water content',
        'Gas stabilization: flash gas from oil to reduce vapour pressure for safe transport',
      ],
      equipment: ['Horizontal 3-phase separator (low pressure)', 'Vertical 3-phase separator (space constraints)', 'Emulsion heater treater (electrostatic / heat)', 'Level controllers (DP type, guided wave radar)', 'Demulsifier injection pump'],
      formulas: [
        { name: 'Residence Time', formula: 't = V_liquid / Q_liquid', desc: 'V_liquid = liquid volume in vessel (m³); Q_liquid = liquid flow rate (m³/hr). Minimum residence time: 3–5 min for good separation.' },
        { name: 'Re-injection Rate for Demulsifier', formula: 'D_rate = Q_oil × C_target (ppm)', desc: 'Target demulsifier concentration typically 50–200 ppm of liquid production rate.' },
      ],
      ai: [
        { name: 'Emulsion Severity Monitor', tech: 'ML classification on interfacial level + P/T data', desc: 'Classifies current emulsion tightness (tight / normal / loose) → auto-adjusts demulsifier injection rate and heater setpoint' },
        { name: 'Separator Level Controller', tech: 'Model predictive control (MPC)', desc: 'Coordinates gas/oil/water level setpoints simultaneously to maximize throughput without liquid carry-over to gas compressor' },
      ],
      kpis: ['Oil-in-water content of produced water (mg/L, target <29 mg/L for disposal)', 'BS&W in export oil (target <0.5%)', 'Separator oil carryover ppm', 'Residence time achieved (minutes)', 'Demulsifier consumption (ppm)'],
    },
    {
      num: 3,
      title: 'Field Compression',
      icon: '⚙️',
      input: 'Separated gas from field separators, at wellhead / gathering system pressure',
      activities: [
        'Receive gas at suction — check temperature, pressure, moisture content',
        'Centrifugal compressor: high-flow / low compression ratio applications',
        'Reciprocating compressor: high compression ratio / lower flow applications',
        'Anti-surge control: maintain minimum flow through compressor',
        'Discharge temperature management: aftercooler to reduce gas temperature',
        'Seal gas system: maintain positive seal pressure on mechanical seals',
        'Suction scrubber: remove any entrained liquid before entering compressor',
      ],
      equipment: ['Centrifugal compressors (Solar Turbines, Siemens)', 'Reciprocating compressors (Ariel, Cooper-Bessemer)', 'Suction scrubbers', 'Aftercoolers (fin-fan air coolers)', 'Anti-surge controllers', 'Vibration monitoring system'],
      compressorTypes: [
        { type: 'Centrifugal', characteristic: 'High flow, moderate compression ratio (1.2–3.5 per stage), continuous flow, lower maintenance', application: 'Main line booster, processing plant compressors' },
        { type: 'Reciprocating', characteristic: 'High compression ratio (up to 8 per stage), lower flow, pulsating flow, more maintenance', application: 'Reinjection, gas lift, export compression' },
      ],
      thermodynamics: [
        { name: 'Polytropic Head', formula: 'H_p = (Z_avg × R × T_in / MW) × (k/(k-1)) × ((P_out/P_in)^((k-1)/k) - 1)', desc: 'Z_avg = average compressibility; R = gas constant (8.314 J/mol·K); T_in = suction temperature (K); MW = molecular weight; k = Cp/Cv ratio' },
        { name: 'Polytropic Efficiency', formula: 'η_p = H_p_ideal / H_p_actual', desc: 'Actual head accounts for mechanical losses; typical η_p = 0.75–0.85 for centrifugal, 0.78–0.88 for reciprocating' },
        { name: 'Power', formula: 'P = (ṁ × H_p) / η_p', desc: 'ṁ = mass flow rate (kg/s); H_p = polytropic head (J/kg)' },
      ],
      ai: [
        { name: 'Surge Detector', tech: 'Real-time operating point mapping', desc: 'Plots current operating point (flow, head) on compressor performance map → calculates proximity to surge line → triggers anti-surge valve open when within 10% of surge margin' },
        { name: 'Valve Health Monitor', tech: 'ML on P/V diagram shape', desc: 'Analyzes pressure-volume (P/V) indicator card from reciprocating compressor → detects valve leakage, broken valve, ring wear from diagram shape anomalies' },
        { name: 'Speed Optimizer', tech: 'ML + optimization', desc: 'Adjusts VFD speed to deliver required throughput at minimum power consumption, following the most efficient point on the compressor curve across varying suction conditions' },
      ],
      kpis: ['Compressor efficiency % (polytropic, target >80%)', 'Surge events per month (target 0)', 'Availability % (target >95%)', 'Suction scrubber liquid level (target 0 during normal operation)', 'Discharge temperature (°C, max 135°C typical)'],
      kaggle: 'machine-maintenance dataset — rotational speed (RPM), torque (Nm), temperature (K), tool wear, failure type — exact analog for compressor predictive maintenance model training',
    },
    {
      num: 4,
      title: 'Gas Dehydration (Glycol TEG)',
      icon: '💧',
      input: 'Compressed gas at pipeline delivery pressure, saturated with water vapour',
      activities: [
        'Absorb water from gas using lean TEG (Triethylene Glycol) in contactor tower',
        'Lean TEG enters top of contactor; wet gas enters bottom — counter-current contact on trays/packing',
        'Rich TEG (water-saturated) exits bottom → to regeneration still',
        'Regeneration still: reboiler strips water from rich TEG at ~200°C',
        'Lean TEG reconcentration to >99.9% purity',
        'Water dew point measurement at contactor outlet — verify spec met',
        'Monitor TEG losses (carryover, evaporation) — replenish as needed',
      ],
      equipment: ['TEG contactor tower (4–8 trays or structured packing)', 'TEG reboiler / regeneration still', 'Flash separator (on rich TEG line — recover dissolved gas)', 'Lean/rich TEG heat exchanger (energy recovery)', 'TEG circulation pump (glycol pump)', 'Water dew point analyser (capacitance or cooled mirror)'],
      dewpointSpecs: [
        { pipeline: 'Gathering line', spec: 'Typically -10°C to -20°C' },
        { pipeline: 'Transmission pipeline', spec: '-20°C to -40°C (AER requirement)' },
        { pipeline: 'Distribution network', spec: '-40°C to -60°C' },
        { pipeline: 'LNG feed gas', spec: '-80°C (requires mol sieve if TEG insufficient)' },
      ],
      ai: [
        { name: 'TEG Circulation Optimizer', tech: 'ML regression on gas composition + temperature', desc: 'Optimizes TEG circulation rate (L/kg water absorbed) vs gas inlet conditions to achieve dew point spec with minimum energy and TEG consumption — typical savings 5–8% glycol pump energy' },
        { name: 'Glycol Loss Predictor', tech: 'ML anomaly detection', desc: 'Monitors differential pressure across contactor and TEG inventory trend → detects carryover events (entrained glycol in gas stream) — critical as glycol contamination causes downstream issues' },
        { name: 'Dew Point Forecaster', tech: 'LSTM time series', desc: 'Predicts water dew point 30 minutes ahead from TEG composition, reboiler temperature trend, gas flow rate — enables proactive setpoint adjustment before spec violation' },
      ],
      kaggle: 'environmental-telemetry dataset (humidity sensor readings in mg/m³ — analogous to gas moisture content monitoring for dehydration control system training)',
      kpis: ['Water dew point (°C) at outlet (must meet pipeline spec)', 'TEG concentration at contactor inlet (%, target >99.5%)', 'TEG losses (L/MMscf, target <1 L/MMscf)', 'Reboiler temperature (°C, 190–205°C range)', 'Contactor ΔP (kPa — high ΔP indicates flooding)'],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <span className="text-amber-400 font-mono text-sm font-bold bg-amber-500/10 px-2 py-0.5 rounded">P-MS-01</span>
          <h1 className="text-2xl font-bold text-white">Compression & Gathering Process</h1>
        </div>
        <p className="text-gray-400 text-sm">
          Field gathering, slug catching, 3-phase separation, field compression, and gas dehydration
        </p>
        <div className="flex gap-4 mt-2 text-xs text-gray-500">
          <span>⚙️ 4 process steps</span>
          <span>🤖 7 AI models</span>
          <span>📊 Kaggle: machine-maintenance, environmental-telemetry</span>
        </div>
      </div>

      {/* SVG Flow */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-6 overflow-x-auto">
        <h2 className="text-xs font-semibold text-amber-400 mb-4 uppercase tracking-wider">Gathering & Compression Flow</h2>
        <svg viewBox="0 0 960 120" className="w-full min-w-[700px]" style={{ height: 120 }}>
          <defs>
            <marker id="arrowC" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#d97706" />
            </marker>
          </defs>
          {[
            { x: 10, label: 'Wellhead', sub: 'Header', step: '' },
            { x: 180, label: 'Slug Catcher', sub: 'Step 1', step: '1' },
            { x: 350, label: 'Field Separation', sub: '3-Phase Step 2', step: '2' },
            { x: 530, label: 'Field Compression', sub: 'Step 3', step: '3' },
            { x: 700, label: 'Gas Dehydration', sub: 'TEG Step 4', step: '4' },
            { x: 850, label: 'Trunk Line', sub: 'Delivery', step: '' },
          ].map((n, i) => (
            <g key={i}>
              <rect x={n.x} y={25} width={145} height={65} rx="8" fill="#0a0e1a" stroke={n.step ? '#d97706' : '#1e2a45'} strokeWidth="1.5" />
              <foreignObject x={n.x + 4} y={28} width={137} height={59}>
                <div className="flex flex-col items-center justify-center h-full text-center">
                  {n.step && <span style={{ fontSize: 9, color: '#d97706', fontWeight: 700 }}>Step {n.step}</span>}
                  <span style={{ fontSize: 11, color: '#f3f4f6', fontWeight: 600, marginTop: 2 }}>{n.label}</span>
                  <span style={{ fontSize: 9, color: '#9ca3af' }}>{n.sub}</span>
                </div>
              </foreignObject>
              {i < 5 && (
                <line x1={n.x + 148} y1={57} x2={n.x + 173} y2={57} stroke="#d97706" strokeWidth="2" markerEnd="url(#arrowC)" />
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

                <div>
                  <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Equipment</div>
                  <div className="grid grid-cols-2 gap-1">
                    {step.equipment.map((e, i) => (
                      <div key={i} className="text-xs text-gray-400 bg-[#0a0e1a] border border-[#1e2a45] rounded px-2 py-1">{e}</div>
                    ))}
                  </div>
                </div>

                {'slugCatcherTypes' in step && step.slugCatcherTypes && (
                  <div>
                    <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Slug Catcher Types</div>
                    <div className="space-y-1">
                      {step.slugCatcherTypes.map((sc, i) => (
                        <div key={i} className="flex items-start gap-3 text-xs">
                          <span className="text-amber-400 font-medium shrink-0 w-36">{sc.type}</span>
                          <span className="text-gray-400">{sc.use}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {'compressorTypes' in step && step.compressorTypes && (
                  <div>
                    <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Compressor Types</div>
                    <div className="space-y-2">
                      {step.compressorTypes.map((ct, i) => (
                        <div key={i} className="bg-[#0a0e1a] border border-[#1e2a45] rounded p-2 text-xs">
                          <div className="text-amber-400 font-semibold">{ct.type}</div>
                          <div className="text-gray-400 mt-0.5">{ct.characteristic}</div>
                          <div className="text-gray-500 mt-0.5">Application: {ct.application}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {'thermodynamics' in step && step.thermodynamics && (
                  <div>
                    <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Thermodynamic Equations</div>
                    <div className="space-y-2">
                      {step.thermodynamics.map((f, i) => (
                        <div key={i} className="bg-[#0a0e1a] border border-amber-500/20 rounded-lg p-3">
                          <div className="text-xs text-amber-400 font-semibold mb-1">{f.name}</div>
                          <div className="font-mono text-xs text-green-400 mb-1 break-all">{f.formula}</div>
                          <div className="text-xs text-gray-500">{f.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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

                {'dewpointSpecs' in step && step.dewpointSpecs && (
                  <div>
                    <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Water Dew Point Specifications by Pipeline Type</div>
                    <div className="space-y-1">
                      {step.dewpointSpecs.map((ds, i) => (
                        <div key={i} className="flex items-center gap-3 text-xs">
                          <span className="text-white font-medium w-36 shrink-0">{ds.pipeline}</span>
                          <span className="text-amber-400">{ds.spec}</span>
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
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
