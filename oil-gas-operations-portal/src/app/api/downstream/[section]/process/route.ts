export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';

const SECTION_DATA: Record<string, {
  process_id: string;
  title: string;
  description: string;
  steps: { step: number; name: string; inputs: string; activities: string; outputs: string; ai_model: string; kpi: string; duration: string }[];
  ai_models: { name: string; type: string; input: string; output: string }[];
  kpis: { name: string; value: string; unit: string }[];
}> = {
  refining: {
    process_id: 'P-DS-01',
    title: 'Crude Distillation Process (CDU/VDU)',
    description: 'Crude desalting → atmospheric distillation → vacuum distillation → FCC/HCK conversion',
    steps: [
      { step: 1, name: 'Crude Desalting', inputs: 'Raw crude, wash water', activities: 'Electrostatic desalter: mix crude + wash water, coalesce salt droplets, settle', outputs: 'Desalted crude < 1 PTB salt', ai_model: 'Desalter Efficiency Optimizer, Corrosion Rate Predictor', kpi: 'Salt PTB, BS&W %', duration: 'Continuous' },
      { step: 2, name: 'Atmospheric Distillation (CDU)', inputs: 'Desalted crude 200-300kbpd', activities: 'Fire crude to 350°C, fractionate at 1.2 bar into naphtha/kero/diesel/residue', outputs: 'Naphtha, Kerosene, Diesel, Atmospheric Residue', ai_model: 'Cut Point Optimizer, Column Stability Monitor, Fouling Rate Predictor', kpi: 'Cut yields %, energy kJ/bbl', duration: 'Continuous' },
      { step: 3, name: 'Vacuum Distillation (VDU)', inputs: 'Atmospheric residue (370°C+)', activities: 'Distill at 10-50 mmHg vacuum to avoid thermal cracking', outputs: 'LVGO, HVGO, Vacuum Residue', ai_model: 'Vacuum Level Controller, Color Spec Predictor', kpi: 'HVGO yield %, VGO color', duration: 'Continuous' },
      { step: 4, name: 'FCC (Fluid Catalytic Cracking)', inputs: 'HVGO from VDU', activities: 'Contact with hot catalyst 700°C in riser → crack → separate → regenerate catalyst at 720°C', outputs: 'FCC Gasoline 40-50%, LPG, LCO, Slurry', ai_model: 'Catalyst Deactivation Model, Yield Predictor, Regenerator Temp Controller', kpi: 'FCC conversion %, coke yield %, gasoline yield %', duration: 'Continuous' },
      { step: 5, name: 'Hydrocracker/Hydrotreater', inputs: 'VGO, H2 (150-200 bar)', activities: 'Ni-Mo/Co-Mo catalyst bed at 350-420°C: crack + desulphurize VGO', outputs: 'Premium diesel, jet fuel, naphtha (sulphur < 15 ppm ULSD)', ai_model: 'Catalyst Temp Profile Optimizer, H2 Consumption Predictor, Product Quality Predictor', kpi: 'Diesel cetane index, ULSD sulphur ppm, H2 consumption', duration: 'Continuous (2-4 yr catalyst cycle)' },
    ],
    ai_models: [
      { name: 'Desalter Efficiency Optimizer', type: 'ML', input: 'Wash water rate, mix valve ΔP, temperature', output: 'Optimal desalter setpoints → target < 1 PTB' },
      { name: 'Cut Point Optimizer', type: 'ML Real-time', input: 'Crude blend properties, product demand', output: 'Pump-around & draw rates → max value yield' },
      { name: 'FCC Yield Predictor', type: 'ML', input: 'Feed properties, catalyst activity, operating conditions', output: 'Product yields before batch' },
      { name: 'H₂ Consumption Predictor', type: 'ML', input: 'Feed properties (N, S, density)', output: 'H₂ consumption for refinery H₂ balance' },
    ],
    kpis: [
      { name: 'CDU Throughput', value: '200,000–300,000', unit: 'bpd' },
      { name: 'Outlet Salt Content', value: '< 1', unit: 'PTB' },
      { name: 'FCC Conversion', value: '70–80', unit: '%' },
      { name: 'ULSD Sulphur', value: '< 15', unit: 'ppm' },
    ],
  },
  process: {
    process_id: 'P-DS-02',
    title: 'Process Optimization & Crude Blending',
    description: 'LP-based crude blend optimization · MPC advanced process control',
    steps: [
      { step: 1, name: 'Crude Assay Database', inputs: 'Crude assays from supplier, lab analysis', activities: 'Maintain updated crude assay library for LP inputs', outputs: 'Current crude property database', ai_model: 'NIR Assay Predictor', kpi: 'Assay currency (weeks since update)', duration: 'Per cargo' },
      { step: 2, name: 'LP Optimization', inputs: 'Crude prices, product demand, CDU capacity', activities: 'Run LP to maximize margin subject to constraints', outputs: 'Optimal blend recipe + crude procurement quantities', ai_model: 'Crude Price Forecaster LSTM, Property Blending Model', kpi: 'Refinery margin $/bbl, LP solve time', duration: 'Daily' },
      { step: 3, name: 'APC/MPC Setpoints', inputs: 'LP output, crude blend properties', activities: 'Translate LP output to APC setpoints for CDU/VDU', outputs: 'Setpoint targets for APC', ai_model: 'Digital Twin-Assisted MPC', kpi: 'APC uptime %, deviation from LP target', duration: 'Every 1-5 min' },
      { step: 4, name: 'Quality Verification', inputs: 'CDU product samples, NIR spectra', activities: 'Verify actual product quality matches LP targets', outputs: 'Quality confirmation or blend adjustment order', ai_model: 'NIR Prediction ML, Spec Violation Predictor', kpi: 'LP vs actual yield gap %, spec compliance %', duration: 'Every 4 hrs per product' },
    ],
    ai_models: [
      { name: 'Property Blending Model', type: 'ML Nonlinear', input: 'Component properties + blend fractions', output: 'Predicted blend property (nonlinear for octane/viscosity)' },
      { name: 'Crude Price Forecaster', type: 'LSTM', input: 'WTI/Brent/WCS 5-yr history', output: '30-day price forecast with confidence intervals' },
      { name: 'Digital Twin-Assisted MPC', type: 'DT + MPC', input: 'Real-time process state + LP targets', output: 'Optimal setpoints (CDU flash zone T, reflux ratios, pump-around duties)' },
    ],
    kpis: [
      { name: 'Refinery Gross Margin', value: 'Target: max', unit: '$/bbl' },
      { name: 'LP Solve Frequency', value: '1–3', unit: 'runs/day' },
      { name: 'APC Uptime', value: '> 95', unit: '%' },
    ],
  },
  quality: {
    process_id: 'P-DS-03',
    title: 'Product Quality Control',
    description: 'LIMS workflow · NIR prediction · Lab testing · CoA generation',
    steps: [
      { step: 1, name: 'Sample Receipt', inputs: 'Product stream samples', activities: 'Sample registration, test assignment, priority queue', outputs: 'Test queue in LIMS', ai_model: 'Auto-test assignment (rule engine)', kpi: 'Registration time min', duration: '15 min' },
      { step: 2, name: 'NIR Analysis', inputs: 'Sample in NIR cell', activities: 'NIR spectrum acquisition → ML model prediction', outputs: 'Predicted properties in < 1 min', ai_model: 'NIR Prediction ML (PLS/Neural Net)', kpi: 'NIR accuracy % vs lab, TAT < 1 min', duration: '< 1 min' },
      { step: 3, name: 'Reference Lab Analysis', inputs: 'Sample + test list', activities: 'Full ASTM method testing (octane, cetane, freezing point etc.)', outputs: 'Full lab result set', ai_model: 'Spec Violation Predictor (early warning from process conditions)', kpi: 'TAT 2-4 hrs, analyst utilization %', duration: '2–4 hrs' },
      { step: 4, name: 'Spec Check', inputs: 'Lab + NIR results, product spec', activities: 'Automated spec comparison → pass/fail per property', outputs: 'Spec status report', ai_model: 'Out-of-Spec Root Cause Analyzer (RAG + ML)', kpi: 'Spec compliance %, out-of-spec rate' , duration: 'Automated < 1 min' },
      { step: 5, name: 'Blend Adjustment', inputs: 'Off-spec result, blend inventory', activities: 'Calculate blend adjustment to bring product on-spec', outputs: 'Blend adjustment order', ai_model: 'Blend Optimizer', kpi: 'Adjustment cycle time hrs, re-test rate %', duration: '2–8 hrs' },
      { step: 6, name: 'Release & CoA', inputs: 'On-spec product, customer order', activities: 'Release product for sale, generate Certificate of Analysis (CoA)', outputs: 'CoA, product released', ai_model: 'CoA Generator (auto-form fill)', kpi: 'Release cycle time, CoA accuracy %', duration: '30 min' },
    ],
    ai_models: [
      { name: 'NIR Prediction Model', type: 'ML (PLS/Neural Net)', input: 'NIR spectrum', output: 'Full product quality profile in < 1 min' },
      { name: 'Spec Violation Predictor', type: 'ML Classification', input: 'Process conditions (CDU T, FCC operating)', output: 'Early warning before product goes off-spec' },
      { name: 'Out-of-Spec Root Cause Analyzer', type: 'ML + RAG', input: 'Current OOS details + historical incident DB', output: 'Top ranked root causes with historical analogues' },
    ],
    kpis: [
      { name: 'NIR TAT', value: '< 1', unit: 'min' },
      { name: 'Full Lab TAT', value: '2–4', unit: 'hrs' },
      { name: 'Spec Compliance', value: '> 99.5', unit: '%' },
    ],
  },
  distribution: {
    process_id: 'P-DS-04',
    title: 'Product Distribution',
    description: 'Tank farm → additive injection → loading rack → pipeline → marine loading',
    steps: [
      { step: 1, name: 'Tank Farm Management', inputs: 'Product receipt, inventory level', activities: 'Manage tank assignments, stratification, vapor recovery, cathodic protection', outputs: 'Available product inventory by grade/tank', ai_model: 'Inventory Optimizer', kpi: 'Tank utilization %, turnover rate', duration: 'Continuous' },
      { step: 2, name: 'Additive Injection', inputs: 'Base product, additive specifications', activities: 'In-line injection: detergent (gasoline), lubricity (diesel), as product is loaded', outputs: 'Treated product meeting additive spec', ai_model: 'Additive Dosing Optimizer', kpi: 'Dosing accuracy ±2%, additive cost ¢/L', duration: 'During loading' },
      { step: 3, name: 'Loading Rack Operations', inputs: 'Customer BOL, truck arrival', activities: 'Bottom loading, vapor recovery, mass flow metering, BOL generation', outputs: 'Loaded truck with BOL', ai_model: 'Loading Scheduler', kpi: 'Trucks/hr, queue time min, vapor recovery %', duration: '15–30 min/truck' },
      { step: 4, name: 'Pipeline Scheduling', inputs: 'Product orders, pipeline capacity', activities: 'Batch sequencing, interface management, injection scheduling', outputs: 'Product delivered to destination terminal', ai_model: 'Contamination Predictor, Batch Tracker', kpi: 'On-time delivery %, interface contamination bbl', duration: 'Per batch (hrs to days)' },
    ],
    ai_models: [
      { name: 'Loading Scheduler', type: 'ML + LP', input: 'Truck arrivals, product inventory, marine tidal windows', output: 'Optimized loading schedule → min queue time' },
      { name: 'Contamination Predictor', type: 'ML', input: 'Flow velocity, pipe diameter, batch sequence', output: 'Predicted interface volume for segregation' },
    ],
    kpis: [
      { name: 'Rack Utilization', value: '> 85', unit: '%' },
      { name: 'On-Time Delivery', value: '> 98', unit: '%' },
      { name: 'Truck Queue Time', value: '< 20', unit: 'min' },
    ],
  },
  trading: {
    process_id: 'P-DS-05',
    title: 'Commercial & Trading',
    description: 'Crude procurement · Product trading · Hedging · Margin optimization',
    steps: [
      { step: 1, name: 'Market Intelligence', inputs: 'Price feeds (WTI/Brent/WCS), news, competitor data', activities: 'Monitor crude differentials, crack spreads, competitor pricing, demand signals', outputs: 'Market brief, trading opportunities identified', ai_model: 'Price Forecaster LSTM', kpi: 'Forecast accuracy vs actual (30-day MAPE)', duration: 'Daily' },
      { step: 2, name: 'Trade Decision', inputs: 'Market intelligence, refinery LP output', activities: 'Select crude grades, volumes, timing; decide spot vs term; hedging decision', outputs: 'Trade decision memo, hedging instruction', ai_model: 'Optimal Crude Selector, Contract Risk Analyzer', kpi: 'Decision cycle time (hrs), hedge ratio %', duration: 'Hours' },
      { step: 3, name: 'Contract Execution', inputs: 'Agreed trade terms', activities: 'Confirm trade, generate contract, credit check, sign', outputs: 'Executed contract, trade in ETRM', ai_model: 'Contract Risk Analyzer (NLP clause review)', kpi: 'Contract cycle time days, disputes rate', duration: '1–5 days' },
      { step: 4, name: 'Settlement', inputs: 'Delivered quantity, price confirmation', activities: 'Invoice generation, quantity/quality reconciliation, payment', outputs: 'Settled invoice, PnL entry', ai_model: 'Invoice Reconciliation AI', kpi: 'Settlement cycle time (days), disputes $', duration: '5–30 days' },
    ],
    ai_models: [
      { name: 'Price Forecaster (LSTM)', type: 'LSTM', input: 'WTI/Brent/WCS 5-yr history + inventory data', output: '30-day price forecast with confidence bounds' },
      { name: 'Optimal Crude Selector', type: 'LP + ML', input: 'Crude prices, refinery config, product demand', output: 'Crude slate → maximum gross margin' },
    ],
    kpis: [
      { name: 'Crude Procurement Cost', value: 'WTI benchmark - negotiated discount', unit: '$/bbl' },
      { name: 'Crack Spread', value: 'Target > $15', unit: '$/bbl' },
    ],
  },
  environmental: {
    process_id: 'P-DS-06',
    title: 'Environmental Compliance',
    description: 'CEMS monitoring · GHG inventory · Flare management · Wastewater treatment',
    steps: [
      { step: 1, name: 'Continuous Monitoring (CEMS)', inputs: 'Stack sensor signals', activities: 'Real-time data collection, averaging, QA/QC per regulation', outputs: 'Validated emissions data (1-hr averages)', ai_model: 'Emission Forecaster', kpi: 'CEMS uptime > 95%, QA/QC pass rate %', duration: 'Continuous' },
      { step: 2, name: 'Compliance Assessment', inputs: 'CEMS data vs regulatory limits', activities: 'Automated limit comparison, exceedance identification, root cause', outputs: 'Compliance status, exceedance log', ai_model: 'NOx Optimizer, Flare Analyzer CV', kpi: 'Exceedance events/month, time to corrective action', duration: 'Automated + daily review' },
      { step: 3, name: 'GHG Inventory', inputs: 'Activity data (fuel consumption, process vents)', activities: 'Calculate GHG emissions per ECCC protocol, uncertainty analysis', outputs: 'Annual GHG inventory report', ai_model: 'GHG Calculator (rule-based + ML validation)', kpi: 'GHG intensity tCO2e/boe, year-on-year reduction %', duration: 'Annual (continuous data collection)' },
      { step: 4, name: 'Wastewater Treatment', inputs: 'Process wastewater', activities: 'API separator → DAF → biotreatment → polishing → discharge', outputs: 'Treated effluent meeting AER WQO', ai_model: 'Biotreatment Optimizer, Spill Risk Predictor', kpi: 'Effluent oil ppm < 15, phenol < 0.5 ppm', duration: 'Continuous' },
    ],
    ai_models: [
      { name: 'Flare Analyzer (CV)', type: 'Computer Vision', input: 'Thermal + visible camera imagery', output: 'Combustion efficiency %, black smoke detection' },
      { name: 'Biotreatment Optimizer', type: 'ML', input: 'Influent loading, treatment parameters', output: 'Optimal nutrient dosing and aeration setpoints' },
    ],
    kpis: [
      { name: 'SO₂', value: '< 500', unit: 'mg/m³' },
      { name: 'NOₓ', value: '< 200', unit: 'mg/m³' },
      { name: 'Wastewater Oil', value: '< 15', unit: 'mg/L' },
    ],
  },
};

export async function GET(req: Request, { params }: { params: { section: string } }) {
  const { section } = params;
  const sectionData = SECTION_DATA[section];

  if (!sectionData) {
    return Response.json({ error: `No process data found for section: ${section}`, available: Object.keys(SECTION_DATA) }, { status: 404 });
  }

  try {
    const client = await pool.connect();
    try {
      const { rows: dbSteps } = await client.query(
        'SELECT * FROM ogo_process_step WHERE process_id = $1 ORDER BY step_number',
        [sectionData.process_id]
      );
      return Response.json({
        section,
        process: sectionData,
        db_steps: dbSteps,
        _source: dbSteps.length > 0 ? 'db' : 'static',
      });
    } finally {
      client.release();
    }
  } catch (err) {
    return Response.json({
      section,
      process: sectionData,
      db_steps: [],
      _source: 'static_fallback',
      _error: String(err),
    });
  }
}
