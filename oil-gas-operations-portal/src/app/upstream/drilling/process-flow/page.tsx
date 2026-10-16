'use client';
import { useState, useEffect } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Phase {
  step_number?: number;
  id?: string;
  step_name?: string;
  name?: string;
  phase: string;
  duration?: string;
  duration_days?: number;
  activities?: string[];
  deliverables?: string[];
  responsible?: string[];
  ai_tools?: { name: string; type?: string; desc?: string; value?: string }[] | string[];
  decision_gate?: { id?: string; name?: string; go?: string; nogo?: string; owner?: string } | null;
  regulatory?: string | null;
  kaggle_data?: string | null;
}

interface Subprocess {
  sp_id: string;
  name: string;
  category: string;
  phase?: string;
  duration?: string;
  key_inputs?: string[];
  key_outputs?: string[];
  responsible?: string;
  ai_model?: string | null;
  regulatory?: string | null;
}

interface ApiData {
  phases?: Phase[];
  subprocesses?: Subprocess[];
  phase_count?: number;
  subprocess_count?: number;
  _source?: string;
}

// ─── Static fallback data ────────────────────────────────────────────────────

const LIFECYCLE_PHASES = [
  { id: 'P01', name: 'Well Concept', type: 'planning', row: 1, pos: 0, desc: 'Integrate seismic interpretation, define well objective (exploration/appraisal/development). Establish geological prognosis, expected formation pressures, and economic screening.', duration: '2–6 weeks', deliverables: ['Well Proposal Document (WPD)', 'Geological Prognosis', 'Target coordinates (KOP/azimuth)', 'PP/FG prognosis curve'], responsible: ['Exploration Geologist', 'Reservoir Engineer'], ai: ['Target Depth Optimizer (ML Regression)', 'Resource Estimator (Monte Carlo)'], gate: 'DG-1: NPV > 0, IRR > 15%, Geological confidence ≥ 60%' },
  { id: 'P02', name: 'Geological Target', type: 'planning', row: 1, pos: 1, desc: 'Define target zone coordinates, formation tops, expected lithology, PP/FG prognosis from offset wells. Seismic interpretation integrated with well logs.', duration: '1–3 weeks', deliverables: ['Expected lithology column', 'Formation tops', 'Expected GR/resistivity values', 'Anticollision data'], responsible: ['Geologist', 'Geophysicist'], ai: ['Automated Facies Predictor', 'Drilling Hazard Predictor'], gate: 'DG-2: PP/FG prognosis complete, casing design approved' },
  { id: 'P03', name: 'Well Design', type: 'planning', row: 1, pos: 2, desc: 'Casing burst/collapse/tension/biaxial loading analysis. BHA design, well trajectory, torque & drag model. Mud weight window established per depth.', duration: '3–8 weeks', deliverables: ['Casing Design Report', 'BHA Design Spec', 'Well Trajectory Plan', 'Torque & Drag Model'], responsible: ['Drilling Engineer', 'Wellbore Stability Engineer'], ai: ['Casing Seat Selector ML', 'BHA Optimizer ML', 'Wellbore Stability ML'], gate: 'DG-2: Casing design approved' },
  { id: 'P04', name: 'Regulatory/Permit', type: 'planning', row: 1, pos: 3, desc: 'AER Well License Application, environmental screening, Indigenous consultation (UNDRIP — 21-day notification). H2S ERP if sour well. EPZ calculation if H2S > 10 ppm.', duration: '3–8 weeks', deliverables: ['AER Well License (D056)', 'Surface Lease', 'Environmental Clearance', 'H2S ERP', 'FPIC Documentation'], responsible: ['Regulatory Affairs', 'Land Agent', 'HSE Manager'], ai: ['Permit Timeline Predictor', 'Regulatory Risk Assessor'], gate: 'DG-3: All permits received' },
  { id: 'P05', name: 'AFE Approval', type: 'planning', row: 1, pos: 4, desc: 'Board/management approval for Authorisation for Expenditure. Bayesian cost model provides AFE accuracy from ±35% to ±12%. Risk matrix approved, contingency established.', duration: '1–2 weeks', deliverables: ['Approved AFE', 'Risk Matrix', 'Contingency Budget', 'Contractor Availability Confirmation'], responsible: ['Finance', 'VP Drilling', 'Management'], ai: ['Well Cost Forecaster (Bayesian Regression)'], gate: 'DG-4: Board/management AFE approval, contractor availability confirmed' },
  { id: 'P06', name: 'Procurement', type: 'planning', row: 1, pos: 5, desc: 'Rig contract (RFQ → award), service contracts for directional drilling, cementing, wireline, frac. Material purchase orders for casing, drill pipe, BHA components.', duration: '4–12 weeks', deliverables: ['Rig Contract', 'Service Contracts', 'Material POs', 'Mob Schedule'], responsible: ['Supply Chain', 'Contracts Engineer', 'Drilling Superintendent'], ai: ['Rig Selection ML', 'Logistics Optimizer'], gate: 'DG-4/DG-5: Contractor availability confirmed' },
  { id: 'P07', name: 'Rig Mob', type: 'active', row: 2, pos: 0, desc: 'Rig move logistics (road permits, pilot cars). BOP function test: annular + pipe rams + shear rams. Pre-spud checklist sign-off (20-point). Crew safety induction, well control drills.', duration: '5–15 days', deliverables: ['Rig Acceptance Test', 'BOP Test Certificate', 'Pre-Spud Checklist', 'Spud Date Confirmation'], responsible: ['Rig Superintendent', 'HSE', 'BOP Specialist'], ai: ['Rig Selection ML', 'Spud Date Optimizer'], gate: 'DG-5: BOP test 300/1500psi, well control drills complete' },
  { id: 'P08', name: 'Spud & Surface', type: 'active', row: 2, pos: 1, desc: 'Conductor 30" driven to 50m. Drill 17-1/2" surface hole for 13-3/8" surface casing. Run and cement — returns to surface mandatory. BOP installation on casing head. Pressure test wellhead.', duration: '3–10 days', deliverables: ['Casing Tally', 'Cement Job Report', 'BOP Test Record', 'Wellhead Installation Report'], responsible: ['Drilling Supervisor', 'Cementing Engineer', 'Casing Crew'], ai: ['Cement Quality Predictor', 'Casing Wear Monitor'], gate: 'DG-6: FIT/LOT passed, cement confirmed to surface' },
  { id: 'P09', name: 'Intermediate', type: 'active', row: 2, pos: 2, desc: 'Drill 12-1/4" intermediate hole. Kick-off point (KOP) reached — directional build at 3–5°/30m dogleg severity. 9-5/8" casing run and cemented. Drill-off tests for WOB/RPM optimization.', duration: '10–20 days', deliverables: ['Directional Survey File', '9-5/8" Casing Cement Report', 'CBL/VDL Log', 'Casing Test Record'], responsible: ['Directional Driller', 'Drilling Engineer', 'Mud Logger'], ai: ['ROP Optimizer', 'Stuck Pipe Predictor', 'Lost Circulation Predictor'], gate: 'DG-6: Casing point confirmed, BHA logging complete' },
  { id: 'P10', name: 'Reservoir Section', type: 'active', row: 2, pos: 3, desc: 'Real-time geosteering using LWD GR/resistivity to stay in zone. ROP optimization (minimize MSE). Mud logging: ROP, gas, cuttings, pit volume. Well control monitoring continuous.', duration: '15–45 days', deliverables: ['LWD Log File (DLIS/LAS)', 'Directional Survey (WITSML)', 'Mud Log', 'Daily Drilling Reports'], responsible: ['Drilling Engineer', 'Directional Driller', 'Mud Logger', 'Petrophysicist'], ai: ['Geosteering AI', 'Early Kick Detection', 'ROP Optimizer', 'Stuck Pipe Predictor'], gate: 'DG-7: Commercial reservoir confirmed (Sw<0.5, porosity>10%)' },
  { id: 'P11', name: 'Evaluation', type: 'active', row: 2, pos: 4, desc: 'Wireline log suite: GR, SP, Caliper, Resistivity, Density, Neutron, Sonic, NMR, FMI. MDT pressure testing. Archie equation for Sw. Core acquisition and preservation if required.', duration: '3–7 days', deliverables: ['Wireline Log Suite (LAS/DLIS)', 'MDT Pressure Report', 'Petrophysical Evaluation Report', 'Core Analysis Report'], responsible: ['Petrophysicist', 'Wireline Engineer', 'Reservoir Engineer'], ai: ['Automated Facies Classifier', 'Fluid Typing AI', 'Petrophysical Property Predictor'], gate: 'DG-7: Net pay above commercial threshold' },
  { id: 'P12', name: 'Completion', type: 'completion', row: 2, pos: 5, desc: 'Perforation design: shot density, phasing, charge selection. Hydraulic fracturing if tight formation. Sand control installation. Tubing running and packer setting. Christmas tree installation.', duration: '5–20 days', deliverables: ['Perforation Design Report', 'Frac Job Report', 'Completion Schematic', 'Tubing Running Report'], responsible: ['Completions Engineer', 'Frac Engineer', 'Wireline Engineer'], ai: ['Completion Optimizer', 'Fracture Geometry Predictor', 'Screen Plugging Risk Predictor'], gate: 'DG-8: Perforation intervals selected, frac design approved' },
  { id: 'P13', name: 'Testing', type: 'completion', row: 2, pos: 6, desc: 'Drill Stem Test (DST): Initial Flow → Initial Shut-In → Main Flow → Final Shut-In. Pressure transient analysis (PTA). PI, kh, skin determination. PVT fluid samples.', duration: '2–7 days', deliverables: ['DST Report', 'PTA Report', 'PVT Fluid Samples', 'Deliverability Curve', 'Productivity Index (PI)'], responsible: ['Reservoir Engineer', 'Well Test Engineer', 'Production Chemist'], ai: ['Automatic PTA Interpreter', 'Well Productivity Predictor'], gate: 'DG-9: PI acceptable, skin < 5, sand < 0.1%' },
  { id: 'P14', name: 'Handover', type: 'completion', row: 2, pos: 7, desc: 'Final wellhead commissioning. Well file closure. Safety Critical Element (SECE) list transferred to production team. AER completion report filed within 30 days.', duration: '3–10 days', deliverables: ['Complete Well File', 'Handover Certificate', 'SECE Register', 'AER Completion Report'], responsible: ['Drilling Engineer', 'Production Supervisor', 'Operations Engineer'], ai: ['Handover Checklist AI (NLP)'], gate: 'DG-10: As-built survey filed with AER, P&A bond posted' },
  { id: 'P15', name: 'Suspension/P&A', type: 'closure', row: 2, pos: 8, desc: 'Temporary suspension: cement plug across reservoir, cut and cap. Permanent P&A per AER D020/D079: 3 barriers required, each pressure tested to 6.9 MPa. Surface reclamation certificate.', duration: '5–25 days', deliverables: ['P&A Program', 'Cement Plug Pressure Test Records', 'Abandonment Report', 'Reclamation Certificate'], responsible: ['Drilling Engineer', 'Regulatory Affairs', 'Land Agent'], ai: ['P&A Optimization ML', 'Plug Integrity Monitor'], gate: 'DG-10: All plugs tested, site remediated, AER filed' },
];

const PHASE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  planning: { bg: '#1e3a5f', border: '#3b82f6', text: '#93c5fd' },
  active:   { bg: '#3d2600', border: '#f59e0b', text: '#fcd34d' },
  completion:{ bg: '#14402a', border: '#10b981', text: '#6ee7b7' },
  closure:  { bg: '#1f2937', border: '#6b7280', text: '#9ca3af' },
};

const NPT_CATEGORIES = [
  { label: 'Stuck Pipe', pct: 35, color: '#ef4444' },
  { label: 'Equipment Failure', pct: 20, color: '#f97316' },
  { label: 'Well Control', pct: 15, color: '#eab308' },
  { label: 'Hole Problems', pct: 15, color: '#a855f7' },
  { label: 'Logistics', pct: 10, color: '#3b82f6' },
  { label: 'Weather', pct: 5, color: '#6b7280' },
];

const AFE_BREAKDOWN = [
  { category: 'Drilling', cost: 3.2, color: '#f59e0b' },
  { category: 'Completion', cost: 2.1, color: '#3b82f6' },
  { category: 'Facilities', cost: 1.4, color: '#10b981' },
  { category: 'Location', cost: 0.8, color: '#8b5cf6' },
  { category: 'P&A Reserve', cost: 0.5, color: '#6b7280' },
];

const AI_TOOLS = [
  { num: 1, name: 'Stuck Pipe Predictor', model: 'Random Forest / Gradient Boosting', inputs: 'WOB, torque, ECD, overpull, drag trends', output: 'Stuck probability % (2–4 hr early warning)', improvement: '60% reduction in stuck pipe events', dataset: 'machine-maintenance (kaggle) — WOB/torque/tool_wear proxy', link: '/ai/predictive-models' },
  { num: 2, name: 'ROP Optimizer', model: 'Gradient Boosting (XGBoost)', inputs: 'WOB, RPM, flow rate, mud weight, formation type → optimal ROP', output: 'Optimal WOB/RPM setpoints in real-time', improvement: '15–25% ROP improvement → 3–5 days/well → $300–500K CAD saved', dataset: 'machine-maintenance, well-logs (kaggle)', link: '/ai/real-time' },
  { num: 3, name: 'Geosteering AI', model: 'CNN + Reinforcement Learning', inputs: 'LWD resistivity, GR curves, geological prognosis, formation dip', output: 'Up/down/straight recommendation to maximize time-in-zone', improvement: '95% time-in-zone vs 75% without AI (+$500K/well NPV)', dataset: 'well-logs, well-facies (kaggle)', link: '/ai/geosteering' },
  { num: 4, name: 'Early Kick Detection', model: 'LSTM (Long Short-Term Memory)', inputs: 'Mud weight in/out, pit volume delta, flow-in/flow-out ratio, SICP', output: 'Kick probability % with <60s detection latency', improvement: 'Prevents $2–10M well control events', dataset: 'environmental-telemetry (flow/pressure time series proxy)', link: '/ai/well-control' },
  { num: 5, name: 'Kill Procedure Advisor', model: 'Ollama LLM (local RAG)', inputs: 'SIDP, SICP, pit gain, original MW, TVD, kick type', output: 'Step-by-step kill sheet: KMW, ICP, FCP, pump schedule', improvement: 'Kill sheet in 2 min vs 20 min manual calculation', dataset: 'Well control manual corpus (RAG)', link: '/ai/well-control' },
  { num: 6, name: 'Drilling Hazard Predictor', model: 'Random Forest (multi-label)', inputs: 'Offset well data, formation tops, mud weight history', output: 'Lost circulation / H2S zones / overpressure risk by depth interval', improvement: '70% reduction in drilling hazard surprises', dataset: 'well-logs (kaggle — GR/RHOB/NPHI/DT)', link: '/ai/predictive-models' },
  { num: 7, name: 'Casing Wear Predictor', model: 'Physics-ML Hybrid (Contact Force Model)', inputs: 'WOB, RPM, contact force at doglegs, run hours', output: 'Casing wear rate mm/hr at critical dogleg points', improvement: 'Prevents unplanned workovers from casing failure (~$2M)', dataset: 'machine-maintenance (kaggle proxy)', link: '/ai/predictive-models' },
  { num: 8, name: 'Drill Bit Selector', model: 'XGBoost (classification)', inputs: 'Formation hardness, UCS, offset bit performance, ROP history', output: 'PDC vs roller cone recommendation + gauge size + grade selection', improvement: '20% reduction in bit trips', dataset: 'well-logs (formation properties proxy)', link: '/ai/optimization' },
  { num: 9, name: 'Well Cost Forecaster', model: 'Bayesian Regression', inputs: 'Well type, depth, location, complexity factors, offset well AFE history', output: 'AFE estimate with P10/P50/P90 distribution', improvement: 'AFE accuracy from ±35% to ±12%', dataset: 'pipeline-operations (cost/duration proxy)', link: '/ai/optimization' },
  { num: 10, name: 'Completion Optimizer', model: 'Multi-Objective Optimizer (NSGA-II)', inputs: 'Log analysis, perf intervals, offset production data, reservoir properties', output: 'Optimal stage count, cluster spacing, fluid volumes, proppant loading', improvement: '15–25% production improvement vs manual design', dataset: 'well-logs + well-facies (kaggle)', link: '/ai/optimization' },
];

const DECISION_GATES = [
  { id: 'DG-1', name: 'Well Concept', stage: 'Pre-Planning', criteria: ['NPV > 0, IRR > 15%', 'Geological confidence ≥ 60%', 'Land/title confirmed', 'Strategic fit with FDP'], authority: 'VP Exploration + Economics', color: '#3b82f6' },
  { id: 'DG-2', name: 'Well Design', stage: 'Planning', criteria: ['PP/FG prognosis complete', 'Casing design approved by well engineer', 'Directional plan issued', 'T&D model within limits'], authority: 'Drilling Engineering Manager', color: '#8b5cf6' },
  { id: 'DG-3', name: 'Regulatory', stage: 'Planning', criteria: ['AER Directive 056 permit received', 'EPZ approved if H2S > 10 ppm', 'Indigenous consultation complete (FPIC)', 'Environmental assessment filed'], authority: 'Regulatory Affairs + Legal', color: '#06b6d4' },
  { id: 'DG-4', name: 'AFE Approval', stage: 'Planning', criteria: ['Board/management AFE approval', 'Contractor availability confirmed', 'Material lead times verified', 'Risk matrix approved'], authority: 'VP Drilling / Board', color: '#10b981' },
  { id: 'DG-5', name: 'Rig Ready', stage: 'Execution', criteria: ['Rig acceptance test passed', 'BOP test: 300 psi low / 1500 psi high', 'Well control drills completed', 'Pre-spud checklist 100%', 'H2S monitors calibrated'], authority: 'Drilling Superintendent + HSE', color: '#f59e0b' },
  { id: 'DG-6', name: 'Casing Point', stage: 'Execution', criteria: ['FIT/LOT passed ≥ required MW', 'Pore pressure not exceeded', 'BHA logging run complete', 'Cement job CBL/VDL reviewed'], authority: 'Drilling Engineer + Well Engineering', color: '#ef4444' },
  { id: 'DG-7', name: 'Completion Decision', stage: 'Evaluation', criteria: ['Commercial reservoir: Sw < 0.5', 'Porosity > 10%', 'Permeability > 0.1 mD', 'TD confirmed at geological target'], authority: 'Reservoir Engineer + Operations Manager', color: '#f97316' },
  { id: 'DG-8', name: 'Completion Design', stage: 'Completion', criteria: ['Perforation intervals selected by petrophysicist', 'Frac design peer-reviewed', 'Stage count/cluster spacing approved', 'Fluid volumes and types confirmed'], authority: 'Completion Engineer + Manager', color: '#84cc16' },
  { id: 'DG-9', name: 'Well Test', stage: 'Testing', criteria: ['PI acceptable vs type-curve', 'Skin (damage) < 5', 'Sand production < 0.1%', 'Flowing WHP stable', 'Gas-oil ratio within prognosis ±20%'], authority: 'Production Engineer + Reservoir', color: '#a855f7' },
  { id: 'DG-10', name: 'Handover', stage: 'Handover', criteria: ['As-built wellbore survey filed with AER', 'P&A bond posted if suspended', 'Handover package signed off by both parties', 'All AER filings confirmed received'], authority: 'Drilling Manager + Regulatory', color: '#6b7280' },
];

const REGULATORY = [
  { directive: 'AER Directive 056', scope: 'Well completion and abandonment — licensing requirements', stage: 'Pre-drill', jurisdiction: 'Alberta', link: '#' },
  { directive: 'AER Directive 020', scope: 'Well abandonment — criteria and procedures (plug placement, pressure tests)', stage: 'P&A', jurisdiction: 'Alberta', link: '#' },
  { directive: 'AER Directive 079', scope: 'Resource applications and downhole pressure containment', stage: 'P&A', jurisdiction: 'Alberta', link: '#' },
  { directive: 'AER Directive 008', scope: 'Surface casing depth requirements — groundwater protection', stage: 'Spud', jurisdiction: 'Alberta', link: '#' },
  { directive: 'AER Directive 009', scope: 'BOP testing requirements — function tests and pressure tests', stage: 'Spud', jurisdiction: 'Alberta', link: '#' },
  { directive: 'AER Directive 050', scope: 'Drilling waste management — OBM/SBM disposal and cuttings', stage: 'Execution', jurisdiction: 'Alberta', link: '#' },
  { directive: 'AER Directive 083', scope: 'Well testing — DST reporting, flaring authorization', stage: 'Testing', jurisdiction: 'Alberta', link: '#' },
  { directive: 'CER Regulations', scope: 'Wells within federal jurisdiction (offshore, cross-border)', stage: 'All', jurisdiction: 'Federal', link: '#' },
  { directive: 'ECCC', scope: 'Environmental protection during drilling — spill reporting, air emissions', stage: 'Execution', jurisdiction: 'Federal', link: '#' },
  { directive: 'UNDRIP/FPIC', scope: 'Indigenous consultation — 21-day notification, free prior informed consent', stage: 'Planning', jurisdiction: 'Canada', link: '#' },
];

const CASING_STRINGS = [
  { string: 'Conductor', od: '30"', weight: '94.0', grade: 'X-52', connection: 'Buttress', depth: 50, burst: '6,900', collapse: '5,500', purpose: 'Soil/formation support; wellhead foundation; conductor driving' },
  { string: 'Surface', od: '20"', weight: '133.0', grade: 'K-55', connection: 'BTC', depth: 300, burst: '14,500', collapse: '11,700', purpose: 'Isolate freshwater zones; BOP installation point; groundwater barrier' },
  { string: 'Intermediate', od: '13-3/8"', weight: '72.0', grade: 'N-80', connection: 'BTC', depth: 1500, burst: '27,600', collapse: '22,800', purpose: 'Isolate abnormal pressure zones; enable higher mud weight without fracturing' },
  { string: 'Production', od: '9-5/8"', weight: '53.5', grade: 'P-110', connection: 'LTC', depth: 3000, burst: '62,100', collapse: '51,700', purpose: 'Primary production conduit; barrier to reservoir; perforation string' },
  { string: 'Liner', od: '7"', weight: '35.0', grade: 'P-110', connection: 'Premium', depth: 3500, burst: '82,700', collapse: '69,000', purpose: 'Reservoir isolation; perforation target string; cost saving vs full string' },
];

const SENSOR_STREAMS = [
  { name: 'Hookload', unit: 'kN', type: 'Load cell', range: '0–5000', rate: '1 Hz', alarm: '>4500 kN (overpull)', ai: 'Stuck pipe early warning' },
  { name: 'WOB', unit: 'kN', type: 'Load cell differential', range: '0–300', rate: '1 Hz', alarm: '>250 kN', ai: 'ROP optimizer input' },
  { name: 'Torque', unit: 'kN·m', type: 'Rotary torque meter', range: '0–50', rate: '1 Hz', alarm: '>40 kN·m', ai: 'Stuck pipe predictor' },
  { name: 'RPM', unit: 'rpm', type: 'Tachometer', range: '0–300', rate: '1 Hz', alarm: '>220 rpm', ai: 'BHA vibration alert' },
  { name: 'Flow Rate', unit: 'L/min', type: 'Mag flowmeter', range: '0–5000', rate: '5 Hz', alarm: '<200 L/min loss', ai: 'Lost circulation detection' },
  { name: 'Pit Volume', unit: 'm³', type: 'Ultrasonic level', range: '0–500', rate: '0.1 Hz', alarm: '±2 m³ change', ai: 'Early kick detection (LSTM)' },
  { name: 'Mud Weight In', unit: 'kg/m³', type: 'Mud balance/Coriolis', range: '900–2400', rate: '0.2 Hz', alarm: '±20 kg/m³', ai: 'Kill mud weight monitor' },
  { name: 'Mud Weight Out', unit: 'kg/m³', type: 'Coriolis flowmeter', range: '900–2400', rate: '0.2 Hz', alarm: 'MW_out < MW_in −30', ai: 'Kick / gas cut detection' },
  { name: 'ECD', unit: 'kg/m³', type: 'Calculated (APWD)', range: '900–2400', rate: '1 Hz', alarm: '>FG prognosis −50', ai: 'Fracture gradient breach alert' },
  { name: 'Gas Reading', unit: '%', type: 'Chromatograph', range: '0–100', rate: '0.5 Hz', alarm: '>5% total gas', ai: 'Well control alert' },
  { name: 'ROP', unit: 'm/hr', type: 'Depth encoder diff', range: '0–100', rate: '1 Hz', alarm: '<1 m/hr (bit worn)', ai: 'ROP optimizer feedback' },
  { name: 'Bit Depth', unit: 'm', type: 'Depth encoder', range: '0–6000', rate: '10 Hz', alarm: 'At TD prognosis ±3m', ai: 'Geological target alert' },
  { name: 'Casing Pressure', unit: 'kPa', type: 'Pressure transducer', range: '0–70,000', rate: '1 Hz', alarm: '>MAASP', ai: 'MAASP breach — well control' },
  { name: 'H2S', unit: 'ppm', type: 'Electrochemical sensor', range: '0–500', rate: '2 Hz', alarm: '>1 ppm warn / >10 alarm', ai: 'EPZ evacuation trigger' },
  { name: 'Temp In/Out', unit: '°C', type: 'RTD thermocouple', range: '0–200', rate: '0.1 Hz', alarm: '>175°C (HPHT)', ai: 'BHA thermal limit alert' },
  { name: 'Standpipe Pressure', unit: 'kPa', type: 'Pressure transducer', range: '0–70,000', rate: '5 Hz', alarm: '>0.9 × max pump pressure', ai: 'Washout / plug detection' },
];

const SUB_PROCESS_CATEGORIES: Record<string, string[]> = {
  'PRE-DRILL': [
    'Survey & title review', 'Geological & reservoir modeling', 'Offset well data analysis',
    'Well design (casing/BHA/mud/trajectory)', 'Regulatory filing (AER D056)', 'AFE preparation & approval',
    'Procurement & contracting (rig/services)', 'Pre-spud safety meeting (SIMOPS review)',
  ],
  'EXECUTION': [
    'Conductor/surface hole drill-out', 'BHA makeup & pre-run inspection', 'Connection drilldown procedure',
    'Directional survey (MWD/gyro every stand)', 'Mud logging (gas chromatograph continuous)', 'Casing running (tally + drifting)',
    'Primary cementing job (slurry design + execution)', 'BOP function & pressure test', 'Intermediate hole drilling',
    'Casing point decision (DG-6)',
  ],
  'RESERVOIR SECTION': [
    'Formation evaluation program setup', 'LWD real-time monitoring (GR/res/density/neutron)',
    'Coring operations (core barrel, preservation)', 'Drillstem test planning',
    'Directional drilling to geological target (geosteering)', 'Reservoir penetration + RCF sampling',
    'TD decision review (pore pressure/FG)', 'Wireline logging program execution',
  ],
  'WELL CONTROL': [
    'Primary barrier maintenance (mud weight in PP/FG window)', 'Secondary barrier (BOP stack integrity tests)',
    'Kick detection & recognition (pit gain/flow check)', 'Shut-in procedure (FOSV → annular → rams)',
    'Kill method selection (Driller\'s/Engineer\'s/Volumetric/Bullheading)', 'Kill execution & monitoring',
    'Post-kill verification (SIDP + SICP = 0)', 'Lessons learned & incident report',
  ],
  'COMPLETION': [
    'Perforation design (interval/shot density/phasing/charge)', 'Hydraulic frac design (stage/cluster/fluid/proppant)',
    'Stimulation execution & real-time monitoring', 'Flowback management & clean-up',
    'Sand control evaluation (screens/gravel pack)', 'Artificial lift selection (pump/gas lift/ESP)', 'Wellhead & choke manifold installation',
  ],
  'HANDOVER/P&A': [
    'As-built wellbore directional survey (filed with AER)', 'Production handover package compilation',
    'Suspension requirements (AER D020 criteria)', 'Plug placement (mechanical/cement per D020)',
    'Surface reclamation plan filing (AEPEA)', 'Regulatory closure & AER confirmation letter',
  ],
};

const TABS = [
  'Lifecycle Flow', 'NPT Analysis', 'AFE Cost', 'Wellbore Design',
  'AI Integration', 'Decision Gates', 'Regulatory', 'Casing & Cement',
  'Sensors & LWD', 'Sub-Processes',
];

// ─── SVG Pie Chart ───────────────────────────────────────────────────────────

function PieChart({ data }: { data: { label: string; pct: number; color: string }[] }) {
  let cumulative = 0;
  const cx = 120, cy = 120, r = 100;

  const slices = data.map((d) => {
    const startAngle = (cumulative / 100) * 2 * Math.PI - Math.PI / 2;
    cumulative += d.pct;
    const endAngle = (cumulative / 100) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = d.pct > 50 ? 1 : 0;
    const midAngle = (startAngle + endAngle) / 2;
    const lx = cx + (r * 0.65) * Math.cos(midAngle);
    const ly = cy + (r * 0.65) * Math.sin(midAngle);
    return { ...d, path: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`, lx, ly };
  });

  return (
    <svg viewBox="0 0 240 240" className="w-64 h-64">
      {slices.map((s, i) => (
        <g key={i}>
          <path d={s.path} fill={s.color} stroke="#0a0e1a" strokeWidth="2" />
          {s.pct >= 10 && (
            <text x={s.lx} y={s.ly} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="11" fontWeight="700">{s.pct}%</text>
          )}
        </g>
      ))}
    </svg>
  );
}

// ─── Waterfall Bar ────────────────────────────────────────────────────────────

function WaterfallChart({ data }: { data: { category: string; cost: number; color: string }[] }) {
  const maxCost = Math.max(...data.map(d => d.cost));
  return (
    <svg viewBox={`0 0 ${data.length * 100 + 40} 200`} className="w-full h-48">
      {data.map((d, i) => {
        const barH = (d.cost / maxCost) * 150;
        const x = i * 100 + 20;
        const y = 170 - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={70} height={barH} fill={d.color} rx="4" />
            <text x={x + 35} y={y - 6} textAnchor="middle" fill="#f3f4f6" fontSize="11" fontWeight="700">${d.cost}M</text>
            <text x={x + 35} y={185} textAnchor="middle" fill="#9ca3af" fontSize="10">{d.category}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Wellbore Schematic ───────────────────────────────────────────────────────

function WellboreSchematic() {
  return (
    <svg viewBox="0 0 320 520" className="w-72 h-auto mx-auto">
      {/* Ground surface */}
      <rect x="0" y="0" width="320" height="20" fill="#374151" />
      <text x="160" y="14" textAnchor="middle" fill="#9ca3af" fontSize="10">Ground Surface 0m</text>

      {/* Conductor 30" — 0-50m */}
      <rect x="80" y="20" width="160" height="50" fill="none" stroke="#eab308" strokeWidth="6" />
      <text x="250" y="50" fill="#eab308" fontSize="10" fontWeight="600">30" Conductor</text>
      <text x="250" y="62" fill="#9ca3af" fontSize="9">50m TD</text>

      {/* Surface 20" — 0-120m */}
      <rect x="95" y="20" width="130" height="100" fill="none" stroke="#93c5fd" strokeWidth="5" />
      <text x="15" y="80" fill="#93c5fd" fontSize="10" fontWeight="600">20" Surface</text>
      <text x="15" y="92" fill="#9ca3af" fontSize="9">300m</text>
      {/* Casing shoe marker */}
      <polygon points="95,120 88,110 88,130" fill="#93c5fd" />

      {/* Intermediate 9-5/8" — 0-250m */}
      <rect x="108" y="20" width="104" height="250" fill="none" stroke="#f97316" strokeWidth="4" />
      <text x="10" y="200" fill="#f97316" fontSize="10" fontWeight="600">13-3/8"</text>
      <text x="10" y="212" fill="#9ca3af" fontSize="9">Intmd 1500m</text>
      {/* Casing shoe */}
      <polygon points="108,270 100,260 100,280" fill="#f97316" />

      {/* Production 9-5/8" — 0-380m */}
      <rect x="118" y="20" width="84" height="380" fill="none" stroke="#10b981" strokeWidth="3" />
      <text x="250" y="200" fill="#10b981" fontSize="10" fontWeight="600">9-5/8" Prodn</text>
      <text x="250" y="212" fill="#9ca3af" fontSize="9">3000m</text>
      {/* Casing shoe */}
      <polygon points="202,400 210,390 210,410" fill="#10b981" />

      {/* Liner 7" — 360-500m */}
      <rect x="128" y="360" width="64" height="140" fill="none" stroke="#a855f7" strokeWidth="3" />
      <text x="205" y="440" fill="#a855f7" fontSize="10" fontWeight="600">7" Liner</text>
      <text x="205" y="452" fill="#9ca3af" fontSize="9">3500m TD</text>

      {/* Perforations */}
      {[430, 445, 460, 475, 490].map((y, i) => (
        <g key={i}>
          <line x1="128" y1={y} x2="115" y2={y} stroke="#f59e0b" strokeWidth="2" />
          <line x1="192" y1={y} x2="205" y2={y} stroke="#f59e0b" strokeWidth="2" />
        </g>
      ))}
      <text x="96" y="468" fill="#f59e0b" fontSize="9">Perfs</text>

      {/* Packer symbol */}
      <rect x="122" y="400" width="76" height="12" fill="#f59e0b" rx="2" />
      <text x="160" y="409" textAnchor="middle" fill="#000" fontSize="8" fontWeight="700">PKR</text>

      {/* Formation labels */}
      <line x1="202" y1="80" x2="280" y2="80" stroke="#374151" strokeWidth="1" strokeDasharray="3,2" />
      <text x="282" y="84" fill="#6b7280" fontSize="9">Overburden</text>
      <line x1="202" y1="200" x2="280" y2="200" stroke="#374151" strokeWidth="1" strokeDasharray="3,2" />
      <text x="282" y="204" fill="#6b7280" fontSize="9">Intermediate</text>
      <line x1="202" y1="380" x2="280" y2="380" stroke="#374151" strokeWidth="1" strokeDasharray="3,2" />
      <text x="282" y="384" fill="#6b7280" fontSize="9">Reservoir</text>

      {/* Depth bar */}
      <line x1="60" y1="20" x2="60" y2="500" stroke="#374151" strokeWidth="1" />
      {[0, 100, 200, 300, 400, 500].map((m, i) => (
        <g key={i}>
          <line x1="55" y1={20 + i * 96} x2="65" y2={20 + i * 96} stroke="#6b7280" strokeWidth="1" />
          <text x="50" y={24 + i * 96} textAnchor="end" fill="#6b7280" fontSize="9">{m * 7}m</text>
        </g>
      ))}
    </svg>
  );
}

// ─── Well Control Flowchart ───────────────────────────────────────────────────

function WellControlFlowchart() {
  const boxStyle = "fill-[#0f1629] stroke-[#f59e0b] stroke-2";
  const boxes = [
    { x: 80, y: 10, w: 360, h: 40, text: 'Kick Indicators Detected', sub: 'Flow increase / Pit gain / Gas / Pressure anomaly', color: '#ef4444' },
    { x: 80, y: 90, w: 360, h: 40, text: 'Pick Up Off Bottom → Space Out → Close Annular BOP → Close Rams', sub: '', color: '#f97316' },
    { x: 80, y: 170, w: 360, h: 40, text: 'Record: SIDP, SICP, Pit Gain', sub: 'Classify Kick: gas / water / oil / combination', color: '#eab308' },
    { x: 80, y: 250, w: 360, h: 40, text: 'Select Kill Method', sub: "Driller's Method | Engineer's Method | Volumetric | Bullheading", color: '#10b981' },
    { x: 80, y: 330, w: 360, h: 40, text: 'Condition Mud to KMW → Wait on Engineering → Pump Kill Mud', sub: 'KMW = OMW + (SIDP / (0.00695 × TVD_m))', color: '#3b82f6' },
    { x: 80, y: 410, w: 360, h: 40, text: 'Monitor: SICP, Bit Depth, Barrels Pumped', sub: 'Maintain Constant BHP — adjust choke continuously', color: '#8b5cf6' },
    { x: 80, y: 490, w: 360, h: 40, text: 'Kill Complete: SIDP + SICP = 0', sub: 'Open BOP → Flow Check → Resume Operations', color: '#10b981' },
  ];

  return (
    <svg viewBox="0 0 520 560" className="w-full max-w-2xl mx-auto h-auto">
      {boxes.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="6" fill="#0f1629" stroke={b.color} strokeWidth="2" />
          <text x={b.x + b.w / 2} y={b.y + (b.sub ? 14 : 20)} textAnchor="middle" fill="#f3f4f6" fontSize="11" fontWeight="700">{b.text}</text>
          {b.sub && <text x={b.x + b.w / 2} y={b.y + 30} textAnchor="middle" fill="#9ca3af" fontSize="9">{b.sub}</text>}
          {i < boxes.length - 1 && (
            <line x1={b.x + b.w / 2} y1={b.y + b.h} x2={b.x + b.w / 2} y2={b.y + b.h + 50} stroke="#f59e0b" strokeWidth="2" markerEnd="url(#arrow)" />
          )}
        </g>
      ))}
      <defs>
        <marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#f59e0b" />
        </marker>
      </defs>
    </svg>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DrillingProcessFlowPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPhase, setSelectedPhase] = useState<typeof LIFECYCLE_PHASES[0] | null>(null);
  const [openAccordion, setOpenAccordion] = useState<string | null>('PRE-DRILL');
  const [apiData, setApiData] = useState<ApiData | null>(null);

  useEffect(() => {
    fetch('/api/upstream/drilling/process-flow')
      .then(r => r.json())
      .then(d => setApiData(d))
      .catch(() => {/* use static fallback */});
  }, []);

  const row1 = LIFECYCLE_PHASES.filter(p => p.row === 1);
  const row2 = LIFECYCLE_PHASES.filter(p => p.row === 2);

  return (
    <div className="space-y-6 min-h-screen" style={{ background: '#0a0e1a' }}>
      {/* Header */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Drilling Industry Process Flow</h1>
            <p className="text-gray-400 text-sm mt-1">
              15-phase well lifecycle · 10 decision gates · 47 sub-processes · Canadian regulatory compliance · 16 LWD sensor streams
            </p>
          </div>
          <div className="flex gap-3 text-xs">
            {[
              { label: 'Phases', val: '15', color: '#f59e0b' },
              { label: 'DGs', val: '10', color: '#10b981' },
              { label: 'Sub-Procs', val: apiData?.subprocess_count?.toString() ?? '47', color: '#3b82f6' },
              { label: 'AI Tools', val: '10', color: '#a855f7' },
            ].map(k => (
              <div key={k.label} className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-center">
                <div className="font-bold text-lg" style={{ color: k.color }}>{k.val}</div>
                <div className="text-gray-500">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
        <div className="flex overflow-x-auto border-b border-[#1e2a45]">
          {TABS.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === i
                  ? 'bg-[#0a0e1a] text-amber-400 border-b-2 border-amber-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6">

          {/* TAB 0: LIFECYCLE FLOW */}
          {activeTab === 0 && (
            <div className="space-y-6">
              <div className="flex gap-4 text-xs flex-wrap">
                {Object.entries(PHASE_COLORS).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ background: v.bg, border: `2px solid ${v.border}` }} />
                    <span className="text-gray-400 capitalize">{k}</span>
                  </div>
                ))}
              </div>

              {/* Row 1 */}
              <div>
                <div className="text-xs text-gray-500 mb-2 font-medium">ROW 1 — PLANNING (Pre-Execution)</div>
                <div className="flex gap-2 flex-wrap">
                  {row1.map(phase => {
                    const c = PHASE_COLORS[phase.type];
                    return (
                      <button
                        key={phase.id}
                        onClick={() => setSelectedPhase(phase)}
                        className="rounded-lg p-3 text-left transition-all hover:scale-105 cursor-pointer min-w-[130px]"
                        style={{ background: c.bg, border: `2px solid ${c.border}` }}
                      >
                        <div className="text-xs font-mono mb-1" style={{ color: c.text }}>{phase.id}</div>
                        <div className="text-sm font-semibold text-white">{phase.name}</div>
                        <div className="text-xs mt-1" style={{ color: c.text }}>{phase.duration}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Connector arrow between rows */}
              <div className="flex items-center gap-2 text-amber-500 text-xs">
                <div className="h-px flex-1 bg-[#1e2a45]" />
                <span>↓ Execution begins after DG-5 Rig Ready</span>
                <div className="h-px flex-1 bg-[#1e2a45]" />
              </div>

              {/* Row 2 */}
              <div>
                <div className="text-xs text-gray-500 mb-2 font-medium">ROW 2 — EXECUTION, EVALUATION, COMPLETION & CLOSURE</div>
                <div className="flex gap-2 flex-wrap">
                  {row2.map(phase => {
                    const c = PHASE_COLORS[phase.type];
                    return (
                      <button
                        key={phase.id}
                        onClick={() => setSelectedPhase(phase)}
                        className="rounded-lg p-3 text-left transition-all hover:scale-105 cursor-pointer min-w-[130px]"
                        style={{ background: c.bg, border: `2px solid ${c.border}` }}
                      >
                        <div className="text-xs font-mono mb-1" style={{ color: c.text }}>{phase.id}</div>
                        <div className="text-sm font-semibold text-white">{phase.name}</div>
                        <div className="text-xs mt-1" style={{ color: c.text }}>{phase.duration}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Phase Detail Panel */}
              {selectedPhase && (
                <div className="bg-[#0a0e1a] border border-amber-500 rounded-xl p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-mono text-amber-400">{selectedPhase.id}</span>
                      <h3 className="text-lg font-bold text-white mt-1">{selectedPhase.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded capitalize mt-1 inline-block`} style={{ background: PHASE_COLORS[selectedPhase.type].bg, color: PHASE_COLORS[selectedPhase.type].text, border: `1px solid ${PHASE_COLORS[selectedPhase.type].border}` }}>{selectedPhase.type}</span>
                    </div>
                    <button onClick={() => setSelectedPhase(null)} className="text-gray-500 hover:text-white text-xl">×</button>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{selectedPhase.desc}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-amber-400 font-semibold mb-2">KEY DELIVERABLES</div>
                      <ul className="space-y-1">
                        {selectedPhase.deliverables.map((d, i) => (
                          <li key={i} className="text-xs text-gray-300 flex gap-2"><span className="text-amber-500">▸</span>{d}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-xs text-amber-400 font-semibold mb-2">RESPONSIBLE PARTIES</div>
                      <ul className="space-y-1">
                        {selectedPhase.responsible.map((r, i) => (
                          <li key={i} className="text-xs text-gray-300 flex gap-2"><span className="text-blue-400">◆</span>{r}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-xs text-amber-400 font-semibold mb-2">AI TOOLS DEPLOYED</div>
                      <ul className="space-y-1">
                        {selectedPhase.ai.map((a, i) => (
                          <li key={i} className="text-xs text-gray-300 flex gap-2"><span className="text-purple-400">🤖</span>{a}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-xs text-amber-400 font-semibold mb-2">GO/NO-GO GATE</div>
                      <div className="text-xs text-green-400 bg-[#0f1629] rounded p-2 border border-[#1e2a45]">{selectedPhase.gate}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 1: NPT ANALYSIS */}
          {activeTab === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white">Non-Productive Time (NPT) Analysis</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#0a0e1a] border border-[#1e2a45] rounded-xl p-4">
                  <div className="text-sm font-semibold text-amber-400 mb-4">NPT Category Distribution</div>
                  <div className="flex gap-6 items-center">
                    <PieChart data={NPT_CATEGORIES} />
                    <div className="space-y-2">
                      {NPT_CATEGORIES.map((c, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: c.color }} />
                          <span className="text-gray-300">{c.label}</span>
                          <span className="font-bold ml-auto pl-2" style={{ color: c.color }}>{c.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-[#0a0e1a] border border-[#1e2a45] rounded-xl p-4">
                    <div className="text-sm font-semibold text-amber-400 mb-3">NPT KPIs</div>
                    {[
                      { label: 'Industry Average NPT', value: '20–25%', color: '#ef4444', note: 'of rig time lost' },
                      { label: 'Best-in-Class Target', value: '<12%', color: '#10b981', note: 'industry benchmark' },
                      { label: 'AI-Assisted Target', value: '<8%', color: '#f59e0b', note: 'with full AI suite' },
                      { label: 'Cost per NPT Hour', value: '$50–150K', color: '#f97316', note: 'CAD (rig + services)' },
                    ].map((k, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-[#1e2a45] last:border-0">
                        <span className="text-xs text-gray-400">{k.label}</span>
                        <div className="text-right">
                          <span className="text-sm font-bold" style={{ color: k.color }}>{k.value}</span>
                          <div className="text-xs text-gray-600">{k.note}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-[#0a0e1a] border border-[#1e2a45] rounded-xl p-4">
                <div className="text-sm font-semibold text-amber-400 mb-3">Top 5 NPT Mitigations with AI Tools</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[#1e2a45]">
                        {['Rank', 'NPT Category', 'Primary Cause', 'AI Mitigation', 'Expected NPT Reduction'].map(h => (
                          <th key={h} className="text-left text-amber-400 font-semibold py-2 pr-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { rank: 1, cat: 'Stuck Pipe', cause: 'Differential sticking in permeable zones with high MW; key seat geometry', ai: 'Stuck Pipe Predictor (RF/XGBoost) — 2-4hr early warning via WOB/torque/drag trends', red: '35% → 14%' },
                        { rank: 2, cat: 'Equipment Failure', cause: 'BHA/downhole tool failure (MWD battery, motor stator, bit dulling)', ai: 'Predictive Maintenance ML — vibration + temp + hours-on-bit → failure probability', red: '20% → 10%' },
                        { rank: 3, cat: 'Well Control', cause: 'Unexpected overpressure zones; gas kicks from underbalanced drilling', ai: 'Early Kick Detection LSTM — pit volume + flow in/out + SICP trends, <60s detection', red: '15% → 5%' },
                        { rank: 4, cat: 'Hole Problems', cause: 'Lost circulation in fractured/vugular formations; washouts; tight hole', ai: 'Drilling Hazard Predictor (RF) — offset well data → lost circulation zones forecast', red: '15% → 8%' },
                        { rank: 5, cat: 'Logistics', cause: 'BHA component lead time; cement/chemical shortages; third-party delays', ai: 'Supply Chain Optimizer ML — lead time prediction, proactive procurement alerts', red: '10% → 6%' },
                      ].map((r, i) => (
                        <tr key={i} className="border-b border-[#1e2a45]">
                          <td className="py-2 pr-4 text-amber-400 font-bold">{r.rank}</td>
                          <td className="py-2 pr-4 text-red-400 font-semibold">{r.cat}</td>
                          <td className="py-2 pr-4 text-gray-400">{r.cause}</td>
                          <td className="py-2 pr-4 text-purple-400">{r.ai}</td>
                          <td className="py-2 pr-4 text-green-400 font-semibold">{r.red}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AFE COST */}
          {activeTab === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white">AFE Cost Breakdown</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#0a0e1a] border border-[#1e2a45] rounded-xl p-4">
                  <div className="text-sm font-semibold text-amber-400 mb-3">Typical Medium Horizontal Well — AFE Waterfall (CAD)</div>
                  <WaterfallChart data={AFE_BREAKDOWN} />
                  <div className="mt-3 pt-3 border-t border-[#1e2a45] flex justify-between text-xs">
                    <span className="text-gray-400">Total AFE Estimate</span>
                    <span className="text-amber-400 font-bold text-base">$8.0M CAD</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-[#0a0e1a] border border-[#1e2a45] rounded-xl p-4">
                    <div className="text-sm font-semibold text-amber-400 mb-3">Well Type Cost Ranges (CAD)</div>
                    <div className="space-y-3">
                      {[
                        { type: 'Shallow Vertical', range: '$500K – $2M', depth: '<1,500m', color: '#10b981' },
                        { type: 'Medium Horizontal', range: '$3M – $8M', depth: '1,500–3,000m Hz', color: '#f59e0b' },
                        { type: 'Hz Multistage Frac', range: '$5M – $12M', depth: '2,500–4,000m Hz', color: '#f97316' },
                        { type: 'Deep HPHT Well', range: '$15M – $30M', depth: '>4,000m, >150°C, >70MPa', color: '#ef4444' },
                      ].map((w, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-[#1e2a45] last:border-0">
                          <div>
                            <div className="text-sm font-semibold text-white">{w.type}</div>
                            <div className="text-xs text-gray-500">{w.depth}</div>
                          </div>
                          <span className="font-bold text-sm" style={{ color: w.color }}>{w.range}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#0a0e1a] border border-[#1e2a45] rounded-xl p-4">
                <div className="text-sm font-semibold text-amber-400 mb-3">AFE Approval Workflow</div>
                <div className="flex items-center gap-2 flex-wrap">
                  {['Well Engineer prepares AFE', '→ Drilling Manager reviews', '→ Finance validates cost model', '→ Risk Board (if > $10M)', '→ VP / Board approval', '→ AFE issued with WBS codes', '→ PO creation authorized'].map((step, i) => (
                    <div key={i} className={`text-xs px-3 py-2 rounded-lg ${step.startsWith('→') ? 'text-gray-500' : 'bg-[#0f1629] border border-[#1e2a45] text-gray-300'}`}>{step}</div>
                  ))}
                </div>
              </div>

              <div className="bg-[#0f1629] border-l-4 border-amber-500 rounded-xl p-4">
                <div className="text-xs text-amber-400 font-semibold mb-1">BAYESIAN WELL COST FORECASTER</div>
                <div className="text-sm text-gray-200 font-mono">
                  AFE_estimate ~ Normal(μ, σ²) where μ = f(well_type, depth, complexity)<br/>
                  P10/P50/P90 uncertainty bounds based on offset well AFE database<br/>
                  Accuracy improvement: <span className="text-amber-400">±35% (deterministic) → ±12% (Bayesian)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WELLBORE DESIGN */}
          {activeTab === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white">Wellbore Design</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#0a0e1a] border border-[#1e2a45] rounded-xl p-4">
                  <div className="text-sm font-semibold text-amber-400 mb-3">Wellbore Schematic — Casing Architecture</div>
                  <WellboreSchematic />
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    {[
                      { label: '30" Conductor', color: '#eab308' }, { label: '20" Surface', color: '#93c5fd' },
                      { label: '13-3/8" Intermediate', color: '#f97316' }, { label: '9-5/8" Production', color: '#10b981' },
                      { label: '7" Liner', color: '#a855f7' }, { label: 'Perforations', color: '#f59e0b' },
                    ].map((l, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ background: l.color }} />
                        <span className="text-gray-400">{l.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-[#0f1629] border-l-4 border-amber-500 rounded-xl p-4">
                    <div className="text-xs text-amber-400 font-semibold mb-2">TORQUE & DRAG MODEL</div>
                    <div className="text-xs text-gray-300 font-mono space-y-1">
                      <div>Hookload_tripping_in = W_string - F_friction</div>
                      <div>Hookload_tripping_out = W_string + F_friction</div>
                      <div>F_friction = μ × N (normal force at contact points)</div>
                      <div>N = function(WOB, DLS, pipe OD, inclination)</div>
                      <div className="text-amber-400 mt-2">DLS (°/30m) = (30/ΔMD) × arccos[sin(I₁)·sin(I₂)·cos(A₂-A₁) + cos(I₁)·cos(I₂)]</div>
                    </div>
                  </div>
                  <div className="bg-[#0f1629] border-l-4 border-amber-500 rounded-xl p-4">
                    <div className="text-xs text-amber-400 font-semibold mb-2">MSE — MECHANICAL SPECIFIC ENERGY</div>
                    <div className="text-xs text-gray-300 font-mono space-y-1">
                      <div className="text-amber-400 font-bold">MSE = (WOB/A_bit) + (120π × RPM × TQ) / (A_bit × ROP)</div>
                      <div className="mt-2 text-gray-500">WOB = weight on bit (N)</div>
                      <div className="text-gray-500">A_bit = bit cross-sectional area (m²)</div>
                      <div className="text-gray-500">TQ = surface torque (N·m)</div>
                      <div className="text-gray-500">ROP = rate of penetration (m/hr)</div>
                      <div className="text-green-400 mt-2">Minimum MSE → maximum drilling efficiency</div>
                    </div>
                  </div>
                  <div className="bg-[#0a0e1a] border border-[#1e2a45] rounded-xl p-4">
                    <div className="text-sm font-semibold text-amber-400 mb-3">BHA — Bottom Hole Assembly</div>
                    <div className="space-y-1">
                      {['PDC Drill Bit (8-1/2")', '→ Positive Displacement Motor (PDM) / RSS', '→ Bit Sub', '→ LWD (GR + Resistivity + Density + Neutron)', '→ MWD (Inclination/Azimuth/Toolface)', '→ HWDP (Heavy Weight Drill Pipe) × 12 joints', '→ Drill Collars (BHA stabilization)', '→ Hydraulic Jar (fishing contingency)', '→ Standard Drill Pipe to surface'].map((c, i) => (
                        <div key={i} className="text-xs text-gray-300 flex gap-2">
                          <span className="text-amber-500 w-4 flex-shrink-0">{i === 0 ? '⬇' : ''}</span>
                          <span>{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AI INTEGRATION */}
          {activeTab === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">AI Integration Map — 10 Tools</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#1e2a45]">
                      {['#', 'Tool Name', 'Model Type', 'Inputs → Output', 'Improvement', 'Kaggle Dataset', 'Link'].map(h => (
                        <th key={h} className="text-left text-amber-400 font-semibold py-3 pr-4 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {AI_TOOLS.map((t, i) => (
                      <tr key={i} className="border-b border-[#1e2a45] hover:bg-[#0a0e1a]">
                        <td className="py-3 pr-4 text-amber-400 font-bold">{t.num}</td>
                        <td className="py-3 pr-4 text-white font-semibold">{t.name}</td>
                        <td className="py-3 pr-4 text-purple-400">{t.model}</td>
                        <td className="py-3 pr-4 text-gray-300 max-w-xs">
                          <div className="text-gray-400">{t.inputs}</div>
                          <div className="text-green-400 mt-1">→ {t.output}</div>
                        </td>
                        <td className="py-3 pr-4 text-green-400 font-semibold min-w-[160px]">{t.improvement}</td>
                        <td className="py-3 pr-4 text-blue-400">{t.dataset}</td>
                        <td className="py-3 pr-4">
                          <a href={t.link} className="text-amber-400 hover:text-amber-200 underline">{t.link}</a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: DECISION GATES */}
          {activeTab === 5 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Well Lifecycle Decision Gates (DG-1 to DG-10)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DECISION_GATES.map((dg, i) => (
                  <div key={i} className="bg-[#0a0e1a] rounded-xl p-4" style={{ border: `1px solid ${dg.color}22`, borderLeft: `4px solid ${dg.color}` }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold font-mono" style={{ color: dg.color }}>{dg.id}</span>
                        <span className="text-sm font-semibold text-white">{dg.name}</span>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: `${dg.color}22`, color: dg.color }}>{dg.stage}</span>
                    </div>
                    <div className="space-y-1 mt-3">
                      {dg.criteria.map((c, j) => (
                        <div key={j} className="flex gap-2 text-xs">
                          <span className="text-green-400 flex-shrink-0">✓</span>
                          <span className="text-gray-300">{c}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-2 border-t border-[#1e2a45]">
                      <span className="text-xs text-gray-500">Authority: </span>
                      <span className="text-xs text-amber-400">{dg.authority}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: REGULATORY */}
          {activeTab === 6 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white">Canadian Regulatory Requirements</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#1e2a45]">
                      {['Directive / Regulation', 'Scope', 'Drilling Stage', 'Jurisdiction'].map(h => (
                        <th key={h} className="text-left text-amber-400 font-semibold py-3 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {REGULATORY.map((r, i) => (
                      <tr key={i} className="border-b border-[#1e2a45] hover:bg-[#0a0e1a]">
                        <td className="py-3 pr-4 text-amber-400 font-semibold">{r.directive}</td>
                        <td className="py-3 pr-4 text-gray-300">{r.scope}</td>
                        <td className="py-3 pr-4 text-blue-400">{r.stage}</td>
                        <td className="py-3 pr-4 text-gray-400">{r.jurisdiction}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#0f1629] border-l-4 border-amber-500 rounded-xl p-4">
                  <div className="text-xs text-amber-400 font-semibold mb-2">EPZ CALCULATION (H2S Sour Wells)</div>
                  <div className="text-xs text-gray-300 font-mono space-y-1">
                    <div className="text-amber-400 font-bold">EPZ_radius = f(H2S_rate, wind_speed, stability_class)</div>
                    <div>H2S_rate = well_flow_rate × H2S_mole_fraction</div>
                    <div>Stability class: Pasquill-Gifford A-F</div>
                    <div>Dispersion model: Gaussian plume (AERMOD/CALPUFF)</div>
                    <div className="text-green-400 mt-2">Threshold: 10 ppm (LC50 basis for EPZ boundary)</div>
                    <div className="text-gray-500">AER Directive 056 — EPZ approval required before spud</div>
                  </div>
                </div>
                <div className="bg-[#0a0e1a] border border-[#1e2a45] rounded-xl p-4">
                  <div className="text-sm font-semibold text-amber-400 mb-3">Well License Application Checklist</div>
                  {['Well location (LSD/QS) coordinates confirmed', 'Bottom-hole location (TVD/MD/azimuth)', 'Well type (exploration/development/injection)', 'Target formation name and zone', 'Expected H2S content (mol%)', 'Surface casing depth (AER D008 calculation)', 'Proposed spud and rig release dates', 'Operator/licensee information', 'Surface lease or access agreement', 'Environmental assessment or screening report'].map((item, i) => (
                    <div key={i} className="flex gap-2 text-xs py-1 border-b border-[#1e2a45] last:border-0">
                      <span className="text-green-400">□</span>
                      <span className="text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: CASING & CEMENT */}
          {activeTab === 7 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white">Casing Design & Well Control Formulas</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#1e2a45]">
                      {['String', 'OD', 'Wt (lb/ft)', 'Grade', 'Conn.', 'Depth (m)', 'Burst (kPa)', 'Collapse (kPa)', 'Purpose'].map(h => (
                        <th key={h} className="text-left text-amber-400 font-semibold py-3 pr-3 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {CASING_STRINGS.map((c, i) => (
                      <tr key={i} className="border-b border-[#1e2a45] hover:bg-[#0a0e1a]">
                        <td className="py-3 pr-3 text-amber-400 font-semibold">{c.string}</td>
                        <td className="py-3 pr-3 text-white font-mono">{c.od}</td>
                        <td className="py-3 pr-3 text-gray-300">{c.weight}</td>
                        <td className="py-3 pr-3 text-blue-400">{c.grade}</td>
                        <td className="py-3 pr-3 text-gray-400">{c.connection}</td>
                        <td className="py-3 pr-3 text-green-400 font-semibold">{c.depth}m</td>
                        <td className="py-3 pr-3 text-orange-400">{c.burst}</td>
                        <td className="py-3 pr-3 text-purple-400">{c.collapse}</td>
                        <td className="py-3 pr-3 text-gray-400">{c.purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0f1629] border-l-4 border-amber-500 rounded-xl p-4 space-y-3">
                  <div className="text-xs text-amber-400 font-semibold">WELL CONTROL KILL FORMULAS</div>
                  <div className="space-y-3">
                    <div className="bg-[#0a0e1a] rounded-lg p-3">
                      <div className="text-xs text-green-400 font-semibold mb-1">Kill Mud Weight (KMW)</div>
                      <div className="text-sm text-white font-mono">KMW = OMW + (SIDP / (0.00695 × TVD_m))</div>
                      <div className="text-xs text-gray-500 mt-1">units: KMW, OMW in kg/m³ | SIDP in kPa | TVD in metres</div>
                    </div>
                    <div className="bg-[#0a0e1a] rounded-lg p-3">
                      <div className="text-xs text-green-400 font-semibold mb-1">Initial Circulating Pressure (ICP)</div>
                      <div className="text-sm text-white font-mono">ICP = SIDP + SCR_pressure</div>
                      <div className="text-xs text-gray-500 mt-1">SCR = slow circulating rate (typically 30-40 spm)</div>
                    </div>
                    <div className="bg-[#0a0e1a] rounded-lg p-3">
                      <div className="text-xs text-green-400 font-semibold mb-1">Final Circulating Pressure (FCP)</div>
                      <div className="text-sm text-white font-mono">FCP = SCR × (KMW / OMW)</div>
                    </div>
                    <div className="bg-[#0a0e1a] rounded-lg p-3">
                      <div className="text-xs text-green-400 font-semibold mb-1">Maximum Allowable Annular Surface Pressure (MAASP)</div>
                      <div className="text-sm text-white font-mono">MAASP = (LOT_MW − OMW) × 0.00695 × TVD_shoe</div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0f1629] border-l-4 border-blue-500 rounded-xl p-4">
                  <div className="text-xs text-blue-400 font-semibold mb-3">CEMENT SLURRY DESIGN (Class G)</div>
                  <div className="space-y-2">
                    {[
                      { label: 'Cement Type', value: 'Class G (API spec 10A)' },
                      { label: 'Slurry Density', value: '1.89 SG (15.8 ppg)' },
                      { label: 'Water-Cement Ratio', value: '44% BWOC (by weight of cement)' },
                      { label: 'Slurry Volume', value: '0.590 ft³/sack (16.7 L/sack)' },
                      { label: 'Yield', value: '1.15 ft³/sack (32.6 L/sack)' },
                      { label: 'Top of Cement (TOC)', value: 'Surface (mandatory per AER D008)' },
                      { label: 'WOC Time', value: '8 hours minimum (first 200m)' },
                      { label: 'Pressure Test', value: '6.9 MPa (1000 psi) for 30 min' },
                    ].map((r, i) => (
                      <div key={i} className="flex justify-between text-xs py-1 border-b border-[#1e2a45] last:border-0">
                        <span className="text-gray-400">{r.label}</span>
                        <span className="text-gray-200 font-semibold text-right">{r.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: SENSORS & LWD */}
          {activeTab === 8 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white">Real-Time Sensor Streams & LWD</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#1e2a45]">
                      {['Sensor', 'Unit', 'Type', 'Range', 'Update Rate', 'Alarm Threshold', 'AI Alert'].map(h => (
                        <th key={h} className="text-left text-amber-400 font-semibold py-3 pr-3 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SENSOR_STREAMS.map((s, i) => (
                      <tr key={i} className="border-b border-[#1e2a45] hover:bg-[#0a0e1a]">
                        <td className="py-2 pr-3 text-amber-400 font-semibold">{s.name}</td>
                        <td className="py-2 pr-3 text-white font-mono">{s.unit}</td>
                        <td className="py-2 pr-3 text-gray-400">{s.type}</td>
                        <td className="py-2 pr-3 text-blue-400">{s.range}</td>
                        <td className="py-2 pr-3 text-gray-300">{s.rate}</td>
                        <td className="py-2 pr-3 text-red-400">{s.alarm}</td>
                        <td className="py-2 pr-3 text-purple-400">{s.ai}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#0a0e1a] border border-[#1e2a45] rounded-xl p-4">
                  <div className="text-sm font-semibold text-amber-400 mb-3">LWD Measurement Suite</div>
                  {[
                    { meas: 'Gamma Ray (GR)', unit: 'API', use: 'Lithology, shale volume (Vsh), formation tops' },
                    { meas: 'Resistivity — Deep', unit: 'Ω·m', use: 'Fluid type (oil/gas/water), Sw via Archie equation' },
                    { meas: 'Resistivity — Med/Shallow', unit: 'Ω·m', use: 'Invasion profile, mud filtrate detection' },
                    { meas: 'Density (ρb)', unit: 'g/cm³', use: 'Porosity (φ_D), lithology, gas effect' },
                    { meas: 'Neutron Porosity (φ_N)', unit: 'pu', use: 'Hydrogen index, porosity, gas crossplot with density' },
                    { meas: 'Sonic (DT)', unit: 'μs/ft', use: 'Mechanical rock properties, pore pressure, permeability' },
                  ].map((l, i) => (
                    <div key={i} className="py-2 border-b border-[#1e2a45] last:border-0">
                      <div className="flex justify-between">
                        <span className="text-white font-semibold text-xs">{l.meas}</span>
                        <span className="text-blue-400 text-xs font-mono">{l.unit}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{l.use}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <div className="bg-[#0f1629] border-l-4 border-amber-500 rounded-xl p-4">
                    <div className="text-xs text-amber-400 font-semibold mb-2">DOGLEG SEVERITY (DLS)</div>
                    <div className="text-xs text-gray-300 font-mono">
                      <div className="text-amber-400 font-bold text-sm">DLS = (30/ΔMD) × arccos[</div>
                      <div className="pl-4">sin(I₁)·sin(I₂)·cos(A₂-A₁)</div>
                      <div className="pl-4">+ cos(I₁)·cos(I₂)]</div>
                      <div className="mt-2 text-gray-500">I = inclination (°), A = azimuth (°), ΔMD = course length (m)</div>
                      <div className="text-green-400 mt-1">Max DLS: 3–5°/30m (standard build); &gt;8°/30m requires review</div>
                    </div>
                  </div>
                  <div className="bg-[#0f1629] border-l-4 border-amber-500 rounded-xl p-4">
                    <div className="text-xs text-amber-400 font-semibold mb-2">ARCHIE EQUATION (Water Saturation)</div>
                    <div className="text-xs text-gray-300 font-mono">
                      <div className="text-amber-400 font-bold text-sm">Sw = (a × Rw / (φ^m × Rt))^(1/n)</div>
                      <div className="mt-2 text-gray-500">a = tortuosity factor (~1.0)</div>
                      <div className="text-gray-500">m = cementation exponent (1.8–2.0)</div>
                      <div className="text-gray-500">n = saturation exponent (~2.0)</div>
                      <div className="text-gray-500">Rw = formation water resistivity (Ω·m)</div>
                      <div className="text-gray-500">Rt = true formation resistivity from LWD</div>
                      <div className="text-green-400 mt-1">Commercial: Sw &lt; 0.5 (50% water saturation)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: SUB-PROCESSES */}
          {activeTab === 9 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">47 Sub-Processes — 6 Categories</h2>
                <span className="text-xs text-gray-500">{Object.values(SUB_PROCESS_CATEGORIES).flat().length} total sub-processes</span>
              </div>

              <div className="space-y-2">
                {Object.entries(SUB_PROCESS_CATEGORIES).map(([cat, procs]) => {
                  const catColors: Record<string, string> = {
                    'PRE-DRILL': '#3b82f6', 'EXECUTION': '#f59e0b', 'RESERVOIR SECTION': '#10b981',
                    'WELL CONTROL': '#ef4444', 'COMPLETION': '#a855f7', 'HANDOVER/P&A': '#6b7280',
                  };
                  const color = catColors[cat] ?? '#f59e0b';
                  const isOpen = openAccordion === cat;
                  return (
                    <div key={cat} className="bg-[#0a0e1a] rounded-xl overflow-hidden" style={{ border: `1px solid ${color}33` }}>
                      <button
                        onClick={() => setOpenAccordion(isOpen ? null : cat)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#0f1629] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                          <span className="text-sm font-semibold" style={{ color }}>{cat}</span>
                          <span className="text-xs text-gray-500">{procs.length} sub-processes</span>
                        </div>
                        <span className="text-gray-500 text-lg">{isOpen ? '−' : '+'}</span>
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                            {procs.map((proc, i) => (
                              <div key={i} className="flex gap-2 text-xs p-2 rounded-lg bg-[#0f1629]">
                                <span className="text-gray-600 font-mono min-w-[24px]">{String(i + 1).padStart(2, '0')}.</span>
                                <span className="text-gray-300">{proc}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6">
                <div className="text-sm font-semibold text-amber-400 mb-3">Well Control Process Flowchart</div>
                <div className="bg-[#0a0e1a] border border-[#1e2a45] rounded-xl p-4">
                  <WellControlFlowchart />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-3 flex items-center justify-between text-xs text-gray-600">
        <span>Data source: {apiData?._source === 'db' ? '✅ Live DB' : '⚠️ Static fallback'}</span>
        <span>Oil &amp; Gas Operations Portal — Upstream → Drilling → Process Flow</span>
        <span>{new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
      </div>
    </div>
  );
}
