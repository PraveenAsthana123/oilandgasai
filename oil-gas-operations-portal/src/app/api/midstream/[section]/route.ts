export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';

const sectionData: Record<string, object> = {
  pipeline: {
    total_length_km: 1240,
    throughput_mmscfd: 245,
    utilization_pct: 82,
    active_leaks: 0,
    pressure_inlet_bar: 72.4,
    pressure_outlet_bar: 68.1,
    last_pig_run: '2026-09-15',
    next_pig_scheduled: '2026-11-20',
    ili_coverage_pct: 94,
    corrosion_rate_mmy: 0.18,
  },
  compression: {
    stations: 4,
    compressors_online: 11,
    compressors_total: 14,
    avg_efficiency_pct: 87.4,
    unplanned_downtime_hrs_ytd: 142,
    availability_pct: 96.2,
    avg_power_kw: 8400,
    surge_events_ytd: 0,
    vibration_alerts: 2,
  },
  'gas-processing': {
    feed_rate_mmscfd: 210,
    ngl_recovery_pct: 94.2,
    acid_gas_removal_pct: 99.7,
    dehydration_dewpoint_c: -65,
    mercury_removal_efficiency: 99.9,
    plant_utilization_pct: 88,
    c3_yield_tpd: 142,
    c4_yield_tpd: 98,
  },
  storage: {
    tanks_total: 8,
    tanks_operational: 7,
    total_capacity_m3: 240000,
    current_inventory_m3: 187000,
    utilization_pct: 77.9,
    lng_boiloff_rate_pct: 0.12,
    last_inspection: '2026-08-01',
    stratification_risk: 'low',
  },
  scada: {
    total_tags: 12450,
    alarm_rate_per_hr: 3.2,
    control_loops_total: 248,
    control_loops_in_auto: 231,
    auto_pct: 93.1,
    cybersecurity_alerts: 1,
    uptime_pct: 99.97,
    response_time_ms: 120,
  },
  metering: {
    metering_stations: 12,
    calibration_due: 2,
    uncertainty_pct: 0.25,
    unaccounted_gas_pct: 0.08,
    audit_trail_completeness_pct: 99.8,
    last_calibration: '2026-10-01',
    gc_units: 8,
    gc_anomalies_ytd: 1,
  },
};

export async function GET(_req: Request, { params }: { params: { section: string } }) {
  const section = params.section;

  try {
    const sensors = await pool.query(
      `SELECT sensor_type, AVG(current_value) as avg_val, COUNT(*) as cnt FROM ogo_sensor WHERE stream='midstream' GROUP BY sensor_type`
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
