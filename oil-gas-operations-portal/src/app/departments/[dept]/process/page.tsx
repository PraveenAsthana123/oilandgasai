'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

type ProcessStep = {
  step: number;
  name: string;
  input: string;
  activity: string;
  output: string;
  responsible: string;
  aiModel: string;
  kpi: string;
};

type SubProcess = {
  name: string;
  purpose: string;
  keyActivities: string;
  inputs: string;
  outputs: string;
  cycleTime: string;
};

type AIModelEntry = {
  model: string;
  step: string;
  type: string;
  dataInput: string;
  output: string;
  status: string;
};

type DataRequirement = {
  name: string;
  source: string;
  format: string;
  frequency: string;
  volume: string;
  quality: string;
};

type DeptProcess = {
  title: string;
  stream: string;
  description: string;
  flow: string[];
  steps: ProcessStep[];
  subProcesses: SubProcess[];
  aiModels: AIModelEntry[];
  dataRequirements: DataRequirement[];
};

const DEPT_PROCESSES: Record<string, DeptProcess> = {
  'exploration-geology': {
    title: 'Exploration & Geoscience Process',
    stream: 'Upstream',
    description: 'End-to-end seismic acquisition, interpretation, and prospect ranking to drive drill decisions.',
    flow: ['Seismic Design', 'Data Acquisition', 'Processing', 'Interpretation', 'Prospect Ranking', 'Drill Decision'],
    steps: [
      { step: 1, name: 'Seismic Survey Design', input: 'Basin maps, licensing data, previous surveys', activity: 'Design 2D/3D seismic grid: fold, offset, azimuth, geophone layout', output: 'Survey design specs, operational plan', responsible: 'Senior Geophysicist', aiModel: 'Survey Design Optimizer (LP)', kpi: 'Expected fold coverage, cost/km²' },
      { step: 2, name: 'Data Acquisition', input: 'Survey design, permits, crew', activity: 'Deploy geophones, shoot sources, QC field data in real-time', output: 'Raw SEG-Y field tapes (1–50 TB)', responsible: 'Operations Geophysicist', aiModel: 'Field QC ML (noise detection)', kpi: 'Uptime %, fold achieved %, data quality score' },
      { step: 3, name: 'Seismic Processing', input: 'Raw SEG-Y data, velocity model', activity: 'Deconvolution, velocity analysis, migration, pre-stack depth migration (PSDM)', output: 'Processed seismic volume (PSDM)', responsible: 'Processing Geophysicist', aiModel: 'Velocity Model ML (AI-assisted first-break picking)', kpi: 'S/N ratio, resolution (dominant freq Hz)' },
      { step: 4, name: 'Interpretation', input: 'Processed seismic, well logs', activity: 'Horizon picking, fault interpretation, attribute analysis, facies classification', output: 'Interpreted horizons, fault model, attribute maps', responsible: 'Geoscientist / Geophysicist', aiModel: 'Horizon Picker ML, Facies CNN, Fault Detector CNN', kpi: 'Interpretation cycle time (days), well tie error (ms)' },
      { step: 5, name: 'Prospect Ranking', input: 'Structural maps, petrophysics, PVT, analogues', activity: 'Resource estimation (Monte Carlo P10/P50/P90), risk assessment, economic ranking', output: 'Prospect portfolio, ranked by risked NPV', responsible: 'Geoscientist + Reservoir Engineer', aiModel: 'Resource Estimator (Monte Carlo), RAG Technical Q&A', kpi: 'Risked resource P50 (MMboe), POS (Probability of Success %)' },
      { step: 6, name: 'Drill Decision (AFE)', input: 'Ranked prospect, well cost estimate', activity: 'Well planning, authority for expenditure (AFE), partner alignment, regulatory application', output: 'Approved well AFE, regulatory permit', responsible: 'Asset Team, VP Exploration', aiModel: 'Cost Estimator ML', kpi: 'AFE cycle time (days), cost accuracy vs final well cost' },
    ],
    subProcesses: [
      { name: '2D/3D Seismic Survey', purpose: 'Image subsurface geology for prospect identification', keyActivities: 'Source/receiver layout, quality control, data acquisition', inputs: 'Survey design, field crew, permits', outputs: 'Raw SEG-Y data', cycleTime: '2–12 months per survey' },
      { name: 'Well Log Analysis (Petrophysics)', purpose: 'Quantify reservoir properties from wireline logs', keyActivities: 'Vshale, porosity, water saturation from GR/resistivity/neutron/density logs', inputs: 'LAS format well logs', outputs: 'Petrophysical interpretation, pay summary', cycleTime: '1–4 weeks per well' },
      { name: 'Reservoir Characterization', purpose: 'Build static geological model', keyActivities: 'Structural modeling, stratigraphic modeling, property population (kriging/SIS)', inputs: 'Seismic interpretation, well data', outputs: 'Static geological model', cycleTime: '3–6 months' },
      { name: 'Resource Estimation', purpose: 'Quantify hydrocarbon volumes with uncertainty', keyActivities: 'Volumetric calculation, Monte Carlo simulation, PRMS classification', inputs: 'GRV, porosity, saturation, FVF, RF estimates', outputs: 'P10/P50/P90 resource estimate, PRMS category', cycleTime: '2–8 weeks per prospect' },
      { name: 'Prospect Portfolio Management', purpose: 'Manage and prioritize drill candidates', keyActivities: 'Ranking by risked NPV, partner negotiations, work program scheduling', inputs: 'Ranked prospects, capital budget', outputs: 'Approved drill schedule', cycleTime: 'Annual planning cycle' },
    ],
    aiModels: [
      { model: 'Seismic Interpreter CNN', step: 'Interpretation', type: 'CNN', dataInput: 'Processed 3D seismic volume', output: 'Auto-picked horizons, fault probability volume', status: 'Active' },
      { model: 'Horizon Picker ML', step: 'Interpretation', type: 'ML Supervised', dataInput: 'Seismic traces + interpreter seed picks', output: 'Propagated horizon picks (10x faster than manual)', status: 'Active' },
      { model: 'Facies Classifier', step: 'Interpretation', type: 'CNN / Unsupervised', dataInput: 'Multi-attribute seismic', output: 'Lithofacies probability maps', status: 'Active' },
      { model: 'Resource Estimator', step: 'Prospect Ranking', type: 'Monte Carlo Simulation', dataInput: 'Input parameter distributions (GRV, φ, Sw, RF)', output: 'P10/P50/P90 resource distribution', status: 'Active' },
      { model: 'RAG Technical Q&A', step: 'All Steps', type: 'RAG (LLM + Vector DB)', dataInput: 'Technical reports, well results, analogues', output: 'Contextual answers with source citations', status: 'Active' },
    ],
    dataRequirements: [
      { name: 'Seismic Data (SEG-Y)', source: 'Acquisition contractor', format: 'SEG-Y rev 2', frequency: 'Per survey', volume: '1–50 TB', quality: 'Field QC passed, fold spec met' },
      { name: 'Well Logs (LAS)', source: 'Logging contractor', format: 'LAS 2.0', frequency: 'Per well', volume: '10–100 MB', quality: 'Depth-matched, calibrated' },
      { name: 'Core Analysis', source: 'Core lab', format: 'CSV/PDF', frequency: 'Per well', volume: 'MB', quality: 'SCAL data, PVT tied' },
      { name: 'Basin Data / Analogues', source: 'NEB/COGCC public data', format: 'Various', frequency: 'Periodic', volume: 'GB', quality: 'Vintage-labeled' },
    ],
  },
  'drilling-engineering': {
    title: 'Drilling & Well Construction Process',
    stream: 'Upstream',
    description: 'Well design, rig mobilization, drilling execution, casing, completion handover.',
    flow: ['Well Design', 'Rig Mob', 'Drilling', 'Logging', 'Completion', 'Handover'],
    steps: [
      { step: 1, name: 'Well Design', input: 'Geological target, offset well data', activity: 'Trajectory design, casing program, mud program, BHA design', output: 'Well Program / AFE', responsible: 'Drilling Engineer', aiModel: 'Well Cost Estimator ML', kpi: 'AFE accuracy %, cost/metre' },
      { step: 2, name: 'Rig Mobilization', input: 'Approved AFE, rig contract', activity: 'Site prep, rig move, BOP testing, wellhead installation', output: 'Rig on site, spud-ready', responsible: 'Rig Superintendent', aiModel: 'Logistics Optimizer', kpi: 'Mob time (days), rig-up cost' },
      { step: 3, name: 'Drilling', input: 'Well program, MWD/LWD downhole tools', activity: 'Directional drilling, formation evaluation while drilling, mud weight management', output: 'Wellbore to target depth', responsible: 'Directional Driller / Mud Engineer', aiModel: 'ROP Optimizer, Stuck Pipe Predictor', kpi: 'ROP (m/hr), NPT %, WOB/RPM optimization' },
      { step: 4, name: 'Formation Evaluation (LWD)', input: 'LWD gamma ray, resistivity, neutron/density', activity: 'Real-time petrophysical interpretation, formation picks, coring decision', output: 'Petrophysical log, pay/non-pay zones', responsible: 'Wellsite Geologist', aiModel: 'Geosteering AI, Facies Classifier (LWD)', kpi: 'Formation pick accuracy, reservoir length in target' },
      { step: 5, name: 'Casing & Cementing', input: 'Casing design, cement program', activity: 'Run casing, mix and pump cement, CBL evaluation', output: 'Cased and cemented wellbore', responsible: 'Drilling Engineer + Cementing Engineer', aiModel: 'Cement Bond ML (CBL interpreter)', kpi: 'CBL quality score, cement TOC confirmed' },
      { step: 6, name: 'Handover to Completion', input: 'Final wellbore status, TD report', activity: 'PPDM data entry, final TD report, handover to completion team', output: 'Well ready for completion', responsible: 'Drilling Supervisor', aiModel: 'Documentation AI (auto-generate well report)', kpi: 'Handover cycle time, data completeness %' },
    ],
    subProcesses: [
      { name: 'Directional Drilling', purpose: 'Steer wellbore to geological target', keyActivities: 'MWD/RSS tool selection, survey control, dogleg severity management', inputs: 'Target coordinates, deviation plan', outputs: 'Wellbore survey', cycleTime: 'Per well (3–30 days drilling)' },
      { name: 'Casing & Cementing', purpose: 'Isolate formations, provide structural integrity', keyActivities: 'Casing running, centralizer placement, cement pumping, CBL logging', inputs: 'Casing design, cement program', outputs: 'Cemented casing string', cycleTime: '1–3 days per string' },
      { name: 'Mud Engineering', purpose: 'Maintain wellbore stability, carry cuttings, control pressure', keyActivities: 'Mud weight control, rheology adjustment, solids control', inputs: 'Formation pressure, lithology prognosis', outputs: 'Stable wellbore, cuttings removed', cycleTime: 'Continuous during drilling' },
      { name: 'Well Control', purpose: 'Prevent blowouts', keyActivities: 'BOP testing, kick detection, well shut-in procedure', inputs: 'Real-time pit volume, flow check', outputs: 'Controlled wellbore pressure', cycleTime: 'Continuous monitoring' },
      { name: 'Formation Evaluation (FE)', purpose: 'Characterize reservoir while drilling', keyActivities: 'LWD/MWD data interpretation, formation testing (MDT)', inputs: 'Downhole tool data (WITSML)', outputs: 'Pay summary, fluid contacts', cycleTime: '1–3 days interpretation per well' },
    ],
    aiModels: [
      { model: 'ROP Optimizer', step: 'Drilling', type: 'ML (Gradient Boosting)', dataInput: 'WOB, RPM, flow rate, formation strength', output: 'Optimal WOB/RPM setpoints → max ROP', status: 'Active' },
      { model: 'Stuck Pipe Predictor', step: 'Drilling', type: 'ML Classification', dataInput: 'Torque, drag, ECD, lithology', output: 'Stuck pipe risk alert (15 min advance)', status: 'Active' },
      { model: 'Geosteering AI', step: 'Logging', type: 'ML + Geomodel', dataInput: 'Real-time LWD GR/resistivity', output: 'Reservoir boundary prediction → steer recommendation', status: 'Active' },
      { model: 'Facies Classifier (LWD)', step: 'Logging', type: 'ML', dataInput: 'LWD multi-sensor data', output: 'Real-time lithofacies classification', status: 'Active' },
      { model: 'Completion Optimizer', step: 'Completion', type: 'ML', dataInput: 'Formation properties, offset frac results', output: 'Optimal perforation clusters, frac stage spacing', status: 'Active' },
    ],
    dataRequirements: [
      { name: 'LWD/MWD Data', source: 'Downhole tools (real-time WITSML)', format: 'WITSML 2.0', frequency: 'Real-time (1-sec)', volume: '1–5 GB/well', quality: 'Validated, depth-matched' },
      { name: 'Offset Well Data', source: 'Internal database + NEB public', format: 'LAS / PPDM', frequency: 'Pre-drill', volume: 'Varies', quality: 'Depth-matched, calibrated logs' },
      { name: 'Mud Logs', source: 'Mud logging unit', format: 'PDF/CSV', frequency: 'Per drill day', volume: 'MB/well', quality: 'Lithological descriptions QC-d' },
      { name: 'Rig Sensor Data', source: 'Surface rig sensors (WITS)', format: 'WITS 0 / WITSML', frequency: '1-sec to 1-min', volume: 'GB/well', quality: 'Timestamped, calibrated' },
    ],
  },
  'reservoir-engineering': {
    title: 'Reservoir Management Process',
    stream: 'Upstream',
    description: 'Static and dynamic reservoir modeling, history matching, and development plan optimization.',
    flow: ['Data Integration', 'Static Modeling', 'Dynamic Simulation', 'History Match', 'Production Forecast', 'Development Plan'],
    steps: [
      { step: 1, name: 'Data Integration', input: 'Well logs, cores, seismic, production history', activity: 'QC, normalize, and integrate all reservoir data into PPDM/database', output: 'Integrated dataset, data quality report', responsible: 'Data Management / Reservoir Engineer', aiModel: 'Data QC ML', kpi: 'Data completeness %, integration cycle time' },
      { step: 2, name: 'Static Geological Model', input: 'Petrophysics, seismic interpretation', activity: 'Build 3D static model: structural, stratigraphic, property population', output: 'Populated 3D geocellular model', responsible: 'Reservoir Geologist', aiModel: 'Permeability Predictor ML (from core/log correlation)', kpi: 'Model runtime, P50 STOIIP vs estimate' },
      { step: 3, name: 'Dynamic Simulation', input: 'Static model, PVT, relative permeability', activity: 'Set up reservoir simulator (Eclipse/CMG), initialize, run', output: 'Initialized dynamic model', responsible: 'Reservoir Engineer', aiModel: 'Proxy Model (ML surrogate for fast runs)', kpi: 'Simulation run time, initialization convergence' },
      { step: 4, name: 'History Matching', input: 'Simulation model, production history (rates + pressures)', activity: 'Adjust model parameters (Kv/Kh, faults, aquifer) to match history', output: 'History-matched model', responsible: 'Senior Reservoir Engineer', aiModel: 'History Match Optimizer (Ensemble Smoother)', kpi: 'Match quality (P mismatch < 5%, rate mismatch < 10%)' },
      { step: 5, name: 'Production Forecast', input: 'History-matched model, development scenarios', activity: 'Run forecast cases (P10/P50/P90), uncertainty quantification', output: 'Production forecast with uncertainty range', responsible: 'Reservoir Engineer', aiModel: 'Decline Curve ML, Uncertainty Quantifier (Monte Carlo)', kpi: 'Forecast accuracy (actual vs predicted 1-yr)' },
      { step: 6, name: 'Development Plan (FDP)', input: 'Forecasts, well costs, product prices', activity: 'Optimize well count/location/timing for maximum NPV', output: 'Field Development Plan (FDP), approved project', responsible: 'Asset Team', aiModel: 'Well Placement Optimizer (Genetic Algorithm + ML)', kpi: 'Development NPV $MM, incremental recovery %OOIP' },
    ],
    subProcesses: [
      { name: 'PVT Analysis', purpose: 'Characterize reservoir fluid behavior under pressure depletion', keyActivities: 'CCE, DL, separator tests, EOS tuning', inputs: 'Bottomhole fluid samples', outputs: 'Tuned EOS, PVT tables', cycleTime: '4–8 weeks per fluid system' },
      { name: 'Core Analysis (SCAL)', purpose: 'Measure relative permeability and capillary pressure for simulation', keyActivities: 'Steady-state/unsteady-state Kr, capillary pressure (MICP)', inputs: 'Core plugs, reservoir fluids', outputs: 'Kr curves, Pc curves, Leverett J-function', cycleTime: '3–6 months per set' },
      { name: 'Decline Curve Analysis (DCA)', purpose: 'Empirical forecast without full simulation', keyActivities: 'Arps exponential/hyperbolic fit, Duong method for tight reservoirs', inputs: 'Production rate history', outputs: 'EUR (Estimated Ultimate Recovery), decline rate', cycleTime: '1–5 days per well/pad' },
      { name: 'Material Balance', purpose: 'Estimate HCIIP and aquifer influx from pressure data', keyActivities: 'Havlena-Odeh plot, water influx modeling', inputs: 'Cumulative production, average reservoir pressure', outputs: 'HCIIP estimate, aquifer strength', cycleTime: '1–2 weeks' },
      { name: 'EOR Screening', purpose: 'Evaluate enhanced recovery options', keyActivities: 'Screen CO₂/waterflood/polymer/SAGD eligibility, pilot design', inputs: 'Reservoir properties, fluid data, economics', outputs: 'EOR shortlist, incremental recovery %, economics', cycleTime: '4–12 weeks' },
    ],
    aiModels: [
      { model: 'Decline Curve ML', step: 'Production Forecast', type: 'ML Time Series', dataInput: 'Production rate history (monthly/daily)', output: 'EUR + confidence interval', status: 'Active' },
      { model: 'Permeability Predictor', step: 'Static Modeling', type: 'ML Regression', dataInput: 'Core permeability + wireline logs (training)', output: 'Predicted permeability in uncored intervals', status: 'Active' },
      { model: 'EOR Screener', step: 'Development Plan', type: 'ML Classification', dataInput: 'Reservoir properties, fluid type, depth, pressure', output: 'Ranked EOR options with predicted incremental recovery', status: 'Active' },
      { model: 'History Match Optimizer', step: 'History Match', type: 'Ensemble Smoother / ML', dataInput: 'Prior model parameters, production history', output: 'Posterior parameter distributions (matched model)', status: 'Active' },
      { model: 'Uncertainty Quantifier', step: 'Forecast', type: 'Monte Carlo Simulation', dataInput: 'Key uncertain parameters (Kh, contacts, recovery factor)', output: 'P10/P50/P90 production forecast', status: 'Active' },
    ],
    dataRequirements: [
      { name: 'Production Data', source: 'SCADA / PI Historian', format: 'CSV / PI tags', frequency: 'Daily / Monthly', volume: 'MB/well/year', quality: 'Corrected for downtime, allocation applied' },
      { name: 'Pressure Data (BHP/WHP)', source: 'Downhole gauges, wellsite', format: 'CSV / WITSML', frequency: 'Continuous / periodic', volume: 'MB/test', quality: 'Temperature-corrected, gauge-calibrated' },
      { name: 'Core Data', source: 'Core lab + ERCB/AER archive', format: 'CSV / PDF', frequency: 'Per well', volume: 'KB-MB', quality: 'SCAL validated, representative plugs' },
      { name: 'Seismic (interpreted)', source: 'Exploration team', format: 'ZMAP / SEG-Y', frequency: 'Per study', volume: 'GB', quality: 'Tie verified to well tops' },
    ],
  },
  'production-engineering': {
    title: 'Production Operations Process',
    stream: 'Upstream',
    description: 'Well monitoring, artificial lift, chemical treatment, production allocation, and facility operations.',
    flow: ['Well Monitoring', 'Optimization', 'Interventions', 'Facility Ops', 'Metering', 'Reporting'],
    steps: [
      { step: 1, name: 'Well Monitoring', input: 'SCADA data, wellhead pressures, rates', activity: 'Real-time monitoring of well performance, identify anomalies', output: 'Well status dashboard, anomaly alerts', responsible: 'Production Engineer', aiModel: 'Virtual Flow Meter (VFM), Anomaly Detector', kpi: 'NPT % (Non-Productive Time), data uptime %' },
      { step: 2, name: 'Well Optimization', input: 'Well performance data, reservoir model', activity: 'Optimize artificial lift, choke management, gas lift injection rates', output: 'Optimized well targets', responsible: 'Production Engineer', aiModel: 'Gas Lift Optimizer, ESP Monitor', kpi: 'Production uplift boe/d, energy per boe' },
      { step: 3, name: 'Well Interventions', input: 'Well performance decline data, economics', activity: 'Plan and execute workovers, coiled tubing, stimulation', output: 'Restored/improved well performance', responsible: 'Production Engineer + Well Services', aiModel: 'Workover Candidate Ranker ML', kpi: 'Workover NPV $, success rate %' },
      { step: 4, name: 'Facility Operations', input: 'Separator, compressor, heater treater status', activity: 'Manage surface facilities: separation, compression, dehydration', output: 'Export-quality oil/gas to pipeline', responsible: 'Facility Operator', aiModel: 'Separator Optimizer, Compressor Efficiency ML', kpi: 'Facility uptime %, shrinkage %' },
      { step: 5, name: 'Production Metering', input: 'Test separator data, flow meter readings', activity: 'Production allocation (oil, gas, water), regulatory measurement', output: 'Allocated production volumes by well', responsible: 'Production Accountant / Engineer', aiModel: 'Production Allocator ML', kpi: 'Allocation unaccounted % < 2%, meter accuracy %' },
      { step: 6, name: 'Reporting', input: 'Allocated volumes, operating data', activity: 'Monthly production report, regulatory submissions (AER/NEB)', output: 'Monthly production report, AER 1P filing', responsible: 'Production Engineer', aiModel: 'Auto-Report Generator (LLM)', kpi: 'Report cycle time (days), zero-defect regulatory filing' },
    ],
    subProcesses: [
      { name: 'Artificial Lift Management', purpose: 'Maintain or increase production against reservoir pressure depletion', keyActivities: 'ESP sizing, gas lift design, rod pump optimization', inputs: 'IPR curves, wellbore survey', outputs: 'Lift design, target production rates', cycleTime: '1–2 weeks per design' },
      { name: 'Well Performance Monitoring', purpose: 'Detect decline, identify intervention candidates', keyActivities: 'Rate transient analysis, Nodal analysis, WOR/GOR trend monitoring', inputs: 'Daily production, WHP, BHP tests', outputs: 'Performance summary, recommendations', cycleTime: 'Monthly review' },
      { name: 'Chemical Treatment', purpose: 'Prevent scale, corrosion, hydrates, emulsions', keyActivities: 'Chemical injection (corrosion inhibitor, scale inhibitor, demulsifier)', inputs: 'Water chemistry, flow rates', outputs: 'Controlled corrosion rates, clean oil to pipeline', cycleTime: 'Continuous injection, quarterly review' },
      { name: 'Sand Management', purpose: 'Prevent sand production damage to equipment and loss of wellbore integrity', keyActivities: 'Sand exclusion (screens, gravel pack), monitoring (sand probes)', inputs: 'Formation sand data, flow velocity', outputs: 'Sand-free production or managed sand', cycleTime: 'Wellbore completion + ongoing monitoring' },
      { name: 'Production Allocation', purpose: 'Allocate commingled production to individual wells for regulatory and royalty reporting', keyActivities: 'Well test scheduling, virtual metering, allocation calculation', inputs: 'Well test rates, commingled meter', outputs: 'Allocated production by well', cycleTime: 'Monthly allocation cycle' },
    ],
    aiModels: [
      { model: 'Virtual Flow Meter (VFM)', step: 'Well Monitoring', type: 'ML Physics-Informed', dataInput: 'WHP, BHP, temperature, choke position', output: 'Estimated oil/gas/water rate without test separator', status: 'Active' },
      { model: 'ESP Monitor', step: 'Optimization', type: 'ML Anomaly Detection', dataInput: 'ESP motor current, vibration, head/flow curve', output: 'Health score, predicted days to failure', status: 'Active' },
      { model: 'Hydrate Predictor', step: 'Facility Ops', type: 'ML + Thermodynamic', dataInput: 'Pressure, temperature, gas composition', output: 'Hydrate formation risk alert', status: 'Active' },
      { model: 'Production Allocator', step: 'Metering', type: 'ML Regression', dataInput: 'Individual well tests + commingled rates', output: 'Estimated individual well rates between tests', status: 'Active' },
      { model: 'Gas Lift Optimizer', step: 'Optimization', type: 'ML + Nodal Analysis', dataInput: 'Injection gas rates, WHP, BHP', output: 'Optimal gas lift injection allocation (multi-well)', status: 'Active' },
    ],
    dataRequirements: [
      { name: 'SCADA/Wellhead Data', source: 'RTU / SCADA system', format: 'Modbus/OPC-UA', frequency: '1-min', volume: 'GB/year/field', quality: 'Calibrated, timestamped' },
      { name: 'Production Test Data', source: 'Test separator / multiphase meter', format: 'CSV', frequency: 'Per well test (weekly/monthly)', volume: 'KB/test', quality: 'Duration > 4 hrs, stabilized' },
      { name: 'ESP Downhole Data', source: 'ESP manufacturer system', format: 'CSV/API', frequency: '1-min', volume: 'GB/year', quality: 'Manufacturer-calibrated sensors' },
      { name: 'Fluid Chemistry (Water)', source: 'Field lab', format: 'CSV', frequency: 'Monthly', volume: 'KB', quality: 'Representative sample, ICP-MS quality' },
    ],
  },
  'hse-safety': {
    title: 'HSE Management Process',
    stream: 'All Streams',
    description: 'Hazard identification, risk assessment, permit-to-work, incident investigation, and environmental monitoring.',
    flow: ['Hazard ID', 'Risk Assessment', 'PTW', 'Job Execution', 'Monitoring', 'Incident Investigation'],
    steps: [
      { step: 1, name: 'Hazard Identification', input: 'Job description, site visit, historical incidents', activity: 'JSA, HAZOP, What-If analysis', output: 'Hazard register, HAZOP report', responsible: 'HSE Advisor + Operations', aiModel: 'Hazard Classifier ML', kpi: 'Hazard IDs per job, new vs recurring hazards' },
      { step: 2, name: 'Risk Assessment', input: 'Hazard register, consequence data', activity: 'Risk matrix scoring (likelihood × consequence), ALARP determination', output: 'Risk register, ALARP documentation', responsible: 'HSE Lead', aiModel: 'Risk Score ML (historical incident data)', kpi: 'High-risk count, % ALARP demonstrated' },
      { step: 3, name: 'Permit to Work (PTW)', input: 'Risk assessment, job scope', activity: 'Issue PTW, define isolations, set safety conditions, authorize', output: 'Approved PTW document', responsible: 'Area Authority / PTW Coordinator', aiModel: 'PTW Conflict Checker (AI validation)', kpi: 'PTW cycle time, simultaneous operations conflicts' },
      { step: 4, name: 'Job Execution', input: 'Approved PTW, equipment, crew', activity: 'Execute work per PTW conditions, toolbox talk, PPE check', output: 'Completed job, safe work record', responsible: 'Field Supervisor', aiModel: 'PPE Detector (Computer Vision)', kpi: 'PPE compliance rate %, near-miss rate' },
      { step: 5, name: 'Environmental Monitoring', input: 'Permit conditions, regulatory limits', activity: 'Air quality, noise, wastewater, spill monitoring', output: 'Environmental compliance records', responsible: 'Environmental Advisor', aiModel: 'Emission Forecaster, Spill Risk Predictor', kpi: 'Exceedances count, permit compliance %' },
      { step: 6, name: 'Incident Investigation', input: 'Incident report, witness statements, physical evidence', activity: 'Root cause analysis (Bow-Tie / 5-Why), ICAM, corrective actions', output: 'Investigation report, CAPA', responsible: 'HSE Manager + Line Manager', aiModel: 'Incident Pattern Analyzer (ML + RAG)', kpi: 'CAPA closure rate %, TRIR trend' },
    ],
    subProcesses: [
      { name: 'JSA / HAZOP', purpose: 'Structured identification of job hazards before work begins', keyActivities: 'Multi-disciplinary team review, node-by-node deviation analysis', inputs: 'PFD, P&ID, job description', outputs: 'JSA form, HAZOP action register', cycleTime: '1 hr (JSA) to 5 days (HAZOP)' },
      { name: 'PTW System', purpose: 'Authorizes non-routine high-risk work under controlled conditions', keyActivities: 'Isolation verification, atmospheric testing, confined space entry', inputs: 'Job scope, risk assessment', outputs: 'PTW certificate, isolation record', cycleTime: 'Per task, renewed daily' },
      { name: 'Emergency Response', purpose: 'Respond to H2S release, fire, well blowout', keyActivities: 'Muster, evacuation, EPRP activation, notification chain', inputs: 'Emergency signal, EPRP plan', outputs: 'Controlled emergency, all personnel accounted', cycleTime: 'Per emergency event' },
      { name: 'Incident Investigation', purpose: 'Determine root causes and prevent recurrence', keyActivities: 'Root cause analysis (RCA), CAPA development, lessons learned', inputs: 'Incident reports, witness statements', outputs: 'Investigation report, closed CAPAs', cycleTime: '1–4 weeks depending on severity' },
      { name: 'PPE Management', purpose: 'Ensure correct PPE is available, used, and maintained', keyActivities: 'PPE inventory, fit testing, inspection, replacement schedule', inputs: 'PPE standard, hazard assessment', outputs: 'Compliant PPE use, inspection records', cycleTime: 'Ongoing' },
    ],
    aiModels: [
      { model: 'PPE Detector (Computer Vision)', step: 'Job Execution', type: 'CNN Object Detection (YOLO)', dataInput: 'CCTV / wearable camera images', output: 'PPE compliance alert (hard hat, vest, gloves detected/missing)', status: 'Active' },
      { model: 'Risk Score ML', step: 'Risk Assessment', type: 'ML Gradient Boosting', dataInput: 'Job type, location, contractor, previous incidents', output: 'Predicted risk score for job type', status: 'Active' },
      { model: 'Incident Pattern Analyzer', step: 'Investigation', type: 'ML + RAG', dataInput: 'Historical incident database, current incident details', output: 'Similar past incidents + corrective actions that worked', status: 'Active' },
      { model: 'H₂S Exposure Predictor', step: 'Monitoring', type: 'ML', dataInput: 'Wind direction, H₂S source locations, atmospheric stability', output: 'H₂S dispersion prediction → muster point recommendation', status: 'Active' },
    ],
    dataRequirements: [
      { name: 'Incident Reports', source: 'Online HSE system', format: 'Structured DB / JSON', frequency: 'Per event', volume: 'KB/report', quality: 'Root cause completed, CAPA assigned' },
      { name: 'PTW Records', source: 'PTW system', format: 'DB records / PDF', frequency: 'Per permit', volume: 'KB/permit', quality: 'Signed by area authority, isolations verified' },
      { name: 'CCTV Footage', source: 'Site cameras', format: 'MP4/H.264', frequency: 'Continuous (30-day retention)', volume: 'TB/month/site', quality: 'Timestamped, calibrated resolution' },
      { name: 'Environmental Monitoring', source: 'CEMS + field samplers', format: 'CSV / regulatory format', frequency: 'Hourly/daily/monthly', volume: 'MB/year', quality: 'QA/QC per regulatory spec' },
    ],
  },
  'pipeline-integrity': {
    title: 'Pipeline Integrity Management Process',
    stream: 'Midstream',
    description: 'Systematic threat identification, ILI inspection, defect assessment, and fitness-for-service evaluation.',
    flow: ['Data Integration', 'Threat Assessment', 'ILI Planning', 'ILI Execution', 'Defect Assessment', 'Remediation'],
    steps: [
      { step: 1, name: 'Data Integration', input: 'Design data, operating history, inspection history, coating data', activity: 'Integrate all pipeline integrity data into PIMS', output: 'Complete pipeline data record', responsible: 'Pipeline Integrity Engineer', aiModel: 'Data Gap Identifier ML', kpi: 'Data completeness % by segment' },
      { step: 2, name: 'Threat Assessment', input: 'Pipeline characteristics, operating conditions, environment', activity: 'ECDA, ICDA, SCC assessment; threat ranking per PHMSA B31.8S', output: 'Threat priority register by segment', responsible: 'Integrity Engineer', aiModel: 'Corrosion Growth ML', kpi: 'High-threat segments %, risk-reduction per $/segment' },
      { step: 3, name: 'ILI Planning', input: 'Threat assessment, pipeline geometry', activity: 'Select ILI tool (MFL, UT, geometry), plan run window', output: 'ILI run specification, vendor contract', responsible: 'Integrity Engineer', aiModel: 'ILI Run Scheduler', kpi: 'Inspection coverage % of high-priority segments' },
      { step: 4, name: 'ILI Execution', input: 'ILI tool, pipeline launcher/receiver', activity: 'Launch pig, track pig in-line, receive pig, download data', output: 'Raw ILI data (MFL/UT signals)', responsible: 'Operations + ILI Vendor', aiModel: 'Pig Run Tracker', kpi: 'Run success rate %, tool speed variance %' },
      { step: 5, name: 'Defect Assessment', input: 'ILI data, material properties', activity: 'Feature classification, depth sizing, failure pressure calculation (ASME B31G)', output: 'Defect list with priority ranking', responsible: 'Integrity Engineer', aiModel: 'ILI Feature Classifier, Failure Pressure Calculator', kpi: 'False call rate %, sizing accuracy vs field verification' },
      { step: 6, name: 'Remediation', input: 'Priority defect list, schedule', activity: 'Excavate, repair (sleeve/grind/pipe replacement), recoat', output: 'Remediated pipeline, fitness-for-service confirmed', responsible: 'Integrity Engineer + Field Crew', aiModel: 'Repair Prioritizer ML', kpi: 'Remediation completion % on schedule, anomaly re-growth rate' },
    ],
    subProcesses: [
      { name: 'ILI Run Planning', purpose: 'Select optimal ILI tool and timing for each segment', keyActivities: 'Tool capability vs threat matching, product compatibility, window scheduling', inputs: 'Threat register, pipeline specs', outputs: 'ILI run package, vendor TQ', cycleTime: '2–4 months planning' },
      { name: 'MFL/UT Data Analysis', purpose: 'Identify and size metal loss features in ILI data', keyActivities: 'Feature extraction, depth sizing, classification (ID/OD, general/pitting/corrosion)', inputs: 'Raw ILI signals (MFL flux, UT echo)', outputs: 'Feature list with dimensions', cycleTime: '4–12 weeks per run' },
      { name: 'ECDA (External Corrosion Direct Assessment)', purpose: 'Assess external corrosion threat on unpiggable lines', keyActivities: 'Pre-assessment (data review), indirect inspection (CIS, DCVG), direct examination', inputs: 'CP survey data, coating condition', outputs: 'ECDA report, dig list', cycleTime: '3–6 months' },
      { name: 'SCC Assessment', purpose: 'Assess stress corrosion cracking threat (near-neutral pH SCC)', keyActivities: 'SCC susceptibility screening, UT crack tool ILI, hydrotest', inputs: 'Stress conditions, cathodic protection history, soil chemistry', outputs: 'SCC risk ranking, inspection priority', cycleTime: '2–4 months' },
      { name: 'Fitness for Service (FFS)', purpose: 'Determine if defective pipeline segment can continue operating safely', keyActivities: 'ASME B31G / RSTRENG calculation, pressure reduction assessment', inputs: 'Defect dimensions, material properties, operating pressure', outputs: 'Maximum allowable operating pressure (MAOP), repair/replace decision', cycleTime: '1–5 days per feature' },
    ],
    aiModels: [
      { model: 'ILI Feature Classifier', step: 'Defect Assessment', type: 'ML Classification (SVM/CNN)', dataInput: 'MFL/UT signal patterns', output: 'Feature class (metal loss / crack / geometry) + confidence', status: 'Active' },
      { model: 'Corrosion Growth ML', step: 'Threat Assessment', type: 'ML Time Series', dataInput: 'Repeat ILI comparison, operating conditions', output: 'Predicted corrosion growth rate mm/yr → re-inspection interval', status: 'Active' },
      { model: 'Failure Pressure Calculator', step: 'Defect Assessment', type: 'Physics + ML', dataInput: 'Defect geometry (depth, length, width), SMYS, pipe OD/WT', output: 'Predicted failure pressure, safety margin vs MAOP', status: 'Active' },
      { model: 'ILI Run Scheduler', step: 'ILI Planning', type: 'LP Optimization', dataInput: 'Inspection due dates, tool availability, budget', output: 'Optimal ILI schedule', status: 'Active' },
    ],
    dataRequirements: [
      { name: 'ILI Data (MFL/UT)', source: 'ILI vendor', format: 'Proprietary + EXCEL summary', frequency: 'Per run (1–5 yr interval)', volume: '1–100 GB per run', quality: 'Tool speed QC, calibration record' },
      { name: 'CP Survey Data', source: 'CP contractor / internal', format: 'CSV', frequency: 'Annual', volume: 'MB', quality: 'Close interval survey (CIS) per NACE SP0169' },
      { name: 'Pipeline Design Data', source: 'As-built drawings', format: 'GIS / PDF', frequency: 'Per construction + updates', volume: 'GB', quality: 'As-built verified, geolocated' },
      { name: 'Operating History', source: 'SCADA historian', format: 'CSV / PI tags', frequency: 'Daily', volume: 'GB/year', quality: 'Pressure/temperature timestamped' },
    ],
  },
  'maintenance': {
    title: 'Maintenance Management Process',
    stream: 'All Streams',
    description: 'Condition monitoring, work order management, predictive maintenance, and turnaround planning.',
    flow: ['Condition Monitoring', 'Work Order Creation', 'Planning', 'Scheduling', 'Execution', 'Closure & Learning'],
    steps: [
      { step: 1, name: 'Condition Monitoring', input: 'Vibration, temperature, oil analysis, CEMS data', activity: 'Real-time CBM: vibration FFT, lubrication oil analysis, performance monitoring', output: 'Equipment health status, anomaly alerts', responsible: 'Reliability Engineer', aiModel: 'Vibration Anomaly Detector (FFT+ML), RUL Predictor', kpi: 'Coverage % of critical equipment, alert-to-action time' },
      { step: 2, name: 'Work Order Creation', input: 'Equipment alerts, PM schedule triggers', activity: 'Create work order in CMMS (SAP PM), assign priority, scope work', output: 'Approved work order', responsible: 'Maintenance Planner', aiModel: 'Failure Mode Classifier ML', kpi: 'WO backlog size, reactive WO %' },
      { step: 3, name: 'Planning', input: 'Work order, equipment history, spare parts', activity: 'Define work steps, bill of materials, tooling, permits, resources', output: 'Work package (job plan)', responsible: 'Maintenance Planner', aiModel: 'Spare Parts Optimizer', kpi: 'Planning quality score, rework rate %' },
      { step: 4, name: 'Scheduling', input: 'Planned WOs, resource availability, production window', activity: 'Prioritize and schedule WOs with production and operations', output: 'Weekly/daily maintenance schedule', responsible: 'Maintenance Scheduler', aiModel: 'Schedule Optimizer (LP)', kpi: 'Schedule adherence %, planned maintenance %' },
      { step: 5, name: 'Execution', input: 'Work package, PTW, tools, parts', activity: 'Execute work per job plan, document findings', output: 'Completed maintenance task, as-found/as-left data', responsible: 'Tradesperson', aiModel: 'AR Work Instructions (digital overlay)', kpi: 'WO completion rate %, compliance with procedures' },
      { step: 6, name: 'Closure & Learning', input: 'Completed WO, findings, failure mode', activity: 'Close WO in CMMS, update equipment history, analyze failure mode', output: 'Updated CMMS record, failure mode analysis', responsible: 'Reliability Engineer', aiModel: 'Failure Mode Analyzer (FMEA + ML)', kpi: 'PM effectiveness (failures caught/total), MTBF improvement' },
    ],
    subProcesses: [
      { name: 'Preventive Maintenance (PM)', purpose: 'Execute scheduled maintenance per OEM and reliability program', keyActivities: 'PM task lists, lube schedules, filter changes, calibration', inputs: 'PM schedule, equipment register', outputs: 'PM completion record', cycleTime: 'Per PM frequency (daily to annual)' },
      { name: 'Predictive Maintenance (PdM)', purpose: 'Detect degradation before failure using condition data', keyActivities: 'Vibration analysis, oil sampling, thermography, UT thickness', inputs: 'Condition monitoring data streams', outputs: 'Work order triggered by predicted failure', cycleTime: 'Continuous monitoring + monthly analysis' },
      { name: 'Turnaround Planning', purpose: 'Plan major plant shutdown for inspection and critical maintenance', keyActivities: 'Scope development, work packs, contractor resourcing, critical path', inputs: 'Equipment inspection deferrals, regulatory requirements', outputs: 'TA work scope, schedule, budget', cycleTime: '18–24 months planning for major TA' },
      { name: 'Spare Parts Management', purpose: 'Maintain critical spare parts inventory at optimal stocking levels', keyActivities: 'ABC classification, min/max setting, BOM maintenance, critical spares identification', inputs: 'Equipment list, failure history, lead times', outputs: 'Optimized inventory levels', cycleTime: 'Annual review + continuous' },
      { name: 'Corrective Maintenance', purpose: 'Restore failed equipment to service efficiently', keyActivities: 'Breakdown diagnosis, parts procurement, repair, test', inputs: 'Failure notification', outputs: 'Restored equipment, root cause documented', cycleTime: 'Hours to days per failure' },
    ],
    aiModels: [
      { model: 'Vibration Anomaly Detector', step: 'Condition Monitoring', type: 'FFT + ML Autoencoder', dataInput: 'Vibration time-series (accelerometer)', output: 'Anomaly score, detected fault type (imbalance/misalignment/bearing)', status: 'Active' },
      { model: 'Failure Mode Classifier', step: 'WO Creation', type: 'ML Classification (NLP)', dataInput: 'Work order text descriptions, equipment type', output: 'Predicted failure mode → auto-populate WO fields', status: 'Active' },
      { model: 'RUL Predictor', step: 'Condition Monitoring', type: 'ML (LSTM)', dataInput: 'Vibration trend, operating hours, temperature history', output: 'Remaining Useful Life in days ± confidence', status: 'Active' },
      { model: 'Turnaround Optimizer', step: 'Scheduling', type: 'LP + Critical Path ML', dataInput: 'Scope list, resource availability, dependency graph', output: 'Optimized TA schedule → minimum duration + cost', status: 'Active' },
      { model: 'Spare Parts Optimizer', step: 'Planning', type: 'ML + Statistics (Poisson demand)', dataInput: 'Usage history, lead times, criticality', output: 'Recommended stock levels per SKU', status: 'Active' },
    ],
    dataRequirements: [
      { name: 'Vibration Data', source: 'Online sensors / portable analyzer', format: 'CSV / OSIsoft PI', frequency: 'Continuous / monthly route', volume: 'GB/year for online', quality: 'ISO calibration, baseline established' },
      { name: 'CMMS (SAP PM) Records', source: 'SAP Plant Maintenance', format: 'SAP structured', frequency: 'Per WO', volume: 'GB accumulation', quality: 'Completion data entered, failure mode coded' },
      { name: 'Lube Oil Analysis', source: 'Oil lab', format: 'CSV', frequency: 'Monthly / quarterly', volume: 'KB/sample', quality: 'Particle count, viscosity, metal content' },
      { name: 'Equipment Data Plates', source: 'As-built / vendor docs', format: 'PDF / structured', frequency: 'Per installation', volume: 'MB', quality: 'OEM spec confirmed' },
    ],
  },
  'scada-control': {
    title: 'SCADA & Control Process',
    stream: 'Midstream',
    description: 'Data acquisition, alarm management, operator response, control actions, and OT cybersecurity.',
    flow: ['Data Acquisition', 'Alarm Management', 'Operator Response', 'Control Actions', 'Reporting', 'Cybersecurity'],
    steps: [
      { step: 1, name: 'Data Acquisition', input: 'RTU/PLC sensor signals', activity: 'Poll field devices (Modbus, DNP3, ICCP), normalize, store in historian', output: 'Real-time process data in SCADA historian', responsible: 'Control Systems Engineer', aiModel: 'Data Quality ML (bad actor detection)', kpi: 'Data availability %, polling success rate %, latency ms' },
      { step: 2, name: 'Alarm Management', input: 'Process variable exceedances', activity: 'Alarm rationalization, priority weighting, alarm flood detection', output: 'Rationalized alarm list, operator alert', responsible: 'Control Room Operator', aiModel: 'Alarm ML Classifier (nuisance vs actionable)', kpi: 'Alarm rate per operator-hr (target < 12), alarm flood events/month' },
      { step: 3, name: 'Operator Response', input: 'Alarm, abnormal condition', activity: 'Acknowledge alarm, diagnose, escalate, execute response procedure', output: 'Process deviation corrected or ESD activated', responsible: 'Control Room Operator', aiModel: 'Process Variable Forecaster (AR/ML)', kpi: 'Mean time to acknowledge (MTTA) alarms, control deviation time' },
      { step: 4, name: 'Control Actions', input: 'Operator or APC setpoint change', activity: 'Setpoint changes, manual override, ESD activation, mode changes', output: 'Process controlled within limits', responsible: 'Operator + APC Engineer', aiModel: 'Anomaly Detector (isolation from APC)', kpi: 'Process deviation frequency, APC uptime %' },
      { step: 5, name: 'Reporting & Compliance', input: 'Historian data', activity: 'Generate regulatory reports, KPI reports, audit logs', output: 'Regulatory submissions, management reports', responsible: 'Control Systems + Regulatory Affairs', aiModel: 'Auto-Report Generator', kpi: 'Report generation time, regulatory compliance rate' },
      { step: 6, name: 'Cybersecurity Monitoring', input: 'OT network traffic, asset list', activity: 'Passive network monitoring, anomaly detection, incident response', output: 'OT threat detection alerts, incident reports', responsible: 'OT Cybersecurity Analyst', aiModel: 'Cybersecurity SIEM Proxy (ML network anomaly)', kpi: 'Dwell time (hrs), mean time to detect (MTTD), patch compliance %' },
    ],
    subProcesses: [
      { name: 'Alarm Rationalization', purpose: 'Eliminate nuisance alarms to prevent operator overload', keyActivities: 'EEMUA 191 review, IPF classification, alarm set point review', inputs: 'Alarm history, P&IDs', outputs: 'Rationalized alarm database', cycleTime: '6–18 months for full rationalization' },
      { name: 'PID Tuning', purpose: 'Optimize controller performance for stability and responsiveness', keyActivities: 'Step test, IMC/Lambda tuning calculation, validation test', inputs: 'Process response data', outputs: 'Tuned PID parameters', cycleTime: '1–3 days per controller' },
      { name: 'ESD (Emergency Shutdown)', purpose: 'Safely shut down process on safety demand signal', keyActivities: 'Safety integrity level (SIL) verification, proof test, bypass management', inputs: 'SIL assessment, functional spec', outputs: 'ESD function verified, proof test record', cycleTime: 'Annual SIL proof test + per-demand' },
      { name: 'SCADA Historian', purpose: 'Archive all process data for analysis and regulatory compliance', keyActivities: 'Tag configuration, compression settings, backup, data retrieval', inputs: 'All PLC/RTU tags', outputs: 'Compressed time-series data store', cycleTime: 'Continuous' },
      { name: 'Cybersecurity Monitoring (ICS)', purpose: 'Detect and respond to cyber threats in OT environment', keyActivities: 'Network segmentation, passive monitoring (Claroty/Dragos), incident response', inputs: 'OT network traffic', outputs: 'Threat alerts, incident reports', cycleTime: 'Continuous' },
    ],
    aiModels: [
      { model: 'Alarm ML Classifier', step: 'Alarm Management', type: 'ML Classification', dataInput: 'Alarm tag, operating context, time-of-day', output: 'Actionable vs nuisance classification + recommended response', status: 'Active' },
      { model: 'Process Variable Forecaster', step: 'Operator Response', type: 'ML Time Series (AR)', dataInput: 'Last 2-hr process history (T, P, flow)', output: '15-min ahead forecast → early warning before limit hit', status: 'Active' },
      { model: 'Anomaly Detector', step: 'Control Actions', type: 'ML Autoencoder', dataInput: 'Multi-variate process signals', output: 'Composite anomaly score, variable contribution ranking', status: 'Active' },
      { model: 'Network Anomaly Detector (OT)', step: 'Cybersecurity', type: 'ML (Unsupervised)', dataInput: 'OT network traffic (PCAP)', output: 'Anomalous connection alert, device behavior change', status: 'Active' },
    ],
    dataRequirements: [
      { name: 'SCADA Historian Tags', source: 'RTU/PLC via SCADA', format: 'OSIsoft PI / InfluxDB', frequency: 'Real-time (1-sec)', volume: 'TB/year for large system', quality: 'Calibration records, bad-quality flagged' },
      { name: 'Alarm History', source: 'SCADA alarm server', format: 'CSV / DB export', frequency: 'Per event + batch extract', volume: 'MB/month', quality: 'Priority codes defined, shelved alarms tracked' },
      { name: 'OT Network Traffic', source: 'Network TAP / SPAN port', format: 'PCAP', frequency: 'Continuous (sampled)', volume: 'TB/month', quality: 'Full packet capture, segmented' },
      { name: 'PLC Configuration Backups', source: 'Control system', format: 'Vendor-specific', frequency: 'After any change', volume: 'MB/device', quality: 'Version-controlled, change-logged' },
    ],
  },
  'data-science-ai': {
    title: 'Data Science & AI Process',
    stream: 'All Streams',
    description: 'End-to-end ML/AI model lifecycle from problem definition through deployment and monitoring.',
    flow: ['Problem Definition', 'Data Collection', 'Feature Engineering', 'Model Development', 'Validation', 'Deployment & Monitoring'],
    steps: [
      { step: 1, name: 'Problem Definition', input: 'Business problem statement, SME input', activity: 'Define objective (regression/classification/anomaly), success criteria, data availability scoping', output: 'Project charter, success metric definitions', responsible: 'Data Scientist + Domain SME', aiModel: 'RAG Problem Analyzer', kpi: 'Charter approval cycle time, success metric clarity score' },
      { step: 2, name: 'Data Collection & QC', input: 'Source systems (PI, SCADA, CMMS, LIMS)', activity: 'Extract, transform, load (ETL) raw data; QC for outliers, gaps, label noise', output: 'Clean training dataset', responsible: 'Data Engineer + Data Scientist', aiModel: 'Data Quality Monitor (statistical ML)', kpi: 'Data completeness %, outlier rate %, label agreement %' },
      { step: 3, name: 'Feature Engineering', input: 'Clean dataset', activity: 'Create domain-informed features (lags, rolling stats, physics-based), dimensionality reduction', output: 'Feature matrix (train/val/test split)', responsible: 'Data Scientist', aiModel: 'AutoFE (automated feature engineering)', kpi: 'Feature importance (SHAP values), feature count vs baseline' },
      { step: 4, name: 'Model Development', input: 'Feature matrix, target variable', activity: 'Train candidate models (LR, RF, XGBoost, LSTM, DNN), hyperparameter optimization', output: 'Candidate model(s) + evaluation metrics', responsible: 'Data Scientist', aiModel: 'AutoML Pipeline (Optuna/FLAML)', kpi: 'RMSE/AUC vs baseline, training time' },
      { step: 5, name: 'Validation', input: 'Candidate model, holdout test set, domain SME', activity: 'Backtesting on historical data, cross-validation, domain expert review, bias check', output: 'Validated model with performance evidence', responsible: 'Data Scientist + SME', aiModel: 'SHAP Explainability, Model Drift Detector', kpi: 'Holdout RMSE, bias audit score, SME sign-off' },
      { step: 6, name: 'Deployment & Monitoring (MLOps)', input: 'Validated model, production infrastructure', activity: 'Containerize (Docker), deploy to inference endpoint, set up monitoring pipeline', output: 'Production model serving predictions, monitored dashboard', responsible: 'MLOps Engineer', aiModel: 'Model Drift Monitor (PSI/KS test), Data Quality Monitor', kpi: 'Model uptime %, prediction latency ms, drift detection lag' },
    ],
    subProcesses: [
      { name: 'Data Pipeline', purpose: 'Automate data flow from source to model training and inference', keyActivities: 'Airflow DAG / Prefect, data contracts, lineage tracking', inputs: 'Source system APIs/DB connections', outputs: 'Automated, reproducible dataset', cycleTime: 'Continuous automated pipeline' },
      { name: 'Feature Engineering', purpose: 'Transform raw data into predictive features using domain knowledge', keyActivities: 'Lag features, rolling window stats, interaction terms, physics-based transforms', inputs: 'Clean dataset', outputs: 'Feature matrix', cycleTime: '1–4 weeks per project' },
      { name: 'Model Training (ML/DL)', purpose: 'Train optimal model for defined objective', keyActivities: 'Cross-validation, hyperparameter search, ensemble methods', inputs: 'Feature matrix, labeled targets', outputs: 'Trained model artifacts', cycleTime: 'Hours to days per training run' },
      { name: 'MLOps / CI-CD for Models', purpose: 'Automate model deployment and retraining pipeline', keyActivities: 'GitHub Actions CI, model registry (MLflow), canary deployment', inputs: 'Trained model artifacts, test suite', outputs: 'Deployed model endpoint, version registry', cycleTime: '30 min to 2 hrs per deployment' },
      { name: 'Model Performance Monitoring', purpose: 'Detect model drift and performance degradation in production', keyActivities: 'PSI/KS tests, accuracy monitoring, retraining triggers', inputs: 'Production predictions + actuals', outputs: 'Drift alerts, retraining signals', cycleTime: 'Continuous (daily checks)' },
    ],
    aiModels: [
      { model: 'AutoML Pipeline', step: 'Model Development', type: 'AutoML (Optuna/FLAML)', dataInput: 'Feature matrix, target', output: 'Best model + hyperparameters from automated search', status: 'Active' },
      { model: 'Feature Importance (SHAP)', step: 'Validation', type: 'SHAP Explainability', dataInput: 'Trained model + feature matrix', output: 'SHAP values per feature → top driver identification', status: 'Active' },
      { model: 'Model Drift Detector', step: 'Deployment & Monitoring', type: 'Statistical tests (PSI, KS)', dataInput: 'Reference distribution vs recent predictions', output: 'Drift alert + affected features', status: 'Active' },
      { model: 'Data Quality Monitor', step: 'Data Collection', type: 'Statistical ML', dataInput: 'Incoming feature distributions', output: 'Data quality score, outlier flags, schema violations', status: 'Active' },
      { model: 'Experiment Tracker (MLflow)', step: 'Model Development', type: 'MLOps Tooling', dataInput: 'Training run parameters + metrics', output: 'Versioned experiment registry + model lineage', status: 'Active' },
    ],
    dataRequirements: [
      { name: 'Labeled Training Data', source: 'Operations systems + SME annotation', format: 'CSV / Parquet', frequency: 'Per project + incremental updates', volume: 'MB to GB per project', quality: 'Inter-rater agreement > 85%, balanced classes' },
      { name: 'Real-time Inference Data', source: 'SCADA/Historian/CMMS (same as training)', format: 'REST API / Kafka stream', frequency: 'Real-time to hourly', volume: 'Varies by model', quality: 'Schema-validated at pipeline ingress' },
      { name: 'Model Metadata (MLflow)', source: 'MLflow tracking server', format: 'JSON / SQLite', frequency: 'Per experiment run', volume: 'MB', quality: 'Every run logged, parameters captured' },
      { name: 'Production Actuals (for drift)', source: 'Operations data with latency', format: 'CSV / DB', frequency: 'Daily', volume: 'Varies', quality: 'Ground truth verified, lag < 24 hrs' },
    ],
  },
};

// Fallback for departments not in the detailed map
function getFallbackProcess(dept: string): DeptProcess {
  const FALLBACKS: Record<string, { title: string; stream: string; flow: string[] }> = {
    'well-completion': { title: 'Well Completion Process', stream: 'Upstream', flow: ['Perforation Design', 'Frac Design', 'Frac Execution', 'Flowback', 'Cleanup', 'Production Startup'] },
    'well-integrity': { title: 'Well Integrity Process', stream: 'Upstream', flow: ['Barrier Identification', 'Risk Assessment', 'Monitoring', 'Inspection', 'Intervention', 'Documentation'] },
    'pipeline-operations': { title: 'Pipeline Operations Process', stream: 'Midstream', flow: ['Nomination/Scheduling', 'Injection/Receipt', 'Mainline Ops', 'Pigging', 'Delivery', 'Custody Transfer'] },
    'compression': { title: 'Compression & Gathering Process', stream: 'Midstream', flow: ['Gathering', 'Field Sep', 'Compression', 'Dehydration', 'Transmission Inlet', 'Measurement'] },
    'gas-processing': { title: 'Gas Processing Plant Process', stream: 'Midstream', flow: ['Inlet Sep', 'Dehydration', 'Acid Gas Removal', 'NGL Extraction', 'Fractionation', 'Product Storage'] },
    'storage': { title: 'Storage Operations Process', stream: 'Midstream', flow: ['Receipt', 'Tank Gauging', 'Quality Check', 'Inventory Mgmt', 'Transfer', 'Custody Transfer'] },
    'metering': { title: 'Custody Transfer Metering Process', stream: 'Midstream', flow: ['Meter Selection', 'Installation', 'Proving', 'Measurement', 'Volume Statement', 'Regulatory Report'] },
    'refinery-operations': { title: 'Refinery Operations Process', stream: 'Downstream', flow: ['Crude Receipt', 'CDU/VDU', 'Conversion Units', 'Treating', 'Blending', 'Distribution'] },
    'process-engineering': { title: 'Process Optimization Process', stream: 'Downstream', flow: ['Crude Assay', 'LP Optimization', 'APC Setpoints', 'Execution', 'Quality Verification', 'Margin Report'] },
    'product-quality': { title: 'Product Quality Control Process', stream: 'Downstream', flow: ['Sampling', 'Lab Analysis', 'Spec Check', 'Blend Adjust', 'CoA Generation', 'Release'] },
    'distribution': { title: 'Product Distribution Process', stream: 'Downstream', flow: ['Demand Forecast', 'Inventory Planning', 'Loading Scheduling', 'Loading Execution', 'Transport', 'Customer Delivery'] },
    'commercial-trading': { title: 'Commercial & Trading Process', stream: 'Downstream', flow: ['Market Intelligence', 'Position Management', 'Contract Execution', 'Logistics', 'Settlement', 'PnL Reporting'] },
    'environmental': { title: 'Environmental Compliance Process', stream: 'All Streams', flow: ['Monitoring', 'Data Validation', 'Compliance Assessment', 'Reporting', 'Corrective Action', 'Regulatory Audit'] },
    'procurement': { title: 'Procurement & Supply Chain Process', stream: 'All Streams', flow: ['Requisition', 'Vendor Selection', 'RFQ/RFP', 'PO Issuance', 'Delivery & Inspection', 'Invoice Payment'] },
    'it-digital': { title: 'IT/OT Digital Operations Process', stream: 'All Streams', flow: ['Requirements', 'Architecture', 'Development', 'Testing', 'Deployment', 'Operations'] },
  };

  const fb = FALLBACKS[dept] ?? { title: `${dept.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} Process`, stream: 'All Streams', flow: ['Input', 'Assessment', 'Planning', 'Execution', 'Verification', 'Reporting'] };

  return {
    title: fb.title,
    stream: fb.stream,
    description: `Operational process flow for ${fb.title}.`,
    flow: fb.flow,
    steps: fb.flow.map((f, i) => ({
      step: i + 1, name: f, input: `Inputs for step ${i + 1}`, activity: `Activities performed during ${f}`,
      output: `Outputs from ${f}`, responsible: 'Department Lead', aiModel: 'ML model (dept-specific)', kpi: 'Key metric',
    })),
    subProcesses: [],
    aiModels: [],
    dataRequirements: [],
  };
}

const STREAM_COLORS: Record<string, string> = {
  'Upstream': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Midstream': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'Downstream': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'All Streams': 'bg-green-500/20 text-green-400 border-green-500/30',
};

export default function DeptProcessPage() {
  const params = useParams();
  const dept = typeof params?.dept === 'string' ? params.dept : '';
  const [activeTab, setActiveTab] = useState('steps');
  const [expandedSub, setExpandedSub] = useState<number | null>(null);

  const process = DEPT_PROCESSES[dept] ?? getFallbackProcess(dept);

  useEffect(() => {}, []);

  const tabs = [
    { id: 'steps', label: 'Process Steps' },
    { id: 'sub', label: 'Sub-Processes' },
    { id: 'ai', label: 'AI Integration Map' },
    { id: 'data', label: 'Data Requirements' },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <a href={`/departments/${dept}`} className="text-gray-500 text-sm hover:text-gray-300 transition-colors">
            ← {dept.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </a>
          <span className="text-gray-700">/</span>
          <span className="text-gray-400 text-sm">Process</span>
        </div>
        <div className="flex items-center gap-3 mt-2 mb-1">
          <h1 className="text-2xl font-bold text-white">{process.title}</h1>
          <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${STREAM_COLORS[process.stream] ?? STREAM_COLORS['All Streams']}`}>
            {process.stream}
          </span>
        </div>
        <p className="text-gray-400 text-sm">{process.description}</p>
      </div>

      {/* SVG Process Flow */}
      <div className="bg-[#0d1424] border border-[#1e2a45] rounded-xl p-6 overflow-x-auto">
        <h2 className="text-white font-semibold mb-4">Process Flow</h2>
        <svg width={Math.max(900, process.flow.length * 160 + 40)} height="90"
          viewBox={`0 0 ${Math.max(900, process.flow.length * 160 + 40)} 90`}
          className="min-w-full">
          {process.flow.slice(0, -1).map((_, i) => {
            const x1 = i * 150 + 110;
            const x2 = (i + 1) * 150 + 20;
            return (
              <g key={`conn-${i}`}>
                <line x1={x1} y1="40" x2={x2} y2="40" stroke="#374151" strokeWidth="2" />
                <polygon points={`${x2},36 ${x2 - 8},32 ${x2 - 8},44`} fill="#374151" />
              </g>
            );
          })}
          {process.flow.map((label, i) => (
            <g key={`node-${i}`}>
              <rect x={i * 150 + 20} y="15" width="90" height="50" rx="6"
                fill="#111827"
                stroke={i === 0 ? '#92400e' : i === process.flow.length - 1 ? '#166534' : '#374151'}
                strokeWidth={i === 0 || i === process.flow.length - 1 ? 2 : 1.5} />
              <text x={i * 150 + 65} y="38" textAnchor="middle" fill="white" fontSize="8" fontWeight="600">
                {label.length > 14 ? label.substring(0, 12) + '…' : label}
              </text>
              <text x={i * 150 + 65} y="53" textAnchor="middle" fill="#6b7280" fontSize="7">
                Step {i + 1}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#1e2a45] overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === t.id ? 'text-amber-400 border-b-2 border-amber-500' : 'text-gray-400 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Process Steps */}
      {activeTab === 'steps' && (
        <div className="bg-[#0d1424] border border-[#1e2a45] rounded-xl p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e2a45]">
                  {['#', 'Step Name', 'Input', 'Activity', 'Output', 'Responsible', 'AI Model', 'KPI'].map(h => (
                    <th key={h} className="text-left text-gray-400 font-medium py-2 px-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {process.steps.map((s) => (
                  <tr key={s.step} className="border-b border-[#1e2a45]/50 hover:bg-[#1e2a45]/20 transition-colors">
                    <td className="py-2 px-3">
                      <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold">{s.step}</span>
                    </td>
                    <td className="py-2 px-3 text-white font-medium whitespace-nowrap">{s.name}</td>
                    <td className="py-2 px-3 text-gray-400 text-xs max-w-[120px]">{s.input}</td>
                    <td className="py-2 px-3 text-gray-300 text-xs max-w-[160px]">{s.activity}</td>
                    <td className="py-2 px-3 text-green-400 text-xs max-w-[120px]">{s.output}</td>
                    <td className="py-2 px-3 text-gray-400 text-xs whitespace-nowrap">{s.responsible}</td>
                    <td className="py-2 px-3 text-amber-400 text-xs whitespace-nowrap">⚡ {s.aiModel}</td>
                    <td className="py-2 px-3 text-blue-400 text-xs">{s.kpi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-Processes */}
      {activeTab === 'sub' && (
        <div className="space-y-3">
          {process.subProcesses.length === 0 && (
            <div className="bg-[#0d1424] border border-[#1e2a45] rounded-xl p-5 text-center text-gray-500">
              Sub-process detail not yet cataloged for this department.
            </div>
          )}
          {process.subProcesses.map((sp, i) => (
            <div key={sp.name} className="bg-[#0d1424] border border-[#1e2a45] rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedSub(expandedSub === i ? null : i)}
                className="w-full flex items-center justify-between p-4 hover:bg-[#1e2a45]/20 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold">{i + 1}</span>
                  <span className="text-white font-medium">{sp.name}</span>
                  <span className="text-gray-500 text-xs hidden sm:block">— {sp.cycleTime}</span>
                </div>
                <span className="text-gray-500">{expandedSub === i ? '▲' : '▼'}</span>
              </button>
              {expandedSub === i && (
                <div className="px-4 pb-4 border-t border-[#1e2a45]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                    {[
                      { label: 'Purpose', value: sp.purpose, color: 'text-gray-300' },
                      { label: 'Key Activities', value: sp.keyActivities, color: 'text-gray-300' },
                      { label: 'Inputs', value: sp.inputs, color: 'text-blue-400' },
                      { label: 'Outputs', value: sp.outputs, color: 'text-green-400' },
                      { label: 'Typical Cycle Time', value: sp.cycleTime, color: 'text-amber-400' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="bg-[#0a0e1a] rounded-lg p-3 border border-[#1e2a45]">
                        <div className="text-gray-500 text-xs mb-1">{label}</div>
                        <div className={`text-sm ${color}`}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* AI Integration Map */}
      {activeTab === 'ai' && (
        <div className="bg-[#0d1424] border border-[#1e2a45] rounded-xl p-5">
          {process.aiModels.length === 0 ? (
            <div className="text-center text-gray-500 py-8">AI model detail not yet cataloged for this department.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1e2a45]">
                    {['AI Model', 'Process Step', 'Type', 'Data Input', 'Output', 'Status'].map(h => (
                      <th key={h} className="text-left text-gray-400 font-medium py-2 px-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {process.aiModels.map((m) => (
                    <tr key={m.model} className="border-b border-[#1e2a45]/50 hover:bg-[#1e2a45]/20 transition-colors">
                      <td className="py-2 px-3 text-amber-400 font-medium text-xs">⚡ {m.model}</td>
                      <td className="py-2 px-3 text-gray-300 text-xs">{m.step}</td>
                      <td className="py-2 px-3">
                        <span className="px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400">{m.type}</span>
                      </td>
                      <td className="py-2 px-3 text-gray-400 text-xs max-w-xs">{m.dataInput}</td>
                      <td className="py-2 px-3 text-green-400 text-xs max-w-xs">{m.output}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${m.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Data Requirements */}
      {activeTab === 'data' && (
        <div className="bg-[#0d1424] border border-[#1e2a45] rounded-xl p-5">
          {process.dataRequirements.length === 0 ? (
            <div className="text-center text-gray-500 py-8">Data requirements not yet cataloged for this department.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1e2a45]">
                    {['Data Name', 'Source', 'Format', 'Frequency', 'Volume', 'Quality Requirement'].map(h => (
                      <th key={h} className="text-left text-gray-400 font-medium py-2 px-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {process.dataRequirements.map((d) => (
                    <tr key={d.name} className="border-b border-[#1e2a45]/50 hover:bg-[#1e2a45]/20 transition-colors">
                      <td className="py-2 px-3 text-amber-400 font-medium">{d.name}</td>
                      <td className="py-2 px-3 text-gray-300 text-xs">{d.source}</td>
                      <td className="py-2 px-3 text-blue-400 font-mono text-xs">{d.format}</td>
                      <td className="py-2 px-3 text-gray-400 text-xs">{d.frequency}</td>
                      <td className="py-2 px-3 text-gray-400 text-xs">{d.volume}</td>
                      <td className="py-2 px-3 text-green-400 text-xs">{d.quality}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
