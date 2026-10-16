export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';

export async function GET(_req: Request, { params }: { params: { type: string } }) {
  const type = params.type;

  try {
    let data: object = {};

    switch (type) {
      case 'digital-twin':
        const twins = await pool.query('SELECT * FROM ogo_digital_twin ORDER BY health_score DESC');
        data = { twins: twins.rows, count: twins.rowCount };
        break;
      case 'iot':
        const sensors = await pool.query('SELECT * FROM ogo_sensor ORDER BY stream, sensor_type');
        const byStream = sensors.rows.reduce((acc: Record<string, number>, s: { stream: string }) => {
          acc[s.stream] = (acc[s.stream] || 0) + 1;
          return acc;
        }, {});
        data = { sensors: sensors.rows, count: sensors.rowCount, by_stream: byStream };
        break;
      case 'cv':
        data = {
          cameras_active: 48, cameras_total: 52,
          ppe_detections_today: 1240, violations_today: 3,
          corrosion_scans_today: 28, defects_found: 4,
          drone_inspections_ytd: 24, models: ['YOLO v8 PPE', 'EfficientDet Corrosion', 'U-Net Flare Seg', 'ResNet Defect Class']
        };
        break;
      case 'statistical-ml':
        data = {
          models_active: 12,
          decline_curves_fit: 42,
          control_charts_monitored: 28,
          monte_carlo_runs_today: 6,
          weibull_assets_analyzed: 85,
          spc_alerts_today: 3,
        };
        break;
      default:
        const useCases = await pool.query('SELECT * FROM ogo_use_case WHERE ai_type ILIKE $1 ORDER BY stream', [`%${type}%`]);
        data = { use_cases: useCases.rows, count: useCases.rowCount };
    }

    return Response.json({ type, data, last_updated: new Date().toISOString() });
  } catch {
    return Response.json({ type, data: {}, _mock: true, last_updated: new Date().toISOString() });
  }
}
