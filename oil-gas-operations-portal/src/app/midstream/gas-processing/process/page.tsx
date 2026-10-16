'use client';
import { useEffect, useState } from 'react';

export default function GasProcessingProcessPage() {
  const [openStep, setOpenStep] = useState<number | null>(0);
  const [_data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch('/api/midstream/gas-processing').then(r => r.json()).then(d => setData(d.metrics));
  }, []);

  const steps = [
    {
      num: 1,
      title: 'Inlet Separation',
      icon: '⚗️',
      desc: 'Remove free liquids and solids from raw gas before processing units',
      input: 'Raw sour/sweet gas from gathering system or field compression — multiphase: gas + condensate + water + possibly solids',
      activities: [
        'Receive raw gas at inlet slug catcher / scrubber',
        'Remove bulk liquid (condensate, produced water, glycol carryover)',
        'Coalesce fine liquid mist using mesh pad or vane packs',
        'Knock out any solids / pipeline scale to protect downstream equipment',
        'Stabilize inlet conditions: pressure letdown to plant operating pressure',
        'Sample inlet gas for composition analysis (GC — chromatography)',
      ],
      equipment: ['Inlet slug catcher / scrubber vessel', 'Coalescers (mesh pad / vane pack)', 'Level controllers (guided wave radar)', 'Inlet separator heater (heat trace if hydrate risk)', 'Gas chromatograph (Varian / ABB)'],
      ai: [
        { name: 'Inlet Composition Predictor', tech: 'ML regression on upstream well data', desc: 'Predicts inlet gas composition (C1–C5+, H2S, CO2, N2) from upstream well test data and production rates — enables proactive plant tuning before composition change arrives' },
        { name: 'Hydrate Risk Monitor', tech: 'Thermodynamic + statistical ML hybrid', desc: 'Continuously calculates hydrate equilibrium temperature from real-time pressure, temperature, and predicted composition — alerts when operating conditions approach hydrate formation zone' },
      ],
      kpis: ['Liquid carryover to next unit (ppm liquid in gas, target <5 ppm)', 'Inlet pressure stability (bar ± target)', 'Solids loading (mg/m³, track for equipment protection)', 'GC sample frequency (every 2–4 hours typical)'],
    },
    {
      num: 2,
      title: 'Dehydration',
      icon: '💧',
      desc: 'Remove water vapour to prevent hydrate formation and corrosion in downstream plant',
      input: 'Gas with water vapour at inlet dew point — must be reduced to pipeline / process spec before acid gas removal or NGL extraction',
      activities: [
        'TEG (Triethylene Glycol) contactor: absorb water from gas on structured packing',
        'Lean TEG enters top, wet gas enters bottom (counter-current)',
        'Rich TEG exits bottom → regeneration',
        'Molecular sieve dehydration (where deep dehydration required for cryogenic NGL extraction)',
        'Monitor water dew point at outlet with online analyser',
        'TEG regeneration: heat rich TEG in reboiler at ~200°C, strip water to atmosphere',
      ],
      equipment: ['TEG contactor column (structured packing or trays)', 'TEG reboiler / regenerator still', 'Flash separator (recover dissolved HC from rich TEG)', 'Lean/rich TEG heat exchanger', 'Molecular sieve vessels (cycled adsorption / regeneration)', 'Dew point analyser (capacitance / cooled mirror)'],
      dehydrationComparison: [
        { method: 'TEG (Glycol)', dewpoint: '-20°C to -40°C', cost: 'Low–Medium', use: 'Transmission pipeline, gathering system outlet' },
        { method: 'Mol Sieve', dewpoint: '-80°C to -100°C', cost: 'High (cyclic regen energy)', use: 'Feed to cryogenic NGL extraction, LNG plants' },
        { method: 'Methanol Injection', dewpoint: 'Temporary / emergency', cost: 'Low (chemical cost)', use: 'Hydrate prevention in wells, short-term pipeline protection' },
      ],
      ai: [
        { name: 'TEG Circulation Rate Optimizer', tech: 'ML regression', desc: 'Optimizes TEG circulation ratio (L/kg water removed) based on inlet gas temperature, composition, and required outlet dew point — reduces energy and glycol consumption 5–10%' },
        { name: 'Mol Sieve Cycle Optimizer', tech: 'RL (Reinforcement Learning)', desc: 'Determines optimal adsorption/regeneration cycle timing for molecular sieve beds based on actual bed loading vs time, minimizing regeneration energy while ensuring full capacity for next cycle' },
      ],
      kpis: ['Water dew point at outlet (°C — must meet spec)', 'TEG concentration (%, target >99.5%)', 'TEG losses per MMscf (L/MMscf)', 'Mol sieve cycle count (impacts bed life)', 'Reboiler duty (kW — energy efficiency indicator)'],
    },
    {
      num: 3,
      title: 'Acid Gas Removal (Amine Treating)',
      icon: '☣️',
      desc: 'Remove H2S and CO2 from sour gas to meet pipeline specifications using amine solvent',
      input: 'Dehydrated sour gas containing H2S and CO2 above pipeline limits — typically H2S >4 ppm or CO2 >2% (pipeline spec varies)',
      activities: [
        'Feed sour gas to absorber tower bottom — contact with lean amine (MDEA, DEA, or blended amine)',
        'Amine selectively absorbs H2S and CO2 — sweet gas exits absorber top',
        'Rich amine (loaded with acid gas) exits absorber bottom → to regenerator',
        'Flash drum: recover dissolved hydrocarbons from rich amine before regenerator',
        'Regenerator (stripper): reboiler at 115–120°C strips acid gas from rich amine',
        'Lean amine (regenerated) cooled → returned to absorber (continuous loop)',
        'Acid gas (H2S + CO2) sent to sulphur recovery unit (Claus process) or compression/disposal',
      ],
      equipment: ['Absorber tower (structured packing or trays)', 'Rich/lean amine heat exchanger', 'Amine regenerator (stripper) column', 'Reboiler (steam or hot oil heated)', 'Amine storage tank + make-up system', 'Amine filter system (particulate + carbon filters)', 'H2S detectors (fixed gas detection throughout)', 'MDEA / DEA amine solution'],
      pipelineSpecs: [
        { component: 'H2S', pipelineLimit: '<4 ppm (sweet gas pipeline)', unit: 'ppm' },
        { component: 'CO2', pipelineLimit: '<2% (may vary by contract)', unit: 'mol%' },
        { component: 'Total sulphur', pipelineLimit: '<15 grains/100 scf', unit: 'grains/100scf' },
        { component: 'Water content', pipelineLimit: '<7 lb/MMscf (dehydration ensures this)', unit: 'lb/MMscf' },
      ],
      safety: {
        hazard: 'H2S is IDLH = 100 ppm (Immediately Dangerous to Life and Health). Even 1–5 ppm causes olfactory fatigue (cannot smell it). Fatal at >300 ppm with short exposure.',
        controls: ['Fixed H2S gas detectors at all low points (H2S is heavier than air)', 'Personal H2S monitors for all personnel in amine area', 'Muster stations upwind of amine plant', 'Emergency shutdown (ESD) triggers at 10 ppm H2S (personnel alarm) and 50 ppm (plant shutdown)', 'Buddy system and self-contained breathing apparatus (SCBA) staged throughout plant'],
        procedure: 'Toxic Release Response: 1. Sound alarm (H2S PA system). 2. Evacuate to designated muster point. 3. Incident command establishes hot zone. 4. Emergency response team in Level B PPE (SCBA + chemical suit) respond. 5. Isolate release source if safe to do so. 6. Notify regulator within 1 hour. 7. Document all exposures above 1 ppm.',
      },
      ai: [
        { name: 'Amine Optimization', tech: 'ML regression + process simulation', desc: 'Optimizes amine circulation rate, reboiler duty, and lean loading setpoint to meet H2S/CO2 spec with minimum energy — typically 8–12% energy reduction vs manual tuning' },
        { name: 'H2S Breakthrough Predictor', tech: 'ML time series + amine loading model', desc: 'Monitors amine loading (moles acid gas per mole amine) trend → predicts when absorber will fail to meet H2S spec (breakthrough) 2–4 hours in advance → enables proactive circulation rate increase' },
        { name: 'Amine Degradation Monitor', tech: 'ML anomaly detection on amine properties', desc: 'Tracks amine concentration, pH, iron content, heat stable salts from lab analysis → predicts amine degradation rate and optimal reclaimer/filter changeout timing' },
      ],
      kpis: ['H2S content at absorber outlet (ppm, must be <4 ppm)', 'CO2 removal % (or outlet mol%)', 'Amine circulation rate (m³/hr)', 'Reboiler duty (GJ/day — energy efficiency)', 'Amine losses per day (kg/day)', 'H2S detector calibration status (all green required)'],
      regulatory: ['AER Directive 071 (sulphur management)', 'US EPA 40 CFR Part 60 (sulphur emissions)', 'H2S Safety Regulations (provincial/federal per jurisdiction)', 'OSHA 29 CFR 1910.119 (PSM for highly hazardous chemicals)'],
    },
    {
      num: 4,
      title: 'NGL Extraction (Cryogenic Turboexpander)',
      icon: '❄️',
      desc: 'Extract natural gas liquids (ethane, propane, butane, pentane+) from sweet dry gas using cryogenic separation',
      input: 'Sweet dry gas (H2S + CO2 removed, deeply dehydrated) — must be <1 ppm water to prevent ice/hydrate in cryogenic section',
      activities: [
        'Pre-cool gas in feed/residue heat exchanger (exchange cold with outgoing residue gas)',
        'Expand gas through turboexpander: pressure drop causes rapid temperature drop to -80 to -100°C',
        'Condensed NGL (C2+ components) separates in cold separator',
        'Lean gas (C1-rich) exits cold separator top → residue gas reheated and compressed',
        'NGL liquid exits bottom → to demethanizer column',
        'Demethanizer: strip residual methane from NGL → methane overhead to residue gas',
        'NGL product (C2+) exits demethanizer bottom → to fractionation train',
        'Monitor C3+ recovery rate — key economic metric',
      ],
      equipment: ['Turboexpander-compressor unit', 'Feed/residue heat exchanger (brazed aluminium)', 'Cold separator vessel', 'Demethanizer column (cryogenic, vacuum-insulated)', 'Residue gas compressor (turboexpander drives part of this)', 'Mol sieve dehydration upstream (required — critical)', 'Temperature monitoring throughout (-100°C range)'],
      nglComposition: [
        { component: 'C2 (Ethane)', source: 'Recovery adjustable — ethane rejection mode in summer (leave in gas as fuel), ethane recovery mode in winter/high price', price: 'Variable (linked to petrochemical feedstock pricing)' },
        { component: 'C3 (Propane)', source: 'Target >95% recovery — high-value product for heating, petrochemical feedstock', price: 'Seasonal premium (higher in winter heating season)' },
        { component: 'C4 (Butane)', source: 'Target >98% recovery — blending component for gasoline, LPG', price: 'Linked to gasoline price (isobutane premium)' },
        { component: 'C5+ (Pentane plus)', source: 'Target >99% recovery — natural gasoline, diluent for heavy oil', price: 'Linked to crude oil price' },
      ],
      formulas: [
        { name: 'NGL Value Equation', formula: 'NGL Value = Σ(V_component × P_component) vs Fuel Gas Value = V_residue × P_gas', desc: 'Decision to run ethane recovery vs rejection based on this comparison — recover ethane only when NGL value > fuel gas value. Ethane rejection maximizes gas pipeline throughput instead.' },
        { name: 'C3+ Recovery Rate', formula: 'Recovery_C3+ = (V_C3+ in NGL product) / (V_C3+ in feed gas) × 100%', desc: 'Key economic and operational KPI — target >95% for C3+. Lower recovery means product is left in residue gas and sold at gas price rather than NGL price.' },
      ],
      ai: [
        { name: 'Recovery Optimizer', tech: 'ML + dynamic simulation', desc: 'Adjusts turboexpander inlet conditions (temperature, pressure drop) to maximize C3+ recovery vs current energy cost — switches ethane recovery/rejection mode based on real-time NGL vs gas price comparison' },
        { name: 'Hydrate Predictor', tech: 'Statistical ML on P/T/composition data', desc: 'Continuously maps current pressure-temperature-composition against hydrate equilibrium curve — flags zones where hydrate formation risk is high in cryogenic section and feed lines' },
        { name: 'Turboexpander Health Monitor', tech: 'FFT + ML on bearing vibration + blade temperature', desc: 'Monitors turboexpander mechanical health — detects bearing wear, seal degradation, blade erosion from vibration signature and temperature trends before shutdown is required' },
      ],
      kpis: ['C3+ recovery % (target >95%)', 'C2 recovery % (mode-dependent: recovery >70% or rejection <5%)', 'Turboexpander efficiency % (typical 75–85%)', 'Residue gas heating value (BTU/scf — must meet pipeline spec, typically 950–1100 BTU/scf)', 'Cold box temperature (°C — stability indicator)', 'Energy per volume NGL (GJ/m³ NGL)'],
    },
    {
      num: 5,
      title: 'Fractionation Train',
      icon: '🏭',
      desc: 'Separate NGL mixture into pure component products: ethane, propane, butane, pentane+',
      input: 'NGL liquid from demethanizer — mixture of C2, C3, C4, C5+ components at moderate temperature and pressure',
      activities: [
        'Deethanizer column: remove C2 (ethane) overhead → ethane product or recycle to residue gas',
        'Depropanizer column: C3 (propane) overhead product → propane storage/pipeline',
        'Debutanizer column: C4 (butane) overhead → butane product; C5+ exits bottom',
        'Pentane splitter (optional): separate isopentane from normal pentane / C5+',
        'Product quality analysis: spec gas chromatography on each product stream',
        'Product storage and transfer: to cavern storage, rail car loading, pipeline delivery',
        'Steam reboiler control: manage column heat duty for each distillation column',
      ],
      equipment: ['Deethanizer column', 'Depropanizer column', 'Debutanizer column', 'Reflux drums and condensers (air-cooled or water-cooled)', 'Steam reboilers for each column', 'Product storage: LPG bullets / pressurized spheres (for C3, C4)', 'Tank farm (for C5+ natural gasoline)', 'Product quality GC analysers on each product line'],
      columnConditions: [
        { column: 'Deethanizer', topTemp: '-10 to +5°C', pressure: '20–25 bar', product: 'Ethane (C2)' },
        { column: 'Depropanizer', topTemp: '40–55°C', pressure: '16–20 bar', product: 'Propane (C3)' },
        { column: 'Debutanizer', topTemp: '50–60°C', pressure: '4–6 bar', product: 'Butane (C4)' },
        { column: 'Pentane Splitter', topTemp: '60–70°C', pressure: '1–2 bar', product: 'Isopentane / C5+' },
      ],
      ai: [
        { name: 'Column Stability Monitor', tech: 'ML on tray temperature profiles', desc: 'Analyzes temperature profile across all distillation trays — detects flooding (temp spike), weeping (temp drop), and feed tray shift before product quality violation occurs, typically 30–60 min earlier than quality analyser alarm' },
        { name: 'Product Spec Predictor', tech: 'ML regression on tray temperatures → composition', desc: 'Predicts overhead and bottoms product composition from tray temperature pattern, avoiding 1–4 hour lab delay for quality confirmation — enables faster setpoint correction when product drifts toward off-spec' },
        { name: 'Reboiler Duty Optimizer', tech: 'Model Predictive Control (MPC)', desc: 'Coordinates reboiler duties across all four columns in the train to minimize total steam consumption while maintaining all product specs simultaneously — interdependencies across columns make this a multi-variable optimization problem' },
      ],
      kpis: ['Propane product purity % (min 95% propane for HD-5 spec, min 99% for chemical grade)', 'Ethane content in propane product (% — specification limit)', 'Column tray efficiency % (actual vs theoretical stages)', 'Reboiler steam consumption (tonnes/day)', 'Product GC analysis frequency (every 4 hours min)', 'Reflux ratio (energy efficiency indicator)'],
    },
    {
      num: 6,
      title: 'Sulphur Recovery (Claus Process)',
      icon: '🔥',
      desc: 'Convert H2S acid gas from amine treating to elemental sulphur product — environmental and regulatory requirement',
      input: 'Acid gas from amine regenerator — mixture of H2S (40–90%) and CO2, temperature ~130°C',
      activities: [
        'Thermal stage: burn 1/3 of H2S with air in reaction furnace at 1000–1200°C → produces SO2 + elemental S',
        'Waste heat boiler: recover high-temperature heat as steam',
        'Catalytic stages (2–3 reactors): react remaining H2S with SO2 over alumina catalyst → sulphur',
        'Sulphur condensers: cool gas after each stage → liquid sulphur drains to pit',
        'Tail gas treatment: handle residual H2S/SO2 that Claus process cannot recover (typically 0.5–3% of feed)',
        'Liquid sulphur storage and solidification: degassing → solidification → storage / ship',
      ],
      equipment: ['Reaction furnace + combustion air system', 'Waste heat boiler (steam generation)', 'Claus catalytic reactors (2 or 3 stages)', 'Sulphur condensers after each reactor', 'Tail gas treating unit (TGTU — amine or incineration)', 'Liquid sulphur pit and forming drum / granulator', 'Continuous Emission Monitoring System (CEMS)'],
      clausChemistry: [
        { stage: 'Thermal (furnace)', reaction: '2H2S + 3O2 → 2SO2 + 2H2O; 2H2S + SO2 → 3S + 2H2O (some)', temp: '1000–1200°C', recovery: '~60–70%' },
        { stage: '1st Catalytic stage', reaction: '2H2S + SO2 → 3S + 2H2O', temp: '250–320°C', recovery: '~20% additional' },
        { stage: '2nd Catalytic stage', reaction: '2H2S + SO2 → 3S + 2H2O', temp: '200–240°C', recovery: '~7% additional' },
        { stage: '3rd Catalytic stage', reaction: '2H2S + SO2 → 3S + 2H2O', temp: '180–220°C', recovery: '~2% additional' },
      ],
      ai: [
        { name: 'Air-to-Gas Ratio Optimizer', tech: 'ML + online process simulation', desc: 'Maintains optimal H2S:SO2 ratio at 2:1 in catalytic stages by precisely controlling combustion air flow — critical: deviation of 5% reduces recovery >2%, and SO2 slip violates stack emission limits' },
        { name: 'Catalyst Deactivation Monitor', tech: 'ML trend analysis on bed temperatures + pressure drop', desc: 'Tracks catalyst bed performance indicators → predicts catalyst deactivation timeline and optimal catalyst change-out interval, avoiding unplanned production outage from catalyst failure' },
      ],
      kpis: ['Sulphur recovery efficiency % (regulatory minimum typically 98.5–99.8% depending on plant size)', 'SO2 emissions (tonnes/day — CEMS verified, AER permit limit)', 'Catalyst bed temperature profiles (all three reactors)', 'Liquid sulphur production rate (tonnes/day)', 'H2S in tail gas (ppm after TGTU)', 'Plant availability % (planned vs unplanned shutdowns)'],
      regulatory: ['AER Directive 071 (sulphur emission limits — Alberta)', 'Environment Canada CEPA (national emission standards)', 'NPRI (National Pollutant Release Inventory reporting)', 'ISO 14001 (environmental management system)'],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <span className="text-amber-400 font-mono text-sm font-bold bg-amber-500/10 px-2 py-0.5 rounded">P-MS-02</span>
          <h1 className="text-2xl font-bold text-white">Gas Processing Plant Process</h1>
        </div>
        <p className="text-gray-400 text-sm">
          End-to-end gas plant operations — Inlet Separation through Fractionation and Sulphur Recovery
        </p>
        <div className="flex gap-4 mt-2 text-xs text-gray-500">
          <span>⚙️ 6 process steps</span>
          <span>🤖 10 AI models</span>
          <span>⚠️ H2S safety critical process</span>
        </div>
      </div>

      {/* SVG Flow */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-6 overflow-x-auto">
        <h2 className="text-xs font-semibold text-amber-400 mb-4 uppercase tracking-wider">Gas Processing Plant Flow</h2>
        <svg viewBox="0 0 1060 120" className="w-full min-w-[900px]" style={{ height: 120 }}>
          <defs>
            <marker id="arrowGP" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#d97706" />
            </marker>
          </defs>
          {[
            { x: 5, label: 'Inlet', sub: 'Separation', step: '1' },
            { x: 185, label: 'Dehydration', sub: 'TEG/Mol Sieve', step: '2' },
            { x: 365, label: 'Acid Gas', sub: 'Removal (Amine)', step: '3' },
            { x: 545, label: 'NGL Extraction', sub: 'Cryogenic', step: '4' },
            { x: 725, label: 'Fractionation', sub: 'C2/C3/C4/C5+', step: '5' },
            { x: 885, label: 'Sulphur', sub: 'Recovery', step: '6' },
          ].map((n, i) => (
            <g key={i}>
              <rect x={n.x} y={25} width={155} height={65} rx="8" fill="#0a0e1a" stroke="#d97706" strokeWidth="1.5" />
              <foreignObject x={n.x + 4} y={28} width={147} height={59}>
                <div xmlns="http://www.w3.org/1999/xhtml" className="flex flex-col items-center justify-center h-full text-center">
                  <span style={{ fontSize: 9, color: '#d97706', fontWeight: 700 }}>Step {n.step}</span>
                  <span style={{ fontSize: 11, color: '#f3f4f6', fontWeight: 600, marginTop: 2 }}>{n.label}</span>
                  <span style={{ fontSize: 9, color: '#9ca3af' }}>{n.sub}</span>
                </div>
              </foreignObject>
              {i < 5 && (
                <line x1={n.x + 158} y1={57} x2={n.x + 178} y2={57} stroke="#d97706" strokeWidth="2" markerEnd="url(#arrowGP)" />
              )}
            </g>
          ))}
          <text x="530" y="14" textAnchor="middle" fill="#9ca3af" fontSize="11">
            Sales Gas → Pipeline (Steps 2-4 bypass H2S removal if gas is already sweet)
          </text>
        </svg>
      </div>

      {/* H2S Safety Banner */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <div className="text-red-400 font-semibold text-sm">H2S Safety Critical Process</div>
            <div className="text-red-300/80 text-xs mt-1">
              H2S IDLH = 100 ppm. At 300 ppm: unconsciousness in &lt;1 minute, lethal within minutes.
              All personnel must carry personal H2S monitors. Fixed gas detection throughout plant.
              Muster upwind. Emergency response team and SCBA required in amine / sulphur areas.
            </div>
          </div>
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
                  <div className="text-xs text-gray-500 mt-0.5">{step.desc}</div>
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

                {'dehydrationComparison' in step && step.dehydrationComparison && (
                  <div>
                    <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Dehydration Method Comparison</div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-gray-400 border-b border-[#1e2a45]">
                            <th className="pb-1 text-left pr-3">Method</th>
                            <th className="pb-1 text-left pr-3">Dew Point</th>
                            <th className="pb-1 text-left pr-3">Cost</th>
                            <th className="pb-1 text-left">Application</th>
                          </tr>
                        </thead>
                        <tbody>
                          {step.dehydrationComparison.map((d, i) => (
                            <tr key={i} className="border-b border-[#1e2a45]/50">
                              <td className="py-1.5 pr-3 text-white">{d.method}</td>
                              <td className="py-1.5 pr-3 text-amber-400">{d.dewpoint}</td>
                              <td className="py-1.5 pr-3 text-gray-400">{d.cost}</td>
                              <td className="py-1.5 text-gray-400">{d.use}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {'pipelineSpecs' in step && step.pipelineSpecs && (
                  <div>
                    <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Pipeline Specification (Outlet Requirements)</div>
                    <div className="space-y-1">
                      {step.pipelineSpecs.map((ps, i) => (
                        <div key={i} className="flex items-center gap-3 text-xs">
                          <span className="text-white font-medium w-24 shrink-0">{ps.component}</span>
                          <span className="text-amber-400">{ps.pipelineLimit}</span>
                          <span className="text-gray-500">{ps.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {'safety' in step && step.safety && (
                  <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                    <div className="text-xs font-semibold text-red-400 mb-2">⚠️ H2S Safety — Critical Hazard</div>
                    <div className="text-xs text-red-300/80 mb-2">{step.safety.hazard}</div>
                    <div className="text-xs font-semibold text-red-400 mb-1">Safety Controls:</div>
                    <ul className="space-y-0.5">
                      {step.safety.controls.map((c, i) => (
                        <li key={i} className="text-xs text-gray-400 flex items-start gap-1">
                          <span className="text-red-500 shrink-0">•</span>{c}
                        </li>
                      ))}
                    </ul>
                    <div className="text-xs font-semibold text-red-400 mt-2 mb-1">Emergency Procedure:</div>
                    <div className="text-xs text-gray-400">{step.safety.procedure}</div>
                  </div>
                )}

                {'nglComposition' in step && step.nglComposition && (
                  <div>
                    <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">NGL Component Details</div>
                    <div className="space-y-2">
                      {step.nglComposition.map((ng, i) => (
                        <div key={i} className="bg-[#0a0e1a] border border-[#1e2a45] rounded p-2 text-xs">
                          <div className="text-amber-400 font-semibold">{ng.component}</div>
                          <div className="text-gray-400 mt-0.5">{ng.source}</div>
                          <div className="text-gray-500 mt-0.5">Price: {ng.price}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {'formulas' in step && step.formulas && (
                  <div>
                    <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Key Economics</div>
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

                {'columnConditions' in step && step.columnConditions && (
                  <div>
                    <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Fractionation Column Operating Conditions</div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-gray-400 border-b border-[#1e2a45]">
                            <th className="pb-1 text-left pr-3">Column</th>
                            <th className="pb-1 text-left pr-3">Top Temp</th>
                            <th className="pb-1 text-left pr-3">Pressure</th>
                            <th className="pb-1 text-left">Product</th>
                          </tr>
                        </thead>
                        <tbody>
                          {step.columnConditions.map((c, i) => (
                            <tr key={i} className="border-b border-[#1e2a45]/50">
                              <td className="py-1.5 pr-3 text-white">{c.column}</td>
                              <td className="py-1.5 pr-3 text-blue-400">{c.topTemp}</td>
                              <td className="py-1.5 pr-3 text-amber-400">{c.pressure}</td>
                              <td className="py-1.5 text-green-400">{c.product}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {'clausChemistry' in step && step.clausChemistry && (
                  <div>
                    <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Claus Process Chemistry</div>
                    <div className="space-y-1">
                      {step.clausChemistry.map((c, i) => (
                        <div key={i} className="bg-[#0a0e1a] border border-[#1e2a45] rounded p-2">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-amber-400 font-medium text-xs">{c.stage}</span>
                            <span className="text-green-400 text-xs">{c.recovery}</span>
                          </div>
                          <div className="font-mono text-xs text-blue-400">{c.reaction}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{c.temp}</div>
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
