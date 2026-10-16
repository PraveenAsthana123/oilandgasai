export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

const SECTION_DETAIL: Record<string, object> = {
  exploration: {
    process_id: 'P-US-01',
    process_name: 'Exploration & Geoscience',
    stream: 'upstream',
    steps: [
      {
        step: 1, name: 'Seismic Acquisition',
        inputs: 'Survey design, permits, GPS coordinates, receiver positions',
        activities: 'Deploy geophones, record shot points, quality check field data, observer reports',
        outputs: 'Raw seismic field records (SEG-D), observer logs, field QC reports',
        equipment: 'Vibroseis trucks, airguns, geophones/hydrophones, recording trucks',
        ai: 'DL Noise Filtering (U-Net ground roll removal), Survey Optimization ML',
        kpis: 'SNR >20dB, fold coverage %, receiver uptime %, cost/km²',
        duration: '2-12 weeks',
        data_volume: '1-50 TB per survey',
      },
      {
        step: 2, name: 'Seismic Data Processing',
        inputs: 'Raw SEG-D field records, geometry files, velocity data',
        activities: 'Demultiplexing, geometry QC, noise attenuation, velocity analysis, NMO correction, stacking, migration',
        outputs: 'Processed seismic volume (SEG-Y), velocity model, QC reports',
        equipment: 'HPC cluster (GPU-accelerated), Petrel/Kingdom processing software',
        ai: 'Deep Learning Denoising (U-Net multiples removal), FWI Velocity Model Building, AGC optimization',
        kpis: 'Stack response quality, velocity uncertainty %, turnaround time (weeks)',
        duration: '4-16 weeks',
      },
      {
        step: 3, name: 'Geological Interpretation',
        inputs: 'Processed seismic volumes, well logs, formation tops',
        activities: 'Horizon picking, fault interpretation, attribute analysis, well-to-seismic tie, 3D geological modeling',
        outputs: 'Interpreted horizons, fault framework, structural maps, attribute volumes',
        ai: 'Automated Horizon Picking (CNN), Fault Detection (3D CNN segmentation), Seismic Facies Classification',
        kpis: 'Picking consistency %, well-to-seismic tie correlation >0.7, cycle time (days)',
        duration: '4-12 weeks',
      },
      {
        step: 4, name: 'Prospect Generation',
        inputs: 'Geological interpretation, analogues, basin model',
        activities: 'Trap definition, reservoir characterization, source rock evaluation, seal analysis, play mapping',
        outputs: 'Prospect inventory, play maps, risk matrix, analogues database',
        ai: 'Play Fairway Analysis ML, Reservoir Quality Prediction, RAG Knowledge Query (historical well results)',
        kpis: 'Prospect count, mean prospect size (MMboe), play risk %, exploration portfolio IRR',
        duration: '4-8 weeks',
      },
      {
        step: 5, name: 'Prospect Ranking',
        inputs: 'Prospect inventory, economic parameters (oil price, CAPEX, OPEX, royalty), risk assessments',
        activities: 'Monte Carlo resource estimation (P10/P50/P90), economic modeling (NPV/IRR), portfolio optimization',
        outputs: 'Ranked prospect list, resource report, portfolio optimization recommendation',
        ai: 'Monte Carlo Simulation (50,000+ iterations), Economic Portfolio Optimizer (LP+ML), Peer Analogue Ranking',
        formula: 'EMV = (POGs × NPVsuccess) - ((1-POGs) × Drilling Cost)',
        kpis: 'EMV (CAD), POGs (%), risked resource MMboe, portfolio balance',
        duration: '2-4 weeks',
      },
      {
        step: 6, name: 'Drill/No-Drill Decision Gate',
        inputs: 'Ranked prospect list, budget approval, rig availability',
        activities: 'Investment committee review, partner alignment, regulatory pre-application, rig contract, operational planning',
        outputs: 'Drill decision, AFE (Authority for Expenditure), regulatory application',
        ai: 'Decision Support AI (Ollama LLM investment recommendation)',
        decision_criteria: 'POGs >25%, NPV positive, resource >20 MMboe, strategic fit rating ≥3/5',
        gate_owners: 'VP Exploration, CFO (>$10M), Board (>$50M)',
        duration: '2-6 weeks',
      },
    ],
  },
  drilling: {
    process_id: 'P-US-03',
    process_name: 'Drilling Operations',
    stream: 'upstream',
    steps: [
      { step: 1, name: 'Rig Mobilization', activities: 'Contract rig selection, rig move, BOP test, pre-spud checklist', ai: 'Rig Selection ML, Spud Date Optimizer', kpis: 'Mob cost CAD, days from contract to spud', duration: '5-15 days' },
      { step: 2, name: 'Surface Section (0-500m)', activities: 'Cellar excavation, conductor running, 30/20/13-3/8" casing, cement, BOP installation', ai: 'Casing Point Selector ML, Cement Volume Optimizer', kpis: 'Casing seat depth (m), cement top depth, WOB (kN)', duration: '3-7 days' },
      { step: 3, name: 'Intermediate Section (500-2500m)', activities: 'Drill to KOP, build angle for directional wells, intermediate casing', ai: 'ROP Optimizer ML (WOB/RPM/ECD/lithology inputs), Downhole Vibration Detector (FFT), Stuck Pipe Predictor (30-min warning)', kpis: 'ROP (m/hr), NPT hours, vibration index, torque trend', duration: '10-25 days' },
      { step: 4, name: 'Reservoir Section (Target Zone)', activities: 'Drill through pay zone, LWD logging, real-time geosteering, oil/gas shows monitoring', ai: 'Geosteering AI (LWD GR/resistivity ML), Formation Evaluation AI, Gas Show Analyzer (statistical ML on chromatograph)', equipment: 'MWD/LWD tools, mud gas separator, chromatograph, PDC bit', kpis: 'Time-in-zone %, oil/water contact depth (m TVD), pay thickness (m), permeability (mD)', duration: '8-20 days' },
      { step: 5, name: 'Formation Evaluation (Wireline)', activities: 'Pull drillstring, run wireline logging suite (GR/SP/resistivity/density/neutron/sonic/image), MDT fluid samples, core cutting', ai: 'Facies Classification ML, Fluid Typing ML (oil/gas/water from resistivity+neutron+density), Petrophysical Model (regression Vsh/Phi/Sw)', formula: "Archie's Equation: Sw = (a × Rw / (Phi^m × Rt))^(1/n)", kpis: 'Net pay (m), avg porosity (%), water saturation Sw (%), permeability from NMR (mD)', duration: '3-7 days' },
      { step: 6, name: 'Total Depth & Suspension', activities: 'Decision: suspend (with production casing) or abandon. Plug & abandon or completion preparation', ai: 'Completion Optimization ML (perf intervals, frac stages), Well Economics AI (NPV recalculation with actual data)', kpis: 'Final well cost (CAD), NPV vs prognosis, reserve booking (MMboe)', duration: '3-10 days' },
    ],
  },
  reservoir: {
    process_id: 'P-US-02',
    process_name: 'Reservoir Management',
    stream: 'upstream',
    steps: [
      { step: 1, name: 'Data Acquisition', activities: 'Well log integration, core analysis, PVT sampling, pressure testing, production history compilation', ai: 'Log Quality Control ML, Data Gap Identifier', kpis: 'Data completeness %, well coverage density', duration: '2-4 weeks' },
      { step: 2, name: 'Static Model', activities: 'Horizon interpretation, fault modeling, property population (geostatistics/kriging/co-kriging), OOIP calculation', ai: 'Geostatistical Property Predictor, Facies ML', formula: 'OOIP = V × φ × (1-Sw) / Boi (stock tank barrels)', kpis: 'Model cell count, OOIP uncertainty range (P10-P90 MMboe)', duration: '4-12 weeks' },
      { step: 3, name: 'Dynamic Model', activities: 'Relative permeability input, PVT equation of state, aquifer model, grid upscaling', ai: 'Upscaling Optimizer, PVT Matching ML', kpis: 'Simulation run time (hrs), history match error %', duration: '4-8 weeks' },
      { step: 4, name: 'History Matching', activities: 'Parameter adjustment (permeability multipliers, transmissibility, aquifer strength) to match historical production data', ai: 'Automated History Match (MCMC/Ensemble Kalman Filter), Parameter Sensitivity ML', kpis: 'BHP match error (psi), rate match error (%)', duration: '4-16 weeks' },
      { step: 5, name: 'Production Forecasting', activities: 'Arps decline analysis, simulation forecast, uncertainty quantification P10/P50/P90, EOR screening', ai: 'Decline Curve ML Fitter, Forecast Uncertainty Quantifier', formulas: ['Exponential: q(t) = qi × e^(-Di×t)', 'Hyperbolic: q(t) = qi / (1 + b×Di×t)^(1/b)', 'Material Balance: N = F / (Et + mEg + Efw)'], kpis: 'EUR (MMboe), recovery factor (%), forecast uncertainty range', duration: '2-4 weeks' },
      { step: 6, name: 'Development Plan', activities: 'Well location optimization, infill drilling schedule, EOR pilot design, capex/opex budget, reservoir surveillance plan', ai: 'Well Placement Optimizer (ML + simulation proxy), EOR Screener (analogue matching)', kpis: 'Incremental reserve add (MMboe), NPV CAD, development drilling schedule', duration: '4-8 weeks' },
    ],
  },
  production: {
    process_id: 'P-US-05',
    process_name: 'Production Operations',
    stream: 'upstream',
    steps: [
      { step: 1, name: 'Wellhead Management', activities: 'Wellhead pressure/temp monitoring, choke management, annulus pressure surveillance', ai: 'Virtual Flow Meter (ML — pressure/temp/choke → flow rate)', kpis: 'FWHP (psi), WHP trend, choke size (64ths)', duration: 'Continuous' },
      { step: 2, name: 'Flowline Management', activities: 'Multiphase flow monitoring, hydrate inhibition (MEG injection), corrosion inhibitor dosing, wax management', ai: 'Hydrate Prediction ML (pressure-temp envelope), Corrosion Rate ML', kpis: 'MEG injection rate (L/hr), wax appearance temp, line pressure drop (kPa/km)', duration: 'Continuous' },
      { step: 3, name: '3-Phase Separation', activities: 'Oil/gas/water separation, emulsion treatment, BS&W measurement, gas compression', ai: 'Separator Level Optimizer, Emulsion Classifier ML', kpis: 'BS&W (%), GOR (scf/bbl), separator pressure (psig)', duration: 'Continuous' },
      { step: 4, name: 'Dehydration & Treating', activities: 'Glycol absorption, molecular sieve, dew point control, H2S treating', ai: 'Glycol Circulation Optimizer, Dew Point Predictor', kpis: 'Water content (lb/MMscf), dew point (°C), glycol purity (%)', duration: 'Continuous' },
      { step: 5, name: 'Fiscal Metering', activities: 'Orifice plate / turbine / ultrasonic measurement, allocation metering, uncertainty analysis, meter proving', ai: 'Meter Anomaly Detector ML, Flow Computer Validator', kpis: 'Meter uncertainty (%), allocation error %, proving frequency', duration: 'Monthly prove' },
      { step: 6, name: 'Export & Custody Transfer', activities: 'Pipeline pumping, custody transfer point, tariff calculation, shipper scheduling', ai: 'Pipeline Optimizer (LP), Tariff Calculator', kpis: 'Export rate (m³/d), pipeline inlet pressure, tariff (CAD/m³)', duration: 'Continuous' },
    ],
  },
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const section = searchParams.get('section') || 'exploration';

  try {
    const result = await pool.query(
      `SELECT p.*,
        (SELECT COUNT(*) FROM ogo_process_run r WHERE r.process_id = p.process_id) AS run_count
       FROM ogo_process p WHERE p.process_id = $1`,
      [SECTION_DETAIL[section] ? (SECTION_DETAIL[section] as Record<string, string>).process_id : 'P-US-01']
    );

    return NextResponse.json({
      section,
      detail: SECTION_DETAIL[section] || null,
      db_record: result.rows[0] || null,
      _source: 'db+static',
    });
  } catch (err) {
    return NextResponse.json({
      section,
      detail: SECTION_DETAIL[section] || null,
      db_record: null,
      _source: 'fallback',
      _error: String(err),
    });
  }
}
