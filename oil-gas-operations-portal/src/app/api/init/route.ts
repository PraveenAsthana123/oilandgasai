export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';

const CREATE_TABLES = `
CREATE TABLE IF NOT EXISTS ogo_use_case (
  id SERIAL PRIMARY KEY,
  stream TEXT,
  department TEXT,
  use_case_name TEXT,
  ai_type TEXT,
  technology TEXT,
  model_name TEXT,
  data_input TEXT,
  output_type TEXT,
  business_value TEXT,
  status TEXT DEFAULT 'planned',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ogo_department (
  id SERIAL PRIMARY KEY,
  name TEXT,
  stream TEXT,
  head_count INT,
  key_kpis JSONB,
  ai_use_cases JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ogo_digital_twin (
  id SERIAL PRIMARY KEY,
  twin_name TEXT,
  twin_type TEXT,
  asset_id TEXT,
  stream TEXT,
  sync_status TEXT DEFAULT 'disconnected',
  last_sync TIMESTAMPTZ,
  health_score INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ogo_sensor (
  id SERIAL PRIMARY KEY,
  sensor_id TEXT UNIQUE,
  sensor_type TEXT,
  location TEXT,
  stream TEXT,
  unit TEXT,
  current_value NUMERIC,
  last_reading TIMESTAMPTZ,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ogo_ai_model (
  id SERIAL PRIMARY KEY,
  model_name TEXT,
  ai_type TEXT,
  stream TEXT,
  department TEXT,
  framework TEXT,
  accuracy NUMERIC,
  last_trained TIMESTAMPTZ,
  status TEXT DEFAULT 'deployed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ogo_data_quality (
  id SERIAL PRIMARY KEY,
  table_name TEXT,
  completeness_pct NUMERIC,
  freshness_minutes INT,
  validity_pct NUMERIC,
  checked_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ogo_incident (
  id SERIAL PRIMARY KEY,
  incident_type TEXT,
  stream TEXT,
  location TEXT,
  severity TEXT,
  status TEXT DEFAULT 'open',
  reported_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS ogo_agent_task (
  id SERIAL PRIMARY KEY,
  agent_name TEXT,
  goal TEXT,
  stream TEXT,
  status TEXT DEFAULT 'pending',
  confidence NUMERIC,
  action_log JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ogo_lead (
  id SERIAL PRIMARY KEY,
  name TEXT,
  company TEXT,
  email TEXT,
  phone TEXT,
  source TEXT,
  score INT DEFAULT 0,
  status TEXT DEFAULT 'new',
  owner_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ogo_opportunity (
  id SERIAL PRIMARY KEY,
  lead_id INT,
  title TEXT,
  value NUMERIC,
  stage TEXT DEFAULT 'prospect',
  probability INT DEFAULT 10,
  close_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ogo_role (
  id SERIAL PRIMARY KEY,
  name TEXT,
  permissions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ogo_audit_log (
  id SERIAL PRIMARY KEY,
  user_id TEXT,
  action TEXT,
  record_type TEXT,
  record_id TEXT,
  details JSONB,
  ts TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ogo_support_ticket (
  id SERIAL PRIMARY KEY,
  user_id TEXT,
  subject TEXT,
  body TEXT,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ogo_feature_flag (
  id SERIAL PRIMARY KEY,
  flag_key TEXT UNIQUE,
  enabled BOOLEAN DEFAULT true,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
`;

const USE_CASES = [
  // UPSTREAM
  { stream: 'upstream', department: 'Exploration & Geology', use_case_name: 'Seismic Interpretation', ai_type: 'Deep Learning / CNN', technology: 'Image Segmentation, 3D CNN', model_name: 'U-Net, ResNet', data_input: 'Seismic shot gathers, stacked volumes', output_type: 'Interpreted horizons, fault maps', business_value: '40% reduction in interpretation time, improved prospect success rate', status: 'deployed' },
  { stream: 'upstream', department: 'Exploration & Geology', use_case_name: 'Formation Evaluation', ai_type: 'Statistical ML', technology: 'Log analysis regression, clustering', model_name: 'Random Forest, XGBoost', data_input: 'Well logs (GR, RHOB, NPHI, RT)', output_type: 'Lithology, porosity, fluid saturation', business_value: '30% faster petrophysical analysis, consistent classification', status: 'deployed' },
  { stream: 'upstream', department: 'Reservoir Engineering', use_case_name: 'Reservoir Simulation', ai_type: 'Digital Twin + Physics ML', technology: 'Eclipse surrogate, physics-informed NN', model_name: 'PINN, Gaussian Process', data_input: 'Production history, PVT data, core samples', output_type: 'Pressure-saturation maps, recovery forecast', business_value: '10x faster simulation runs, real-time history matching', status: 'deployed' },
  { stream: 'upstream', department: 'Reservoir Engineering', use_case_name: 'Decline Curve Analysis', ai_type: 'Statistical ML - Arps', technology: 'Arps decline, Bayesian fitting, LSTM', model_name: 'Hyperbolic/Exponential Arps, LSTM', data_input: 'Historical production rates, pressures', output_type: 'EUR estimates, production forecast, P10/P50/P90', business_value: 'Accurate reserves estimation, optimized field development planning', status: 'deployed' },
  { stream: 'upstream', department: 'Reservoir Engineering', use_case_name: 'Well Log Analysis', ai_type: 'ML Regression + Feature Engineering', technology: 'Multi-log feature engineering, ensemble ML', model_name: 'Gradient Boosting, SVM', data_input: 'LWD/MWD logs, mudlog data', output_type: 'Pay zone identification, permeability, fluid contacts', business_value: '25% improvement in well placement accuracy', status: 'active' },
  { stream: 'upstream', department: 'Drilling Engineering', use_case_name: 'Drilling ROP Optimization', ai_type: 'ML + Reinforcement Learning', technology: 'Real-time parameter optimization, RL control', model_name: 'PPO RL agent, XGBoost', data_input: 'WOB, RPM, flow rate, torque, formation tops', output_type: 'Optimal drilling parameters, ROP improvement recommendations', business_value: '15-25% ROP improvement, reduced drilling time and cost', status: 'deployed' },
  { stream: 'upstream', department: 'Drilling Engineering', use_case_name: 'Stuck Pipe Prediction', ai_type: 'ML Classification', technology: 'Real-time anomaly detection, classification', model_name: 'LSTM, Random Forest classifier', data_input: 'Hook load, torque, drag, ECD, formation data', output_type: 'Stuck pipe risk score, early warning alert', business_value: 'Prevent costly fishing operations, $500K+ per stuck pipe event avoided', status: 'deployed' },
  { stream: 'upstream', department: 'Drilling Engineering', use_case_name: 'Bit Wear Detection', ai_type: 'Computer Vision Detection', technology: 'Drill bit image analysis, CV object detection', model_name: 'YOLO v8, ResNet classification', data_input: 'High-speed camera footage, vibration sensors', output_type: 'Bit wear classification, replacement recommendation', business_value: 'Optimal bit life utilization, prevent hole problems', status: 'active' },
  { stream: 'upstream', department: 'Production Engineering', use_case_name: 'ESP Pump Monitoring', ai_type: 'IoT + Anomaly ML', technology: 'Vibration FFT, time series anomaly detection', model_name: 'Isolation Forest, LSTM Autoencoder', data_input: 'Motor temperature, vibration, current, fluid levels', output_type: 'Pump health score, failure prediction, maintenance alert', business_value: '20% reduction in ESP failures, optimized intervention timing', status: 'deployed' },
  { stream: 'upstream', department: 'Production Engineering', use_case_name: 'Production Forecasting', ai_type: 'LSTM Time Series', technology: 'Seq2Seq LSTM, transformer time series', model_name: 'LSTM, Temporal Fusion Transformer', data_input: 'Historical rates, pressures, GOR, WCT', output_type: '30/90/365-day production forecast, uncertainty bands', business_value: 'Accurate budget planning, optimized facility sizing', status: 'deployed' },
  { stream: 'upstream', department: 'HSE/Safety', use_case_name: 'H2S Gas Leak Detection', ai_type: 'IoT + Statistical ML', technology: 'Multi-sensor fusion, SPC, threshold ML', model_name: 'Ensemble SPC, anomaly detection', data_input: 'H2S sensors, wind direction, atmospheric data', output_type: 'Leak localization, dispersion plume, evacuation zones', business_value: 'Personnel safety, regulatory compliance, incident prevention', status: 'deployed' },
  { stream: 'upstream', department: 'Production Engineering', use_case_name: 'Flow Assurance', ai_type: 'Digital Twin + CFD-ML', technology: 'Multiphase flow simulation surrogate', model_name: 'Physics-ML hybrid, neural ODE', data_input: 'Temperature, pressure profiles, fluid composition', output_type: 'Hydrate/wax/scale risk prediction, flow guarantee', business_value: 'Prevent costly flowline blockages, optimize chemical injection', status: 'active' },
  { stream: 'upstream', department: 'Well Integrity', use_case_name: 'Wellbore Integrity Monitoring', ai_type: 'IoT + ML Regression', technology: 'Casing inspection ML, barrier analysis', model_name: 'Regression ensemble, time series', data_input: 'Annular pressures, casing inspection logs, cement logs', output_type: 'Barrier status classification, integrity score, intervention priority', business_value: 'Prevent well blowouts, reduce regulatory risk', status: 'deployed' },
  { stream: 'upstream', department: 'HSE/Safety', use_case_name: 'SIMOPS Risk Assessment', ai_type: 'AI + RAG', technology: 'NLP risk matrix, RAG procedure lookup', model_name: 'LLM + vector search, risk ML', data_input: 'Operational activities, work orders, procedures', output_type: 'Conflict matrix, risk level, mitigation recommendations', business_value: 'Zero SIMOPS-related incidents, streamlined permit-to-work', status: 'active' },
  // MIDSTREAM
  { stream: 'midstream', department: 'Pipeline Integrity', use_case_name: 'Pipeline Leak Detection', ai_type: 'Statistical ML + IoT', technology: 'Pressure wave analysis, RTTM, ML', model_name: 'Statistical process control, LSTM', data_input: 'Flow, pressure, temperature from SCADA', output_type: 'Leak location estimate, severity, confidence score', business_value: 'Early detection prevents environmental damage, reduces product loss', status: 'deployed' },
  { stream: 'midstream', department: 'Pipeline Integrity', use_case_name: 'Corrosion Rate Prediction', ai_type: 'ML Regression', technology: 'Electrochemical model surrogate, feature ML', model_name: 'Gradient Boosting, Bayesian regression', data_input: 'Soil data, cathodic protection readings, product chemistry', output_type: 'Annual corrosion rate mm/yr, remaining life estimation', business_value: 'Targeted inspection, optimized pipeline maintenance budget', status: 'deployed' },
  { stream: 'midstream', department: 'Pipeline Integrity', use_case_name: 'ILI Defect Classification', ai_type: 'CV Image Classification', technology: 'MFL/UT signal processing + CNN', model_name: 'ResNet, EfficientNet', data_input: 'Magnetic flux leakage signals, ultrasonic wall thickness', output_type: 'Defect type, severity class, dig priority ranking', business_value: '60% reduction in unnecessary digs, focused integrity management', status: 'deployed' },
  { stream: 'midstream', department: 'Compression', use_case_name: 'Compressor Predictive Maintenance', ai_type: 'ML + Vibration FFT', technology: 'Vibration spectrum analysis, ML health scoring', model_name: 'Random Forest, LSTM Autoencoder', data_input: 'Vibration spectra, temperature, suction/discharge P', output_type: 'Component health scores, failure mode prediction, maintenance schedule', business_value: '30% reduction in unplanned shutdowns, optimized maintenance costs', status: 'deployed' },
  { stream: 'midstream', department: 'SCADA/Control', use_case_name: 'SCADA Anomaly Detection', ai_type: 'Statistical ML + DL', technology: 'Multivariate anomaly detection, autoencoders', model_name: 'LSTM Autoencoder, Isolation Forest', data_input: '10,000+ SCADA tags, historical operational data', output_type: 'Anomaly score, affected tags, root cause ranking', business_value: 'Early operational issue detection, cybersecurity threat detection', status: 'deployed' },
  { stream: 'midstream', department: 'Pipeline Operations', use_case_name: 'Pigging Schedule Optimization', ai_type: 'ML Scheduling', technology: 'Fouling rate model, scheduling optimizer', model_name: 'XGBoost + constraint optimization', data_input: 'Pig run history, pressure drop trends, product flow', output_type: 'Optimal pig run schedule, expected pressure recovery', business_value: '15% improvement in pipeline throughput efficiency', status: 'active' },
  { stream: 'midstream', department: 'Storage', use_case_name: 'LNG Loading Optimization', ai_type: 'ML Optimization', technology: 'Multi-objective optimization, constraint ML', model_name: 'Genetic algorithm + ML surrogate', data_input: 'Vessel schedule, tank levels, boiloff rates, tides', output_type: 'Optimal loading sequence, boiloff minimization plan', business_value: 'Minimize boiloff losses ($2M+ per cargo), optimize berth utilization', status: 'active' },
  { stream: 'midstream', department: 'Metering', use_case_name: 'Gas Chromatograph Anomaly', ai_type: 'Statistical ML', technology: 'Time series anomaly, SPC', model_name: 'EWMA, Isolation Forest', data_input: 'GC component readings, calibration history', output_type: 'Calibration drift alert, measurement uncertainty flag', business_value: 'Custody transfer accuracy, regulatory compliance', status: 'deployed' },
  { stream: 'midstream', department: 'Pipeline Operations', use_case_name: 'Pig Tracking', ai_type: 'IoT + GPS', technology: 'Acoustic signature + GPS triangulation', model_name: 'Signal processing + KNN', data_input: 'Acoustic sensors, pig passage detectors, SCADA', output_type: 'Real-time pig location, ETA at receiver', business_value: 'Prevent lost pig incidents, optimize inspection window', status: 'deployed' },
  { stream: 'midstream', department: 'SCADA/Control', use_case_name: 'Alarm Rationalization', ai_type: 'ML Classification + NLP', technology: 'Alarm clustering, nuisance alarm detection', model_name: 'Clustering + LLM classification', data_input: 'Historical alarm logs, process data, operator responses', output_type: 'Rationalized alarm set, priority tiers, dead band recommendations', business_value: '70% alarm flood reduction, improved operator response quality', status: 'active' },
  // DOWNSTREAM
  { stream: 'downstream', department: 'Process Engineering', use_case_name: 'Crude Blending Optimization', ai_type: 'LP + ML', technology: 'Linear programming + ML property prediction', model_name: 'CPLEX + XGBoost', data_input: 'Crude assay data, unit capacities, product specs, prices', output_type: 'Optimal blend recipe, predicted product yields, economic margin', business_value: '$0.50-1.50/bbl margin improvement, maximize high-value products', status: 'deployed' },
  { stream: 'downstream', department: 'Refinery Operations', use_case_name: 'Distillation Column Optimization', ai_type: 'ML + Digital Twin', technology: 'Column simulation surrogate, RL control', model_name: 'MPC + ML surrogate, DQN RL', data_input: 'Feed composition, temperatures, pressures, reflux ratios', output_type: 'Optimal operating conditions, product cut points, energy usage', business_value: '5-10% energy reduction, improved product separation', status: 'deployed' },
  { stream: 'downstream', department: 'Refinery Operations', use_case_name: 'FCC Catalyst Deactivation', ai_type: 'ML Regression', technology: 'Catalyst aging model, time series', model_name: 'Gaussian Process + XGBoost', data_input: 'Catalyst activity, coke yield, regenerator temperature', output_type: 'Catalyst activity forecast, optimal regeneration timing', business_value: 'Extended catalyst life, optimized regeneration cycles', status: 'active' },
  { stream: 'downstream', department: 'Product Quality/QC', use_case_name: 'Product Quality Prediction', ai_type: 'ML - Specs from Feed', technology: 'Soft sensor, feed-to-product ML', model_name: 'Partial Least Squares + NN', data_input: 'Feed properties, process conditions, historical lab data', output_type: 'Predicted product specifications, off-spec risk probability', business_value: '50% reduction in lab costs, real-time quality control', status: 'deployed' },
  { stream: 'downstream', department: 'Environmental', use_case_name: 'Flare Monitoring', ai_type: 'CV Image Segmentation', technology: 'Thermal camera + CV segmentation', model_name: 'DeepLab v3, semantic segmentation', data_input: 'Thermal camera feed, UV flame detection', output_type: 'Flare volume estimate, combustion efficiency, emission estimate', business_value: 'Regulatory compliance, minimize venting/flaring losses', status: 'deployed' },
  { stream: 'downstream', department: 'Maintenance', use_case_name: 'Refinery Energy Management', ai_type: 'ML + IoT', technology: 'Steam/power system optimization, IoT metering', model_name: 'Multi-objective ML optimizer', data_input: 'Steam flows, power consumption, furnace efficiencies', output_type: 'Energy reduction recommendations, fuel saving plan', business_value: '3-8% energy cost reduction across refinery operations', status: 'active' },
  { stream: 'downstream', department: 'Distribution', use_case_name: 'Tank Level Optimization', ai_type: 'ML + IoT', technology: 'Demand forecasting, inventory optimization', model_name: 'SARIMA + RL optimizer', data_input: 'Tank levels, transfer schedules, demand history', output_type: 'Optimal tank fill/draw schedule, minimize demurrage', business_value: 'Reduce tank turnover costs, minimize product quality degradation', status: 'deployed' },
  { stream: 'downstream', department: 'Environmental', use_case_name: 'Emission Monitoring', ai_type: 'IoT + ML', technology: 'CEMS data fusion, dispersion modeling', model_name: 'Regression + CFD surrogate', data_input: 'CEMS readings, stack tests, atmospheric data', output_type: 'Real-time emission rates, permit compliance status, alerts', business_value: 'Regulatory compliance, avoid $1M+ penalties', status: 'deployed' },
  { stream: 'downstream', department: 'Refinery Operations', use_case_name: 'Coking Prediction', ai_type: 'ML Time Series', technology: 'Furnace tube fouling rate, thermal model ML', model_name: 'LSTM + physics surrogate', data_input: 'Furnace temperatures, run lengths, feed properties', output_type: 'Decoking schedule prediction, run length optimization', business_value: 'Extended run lengths, reduced decoking frequency and cost', status: 'active' },
  { stream: 'downstream', department: 'Refinery Operations', use_case_name: 'Hydrocracker Optimization', ai_type: 'RL + ML', technology: 'Deep RL for unit optimization, soft sensors', model_name: 'SAC RL + XGBoost', data_input: 'Feed characterization, catalyst age, operating conditions', output_type: 'Optimal WABT, LHSV, H2/HC ratio, product distribution', business_value: '$2-5/bbl improvement in product value', status: 'active' },
  // CROSS-CUTTING
  { stream: 'cross-cutting', department: 'Data Science/AI', use_case_name: 'RAG Technical Q&A', ai_type: 'RAG + LLM', technology: 'Vector search + LLM generation', model_name: 'llama3.2 + ChromaDB embeddings', data_input: 'Technical manuals, procedures, standards, incident reports', output_type: 'Precise Q&A with source citations, procedure references', business_value: '60% reduction in time-to-answer for technical queries', status: 'deployed' },
  { stream: 'cross-cutting', department: 'HSE/Safety', use_case_name: 'Worker PPE Detection', ai_type: 'CV Object Detection', technology: 'Real-time video analysis, YOLO', model_name: 'YOLO v8, EfficientDet', data_input: 'CCTV camera feeds across facilities', output_type: 'PPE compliance score, violation alerts, location tagging', business_value: 'Zero tolerance PPE enforcement, regulatory compliance', status: 'deployed' },
  { stream: 'cross-cutting', department: 'Maintenance', use_case_name: 'Facility Inspection Drone', ai_type: 'CV + Object Detection', technology: 'Drone autonomy + CV defect detection', model_name: 'YOLO + custom defect classifier', data_input: 'Drone camera/LiDAR, inspection history', output_type: 'Defect inventory, severity map, inspection report', business_value: '80% cost reduction vs. rope access, improved safety', status: 'active' },
  { stream: 'cross-cutting', department: 'IT/Digital', use_case_name: 'Document Intelligence', ai_type: 'NLP + RAG', technology: 'OCR + NLP extraction + vector search', model_name: 'llama3.2 + sentence transformers', data_input: 'P&IDs, maintenance records, regulatory documents', output_type: 'Structured data extraction, Q&A, document search', business_value: 'Eliminate manual document search, knowledge preservation', status: 'deployed' },
  { stream: 'cross-cutting', department: 'SCADA/Control', use_case_name: 'Alarm Fatigue Reduction', ai_type: 'ML Classification', technology: 'Alarm clustering, priority ML', model_name: 'K-means + classification ensemble', data_input: 'Historical alarm logs, operator acknowledgments', output_type: 'High-priority alarm subset, nuisance alarm list, standing alarm resolution', business_value: 'Improved operator effectiveness, faster upset response', status: 'deployed' },
  { stream: 'cross-cutting', department: 'Procurement', use_case_name: 'Predictive Spare Parts', ai_type: 'ML + Supply Chain', technology: 'Demand forecasting, inventory optimization', model_name: 'XGBoost demand forecast + optimization', data_input: 'CMMS work orders, failure history, lead times', output_type: 'Optimal stock levels, reorder points, critical spare recommendations', business_value: '25% inventory cost reduction, improved equipment availability', status: 'active' },
  { stream: 'cross-cutting', department: 'Environmental', use_case_name: 'Environmental Incident Prediction', ai_type: 'ML', technology: 'Risk factor ML, historical pattern analysis', model_name: 'Gradient Boosting, survival analysis', data_input: 'Inspection history, equipment age, process conditions, weather', output_type: 'Environmental incident risk score, preventive action priority', business_value: 'Prevent environmental incidents, reduce regulatory exposure', status: 'active' },
  { stream: 'cross-cutting', department: 'Data Science/AI', use_case_name: 'KPI Anomaly Alerting', ai_type: 'Statistical ML', technology: 'Multivariate SPC, EWMA, CUSUM', model_name: 'Statistical control charts + ML', data_input: 'All operational KPIs across streams', output_type: 'Anomaly score, affected KPI list, diagnostic context', business_value: 'Early operational deterioration detection across all business areas', status: 'deployed' },
  { stream: 'cross-cutting', department: 'Data Science/AI', use_case_name: 'Digital Twin Calibration', ai_type: 'Physics ML', technology: 'History matching, model calibration', model_name: 'Bayesian optimization + physics model', data_input: 'Real sensor measurements, model predictions, process data', output_type: 'Calibrated model parameters, reduced prediction error', business_value: 'Maintain twin accuracy over time, improve optimization recommendations', status: 'active' },
  { stream: 'cross-cutting', department: 'Exploration & Geology', use_case_name: 'Noise-free Seismic Processing', ai_type: 'DL Denoising', technology: 'U-Net denoising, wavelet DL', model_name: 'DnCNN, U-Net denoiser', data_input: 'Raw seismic shot gathers with ground roll, multiples', output_type: 'Clean seismic sections, improved S/N ratio', business_value: 'Better interpretation quality, improved prospect delineation', status: 'deployed' },
  { stream: 'upstream', department: 'Well Integrity', use_case_name: 'Cement Evaluation ML', ai_type: 'ML + Signal Processing', technology: 'Acoustic cement log analysis', model_name: 'CNN signal classifier', data_input: 'Acoustic cement bond logs, ultrasonic images', output_type: 'Cement quality map, channeling risk, remediation priority', business_value: 'Well integrity compliance, prevent sustained casing pressure', status: 'active' },
  { stream: 'midstream', department: 'Gas Processing', use_case_name: 'NGL Fractionation Optimization', ai_type: 'ML + Process', technology: 'Column optimization ML surrogate', model_name: 'Neural network surrogate + LP', data_input: 'Feed gas composition, product specs, energy prices', output_type: 'Optimal split fractions, energy-product value tradeoff', business_value: '$1-3M/year product value improvement per plant', status: 'active' },
  { stream: 'downstream', department: 'Commercial/Trading', use_case_name: 'Price Forecasting', ai_type: 'ML Time Series', technology: 'Multi-factor commodity price ML', model_name: 'LSTM + fundamental models', data_input: 'Market prices, inventory data, geopolitical signals, derivatives', output_type: '7/30/90-day price forecast with confidence intervals', business_value: 'Improved procurement and hedging decisions, margin optimization', status: 'active' },
  { stream: 'upstream', department: 'Production Engineering', use_case_name: 'Artificial Lift Optimization', ai_type: 'ML + IoT', technology: 'Pump performance ML, nodal analysis', model_name: 'Gradient Boosting + optimization', data_input: 'Pump intake pressure, GOR, water cut, pump setting depth', output_type: 'Optimal pump operating point, GL injection rate', business_value: '10-15% production increase through optimized lift design', status: 'deployed' },
  { stream: 'midstream', department: 'Pipeline Integrity', use_case_name: 'Cathodic Protection Optimization', ai_type: 'ML IoT', technology: 'CP survey data ML, soil modeling', model_name: 'Interpolation ML + regression', data_input: 'CP measurement surveys, soil resistivity, current drainage', output_type: 'Protection adequacy map, rectifier adjustment recommendations', business_value: 'Prevent external corrosion, extend pipeline life by 10+ years', status: 'active' },
  { stream: 'downstream', department: 'Maintenance', use_case_name: 'Heat Exchanger Fouling Prediction', ai_type: 'ML Time Series + IoT', technology: 'Thermal performance monitoring ML', model_name: 'LSTM + performance model', data_input: 'Inlet/outlet temperatures, flow rates, duty', output_type: 'Fouling factor trend, cleaning schedule optimization', business_value: '20% improvement in heat exchanger availability, energy savings', status: 'active' },
  { stream: 'upstream', department: 'Drilling Engineering', use_case_name: 'Wellbore Stability Prediction', ai_type: 'ML + Geomechanics', technology: 'Geomechanical model ML, stress analysis', model_name: 'SVM + geomechanical surrogate', data_input: 'Formation strength, pore pressure, in-situ stresses, mud weight', output_type: 'Safe mud weight window, borehole stability risk map', business_value: 'Prevent costly wellbore instability problems ($1-10M+ per event)', status: 'deployed' },
  { stream: 'midstream', department: 'Compression', use_case_name: 'Compressor Surge Protection', ai_type: 'ML + Control', technology: 'Real-time surge prediction, fast MPC', model_name: 'Neural MPC + surge model', data_input: 'Flow, pressure ratio, speed, inlet conditions', output_type: 'Surge margin monitoring, anti-surge valve control signal', business_value: 'Prevent mechanical damage from surge, safe operating envelope', status: 'deployed' },
  { stream: 'downstream', department: 'Refinery Operations', use_case_name: 'Reformer Catalyst Management', ai_type: 'ML Regression', technology: 'Catalyst age-activity model, cycle optimization', model_name: 'Bayesian regression + optimization', data_input: 'Catalyst age, RON, severity, feed quality', output_type: 'Optimal severity schedule, regeneration timing, cycle length prediction', business_value: 'Maximize catalyst life, maintain octane targets', status: 'active' },
];

const DEPARTMENTS = [
  { name: 'Exploration & Geology', stream: 'upstream', head_count: 45, key_kpis: ['Prospect success rate', 'Seismic quality score', 'Discovery cost $/BOE', '2P reserves additions'], ai_use_cases: ['Seismic Interpretation', 'Formation Evaluation', 'Noise-free Seismic Processing', 'Wellbore Stability Prediction'] },
  { name: 'Drilling Engineering', stream: 'upstream', head_count: 60, key_kpis: ['ROP m/hr', 'NPT %', 'Well cost vs AFE', 'Stuck pipe incidents'], ai_use_cases: ['Drilling ROP Optimization', 'Stuck Pipe Prediction', 'Bit Wear Detection', 'Wellbore Stability Prediction'] },
  { name: 'Reservoir Engineering', stream: 'upstream', head_count: 35, key_kpis: ['Recovery factor %', '2P reserves MMBOE', 'Reservoir pressure decline', 'History match quality'], ai_use_cases: ['Reservoir Simulation', 'Decline Curve Analysis', 'Well Log Analysis', 'Digital Twin Calibration'] },
  { name: 'Production Engineering', stream: 'upstream', head_count: 50, key_kpis: ['Gross production BOE/d', 'Water cut %', 'GOR scf/bbl', 'Uptime %'], ai_use_cases: ['ESP Pump Monitoring', 'Production Forecasting', 'Flow Assurance', 'Artificial Lift Optimization'] },
  { name: 'Well Completion', stream: 'upstream', head_count: 30, key_kpis: ['Completion cost $/ft', 'Proppant placed ton', 'IP30 BOE/d', 'Stage count'], ai_use_cases: ['Well Log Analysis', 'Wellbore Integrity Monitoring', 'Cement Evaluation ML'] },
  { name: 'Well Integrity', stream: 'upstream', head_count: 25, key_kpis: ['Barrier status A/B/C', 'Sustained casing pressure wells', 'Integrity tests passed', 'Remediation backlog'], ai_use_cases: ['Wellbore Integrity Monitoring', 'Cement Evaluation ML', 'Corrosion Rate Prediction'] },
  { name: 'HSE/Safety', stream: 'cross-cutting', head_count: 40, key_kpis: ['TRIR', 'LTIF', 'Near miss reporting rate', 'H2S drills completed'], ai_use_cases: ['H2S Gas Leak Detection', 'SIMOPS Risk Assessment', 'Worker PPE Detection', 'Environmental Incident Prediction'] },
  { name: 'Pipeline Integrity', stream: 'midstream', head_count: 35, key_kpis: ['Defect density per km', 'ILI coverage %', 'Corrosion rate mm/yr', 'CP system effectiveness'], ai_use_cases: ['Pipeline Leak Detection', 'Corrosion Rate Prediction', 'ILI Defect Classification', 'Cathodic Protection Optimization'] },
  { name: 'Pipeline Operations', stream: 'midstream', head_count: 55, key_kpis: ['Pipeline throughput MMscf/d', 'Hydraulic efficiency %', 'Pigging frequency', 'Pressure drop'], ai_use_cases: ['Pigging Schedule Optimization', 'Pig Tracking', 'SCADA Anomaly Detection'] },
  { name: 'Compression', stream: 'midstream', head_count: 40, key_kpis: ['Compression efficiency %', 'Unplanned downtime hrs', 'Power consumption kW', 'Availability %'], ai_use_cases: ['Compressor Predictive Maintenance', 'Compressor Surge Protection', 'Vibration Analysis'] },
  { name: 'Gas Processing', stream: 'midstream', head_count: 45, key_kpis: ['NGL recovery %', 'Acid gas removal efficiency', 'Dehydration outlet dewpoint', 'Plant utilization %'], ai_use_cases: ['NGL Fractionation Optimization', 'Gas Chromatograph Anomaly', 'Energy Management'] },
  { name: 'Storage', stream: 'midstream', head_count: 30, key_kpis: ['Tank utilization %', 'Inventory turnover', 'Ullage management', 'LNG boiloff rate %'], ai_use_cases: ['LNG Loading Optimization', 'Tank Level Optimization', 'Inventory Forecasting'] },
  { name: 'SCADA/Control', stream: 'midstream', head_count: 25, key_kpis: ['Alarm rate per operator-hour', 'Control loop performance', 'Cybersecurity incidents', 'SCADA uptime %'], ai_use_cases: ['SCADA Anomaly Detection', 'Alarm Fatigue Reduction', 'Alarm Rationalization'] },
  { name: 'Metering', stream: 'midstream', head_count: 20, key_kpis: ['Measurement uncertainty %', 'Calibration drift events', 'Audit trail completeness', 'Unaccounted for gas %'], ai_use_cases: ['Gas Chromatograph Anomaly', 'Flow Computer Calibration', 'Measurement Uncertainty'] },
  { name: 'Refinery Operations', stream: 'downstream', head_count: 120, key_kpis: ['Utilization %', 'Distillate yield %', 'Energy intensity BTU/bbl', 'EII index'], ai_use_cases: ['Crude Blending Optimization', 'Distillation Column Optimization', 'FCC Catalyst Deactivation', 'Hydrocracker Optimization'] },
  { name: 'Process Engineering', stream: 'downstream', head_count: 50, key_kpis: ['Operating cost $/bbl', 'Yield improvement %', 'Energy optimization savings', 'Debottlenecking projects'], ai_use_cases: ['Crude Blending Optimization', 'Distillation Column Optimization', 'Heat Exchanger Fouling Prediction'] },
  { name: 'Product Quality/QC', stream: 'downstream', head_count: 35, key_kpis: ['Off-spec batches/month', 'Lab turnaround time hrs', 'Spec compliance %', 'Customer complaints'], ai_use_cases: ['Product Quality Prediction', 'Blending Optimization', 'Contamination Detection'] },
  { name: 'Maintenance', stream: 'cross-cutting', head_count: 80, key_kpis: ['Equipment availability %', 'MTBF hours', 'Maintenance cost $/year', 'PM completion rate %'], ai_use_cases: ['Compressor Predictive Maintenance', 'ESP Pump Monitoring', 'Facility Inspection Drone', 'Predictive Spare Parts'] },
  { name: 'Distribution', stream: 'downstream', head_count: 45, key_kpis: ['On-time delivery %', 'Truck utilization %', 'Demurrage cost', 'Tank farm efficiency'], ai_use_cases: ['Tank Level Optimization', 'Logistics Optimization', 'Demand Forecasting'] },
  { name: 'Commercial/Trading', stream: 'downstream', head_count: 30, key_kpis: ['Cargo optimization savings', 'Hedge effectiveness', 'Realized price vs benchmark', 'Counterparty exposure'], ai_use_cases: ['Price Forecasting', 'Cargo Optimization', 'Risk Analytics'] },
  { name: 'Environmental', stream: 'cross-cutting', head_count: 25, key_kpis: ['CO2e tonnes/year', 'Flaring volume MMSCF', 'Wastewater compliance %', 'Spill incidents'], ai_use_cases: ['Flare Monitoring', 'Emission Monitoring', 'Environmental Incident Prediction'] },
  { name: 'Procurement', stream: 'cross-cutting', head_count: 35, key_kpis: ['Procurement savings %', 'Supplier on-time delivery', 'Critical spare availability', 'PO cycle time'], ai_use_cases: ['Predictive Spare Parts', 'Demand Forecasting', 'Supplier Risk Scoring'] },
  { name: 'IT/Digital', stream: 'cross-cutting', head_count: 45, key_kpis: ['System uptime %', 'Cybersecurity incidents', 'Digital twin coverage', 'Data pipeline health'], ai_use_cases: ['Document Intelligence', 'SCADA Anomaly Detection', 'KPI Anomaly Alerting'] },
  { name: 'Data Science/AI', stream: 'cross-cutting', head_count: 30, key_kpis: ['Model accuracy improvement', 'Models in production', 'Data quality score', 'AI value delivered $M'], ai_use_cases: ['RAG Technical Q&A', 'KPI Anomaly Alerting', 'Digital Twin Calibration', 'Model Governance'] },
];

const DIGITAL_TWINS = [
  { twin_name: 'Reservoir Alpha Digital Twin', twin_type: 'reservoir', asset_id: 'RSV-001', stream: 'upstream', sync_status: 'connected', health_score: 92 },
  { twin_name: 'Pipeline Trunk Line Twin', twin_type: 'pipeline', asset_id: 'PL-042', stream: 'midstream', sync_status: 'connected', health_score: 87 },
  { twin_name: 'Main Compression Station Twin', twin_type: 'compressor', asset_id: 'CS-015', stream: 'midstream', sync_status: 'connected', health_score: 95 },
  { twin_name: 'CDU-1 Refinery Unit Twin', twin_type: 'refinery_unit', asset_id: 'CDU-001', stream: 'downstream', sync_status: 'connected', health_score: 89 },
  { twin_name: 'Well X-42 Production Twin', twin_type: 'well', asset_id: 'WL-042', stream: 'upstream', sync_status: 'connected', health_score: 78 },
  { twin_name: 'Gas Processing Plant Twin', twin_type: 'gas_plant', asset_id: 'GP-007', stream: 'midstream', sync_status: 'syncing', health_score: 83 },
  { twin_name: 'FCC Unit Digital Twin', twin_type: 'refinery_unit', asset_id: 'FCC-002', stream: 'downstream', sync_status: 'connected', health_score: 91 },
  { twin_name: 'LNG Storage Tank Farm Twin', twin_type: 'storage', asset_id: 'LNG-TF-01', stream: 'midstream', sync_status: 'disconnected', health_score: 60 },
];

const SENSORS = [
  { sensor_id: 'PT-US-001', sensor_type: 'pressure', location: 'Wellhead Alpha-12', stream: 'upstream', unit: 'psi', current_value: 3245, status: 'active' },
  { sensor_id: 'TT-US-002', sensor_type: 'temperature', location: 'Wellhead Alpha-12', stream: 'upstream', unit: '°F', current_value: 185, status: 'active' },
  { sensor_id: 'FT-US-003', sensor_type: 'flow', location: 'Production Header Alpha', stream: 'upstream', unit: 'BOE/d', current_value: 4520, status: 'active' },
  { sensor_id: 'VB-US-004', sensor_type: 'vibration', location: 'ESP Pump Well-42', stream: 'upstream', unit: 'mm/s RMS', current_value: 3.2, status: 'active' },
  { sensor_id: 'GS-US-005', sensor_type: 'gas_detector', location: 'Process Area H2S Zone', stream: 'upstream', unit: 'ppm', current_value: 0.5, status: 'active' },
  { sensor_id: 'PT-MS-001', sensor_type: 'pressure', location: 'Pipeline Inlet Trunk', stream: 'midstream', unit: 'bar', current_value: 72.4, status: 'active' },
  { sensor_id: 'FT-MS-002', sensor_type: 'flow', location: 'Pipeline Trunk Inlet', stream: 'midstream', unit: 'MMscf/d', current_value: 245, status: 'active' },
  { sensor_id: 'VB-MS-003', sensor_type: 'vibration', location: 'Compressor CS-015 Drive End', stream: 'midstream', unit: 'g RMS', current_value: 0.8, status: 'active' },
  { sensor_id: 'TT-MS-004', sensor_type: 'temperature', location: 'Compressor CS-015 Discharge', stream: 'midstream', unit: '°C', current_value: 142, status: 'active' },
  { sensor_id: 'LT-MS-005', sensor_type: 'level', location: 'LNG Tank T-001', stream: 'midstream', unit: '% volume', current_value: 78.3, status: 'active' },
  { sensor_id: 'PT-DS-001', sensor_type: 'pressure', location: 'CDU Overhead Condenser', stream: 'downstream', unit: 'psig', current_value: 12.8, status: 'active' },
  { sensor_id: 'TT-DS-002', sensor_type: 'temperature', location: 'CDU Column Bottom', stream: 'downstream', unit: '°F', current_value: 695, status: 'active' },
  { sensor_id: 'FT-DS-003', sensor_type: 'flow', location: 'Crude Feed to CDU', stream: 'downstream', unit: 'bbl/d', current_value: 95400, status: 'active' },
  { sensor_id: 'AT-DS-004', sensor_type: 'analyzer', location: 'Product Quality Lab Inline', stream: 'downstream', unit: 'RVP psi', current_value: 9.2, status: 'active' },
  { sensor_id: 'EM-DS-005', sensor_type: 'emission', location: 'Stack CEMS FCC Unit', stream: 'downstream', unit: 'ppm SO2', current_value: 145, status: 'active' },
  { sensor_id: 'PT-MS-006', sensor_type: 'pressure', location: 'Pipeline Delivery Point', stream: 'midstream', unit: 'bar', current_value: 68.1, status: 'active' },
  { sensor_id: 'TT-US-006', sensor_type: 'temperature', location: 'Reservoir Downhole BH', stream: 'upstream', unit: '°F', current_value: 215, status: 'active' },
  { sensor_id: 'VB-DS-001', sensor_type: 'vibration', location: 'Refinery Pump P-042', stream: 'downstream', unit: 'mm/s RMS', current_value: 2.1, status: 'active' },
  { sensor_id: 'GC-MS-001', sensor_type: 'gas_chromatograph', location: 'Pipeline Inlet GC', stream: 'midstream', unit: 'mol% CH4', current_value: 94.2, status: 'active' },
  { sensor_id: 'LT-US-001', sensor_type: 'level', location: 'Separator Three-Phase', stream: 'upstream', unit: 'inches', current_value: 42, status: 'active' },
];

export async function GET() {
  try {
    await pool.query(CREATE_TABLES);

    // Seed use cases if empty
    const ucCount = await pool.query('SELECT COUNT(*) FROM ogo_use_case');
    if (parseInt(ucCount.rows[0].count) === 0) {
      for (const uc of USE_CASES) {
        await pool.query(
          `INSERT INTO ogo_use_case (stream,department,use_case_name,ai_type,technology,model_name,data_input,output_type,business_value,status)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [uc.stream, uc.department, uc.use_case_name, uc.ai_type, uc.technology, uc.model_name, uc.data_input, uc.output_type, uc.business_value, uc.status]
        );
      }
    }

    // Seed departments if empty
    const deptCount = await pool.query('SELECT COUNT(*) FROM ogo_department');
    if (parseInt(deptCount.rows[0].count) === 0) {
      for (const d of DEPARTMENTS) {
        await pool.query(
          `INSERT INTO ogo_department (name,stream,head_count,key_kpis,ai_use_cases)
           VALUES ($1,$2,$3,$4,$5)`,
          [d.name, d.stream, d.head_count, JSON.stringify(d.key_kpis), JSON.stringify(d.ai_use_cases)]
        );
      }
    }

    // Seed digital twins if empty
    const dtCount = await pool.query('SELECT COUNT(*) FROM ogo_digital_twin');
    if (parseInt(dtCount.rows[0].count) === 0) {
      for (const dt of DIGITAL_TWINS) {
        await pool.query(
          `INSERT INTO ogo_digital_twin (twin_name,twin_type,asset_id,stream,sync_status,last_sync,health_score)
           VALUES ($1,$2,$3,$4,$5,NOW(),$6)`,
          [dt.twin_name, dt.twin_type, dt.asset_id, dt.stream, dt.sync_status, dt.health_score]
        );
      }
    }

    // Seed sensors if empty
    const sensorCount = await pool.query('SELECT COUNT(*) FROM ogo_sensor');
    if (parseInt(sensorCount.rows[0].count) === 0) {
      for (const s of SENSORS) {
        await pool.query(
          `INSERT INTO ogo_sensor (sensor_id,sensor_type,location,stream,unit,current_value,last_reading,status)
           VALUES ($1,$2,$3,$4,$5,$6,NOW(),$7)`,
          [s.sensor_id, s.sensor_type, s.location, s.stream, s.unit, s.current_value, s.status]
        );
      }
    }

    // Seed default roles if empty
    const roleCount = await pool.query('SELECT COUNT(*) FROM ogo_role');
    if (parseInt(roleCount.rows[0].count) === 0) {
      await pool.query(`INSERT INTO ogo_role (name, permissions) VALUES ('admin', $1), ('engineer', $2), ('viewer', $3)`,
        [JSON.stringify({ all: true }), JSON.stringify({ read: true, write: true }), JSON.stringify({ read: true })]);
    }

    return Response.json({
      ok: true,
      tables_created: true,
      seeded: {
        use_cases: USE_CASES.length,
        departments: DEPARTMENTS.length,
        digital_twins: DIGITAL_TWINS.length,
        sensors: SENSORS.length,
      }
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function POST() {
  return GET();
}
