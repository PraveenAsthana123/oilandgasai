export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import fs from 'fs';
import path from 'path';

const DATA_PATH = process.env.DATA_BASE_PATH ?? '/mnt/deepa/IoT/code/oil-gas-monitoring';

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = vals[i] ?? ''; });
    return row;
  });
}

const DATASET_MAP: Record<string, { file: string; description: string }> = {
  'telemetry': { file: 'data/kaggle/environmental-telemetry/content/iot_telemetry_data.csv', description: 'IoT Environmental Telemetry' },
  'maintenance': { file: 'data/kaggle/machine-maintenance/content/predictive_maintenance.csv', description: 'Equipment Predictive Maintenance' },
  'pipeline': { file: 'data/kaggle/pipeline-maintenance/content/market_pipe_thickness_loss_dataset.csv', description: 'Pipeline Corrosion & Thickness' },
  'production': { file: 'data/kaggle/production-trends/content/OGORBcsv_cleaned.csv', description: 'Oil & Gas Production Trends' },
};

export async function GET(req: Request, { params }: { params: { dataset: string } }) {
  const { dataset } = params;
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get('limit') ?? '100');
  const offset = parseInt(url.searchParams.get('offset') ?? '0');
  const filterKey = url.searchParams.get('filter_key') ?? '';
  const filterVal = url.searchParams.get('filter_val') ?? '';

  const dsInfo = DATASET_MAP[dataset];
  if (!dsInfo) {
    return Response.json({ error: `Unknown dataset: ${dataset}. Available: ${Object.keys(DATASET_MAP).join(', ')}` }, { status: 404 });
  }

  const fullPath = path.join(DATA_PATH, dsInfo.file);
  if (!fs.existsSync(fullPath)) {
    return Response.json({
      error: `Dataset file not found`,
      path: fullPath,
      _mock: true,
      _reason: `Set DATA_BASE_PATH env var to point to your data directory. Expected: ${fullPath}`,
    }, { status: 404 });
  }

  const content = fs.readFileSync(fullPath, 'utf-8');
  let rows = parseCSV(content);
  const headers = Object.keys(rows[0] ?? {});

  // Get unique values for filter dropdowns (first col as main filter)
  const uniqueFirstCol: Set<string> = new Set();
  rows.forEach(r => { const v = r[headers[0]]; if (v) uniqueFirstCol.add(v); });

  // Apply filter
  if (filterKey && filterVal) {
    rows = rows.filter(r => r[filterKey] === filterVal);
  }

  const total = rows.length;
  const page = rows.slice(offset, offset + limit);

  return Response.json({
    dataset,
    description: dsInfo.description,
    path: fullPath,
    total_rows: total,
    headers,
    rows: page,
    offset,
    limit,
    unique_values_col0: Array.from(uniqueFirstCol).slice(0, 50),
  });
}
