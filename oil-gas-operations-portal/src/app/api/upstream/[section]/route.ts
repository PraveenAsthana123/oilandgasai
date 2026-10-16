export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';

const sectionData: Record<string, object> = {
  drilling: {
    active_wells: 12,
    wells_drilling: 3,
    avg_rop_mhr: 28.4,
    npt_pct: 4.2,
    stuck_pipe_risk: 'low',
    wells_planned: 18,
    avg_well_cost_m: 4.2,
    bit_life_avg_hrs: 95,
    wob_klbs: 28,
    rpm: 120,
    rop_trend: [22, 25, 27, 28, 30, 28, 29],
  },
  reservoir: {
    reservoir_pressure_psi: 4250,
    initial_pressure_psi: 5800,
    recovery_factor_pct: 38.2,
    ooip_mmboe: 450,
    proved_reserves_mmboe: 128,
    decline_rate_pct_yr: 8.4,
    water_influx_active: true,
    history_match_quality: 'good',
    material_balance_f: 1.24,
    pressure_history: [5800, 5400, 5100, 4800, 4500, 4250],
  },
  production: {
    gross_production_boed: 45200,
    oil_bopd: 31400,
    gas_mmscfd: 82,
    water_bwpd: 12000,
    water_cut_pct: 26.5,
    gor_scf_bbl: 2610,
    uptime_pct: 96.8,
    active_wells: 42,
    artificial_lift_wells: 28,
    production_trend: [44100, 44600, 45000, 45200, 45100, 45200],
  },
  exploration: {
    active_prospects: 8,
    wells_planned_yr: 4,
    prospect_success_rate_pct: 35,
    seismic_survey_km2: 1200,
    acquisition_progress_pct: 67,
    interpreted_horizons: 12,
    mapped_faults: 34,
    risked_resources_mmboe: 280,
    prospect_list: ['Prospect Alpha - High', 'Prospect Beta - Medium', 'Prospect Gamma - Low'],
  },
  'well-integrity': {
    total_wells: 85,
    barrier_a_wells: 62,
    barrier_b_wells: 18,
    barrier_c_wells: 5,
    scp_wells: 3,
    integrity_tests_passed_ytd: 78,
    remediation_backlog: 7,
    next_scheduled_tests: 12,
    corrosion_alerts: 2,
  },
  hse: {
    trir: 0.42,
    ltif: 0.12,
    near_miss_ytd: 28,
    h2s_drills_ytd: 12,
    ppe_compliance_pct: 98.2,
    open_incidents: 3,
    permits_active: 24,
    safety_observations_ytd: 156,
  },
};

export async function GET(_req: Request, { params }: { params: { section: string } }) {
  const section = params.section;

  try {
    // Try to get real data from DB if available
    const sensors = await pool.query(
      `SELECT sensor_type, AVG(current_value) as avg_val, COUNT(*) as cnt FROM ogo_sensor WHERE stream='upstream' GROUP BY sensor_type`
    );

    return Response.json({
      section,
      metrics: sectionData[section] || { message: `No metrics defined for section: ${section}` },
      sensors: sensors.rows,
      last_updated: new Date().toISOString(),
    });
  } catch {
    return Response.json({
      section,
      metrics: sectionData[section] || {},
      sensors: [],
      last_updated: new Date().toISOString(),
      _mock: true,
      _reason: 'DATABASE_URL not configured',
    });
  }
}
