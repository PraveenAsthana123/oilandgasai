export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// ─── Schema bootstrap ───────────────────────────────────────────────────────

async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ogo_process (
      id            SERIAL PRIMARY KEY,
      process_id    VARCHAR(32) UNIQUE NOT NULL,
      process_name  TEXT NOT NULL,
      stream        VARCHAR(32) NOT NULL,
      description   TEXT,
      created_at    TIMESTAMPTZ DEFAULT NOW(),
      updated_at    TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS ogo_process_step (
      id            SERIAL PRIMARY KEY,
      process_id    VARCHAR(32) NOT NULL REFERENCES ogo_process(process_id) ON DELETE CASCADE,
      step_number   INT NOT NULL,
      step_name     TEXT NOT NULL,
      phase         VARCHAR(32),
      duration      TEXT,
      activities    TEXT[],
      deliverables  TEXT[],
      responsible   TEXT[],
      ai_tools      JSONB DEFAULT '[]',
      kpis          JSONB DEFAULT '[]',
      decision_gate JSONB,
      regulatory    TEXT,
      kaggle_data   TEXT,
      created_at    TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(process_id, step_number)
    );
    CREATE TABLE IF NOT EXISTS ogo_drilling_subprocesses (
      id            SERIAL PRIMARY KEY,
      sp_id         VARCHAR(8) UNIQUE NOT NULL,
      name          TEXT NOT NULL,
      category      VARCHAR(64),
      phase         VARCHAR(64),
      duration      TEXT,
      key_inputs    TEXT[],
      key_outputs   TEXT[],
      responsible   TEXT,
      ai_model      TEXT,
      regulatory    TEXT,
      created_at    TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}

// ─── Phase definitions ───────────────────────────────────────────────────────

const PHASES = [
  {
    step_number: 1,
    step_name: 'Well Concept & Target Definition',
    phase: 'planning',
    duration: '2–6 weeks',
    activities: [
      'Integrate seismic interpretation, reservoir model, and field development plan',
      'Define well objective (exploration/appraisal/development/infill)',
      'Define target zone, TD depth, expected formation pressures',
      'Develop geological prognosis and target coordinates',
      'Establish PP/FG (pore pressure / fracture gradient) prognosis from offset wells',
    ],
    deliverables: [
      'Well Proposal Document (WPD)',
      'Geological Prognosis',
      'Target coordinates (KOP/azimuth/inclination)',
      'PP/FG prognosis curve',
      'Expected formation pressure profile',
    ],
    responsible: ['Exploration Geologist', 'Reservoir Engineer', 'Drilling Engineer'],
    ai_tools: [
      { name: 'Target Depth Optimizer', type: 'ML Regression', desc: 'ML from offset well results — predicts optimal well trajectory to maximize reservoir contact', value: 'Optimal TVD / azimuth recommendation' },
      { name: 'Resource Estimator', type: 'Monte Carlo', desc: 'Monte Carlo simulation for target size uncertainty — P10/P50/P90 range', value: 'Probabilistic resource range (MMboe)' },
    ],
    decision_gate: { id: 'DG-1', name: 'Well Concept Approval', go: 'EMV > 0, resource > threshold, strategic fit confirmed', nogo: 'Negative EMV, below minimum threshold', owner: 'VP Exploration' },
    regulatory: 'Well proposal review by AER (initial screening)',
    kaggle_data: null,
  },
  {
    step_number: 2,
    step_name: 'Well Design',
    phase: 'planning',
    duration: '3–8 weeks',
    activities: [
      'Casing design — burst/collapse/tension/biaxial loading analysis for each string',
      'PP/FG profile plotting — establish mud weight window at every depth',
      'BHA design (bit → NBS → motor → MWD → LWD → HWDP → DC → jar → DP)',
      'Well trajectory design (KOP, build rate, landing inclination, azimuth)',
      'Torque & drag analysis (trip-in/out hookload and surface torque)',
    ],
    deliverables: ['Casing Design Report', 'BHA Design Spec', 'Well Trajectory Plan', 'Torque & Drag Model', 'PP/FG Prognosis Plot'],
    responsible: ['Drilling Engineer', 'Wellbore Stability Engineer', 'Directional Drilling Contractor'],
    ai_tools: [
      { name: 'Casing Seat Selector', type: 'ML Classification', desc: 'ML from offset PP/FG data — selects optimal casing seats to avoid kicks and losses', value: 'Optimal casing setting depths' },
      { name: 'BHA Optimizer', type: 'ML Recommendation', desc: 'ML recommends BHA components based on hole size, formation, deviation target', value: 'Optimal BHA configuration' },
      { name: 'Wellbore Stability ML', type: 'ML Regression', desc: 'Predict formation breakdown pressure and collapse pressure from rock mechanics data', value: 'Safe mud weight window per depth' },
    ],
    decision_gate: { id: 'DG-2', name: 'AFE Approval', go: 'Costs within budget, regulatory permits obtainable, well design sound', nogo: 'Costs exceed sanction, design unworkable', owner: 'CFO / Board' },
    regulatory: 'Well design submitted with AER Well License Application',
    kaggle_data: 'well-logs dataset (GR, RHOB, NPHI, DT per depth — proxy for formation property inputs to wellbore stability model)',
  },
  {
    step_number: 3,
    step_name: 'Mud Program Design',
    phase: 'planning',
    duration: '1–3 weeks',
    activities: [
      'Select mud system: WBM / OBM / SBM based on formation, temperature, environment',
      'Design mud properties: density, PV, YP, gel strength, fluid loss, pH, chlorides',
      'Establish mud weighting window (min = PP + 0.1 SG, max = FG - 0.05 SG)',
      'Plan lost circulation material (LCM) inventory',
      'Design solid control equipment program',
    ],
    deliverables: ['Mud Program Document', 'Mud Property Tables per section', 'Chemical inventory list', 'LCM stockpile plan'],
    responsible: ['Mud Engineer', 'Drilling Engineer'],
    ai_tools: [
      { name: 'Mud Weight Optimizer', type: 'Real-Time ML', desc: 'Adjusts mud weight based on live MWD PWD data to stay in window throughout drilling', value: 'Real-time mud weight setpoint recommendation' },
      { name: 'Lost Circulation Predictor', type: 'ML Time Series', desc: 'ML from mud weight + ROP + LWD data — predicts lost circulation events 2 hrs ahead', value: '2-hr early warning — saves $50-150K/event' },
      { name: 'Rheology Optimizer', type: 'ML Regression', desc: 'Recommends additive dosing to maintain target rheology in changing temperatures', value: 'Optimal additive volume (L per tank)' },
    ],
    decision_gate: null,
    regulatory: 'OBM/SBM disposal plan filed with AER (Directive 050 — drilling waste management)',
    kaggle_data: 'pipeline-operations dataset (pressure proxy for PWD readings)',
  },
  {
    step_number: 4,
    step_name: 'Regulatory & Permitting (Alberta/Canada)',
    phase: 'planning',
    duration: '2–8 weeks',
    activities: [
      'AER Well License Application (WLA) — provide LSD, bottom-hole location, well type, target formation, H2S content',
      'Environmental screening — ESRD assessment if near water bodies',
      'Indigenous consultation (UNDRIP — 21-day notification period)',
      'Crown surface lease or freehold license-to-occupy',
      'H2S Emergency Response Plan (ERP) if sour well (>1 mol% H2S)',
      'EPZ (Emergency Planning Zone) calculation for sour wells',
    ],
    deliverables: ['AER Well License', 'Surface Lease', 'Environmental Clearance', 'H2S ERP (if applicable)', 'Indigenous Consultation Record'],
    responsible: ['Regulatory Affairs Specialist', 'Land Agent', 'HSE Manager'],
    ai_tools: [
      { name: 'Permit Timeline Predictor', type: 'ML Classification', desc: 'ML from historical AER processing times — predicts submission-to-approval time, flags bottlenecks', value: 'Expected approval date, bottleneck alert' },
      { name: 'Regulatory Risk Assessor', type: 'ML Multi-label', desc: 'ML from well parameters — flags sour well triggers, environmental sensitivities, consultation requirements', value: 'Risk flag report per directive' },
    ],
    decision_gate: { id: 'DG-3', name: 'Rig Release to Drill', go: 'All permits secured, BOP tested, crew inducted, site ready', nogo: 'Permits denied or pending, failed BOP test', owner: 'Drilling Manager' },
    regulatory: 'AER Directives: 056 (well licensing), 050 (drilling waste), ESRD Environmental Assessment Act, UNDRIP consultation',
    kaggle_data: null,
  },
  {
    step_number: 5,
    step_name: 'Spud & Surface Section',
    phase: 'active',
    duration: '3–10 days',
    activities: [
      'Drive or drill conductor (30", 15-25m into competent overburden)',
      'Drill 17-1/2" surface hole for 13-3/8" surface casing',
      'Run and cement 13-3/8" surface casing — cement returns to surface mandatory',
      'Install BOP stack (annular + pipe rams + blind/shear rams)',
      'BOP pressure test: low test 200-300 psi, high test to rated WHP',
      'Verify groundwater protection (cased to 50m below base of usable groundwater)',
    ],
    deliverables: ['Casing Tally & Inspection Report', 'Cement Job Report', 'BOP Test Record (signed)', 'Wellhead Installation Report'],
    responsible: ['Drilling Supervisor', 'Casing Crew', 'Cementing Engineer', 'BOP Specialist'],
    ai_tools: [
      { name: 'Cement Quality Predictor', type: 'ML Regression', desc: 'ML from BHCT/density/pump rate — predicts cement top and quality before CBL logging', value: 'Predicted cement top depth ± 20m' },
      { name: 'Casing Wear Monitor', type: 'ML Time Series', desc: 'ML from WOB/RPM/contact time — predicts casing wear at dogleg severity points', value: 'Wear alert before ID threshold exceeded' },
    ],
    decision_gate: { id: 'DG-4', name: 'Case Casing (Surface)', go: 'Cement to surface confirmed, BOP tested, no well control incidents', nogo: 'Lost circulation, cement failure, BOP test failure', owner: 'Wellsite Supervisor' },
    regulatory: 'AER Directive 008: surface casing depth requirements; Directive 009: BOP testing requirements',
    kaggle_data: null,
  },
  {
    step_number: 6,
    step_name: 'Drilling the Reservoir Section',
    phase: 'active',
    duration: '15–45 days',
    activities: [
      'Directional drilling: KOP, build section, tangent, landing in reservoir',
      'Real-time geosteering using LWD GR/resistivity to stay in zone',
      'ROP optimization: WOB/RPM/flow rate real-time adjustment (minimize MSE)',
      'Mud logging: continuous monitoring of ROP, gas, cuttings, pit volume',
      'Well control monitoring: pit volume, flow check, SICP watch',
      'Wireline or LWD log suite acquisition across reservoir',
    ],
    deliverables: ['LWD Log File (DLIS/LAS)', 'Directional Survey File (WITSML)', 'Mud Log (paper + digital)', 'Daily Drilling Reports', 'Gas Show Record'],
    responsible: ['Drilling Engineer', 'Directional Driller', 'Mud Logger', 'Petrophysicist', 'Well Site Supervisor'],
    ai_tools: [
      { name: 'Geosteering AI', type: 'ML + RL', desc: 'LWD GR/resistivity + geological model — real-time drill up/down/straight recommendation to maximize time-in-zone', value: '95% time-in-zone vs 75% without AI (+$500K/well NPV)' },
      { name: 'ROP Optimizer', type: 'Real-Time ML', desc: 'Inputs WOB/RPM/flow/formation type → outputs optimal WOB/RPM to maximize ROP while staying in safe operating envelope', value: '20-30% ROP improvement → 3-5 days/well → $300-500K CAD/well' },
      { name: 'Early Kick Detection', type: 'Statistical ML', desc: 'Pit volume + flow in/out + SICP trends → kick probability %, 15-min early warning', value: 'Prevents well control events ($2-10M per event)' },
      { name: 'Stuck Pipe Predictor', type: 'ML Classification', desc: 'WOB/torque/ECD/overpull trends → stuck pipe probability 30-min ahead', value: 'Prevents $500K+ per stuck pipe event' },
    ],
    decision_gate: { id: 'DG-5', name: 'Enter Reservoir', go: 'Mud weight in PP/FG window, BHA ready, no wellbore instability', nogo: 'PP/FG window too narrow, unstable wellbore, well control event', owner: 'Drilling Engineer' },
    regulatory: 'AER: daily drilling reports if required; mud log continuous; kick reports within 48 hrs',
    kaggle_data: 'machine-maintenance (WOB/RPM/torque/tool_wear proxy), well-logs (GR/RHOB/NPHI/DT/Rt), well-facies (lithology labels)',
  },
  {
    step_number: 7,
    step_name: 'Petrophysical Evaluation (Wireline Logging)',
    phase: 'active',
    duration: '1–3 days',
    activities: [
      'Run wireline log suite: GR, SP, Caliper, Resistivity (shallow/medium/deep), Density, Neutron, Sonic, NMR, FMI',
      'MDT pressure testing at key reservoir intervals',
      'Archie equation application: Sw = (a×Rw / (ϕ^m × Rt))^(1/n)',
      'Net pay calculation: Vshale < 0.35, ϕ > 0.08, Sw < 0.65, k > 0.1 mD',
      'Fluid typing from density-neutron crossplot',
    ],
    deliverables: ['Wireline Log Suite (LAS/DLIS)', 'MDT Pressure Report', 'Petrophysical Evaluation Report', 'Net Pay Summary', 'Fluid Contact Estimates'],
    responsible: ['Petrophysicist', 'Wireline Engineer', 'Reservoir Engineer'],
    ai_tools: [
      { name: 'Automated Facies Classifier', type: 'ML Classification', desc: 'ML on GR/RHOB/NPHI/Rt/DT → classify rock types per depth (clean sand/shaly sand/shale/carbonate/coal)', value: '4 hrs manual → 10 min automated' },
      { name: 'Fluid Typing AI', type: 'ML Crossplot', desc: 'ML crossplot RHOB+NPHI+resistivity → oil/gas/water classification without manual interpretation', value: 'Eliminates DST on non-commercial zones → saves $500K/well' },
      { name: 'Petrophysical Property Predictor', type: 'ML Regression', desc: 'Predict porosity/permeability from seismic attributes for unlogged intervals', value: 'Full reservoir volume characterization from sparse wells' },
    ],
    decision_gate: { id: 'DG-6', name: 'Core / No Core', go: 'Log shows reservoir above threshold quality', nogo: 'Below economic cutoff on all log criteria', owner: 'Petrophysicist' },
    regulatory: 'Log data submission to AER in LAS format within 30 days of rig release',
    kaggle_data: 'well-logs dataset (GR, RHOB, NPHI, DT, Rt per depth), well-facies dataset (facies classification labels)',
  },
  {
    step_number: 8,
    step_name: 'Well Completion',
    phase: 'completion',
    duration: '5–20 days',
    activities: [
      'Perforation design: shot density (shots/m), phasing (0°/60°/120°), charge selection',
      'Hydraulic fracturing (if tight formation): fluid/proppant design, pump rate, treating pressure',
      'Sand control installation (screens, gravel pack, frac-pack)',
      'Tubing running and packer setting at designed depth',
      'Christmas tree installation (gate valves, choke, wing valves)',
    ],
    deliverables: ['Perforation Design Report', 'Frac Job Report (if applicable)', 'Completion Schematic', 'Tubing Running Report', 'Christmas Tree Installation Report'],
    responsible: ['Completions Engineer', 'Frac Engineer', 'Wireline Engineer', 'Wellsite Supervisor'],
    ai_tools: [
      { name: 'Completion Optimizer', type: 'ML', desc: 'Log analysis + offset well production → recommend optimal perf intervals, frac stage count, fluid/proppant design', value: '15-25% production improvement vs manual design' },
      { name: 'Fracture Geometry Predictor', type: 'ML', desc: 'Microseismic data → estimate fracture half-length and height', value: 'Validate fracture design vs execution' },
      { name: 'Screen Plugging Risk Predictor', type: 'ML', desc: 'Fines content + flow velocity → predict screen plugging rate and time-to-plug', value: 'Optimizes screen design to extend service life' },
    ],
    decision_gate: { id: 'DG-8', name: 'Complete / Abandon', go: 'Test results confirm commercial rates, reservoir characterization positive', nogo: 'Sub-commercial flow rates on all criteria', owner: 'Asset Manager' },
    regulatory: 'AER Directive 007: injection well requirements (if applicable); Directive 083: well testing requirements',
    kaggle_data: 'well-logs dataset (used for completion interval selection)',
  },
  {
    step_number: 9,
    step_name: 'Well Testing (DST — Drill Stem Test)',
    phase: 'completion',
    duration: '2–7 days',
    activities: [
      'Set test string: perforations → packer → downhole gauges → surface test tree',
      'Flow sequence: Initial Flow (30 min) → Initial Shut-in (4 hr) → Main Flow (4-8 hr) → Final Shut-in (4-8 hr)',
      'Pressure transient analysis: Horner plot for k and skin',
      'Deliverability determination: AOF, PI, back-pressure curve',
      'Fluid sampling: PVT samples (recombination), separator oil/gas/water rates',
    ],
    deliverables: ['DST Report', 'Pressure Transient Analysis (PTA) Report', 'Fluid Sample PVT', 'Deliverability Curve', 'Wellbore Productivity Index (PI)'],
    responsible: ['Reservoir Engineer', 'Well Test Engineer', 'Production Chemist'],
    ai_tools: [
      { name: 'Automatic PTA Interpreter', type: 'ML', desc: 'ML on pressure transient data → automatic flow regime identification, kh and skin calculation without manual Horner plot', value: 'PTA turnaround: 3 days → 30 minutes' },
      { name: 'Well Productivity Predictor', type: 'ML', desc: 'Test results + formation properties → predict 5-year production forecast (P10/P50/P90)', value: 'Early production forecast for FDP update' },
    ],
    decision_gate: { id: 'DG-7', name: 'Test / No Test', go: 'Commercial reservoir indicated by log evaluation', nogo: 'Non-commercial on all log criteria', owner: 'Reservoir Engineer' },
    regulatory: 'AER Directive 083: test reporting requirements; flaring authorization required',
    kaggle_data: 'environmental-telemetry dataset (pressure/flow time series proxy)',
  },
  {
    step_number: 10,
    step_name: 'Handover to Production',
    phase: 'completion',
    duration: '3–10 days',
    activities: [
      'Final wellhead installation: tubing head spool, tubing hanger, SSV',
      'Flowback: clean out completion fluids, ramp up production gradually',
      'Initial well test: separator test (oil/gas/water rates), sampling',
      'Well file closure: compile all documents into well file',
      'Safety critical element (SECE) list transferred to production team',
    ],
    deliverables: ['Wellhead Inspection Certificate', 'Production Handover Package', 'Well File (all documents)', 'SECE Register', 'Emergency Response Plan'],
    responsible: ['Operations Engineer', 'Production Supervisor', 'Drilling Engineer', 'Safety Officer'],
    ai_tools: [
      { name: 'Handover Checklist AI', type: 'NLP', desc: 'NLP scans well file documents to verify all required elements are present and complete', value: 'Automated completeness check — reduces handover errors' },
    ],
    decision_gate: { id: 'DG-9', name: 'Handover', go: 'All documentation complete, SECE in place, no outstanding safety issues', nogo: 'Outstanding safety issues, incomplete data package', owner: 'Operations Manager' },
    regulatory: 'Well completion report submitted to AER within 30 days; production test report filed',
    kaggle_data: null,
  },
  {
    step_number: 11,
    step_name: 'Suspension & Plug & Abandon (P&A)',
    phase: 'closure',
    duration: '3–15 days (suspension); 5–25 days (P&A)',
    activities: [
      'Temporary suspension: cement plug across reservoir, cut and cap surface casing',
      'Permanent P&A: AER Directive 020/079',
      'Barrier 1: Cement plug across all open hole/perforated intervals + 50m above → pressure test to 6.9 MPa',
      'Barrier 2: Cement plug at base of surface casing → pressure test',
      'Barrier 3: Surface casing cut and capped at 1m below grade',
      'File abandonment report with regulator; site remediation',
    ],
    deliverables: ['P&A Program', 'Cement Plug Pressure Test Records', 'Abandonment Report', 'Remediation Certificate (Land Agent)'],
    responsible: ['Drilling Engineer', 'Regulatory Affairs', 'Land Agent', 'Environmental Specialist'],
    ai_tools: [
      { name: 'P&A Optimization', type: 'ML', desc: 'Well history → optimal plug placement depths, cement volume to minimize P&A cost while meeting regulatory requirements', value: '15-25% cost reduction vs manual planning' },
      { name: 'Plug Integrity Monitor', type: 'ML', desc: 'Pressure decay test data → classify plug integrity: sound/leaking/failed', value: 'Eliminates ambiguity in pressure test pass/fail' },
    ],
    decision_gate: { id: 'DG-10', name: 'P&A Sign-off', go: 'All plugs pressure tested, regulator notified, site remediated', nogo: 'Failed pressure test, outstanding remediation requirements', owner: 'Regulatory Affairs' },
    regulatory: 'AER Directive 020 (criteria for abandonment), Directive 079 (downhole pressure containment), remediation under AEPEA',
    kaggle_data: null,
  },
];

// ─── Sub-process library ─────────────────────────────────────────────────────

const SUBPROCESSES = [
  // PRE-DRILL
  { sp_id: 'SP-01', name: 'Well Proposal Preparation', category: 'PRE-DRILL', phase: 'Planning', duration: '1-2 wk', key_inputs: ['FDP', 'seismic interpretation', 'offset well data'], key_outputs: ['WPD', 'geological prognosis'], responsible: 'Exploration Geologist', ai_model: 'Resource Estimator (Monte Carlo)', regulatory: 'AER pre-application screening' },
  { sp_id: 'SP-02', name: 'Geological Prognosis', category: 'PRE-DRILL', phase: 'Planning', duration: '1-3 wk', key_inputs: ['Seismic interpretation', 'formation tops from offset wells', 'core data'], key_outputs: ['Expected lithology column', 'formation tops', 'expected GR/resistivity values'], responsible: 'Exploration Geologist', ai_model: 'Automated Facies Predictor', regulatory: null },
  { sp_id: 'SP-03', name: 'PP/FG Prognosis', category: 'PRE-DRILL', phase: 'Planning', duration: '1-2 wk', key_inputs: ['Offset well pressure data', 'sonic logs', 'seismic velocity'], key_outputs: ['PP/FG prognosis curve', 'mud weight window vs depth'], responsible: 'Drilling Engineer', ai_model: 'Wellbore Stability ML', regulatory: null },
  { sp_id: 'SP-04', name: 'Casing Design', category: 'PRE-DRILL', phase: 'Planning', duration: '1-2 wk', key_inputs: ['PP/FG prognosis', 'well TD', 'temperature profile'], key_outputs: ['Casing design report', 'casing specifications table'], responsible: 'Drilling Engineer', ai_model: 'Casing Seat Selector ML', regulatory: 'AER WLA submission' },
  { sp_id: 'SP-05', name: 'BHA Design', category: 'PRE-DRILL', phase: 'Planning', duration: '3-5 d', key_inputs: ['Hole size', 'formation type', 'deviation target'], key_outputs: ['BHA component list', 'BHA schematic'], responsible: 'Drilling Engineer', ai_model: 'BHA Optimizer ML', regulatory: null },
  { sp_id: 'SP-06', name: 'Mud Program Design', category: 'PRE-DRILL', phase: 'Planning', duration: '3-5 d', key_inputs: ['PP/FG prognosis', 'temperature', 'formation compatibility'], key_outputs: ['Mud program document', 'chemical inventory'], responsible: 'Mud Engineer', ai_model: 'Rheology Optimizer', regulatory: 'AER Directive 050 (waste)' },
  { sp_id: 'SP-07', name: 'Well Trajectory Design', category: 'PRE-DRILL', phase: 'Planning', duration: '3-5 d', key_inputs: ['Target coordinates', 'surface location', 'anti-collision data'], key_outputs: ['Well trajectory plan', 'survey program', 'anti-collision report'], responsible: 'Directional Drilling Engineer', ai_model: 'Trajectory Optimizer (RL)', regulatory: null },
  { sp_id: 'SP-08', name: 'Regulatory Application', category: 'PRE-DRILL', phase: 'Planning', duration: '3-7 wk', key_inputs: ['Well design', 'location coordinates', 'H2S content'], key_outputs: ['AER Well License', 'surface lease', 'environmental clearance'], responsible: 'Regulatory Affairs', ai_model: 'Permit Timeline Predictor', regulatory: 'AER Directive 056' },
  { sp_id: 'SP-09', name: 'Rig Procurement (RFQ → Contract)', category: 'PRE-DRILL', phase: 'Planning', duration: '4-12 wk', key_inputs: ['Well specifications', 'rig rating requirements', 'budget'], key_outputs: ['Evaluated rig list', 'rig contract', 'mob schedule'], responsible: 'Contracts Engineer', ai_model: 'Rig Selection ML', regulatory: null },
  { sp_id: 'SP-10', name: 'Site Construction & Access Road', category: 'PRE-DRILL', phase: 'Planning', duration: '1-4 wk', key_inputs: ['Site survey', 'environmental assessment', 'surface lease'], key_outputs: ['Drilling pad', 'access road', 'waste management pits'], responsible: 'Site Construction Contractor', ai_model: null, regulatory: 'ESRD land disturbance authorization' },
  // DRILLING EXECUTION
  { sp_id: 'SP-11', name: 'Conductor & Conductor Casing', category: 'DRILLING EXECUTION', phase: 'Active', duration: '1-2 d', key_inputs: ['Conductor design spec', 'surface formation data'], key_outputs: ['Conductor installed, set in competent ground'], responsible: 'Drilling Supervisor', ai_model: null, regulatory: null },
  { sp_id: 'SP-12', name: 'Surface Casing & Cementing', category: 'DRILLING EXECUTION', phase: 'Active', duration: '2-4 d', key_inputs: ['Surface casing design', 'cement slurry design', 'groundwater depth'], key_outputs: ['Surface casing cemented to surface', 'CBL log'], responsible: 'Cementing Engineer', ai_model: 'Cement Quality Predictor', regulatory: 'AER Directive 008 — surface casing depth; cement to surface mandatory' },
  { sp_id: 'SP-13', name: 'BOP Installation & Testing', category: 'DRILLING EXECUTION', phase: 'Active', duration: '4-8 hr', key_inputs: ['BOP spec (annular, pipe rams, shear rams)', 'test procedure'], key_outputs: ['BOP test certificate (low 200-300 psi + high test)'], responsible: 'BOP Specialist', ai_model: null, regulatory: 'AER Directive 009 — BOP testing requirements' },
  { sp_id: 'SP-14', name: 'Directional Drilling (Build Section)', category: 'DRILLING EXECUTION', phase: 'Active', duration: '5-15 d', key_inputs: ['KOP depth', 'build rate (°/30m)', 'target inclination and azimuth'], key_outputs: ['Directional survey file', 'DLS report', 'anti-collision clearance'], responsible: 'Directional Driller', ai_model: 'Trajectory Optimizer (RL)', regulatory: null },
  { sp_id: 'SP-15', name: 'ROP Optimization', category: 'DRILLING EXECUTION', phase: 'Active', duration: 'Continuous', key_inputs: ['WOB', 'RPM', 'flow rate', 'ECD', 'MSE'], key_outputs: ['Optimal WOB/RPM setpoints', 'MSE trend log'], responsible: 'Drilling Engineer', ai_model: 'ROP Optimizer ML', regulatory: null },
  { sp_id: 'SP-16', name: 'Mud Engineering (Daily Testing)', category: 'DRILLING EXECUTION', phase: 'Active', duration: 'Continuous', key_inputs: ['Mud sample', 'temperature', 'density target'], key_outputs: ['Daily mud report', 'treatment recommendations'], responsible: 'Mud Engineer', ai_model: 'Mud Weight Optimizer', regulatory: null },
  { sp_id: 'SP-17', name: 'Mud Logging (Cutting Description & Gas Detection)', category: 'DRILLING EXECUTION', phase: 'Active', duration: 'Continuous', key_inputs: ['Drill cuttings', 'gas trap sample', 'chromatograph'], key_outputs: ['Mud log (paper/digital)', 'gas show record', 'formation top calls'], responsible: 'Mud Logger', ai_model: 'Formation Lithology Classifier', regulatory: 'Continuous mud log submitted to AER' },
  { sp_id: 'SP-18', name: 'MWD/LWD Operations', category: 'DRILLING EXECUTION', phase: 'Active', duration: 'Continuous', key_inputs: ['BHA with MWD/LWD tools', 'WITS/WITSML connection'], key_outputs: ['Real-time azimuth/inclination', 'real-time GR/resistivity/density/neutron'], responsible: 'MWD/LWD Engineer', ai_model: 'Geosteering AI', regulatory: null },
  { sp_id: 'SP-19', name: 'Formation Evaluation (Real-Time Log Interpretation)', category: 'DRILLING EXECUTION', phase: 'Active', duration: 'Continuous', key_inputs: ['LWD log suite', 'geological prognosis'], key_outputs: ['Real-time lithology, porosity, fluid type estimate'], responsible: 'Petrophysicist', ai_model: 'Automated Facies Classifier', regulatory: null },
  { sp_id: 'SP-20', name: 'Intermediate Casing & Cementing', category: 'DRILLING EXECUTION', phase: 'Active', duration: '3-5 d', key_inputs: ['9-5/8" casing design', 'cement design', 'centralizer program'], key_outputs: ['Casing cemented, CBL/VDL log, casing test'], responsible: 'Cementing Engineer', ai_model: 'Cement Slurry Designer', regulatory: null },
  { sp_id: 'SP-21', name: 'Drill-Out (Cement + Float Equipment)', category: 'DRILLING EXECUTION', phase: 'Active', duration: '4-8 hr', key_inputs: ['Cement plug at shoe', 'PDC bit'], key_outputs: ['Shoe track drilled out', 'returns circulated clean'], responsible: 'Drilling Supervisor', ai_model: null, regulatory: null },
  { sp_id: 'SP-22', name: 'Wellbore Conditioning (Reaming / Wiper Trips)', category: 'DRILLING EXECUTION', phase: 'Active', duration: '4-24 hr', key_inputs: ['Caliper log (if available)', 'tight spot log from drilling'], key_outputs: ['Clean wellbore for logging', 'reduced drag'], responsible: 'Drilling Supervisor', ai_model: 'Torque & Drag Model', regulatory: null },
  // RESERVOIR SECTION & EVALUATION
  { sp_id: 'SP-23', name: 'Reservoir Section Drilling (Geosteering)', category: 'RESERVOIR & EVALUATION', phase: 'Active', duration: '10-30 d', key_inputs: ['LWD GR/resistivity', 'geological model', 'formation dip'], key_outputs: ['Time-in-zone %', 'geosteering decisions log'], responsible: 'Directional Driller + Geologist', ai_model: 'Geosteering AI (ML + RL)', regulatory: null },
  { sp_id: 'SP-24', name: 'Production Casing & Cementing', category: 'RESERVOIR & EVALUATION', phase: 'Active', duration: '3-6 d', key_inputs: ['7" production casing design', 'cement design (lead + tail)'], key_outputs: ['Casing cemented to 200m above perfs', 'CBL log', 'pressure test'], responsible: 'Cementing Engineer', ai_model: 'Cement-Behind-Casing Evaluator', regulatory: null },
  { sp_id: 'SP-25', name: 'Wireline Logging Suite', category: 'RESERVOIR & EVALUATION', phase: 'Active', duration: '1-3 d', key_inputs: ['Toolstring: GR+SP+Caliper+Resistivity+Density+Neutron+Sonic+NMR+FMI'], key_outputs: ['Full wireline log suite (LAS/DLIS)', 'borehole image log (FMI)'], responsible: 'Wireline Engineer + Petrophysicist', ai_model: 'Automated Facies Classifier + Fluid Typing AI', regulatory: 'Log data to AER in LAS format' },
  { sp_id: 'SP-26', name: 'MDT Pressure Testing & Fluid Sampling', category: 'RESERVOIR & EVALUATION', phase: 'Active', duration: '12-24 hr', key_inputs: ['MDT tool on wireline', 'target depth intervals'], key_outputs: ['Formation pressure at depth (MPa)', 'fluid sample', 'mobility (k/μ)'], responsible: 'Wireline Engineer + Reservoir Engineer', ai_model: 'Fluid Typing AI', regulatory: null },
  { sp_id: 'SP-27', name: 'Core Acquisition & Preservation', category: 'RESERVOIR & EVALUATION', phase: 'Active', duration: '1-3 d', key_inputs: ['Core barrel design', 'target coring interval'], key_outputs: ['Core (wax/fiberglass preserved)', 'core photos', 'core catolog'], responsible: 'Core Engineer', ai_model: 'Core Image Analyzer (CNN)', regulatory: 'Core report to AER' },
  { sp_id: 'SP-28', name: 'Petrophysical Evaluation', category: 'RESERVOIR & EVALUATION', phase: 'Active', duration: '3-7 d', key_inputs: ['Wireline log suite', 'mud filtrate Rw', 'core data'], key_outputs: ['Petrophysical evaluation report', 'net pay summary', 'porosity/permeability per zone'], responsible: 'Petrophysicist', ai_model: 'Automated Facies Classifier + Petrophysical Property Predictor', regulatory: null },
  { sp_id: 'SP-29', name: 'Reservoir Characterization', category: 'RESERVOIR & EVALUATION', phase: 'Active', duration: '1-4 wk', key_inputs: ['Log eval', 'seismic', 'MDT pressures', 'core data'], key_outputs: ['Reservoir model update', 'net/gross map', 'porosity map', 'Sw map'], responsible: 'Reservoir Engineer + Petrophysicist', ai_model: 'Petrophysical Property Predictor', regulatory: null },
  // WELL CONTROL
  { sp_id: 'SP-30', name: 'Well Control Drills (Quarterly)', category: 'WELL CONTROL', phase: 'Active', duration: '2-4 hr/drill', key_inputs: ['Well control manual', 'BOP test schedule'], key_outputs: ['Drill record', 'personnel competency record'], responsible: 'Drilling Supervisor', ai_model: null, regulatory: 'AER mandatory crew competency' },
  { sp_id: 'SP-31', name: 'Kick Detection & Shut-In', category: 'WELL CONTROL', phase: 'Active', duration: 'Minutes', key_inputs: ['Pit gain volume (bbl)', 'SIDP (kPa)', 'SICP (kPa)', 'depth (m TVD)'], key_outputs: ['Wellbore shut in', 'kick parameters recorded'], responsible: 'Driller + Toolpusher', ai_model: 'Early Kick Detection ML (15-min warning)', regulatory: 'AER immediate notification; written report within 48 hrs' },
  { sp_id: 'SP-32', name: 'Kill Operations (Driller\'s or W&W Method)', category: 'WELL CONTROL', phase: 'Active', duration: '4-24 hr', key_inputs: ['SIDP', 'SICP', 'pit gain', 'original mud weight', 'TVD'], key_outputs: ['Kill mud weight', 'kill sheet', 'post-kill WOB=0 confirmation'], responsible: 'Drilling Engineer + Toolpusher', ai_model: 'Kill Procedure Advisor (Ollama RAG)', regulatory: null },
  { sp_id: 'SP-33', name: 'Blowout Response (BOP Failure Contingency)', category: 'WELL CONTROL', phase: 'Active', duration: '24-72 hr', key_inputs: ['Blowout source identification', 'wild well assessment'], key_outputs: ['Relief well design', 'kill operation plan'], responsible: 'Well Control Specialist', ai_model: null, regulatory: 'AER emergency notification; response contractor (WELL CONTROL INC / Wild Well)' },
  { sp_id: 'SP-34', name: 'H2S Contingency Response', category: 'WELL CONTROL', phase: 'Active', duration: 'Variable', key_inputs: ['H2S gas detector alarm', 'wind direction', 'H2S concentration (ppm)'], key_outputs: ['Evacuation log', 'incident report', 'ERP activation record'], responsible: 'HSE Manager + Drilling Supervisor', ai_model: null, regulatory: 'AER Directive 056 sour well requirements; EPZ evacuation' },
  // COMPLETION & TESTING
  { sp_id: 'SP-35', name: 'Perforation Design & Execution', category: 'COMPLETION & TESTING', phase: 'Completion', duration: '4-8 hr', key_inputs: ['Log analysis', 'perf gun selection', 'shot density (shots/m)', 'phasing'], key_outputs: ['Perforated interval', 'gun firing record', 'underbalance calculation'], responsible: 'Completions Engineer + Wireline Engineer', ai_model: 'Completion Optimizer ML', regulatory: null },
  { sp_id: 'SP-36', name: 'Hydraulic Fracturing (if applicable)', category: 'COMPLETION & TESTING', phase: 'Completion', duration: '1-5 d', key_inputs: ['Frac design (fluid/proppant/stages)', 'treating pressure limit', 'pump rate (m³/min)'], key_outputs: ['Frac job report', 'ISIP (instantaneous shut-in pressure)', 'job summary'], responsible: 'Frac Engineer', ai_model: 'Fracture Geometry Predictor + Completion Optimizer', regulatory: 'AER Directive 083; frac fluid disclosure to AER' },
  { sp_id: 'SP-37', name: 'Sand Control Installation', category: 'COMPLETION & TESTING', phase: 'Completion', duration: '1-3 d', key_inputs: ['Screen selection (SAS/wire-wrap/expandable)', 'gravel size', 'packer design'], key_outputs: ['Screen installed', 'gravel pack log'], responsible: 'Completions Engineer', ai_model: 'Screen Plugging Risk Predictor', regulatory: null },
  { sp_id: 'SP-38', name: 'Tubing Running & Packer Setting', category: 'COMPLETION & TESTING', phase: 'Completion', duration: '1-2 d', key_inputs: ['Tubing tally', 'packer design depth', 'setting tool'], key_outputs: ['Tubing installed', 'packer set and tested (pull test)'], responsible: 'Completions Engineer', ai_model: null, regulatory: null },
  { sp_id: 'SP-39', name: 'Christmas Tree Installation', category: 'COMPLETION & TESTING', phase: 'Completion', duration: '4-8 hr', key_inputs: ['Wellhead design', 'SSV', 'choke manifold'], key_outputs: ['Tree installed and pressure tested'], responsible: 'Wellsite Supervisor', ai_model: null, regulatory: 'AER wellhead inspection' },
  { sp_id: 'SP-40', name: 'DST (Drill Stem Test)', category: 'COMPLETION & TESTING', phase: 'Completion', duration: '2-7 d', key_inputs: ['Test packer', 'downhole gauges', 'surface test tree'], key_outputs: ['DST report', 'PTA report', 'PI', 'kh', 'skin'], responsible: 'Reservoir Engineer + Well Test Engineer', ai_model: 'Automatic PTA Interpreter + Well Productivity Predictor', regulatory: 'AER Directive 083 — test reporting' },
  { sp_id: 'SP-41', name: 'Flowback & Cleanup', category: 'COMPLETION & TESTING', phase: 'Completion', duration: '3-10 d', key_inputs: ['Completion fluid type', 'formation fluid properties', 'separator capacity'], key_outputs: ['Clean wellbore', 'flowback fluid disposal record', 'initial rate'], responsible: 'Production Technologist', ai_model: null, regulatory: 'AER flaring authorization; fluid disposal permit' },
  { sp_id: 'SP-42', name: 'Well Test Interpretation (PTA)', category: 'COMPLETION & TESTING', phase: 'Completion', duration: '1-3 d', key_inputs: ['Pressure buildup data', 'flow rate history', 'log-log diagnostic plot'], key_outputs: ['Permeability (k mD)', 'skin (S)', 'drainage area', 'reservoir pressure'], responsible: 'Reservoir Engineer', ai_model: 'Automatic PTA Interpreter ML', regulatory: null },
  // HANDOVER & P&A
  { sp_id: 'SP-43', name: 'Well Handover Package', category: 'HANDOVER & P&A', phase: 'Handover', duration: '3-7 d', key_inputs: ['All well documents', 'SECE list', 'ERP', 'chemical injection matrix'], key_outputs: ['Complete well file', 'handover certificate'], responsible: 'Drilling Engineer', ai_model: 'Handover Checklist AI (NLP)', regulatory: 'AER completion report within 30 days' },
  { sp_id: 'SP-44', name: 'Production Startup', category: 'HANDOVER & P&A', phase: 'Handover', duration: '1-3 d', key_inputs: ['Wellhead commissioning', 'pipeline connection', 'meter calibration'], key_outputs: ['First production on sales', 'initial well test on separator'], responsible: 'Production Supervisor', ai_model: null, regulatory: 'AER production test filing' },
  { sp_id: 'SP-45', name: 'Temporary Suspension', category: 'HANDOVER & P&A', phase: 'Closure', duration: '1-3 d', key_inputs: ['Suspension criteria (AER)', 'cement plug design', 'wellbore diagram'], key_outputs: ['Cement plug across reservoir', 'suspended well status filed with AER'], responsible: 'Drilling Engineer', ai_model: null, regulatory: 'AER Directive 020' },
  { sp_id: 'SP-46', name: 'Permanent Plug & Abandon', category: 'HANDOVER & P&A', phase: 'Closure', duration: '5-25 d', key_inputs: ['P&A program', 'cement plug depths', 'pressure test procedure'], key_outputs: ['All plugs pressure tested to 6.9 MPa', 'abandonment report filed'], responsible: 'Drilling Engineer + Regulatory Affairs', ai_model: 'P&A Optimization + Plug Integrity Monitor', regulatory: 'AER Directives 020 and 079' },
  { sp_id: 'SP-47', name: 'Site Remediation', category: 'HANDOVER & P&A', phase: 'Closure', duration: '1-12 months', key_inputs: ['Environmental assessment', 'soil sample results', 'original topsoil storage'], key_outputs: ['Reclaimed surface', 'remediation certificate', 'reclamation certificate'], responsible: 'Environmental Specialist + Land Agent', ai_model: null, regulatory: 'AEPEA — reclamation certificate from AER' },
];

// ─── DB upsert ───────────────────────────────────────────────────────────────

async function upsertData() {
  await pool.query(`
    INSERT INTO ogo_process(process_id, process_name, stream, description)
    VALUES('P-US-DRILL-PF', 'Drilling Industry Process Flow', 'upstream',
           'Complete end-to-end drilling lifecycle from well concept to P&A — 11 phases, 47 sub-processes, well control kill sheet, petrophysical evaluation, NPT analysis, regulatory compliance (Alberta/Canada)')
    ON CONFLICT (process_id) DO UPDATE
      SET process_name = EXCLUDED.process_name,
          description  = EXCLUDED.description,
          updated_at   = NOW();
  `);

  for (const p of PHASES) {
    await pool.query(`
      INSERT INTO ogo_process_step(process_id, step_number, step_name, phase, duration, activities, deliverables, responsible, ai_tools, kpis, decision_gate, regulatory, kaggle_data)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      ON CONFLICT (process_id, step_number) DO UPDATE
        SET step_name=EXCLUDED.step_name, phase=EXCLUDED.phase,
            activities=EXCLUDED.activities, deliverables=EXCLUDED.deliverables,
            ai_tools=EXCLUDED.ai_tools, decision_gate=EXCLUDED.decision_gate,
            regulatory=EXCLUDED.regulatory
    `, [
      'P-US-DRILL-PF', p.step_number, p.step_name, p.phase, p.duration,
      p.activities, p.deliverables, p.responsible,
      JSON.stringify(p.ai_tools), JSON.stringify((p as Record<string, unknown>).kpis ?? []),
      JSON.stringify(p.decision_gate), p.regulatory, p.kaggle_data,
    ]);
  }

  for (const sp of SUBPROCESSES) {
    await pool.query(`
      INSERT INTO ogo_drilling_subprocesses(sp_id,name,category,phase,duration,key_inputs,key_outputs,responsible,ai_model,regulatory)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      ON CONFLICT (sp_id) DO UPDATE
        SET name=EXCLUDED.name, category=EXCLUDED.category,
            key_inputs=EXCLUDED.key_inputs, key_outputs=EXCLUDED.key_outputs,
            ai_model=EXCLUDED.ai_model, regulatory=EXCLUDED.regulatory
    `, [sp.sp_id, sp.name, sp.category, sp.phase, sp.duration, sp.key_inputs, sp.key_outputs, sp.responsible, sp.ai_model, sp.regulatory]);
  }
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function GET(_req: NextRequest) {
  try {
    await ensureSchema();
    await upsertData();

    const phasesResult = await pool.query(
      `SELECT * FROM ogo_process_step WHERE process_id='P-US-DRILL-PF' ORDER BY step_number`
    );
    const spResult = await pool.query(
      `SELECT * FROM ogo_drilling_subprocesses ORDER BY sp_id`
    );

    return NextResponse.json({
      process_id: 'P-US-DRILL-PF',
      process_name: 'Drilling Industry Process Flow',
      stream: 'upstream',
      phase_count: phasesResult.rows.length,
      subprocess_count: spResult.rows.length,
      phases: phasesResult.rows,
      subprocesses: spResult.rows,
      _source: 'db',
      _ts: new Date().toISOString(),
    });
  } catch (err) {
    // Fallback to static data when DB is unavailable
    console.error('DB error — returning static data:', err);
    return NextResponse.json({
      process_id: 'P-US-DRILL-PF',
      process_name: 'Drilling Industry Process Flow',
      stream: 'upstream',
      phase_count: PHASES.length,
      subprocess_count: SUBPROCESSES.length,
      phases: PHASES,
      subprocesses: SUBPROCESSES,
      _source: 'static',
      _db_error: String(err),
      _ts: new Date().toISOString(),
    });
  }
}
