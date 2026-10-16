export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';

const sectionData: Record<string, object> = {
  refining: {
    crude_charge_bpd: 95400,
    nameplate_capacity_bpd: 110000,
    utilization_pct: 86.7,
    distillate_yield_pct: 38.2,
    gasoline_yield_pct: 34.5,
    fuel_oil_yield_pct: 12.1,
    energy_intensity_btu_bbl: 385000,
    eii: 94.2,
    units: ['CDU-1', 'VDU-1', 'FCC-1', 'HCU-1', 'CCR-1'],
  },
  process: {
    crude_blend_efficiency_pct: 97.2,
    distillation_energy_pct_improvement: 4.8,
    catalyst_activity_index: 88,
    process_loss_pct: 1.2,
    margin_usd_bbl: 12.40,
    optimization_runs_today: 6,
    constraint_violations: 1,
  },
  quality: {
    lab_tests_today: 142,
    off_spec_batches_mtd: 3,
    spec_compliance_pct: 97.9,
    turnaround_time_hrs: 2.4,
    contamination_alerts: 0,
    customer_complaints_ytd: 4,
    inline_analyzers: 24,
    analyzer_uptime_pct: 98.8,
  },
  distribution: {
    truck_loads_today: 48,
    truck_utilization_pct: 84,
    on_time_delivery_pct: 97.2,
    tanks_in_service: 22,
    demurrage_cost_usd_mtd: 45000,
    pipeline_schedules_active: 3,
    inventory_days: 12.4,
  },
  trading: {
    open_contracts: 14,
    cargo_value_musd: 284,
    hedge_ratio_pct: 65,
    realized_vs_benchmark_pct: 0.8,
    price_forecast_30d_usd_bbl: 82.40,
    counterparty_exposure_musd: 42,
    arbitrage_opportunities: 2,
  },
  environmental: {
    co2e_tonnes_today: 1240,
    flare_volume_mmscf_mtd: 0.42,
    wastewater_compliance_pct: 100,
    spill_incidents_ytd: 0,
    permit_utilization_pct: 68,
    emissions_alerts_active: 1,
    air_quality_index: 42,
  },
};

export async function GET(_req: Request, { params }: { params: { section: string } }) {
  const section = params.section;

  try {
    const sensors = await pool.query(
      `SELECT sensor_type, AVG(current_value) as avg_val, COUNT(*) as cnt FROM ogo_sensor WHERE stream='downstream' GROUP BY sensor_type`
    );

    return Response.json({
      section,
      metrics: sectionData[section] || {},
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
    });
  }
}
