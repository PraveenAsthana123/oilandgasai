'use client';
import { useEffect, useState } from 'react';

export default function MeteringProcessPage() {
  const [openStep, setOpenStep] = useState<number | null>(0);
  const [_data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch('/api/midstream/metering').then(r => r.json()).then(d => setData(d.metrics));
  }, []);

  const meterTypes = [
    { type: 'Positive Displacement (PD)', products: 'Heavy crude, viscous products, LPG', accuracy: '±0.1–0.15%', range: 'Wide turndown (10:1)', notes: 'Best for viscous products; sensitive to solids/contamination; requires strainer upstream' },
    { type: 'Turbine Meter', products: 'Light crude, condensate, NGL, refined products', accuracy: '±0.15–0.25%', range: '10:1 turndown', notes: 'Good repeatability; wear on bearing over time → track meter factor trend; requires smooth flow profile' },
    { type: 'Coriolis (mass flow)', products: 'Any fluid, especially when mass is needed', accuracy: '±0.05–0.1% mass', range: '10:1 turndown', notes: 'Measures mass directly — eliminates density correction; no moving parts; high pressure drop; expensive but most accurate' },
    { type: 'Ultrasonic (USM)', products: 'Crude oil, gas, refined products', accuracy: '±0.1–0.2%', range: '30:1 turndown (excellent)', notes: 'No moving parts; multiple path averages out flow profile; self-diagnostic (AGA-9 path diagnostics); preferred for gas fiscal metering' },
    { type: 'Differential Pressure (Orifice)', products: 'Gas, steam; less common for fiscal liquid', accuracy: '±0.5–1.0%', range: '3:1 turndown (poor)', notes: 'Simple and reliable; restricted to secondary/check metering; permanent pressure drop; plate inspection required' },
  ];

  const provingMethods = [
    { method: 'Small Volume Prover (SVP)', accuracy: '±0.01%', frequency: 'Monthly or when MF drifts ±0.0025', desc: 'Compact bi-directional piston prover. 5 proving runs, agree within ±0.027%. Most common for liquid fiscal metering.' },
    { method: 'Pipe Prover (Piston Prover)', accuracy: '±0.01%', frequency: 'Quarterly / semi-annual', desc: 'Calibrated volume between detectors — sphere displaces fluid through calibrated section. Larger physical size. API MPMS Chapter 4.2.' },
    { method: 'Master Meter Proving', accuracy: '±0.02%', frequency: 'When pipe prover not practical', desc: 'High-accuracy reference meter (Coriolis or calibrated ultrasonic) used as transfer standard to prove in-service meter.' },
    { method: 'Gravimetric Proving', accuracy: '±0.05%', frequency: 'Periodic validation / audits', desc: 'Weigh known volume in certified vessel. Absolute reference. Used for meter calibration laboratories. NIST traceable weights.' },
  ];

  const steps = [
    {
      num: 1,
      title: 'Meter Selection & Installation',
      icon: '🔧',
      input: 'Flow rate range, product type, accuracy requirement, fiscal vs operational application',
      activities: [
        'Select meter type based on product, flow rate, accuracy requirement, and cost',
        'Size meter: operating flow 70–80% of nominal rated capacity for best accuracy',
        'Specify upstream straight run length: 10–20 pipe diameters for most meters',
        'Install meter run: strainer upstream, isolation valves, bypass valve, prover connection',
        'Commission: verify zero flow indication, check for leaks, verify RTD and PT connections',
        'Establish baseline meter factor from initial proving run',
        'Configure flow computer: API tables, meter serial number, proving data',
      ],
      equipment: ['Flow meter (PD/turbine/Coriolis/USM)', 'Flow computer (Daniel 3410 / Emerson ROC800)', 'Pressure transmitter (±0.04% typical)', 'Temperature RTD (±0.1°C Class A)', 'Density meter (Coriolis or vibrating element)', 'Strainer (upstream protection)', 'Prover connection (ACME thread or flanged)'],
      ai: [
        { name: 'Meter Sizing Optimizer', tech: 'ML recommendation system', desc: 'Recommends optimal meter type and size from product properties, flow rate range, accuracy requirement, and maintenance history of similar meters in the fleet — reduces selection errors' },
      ],
      kpis: ['Pressure drop across meter run (kPa — check against design)', 'Initial meter factor uncertainty % (from first prove)', 'Straight run compliance % (per AGA-3 / API MPMS 14.3)'],
      regulatory: ['API MPMS Chapter 5.1/5.2/5.3/5.6/5.8 (each meter type)', 'AGA-3 (orifice metering of natural gas)', 'AGA-9 (ultrasonic metering of natural gas)', 'ISO 17089 (ultrasonic meters)'],
    },
    {
      num: 2,
      title: 'Calibration / Proving',
      icon: '⚖️',
      input: 'In-service meter with accumulated volume since last prove, prover ready and calibrated',
      activities: [
        'Connect prover to meter run proving connection (parallel loop or series)',
        'Establish stable flow rate at proving conditions (55–70% of meter nominal)',
        'Run proving sequence: minimum 5 consecutive runs, check repeatability',
        'Calculate meter factor for each run: MF = Prover Volume / Meter Indicated Volume',
        'Accept prove if: (1) repeatability ≤ 0.027% (SVP), (2) average MF within ±0.0025 of 1.000',
        'Update flow computer with new meter factor',
        'Record all prove data in measurement system, signed by both parties for custody transfer',
      ],
      formulas: [
        { name: 'Meter Factor', formula: 'MF = V_prover / V_meter', desc: 'V_prover = prover calibrated volume (traceable to NIST); V_meter = meter indicated volume during prover pass. Target MF = 1.0000 ± 0.0025.' },
        { name: 'Prove Repeatability', formula: 'Repeatability = (MF_max − MF_min) / MF_avg × 100%', desc: 'Must be ≤ 0.027% for SVP (5 runs), ≤ 0.05% for pipe prover. Exceed this → investigate meter and prover before accepting prove.' },
        { name: 'Corrected Volume at Standard Conditions', formula: 'Qstd = Q_indicated × MF × CTL × CPL', desc: 'CTL = Correction for Temperature of Liquid (API 11.1 Table 6A/6B); CPL = Correction for Pressure compressibility; MF = proven meter factor for this date/conditions.' },
      ],
      ai: [
        { name: 'Meter Drift Predictor', tech: 'ML time-series trend on meter factor history', desc: 'Tracks sequence of meter factor values from successive prove runs. Identifies gradual drift trend — predicts how many operating hours remain before factor will drift outside ±0.0025 tolerance. Triggers early-prove recommendation, avoiding an out-of-tolerance period between scheduled proves.' },
        { name: 'Prove Anomaly Detector', tech: 'Statistical outlier detection on prove runs', desc: 'Flags individual prove runs with unusual meter factor or repeatability — indicates prover fluid contamination, temperature instability, or valve leak. Avoids accepting a bad prove that would corrupt all custody volumes until next prove.' },
      ],
      kpis: ['Meter factor (target 1.0000 ± 0.0025)', 'Prove repeatability % (target ≤ 0.027% for SVP)', 'Prove frequency (monthly for high-volume fiscal points)', 'Meters due for prove (number overdue)', 'Prover calibration status (NIST traceable certificate currency)'],
      regulatory: ['API MPMS Chapter 4.1/4.2/4.5 (prover design and calibration)', 'API MPMS Chapter 12.2 (meter proving calculations)', 'OIML R-117 (measuring systems for liquids — international)', 'AER Directive 017 (Alberta prove requirements)'],
    },
    {
      num: 3,
      title: 'Measurement (Volume Calculation)',
      icon: '📐',
      input: 'Flow computer receiving real-time signals from meter (pulses/frequency), P, T, density sensors',
      activities: [
        'Flow computer accumulates meter pulses continuously',
        'Apply correction factors in real-time: CTL from temperature measurement, CPL from pressure',
        'Apply meter factor from last valid prove',
        'Calculate instantaneous flow rate (m³/hr or bbl/day) and accumulated volume (m³ or bbl)',
        'Log all measured values to historian with timestamps',
        'Generate daily batch tickets for all fiscal quantities',
        'For gas metering: apply additional AGA-8 compressibility correction (Z factor)',
      ],
      formulas: [
        { name: 'Volume at Standard Conditions (Liquid)', formula: 'Qstd = Q_indicated × CTL × CPL × MF', desc: 'Per API MPMS Chapter 12.2. CTL from API 11.1; CPL from API 11.2.' },
        { name: 'Volume at Standard Conditions (Gas)', formula: 'Qstd = Q_actual × (P/P_base) × (T_base/T) × (Z_base/Z)', desc: 'P_base = 101.325 kPa; T_base = 15°C (288.15 K); Z = actual compressibility (AGA-8 equation); Z_base = 1.000 for ideal conditions.' },
        { name: 'Mass Flow', formula: 'M = Q_std × ρ_std', desc: 'ρ_std = density at standard conditions measured by density meter (kg/m³). Used when mass allocation is required (pipelines with blended grades).' },
        { name: 'Energy Flow (Gas)', formula: 'E = Q_std × HHV', desc: 'HHV = Higher Heating Value (MJ/m³ or BTU/scf) from gas chromatograph analysis. Energy billing replaces volume billing for most gas transactions.' },
        { name: 'Combined Measurement Uncertainty (ISO 17089)', formula: 'U_combined = √(u_meter² + u_MF² + u_T² + u_P² + u_ρ²)', desc: 'Root-sum-of-squares of all measurement uncertainty components. Must be ≤ 0.35% (liquid) or ≤ 1.0% (gas) for fiscal custody transfer per API MPMS.' },
      ],
      ai: [
        { name: 'Uncertainty Analyzer', tech: 'Monte Carlo simulation (10,000 iterations)', desc: 'Computes combined measurement uncertainty from all components (meter, prover, temperature, pressure, density transducers) using Monte Carlo simulation per ISO 17089 GUM supplement. Automatically flags when any component degrades and combined uncertainty exceeds limit — triggers corrective maintenance before regulatory violation.' },
        { name: 'Real-Time Flow Rate Validator', tech: 'ML pattern matching + physics check', desc: 'Cross-validates flow computer output against expected range from upstream/downstream meter stations — detects flow computer configuration errors, stuck meter (zero flow but pressure normal), or sensor short circuit before they corrupt accumulated volume.' },
      ],
      kpis: ['Measurement uncertainty % (liquid ≤ 0.35%, gas ≤ 1.0%)', 'Flow computer availability % (target 100% — any downtime is unaccounted volume)', 'Volume allocation accuracy % (check vs pipeline mass balance)', 'Unaccounted-for fluid % per billing period'],
      regulatory: ['API MPMS Chapter 12.2 (calculation of petroleum quantities)', 'API MPMS Chapter 14 (natural gas measurement)', 'AGA-8 (compressibility of natural gas)', 'ISO 17089 (measurement uncertainty)', 'AER Directive 017 (metering requirements — Alberta)'],
    },
    {
      num: 4,
      title: 'Volume Statement',
      icon: '📄',
      input: 'Monthly accumulated volumes from all fiscal meters, quality data, allocation data, reconciliation results',
      activities: [
        'Accumulate all fiscal meter data for billing period (monthly)',
        'Apply quality corrections: BS&W, temperature, density to net volumes',
        'Prepare allocation statement: apportion commingled volumes to individual shippers',
        'Reconcile meter volumes vs pipeline imbalance (inlet vs outlet for each segment)',
        'Calculate Unaccounted-for Fluid (UAF) / Unaccounted-for Gas (UAG)',
        'Generate Statement of Measurement (SoM) for each shipper/receiver',
        'Submit to billing system: trigger invoice generation by tariff × volume',
        'Retain all measurement records for regulatory period (7 years typical)',
      ],
      keyTerms: [
        { term: 'Statement of Measurement (SoM)', def: 'Official monthly document confirming metered volumes by shipper, product grade, receipt/delivery point — basis for invoice. Signed by transporter and shipper.' },
        { term: 'Unaccounted-for Fluid (UAF)', def: 'Difference between total received and total delivered + closing inventory − opening inventory. Target <0.1% for liquids; causes: evaporation, meter error, theft, leaks.' },
        { term: 'Pipeline Imbalance', def: 'Shipper delivered different volume than nominated/contracted. Imbalance accumulates and is settled in cash or make-up gas/liquid.' },
        { term: 'Allocation', def: 'Dividing commingled pipeline volumes back to individual shippers based on their injection volumes and pipeline tariff rules — required when multiple shippers use same pipeline.' },
        { term: 'Meter Ticket', def: 'Document produced at each fiscal transfer event: date/time, meter serial, opening/closing reads, meter factor, temperature, gravity, BS&W, net volume. Legally binding custody record.' },
      ],
      ai: [
        { name: 'Volume Reconciliation Engine', tech: 'ML + constrained optimization', desc: 'Automatically reconciles meter volumes across all points in a pipeline system (inlet, outlet, intermediate taps, storage) using constrained optimization to close the mass balance and identify where discrepancies originate — reduces manual reconciliation from 3 days to 4 hours per billing period' },
        { name: 'UAF Anomaly Detector', tech: 'Statistical SPC on historical UAF', desc: 'Tracks UAF per billing period against historical normal band. Flags months where UAF exceeds statistical upper control limit → triggers investigation protocol (re-prove meters, check tank gauges, review allocation methodology)' },
      ],
      kpis: ['UAF/UAG % (target <0.1% for liquids, <0.3% for gas — company-specific varies)', 'Billing accuracy % (invoiced vs agreed volume)', 'Statement delivery time (days after month-end, target <5 business days)', 'Dispute rate % (statements disputed by shippers — target <1%)', 'Record retention compliance % (all required documents archived)'],
    },
    {
      num: 5,
      title: 'Dispute Resolution',
      icon: '⚖️',
      input: 'Shipper dispute notice citing volume or quality discrepancy on Statement of Measurement',
      activities: [
        'Receive dispute notice from shipper within contract-specified window (typically 60–90 days)',
        'Retrieve all supporting records: meter tickets, prove records, lab reports, SCADA data',
        'Conduct joint investigation: re-review prove records, check meter calibration certificates',
        'Perform re-prove if meter accuracy is in question',
        'Review tank gauge records and sampling procedures',
        'Prepare dispute resolution report: findings, root cause, proposed adjustment',
        'Issue correction credit note if measurement error confirmed',
        'Update systems with corrected volume if required',
      ],
      disputeTypes: [
        { type: 'Volume Discrepancy', causes: 'Meter factor error, flow computer misconfiguration, tank gauge error, evaporation underestimation', resolution: 'Re-prove meter, review configuration, re-gauge tanks' },
        { type: 'Quality Discrepancy', causes: 'Sample not representative, lab error, product contamination in-line', resolution: 'Re-analyse retained sample, joint sampling at receipt point, lab audit' },
        { type: 'Allocation Dispute', causes: 'Wrong proration basis, timing error in batch tracking, meter timing desynchronization', resolution: 'Review allocation methodology, re-run allocation with corrected meter data' },
        { type: 'Prove Validity', causes: 'Prover calibration lapsed, prove repeatability exceeded limit, temperature instability during prove', resolution: 'Re-prove with certified prover, apply interpolation between valid proves' },
      ],
      ai: [
        { name: 'Dispute Root Cause Analyzer', tech: 'ML decision tree + document analysis', desc: 'Analyzes dispute details against measurement records, prove history, and sampling records to rapidly identify most likely root cause category — reduces investigation time by pre-filtering the most probable causes and retrieves all relevant supporting records automatically' },
      ],
      kpis: ['Dispute resolution time (days, target <30 days from receipt)', 'Volume adjusted per dispute (m³) — track trend', 'Dispute win/loss ratio (self-assessed measurement error vs shipper error)', 'Repeat disputes from same meter station (signals systemic issue)'],
    },
    {
      num: 6,
      title: 'Regulatory Reporting',
      icon: '📋',
      input: 'Monthly volume statements, product quality analysis, measurement uncertainty reports',
      activities: [
        'Submit monthly volume reports to NEB (National Energy Board) / AER (Alberta Energy Regulator)',
        'File quarterly measurement uncertainty reports for fiscal metering stations',
        'Provide annual calibration status report: all fiscal meters with prove history',
        'Notify regulator within specified timeframe of any significant measurement error (>0.5% retrospective correction)',
        'Maintain calibration certificate files for all fiscal instruments (current + 7 year retention)',
        'Support regulatory audits: provide full audit trail for any queried billing period',
        'File annual Unaccounted-for Gas (UAG) reconciliation with regulator',
      ],
      regulatorySchedule: [
        { report: 'Monthly Volume Statement', due: '15th of following month', authority: 'NEB / AER / National Energy Board', note: 'All fiscal meter points — volumes by product, shipper, point' },
        { report: 'Quarterly Uncertainty Report', due: 'Within 30 days of quarter end', authority: 'AER (if applicable)', note: 'Formal uncertainty budget per measurement station' },
        { report: 'Annual Calibration Status', due: 'January 31st', authority: 'AER Directive 017 (Alberta)', note: 'All fiscal meters: prove history, certificate expiry, MF trend' },
        { report: 'Incident Report (measurement error)', due: 'Within 30 days of discovery', authority: 'Applicable provincial regulator', note: 'Required if error >0.5% of volume in any billing period' },
        { report: 'Annual UAG / UAF Reconciliation', due: 'March 31st', authority: 'NEB / AER', note: 'Annual reconciliation of total system balance' },
      ],
      ai: [
        { name: 'Compliance Calendar Bot', tech: 'Rule engine + NLP report generator', desc: 'Automatically tracks all regulatory reporting deadlines, sends advance reminders, and generates draft reports from measurement system data — ensures zero missed submissions' },
        { name: 'Regulatory Change Monitor', tech: 'NLP on regulatory portal feeds', desc: 'Monitors NEB, AER, and OGC regulatory portals for updates to measurement and reporting requirements — alerts compliance team when requirements change affecting current measurement practices' },
      ],
      kpis: ['Regulatory submissions on-time % (target 100%)', 'Audit findings (target zero non-compliances per year)', 'Calibration certificate currency % (target 100% current)', 'Retrospective corrections per year (target <2)'],
      regulatory: ['NEB Measurement Regulation (Canada)', 'AER Directive 017 (Alberta — liquid and gas metering)', 'BC Oil and Gas Commission Order', 'Saskatchewan Oil and Gas Conservation Regulations', 'API MPMS — full series referenced by regulators', 'GPA (Gas Processors Association) standards for NGL'],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <span className="text-amber-400 font-mono text-sm font-bold bg-amber-500/10 px-2 py-0.5 rounded">P-MS-06</span>
          <h1 className="text-2xl font-bold text-white">Custody Transfer Metering Process</h1>
        </div>
        <p className="text-gray-400 text-sm">
          Fiscal metering — from meter selection and proving through volume statements and regulatory reporting
        </p>
        <div className="flex gap-4 mt-2 text-xs text-gray-500">
          <span>⚙️ 6 process steps</span>
          <span>🤖 6 AI models</span>
          <span>📐 API MPMS, ISO 17089, AGA standards</span>
        </div>
      </div>

      {/* SVG Flow */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-6 overflow-x-auto">
        <h2 className="text-xs font-semibold text-amber-400 mb-4 uppercase tracking-wider">Custody Transfer Metering Flow</h2>
        <svg viewBox="0 0 1060 120" className="w-full min-w-[900px]" style={{ height: 120 }}>
          <defs>
            <marker id="arrowMT" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#d97706" />
            </marker>
          </defs>
          {[
            { x: 5, label: 'Meter', sub: 'Selection', step: '1' },
            { x: 185, label: 'Calibration/', sub: 'Proving', step: '2' },
            { x: 365, label: 'Measurement', sub: 'Volume Calc', step: '3' },
            { x: 545, label: 'Volume', sub: 'Statement', step: '4' },
            { x: 725, label: 'Dispute', sub: 'Resolution', step: '5' },
            { x: 885, label: 'Regulatory', sub: 'Reporting', step: '6' },
          ].map((n, i) => (
            <g key={i}>
              <rect x={n.x} y={25} width={155} height={65} rx="8" fill="#0a0e1a" stroke="#d97706" strokeWidth="1.5" />
              <foreignObject x={n.x + 4} y={28} width={147} height={59}>
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <span style={{ fontSize: 9, color: '#d97706', fontWeight: 700 }}>Step {n.step}</span>
                  <span style={{ fontSize: 11, color: '#f3f4f6', fontWeight: 600, marginTop: 2 }}>{n.label}</span>
                  <span style={{ fontSize: 9, color: '#9ca3af' }}>{n.sub}</span>
                </div>
              </foreignObject>
              {i < 5 && (
                <line x1={n.x + 158} y1={57} x2={n.x + 178} y2={57} stroke="#d97706" strokeWidth="2" markerEnd="url(#arrowMT)" />
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Meter Types Table */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <h2 className="text-sm font-semibold text-amber-400 mb-3 uppercase tracking-wider">Fiscal Meter Types — Technology Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-400 border-b border-[#1e2a45]">
                <th className="pb-2 text-left pr-3">Type</th>
                <th className="pb-2 text-left pr-3">Products</th>
                <th className="pb-2 text-left pr-3">Accuracy</th>
                <th className="pb-2 text-left pr-3">Turndown</th>
                <th className="pb-2 text-left">Notes</th>
              </tr>
            </thead>
            <tbody>
              {meterTypes.map((mt, i) => (
                <tr key={i} className="border-b border-[#1e2a45]/50">
                  <td className="py-2 pr-3 text-white font-medium">{mt.type}</td>
                  <td className="py-2 pr-3 text-gray-400">{mt.products}</td>
                  <td className="py-2 pr-3 text-amber-400 font-mono">{mt.accuracy}</td>
                  <td className="py-2 pr-3 text-blue-400">{mt.range}</td>
                  <td className="py-2 text-gray-500">{mt.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proving Methods */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <h2 className="text-sm font-semibold text-amber-400 mb-3 uppercase tracking-wider">Meter Proving Methods — API MPMS Chapter 4</h2>
        <div className="grid grid-cols-2 gap-3">
          {provingMethods.map((pm, i) => (
            <div key={i} className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg p-3">
              <div className="flex items-start justify-between mb-1">
                <div className="text-sm font-medium text-white">{pm.method}</div>
                <span className="text-xs text-amber-400 shrink-0 ml-2 font-mono">{pm.accuracy}</span>
              </div>
              <div className="text-xs text-gray-500 mb-1">Frequency: {pm.frequency}</div>
              <div className="text-xs text-gray-400">{pm.desc}</div>
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
                    <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Key Formulas</div>
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

                {'keyTerms' in step && step.keyTerms && (
                  <div>
                    <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Key Measurement Terms</div>
                    <div className="space-y-2">
                      {step.keyTerms.map((kt, i) => (
                        <div key={i} className="bg-[#0a0e1a] border border-[#1e2a45] rounded p-2">
                          <div className="text-xs text-amber-400 font-semibold">{kt.term}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{kt.def}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {'disputeTypes' in step && step.disputeTypes && (
                  <div>
                    <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Dispute Types & Resolution</div>
                    <div className="space-y-2">
                      {step.disputeTypes.map((dt, i) => (
                        <div key={i} className="bg-[#0a0e1a] border border-[#1e2a45] rounded p-2 text-xs">
                          <div className="text-white font-medium">{dt.type}</div>
                          <div className="text-gray-500 mt-0.5">Causes: {dt.causes}</div>
                          <div className="text-green-400 mt-0.5">Resolution: {dt.resolution}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {'regulatorySchedule' in step && step.regulatorySchedule && (
                  <div>
                    <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Regulatory Reporting Schedule</div>
                    <div className="space-y-1">
                      {step.regulatorySchedule.map((rs, i) => (
                        <div key={i} className="bg-[#0a0e1a] border border-[#1e2a45] rounded p-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-white font-medium">{rs.report}</span>
                            <span className="text-amber-400 shrink-0 ml-2">{rs.due}</span>
                          </div>
                          <div className="text-gray-500 mt-0.5">{rs.authority} — {rs.note}</div>
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
