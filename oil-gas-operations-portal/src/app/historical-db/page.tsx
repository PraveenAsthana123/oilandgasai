'use client';

import { useState, useEffect } from 'react';

type DataRow = Record<string, string>;
type DatasetResponse = {
  dataset: string; description: string; path: string;
  total_rows: number; headers: string[]; rows: DataRow[];
  unique_values_col0: string[];
  error?: string; _mock?: boolean; _reason?: string;
};

const TABS = ['Environmental Telemetry', 'Equipment Maintenance', 'Pipeline Conditions', 'Production History'];
const DATASET_KEYS = ['telemetry', 'maintenance', 'pipeline', 'production'];
const LIMITS = [50, 100, 500];

function LineChart({ rows, headers, xKey, yKeys }: {
  rows: DataRow[]; headers: string[]; xKey: string; yKeys: string[];
}) {
  if (!rows.length || !yKeys.length) return null;
  const W = 580, H = 140, PAD = { l: 40, r: 10, t: 10, b: 30 };
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;

  const xVals = rows.map(r => r[xKey] ?? '');
  const colors = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'];

  const allY = yKeys.flatMap(k => rows.map(r => parseFloat(r[k] ?? '0') || 0));
  const minY = Math.min(...allY), maxY = Math.max(...allY);
  const rangeY = maxY - minY || 1;

  const pts = (yKey: string) =>
    rows.map((r, i) => {
      const x = PAD.l + (i / Math.max(rows.length - 1, 1)) * innerW;
      const y = PAD.t + innerH - ((parseFloat(r[yKey] ?? '0') || 0) - minY) / rangeY * innerH;
      return `${x},${y}`;
    }).join(' ');

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="border border-[#1e2a45] rounded-lg bg-[#0a0e1a]">
      {/* Y axis labels */}
      {[0, 0.5, 1].map((f, i) => (
        <text key={i} x={PAD.l - 4} y={PAD.t + innerH * (1 - f)} fill="#6b7280" fontSize="8" textAnchor="end" dominantBaseline="middle">
          {(minY + rangeY * f).toFixed(1)}
        </text>
      ))}
      {/* X axis labels */}
      {[0, Math.floor(rows.length / 2), rows.length - 1].map((idx) => (
        <text key={idx} x={PAD.l + (idx / Math.max(rows.length - 1, 1)) * innerW} y={H - 4} fill="#6b7280" fontSize="7" textAnchor="middle">
          {String(xVals[idx] ?? '').slice(0, 10)}
        </text>
      ))}
      {/* Grid */}
      {[0, 0.5, 1].map((f, i) => (
        <line key={i} x1={PAD.l} x2={W - PAD.r} y1={PAD.t + innerH * (1 - f)} y2={PAD.t + innerH * (1 - f)}
          stroke="#1e2a45" strokeWidth="1" />
      ))}
      {/* Lines */}
      {yKeys.map((k, ci) => (
        <polyline key={k} points={pts(k)} fill="none" stroke={colors[ci % colors.length]} strokeWidth="1.5" />
      ))}
      {/* Legend */}
      {yKeys.map((k, ci) => (
        <g key={k}>
          <rect x={PAD.l + ci * 90} y={PAD.t} width="8" height="8" fill={colors[ci % colors.length]} rx="1" />
          <text x={PAD.l + ci * 90 + 11} y={PAD.t + 7} fill="#9ca3af" fontSize="8">{k}</text>
        </g>
      ))}
    </svg>
  );
}

function ScatterChart({ rows, xKey, yKey }: { rows: DataRow[]; xKey: string; yKey: string }) {
  if (!rows.length) return null;
  const W = 580, H = 160, PAD = { l: 40, r: 10, t: 10, b: 30 };
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;

  const xs = rows.map(r => parseFloat(r[xKey] ?? '0') || 0);
  const ys = rows.map(r => parseFloat(r[yKey] ?? '0') || 0);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const rX = maxX - minX || 1, rY = maxY - minY || 1;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="border border-[#1e2a45] rounded-lg bg-[#0a0e1a]">
      <text x={W / 2} y={H - 2} fill="#9ca3af" fontSize="8" textAnchor="middle">{xKey}</text>
      <text x={8} y={H / 2} fill="#9ca3af" fontSize="8" textAnchor="middle" transform={`rotate(-90, 8, ${H / 2})`}>{yKey}</text>
      {rows.slice(0, 200).map((r, i) => {
        const cx = PAD.l + ((parseFloat(r[xKey] ?? '0') || 0) - minX) / rX * innerW;
        const cy = PAD.t + innerH - ((parseFloat(r[yKey] ?? '0') || 0) - minY) / rY * innerH;
        return <circle key={i} cx={cx} cy={cy} r="2" fill="#f59e0b" opacity="0.6" />;
      })}
    </svg>
  );
}

export default function HistoricalDBPage() {
  const [tab, setTab] = useState(0);
  const [data, setData] = useState<DatasetResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(100);
  const [filterVal, setFilterVal] = useState('');

  useEffect(() => {
    loadData();
  }, [tab, limit, filterVal]);

  async function loadData() {
    setLoading(true);
    setData(null);
    const key = DATASET_KEYS[tab];
    const params = new URLSearchParams({ limit: String(limit) });
    if (filterVal) {
      const filterKeys: Record<string, string> = { telemetry: 'device', maintenance: 'Type', pipeline: 'Material', production: 'Commodity' };
      params.set('filter_key', filterKeys[key] ?? '');
      params.set('filter_val', filterVal);
    }
    try {
      const resp = await fetch(`/api/historical/${key}?${params}`);
      const d = await resp.json() as DatasetResponse;
      setData(d);
    } catch (e) {
      setData({ dataset: key, description: '', path: '', total_rows: 0, headers: [], rows: [], unique_values_col0: [], error: String(e) });
    } finally {
      setLoading(false);
    }
  }

  const CHART_CONFIGS = [
    { xKey: 'ts', yKeys: ['co', 'lpg', 'temp'] },
    { xKey: 'UDI', yKeys: ['Tool wear [min]', 'Process temperature [K]', 'Rotational speed [rpm]'] },
    { xKey: 'Time_Years', yKeys: ['Thickness_mm', 'Max_Pressure_psi'] },
    { xKey: '', yKeys: ['Volume'] },
  ];

  const chartConf = CHART_CONFIGS[tab];
  const filterLabels = ['Device', 'Product Type', 'Material', 'Commodity'];
  const filterLabel = filterLabels[tab];

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs text-amber-500/70 uppercase tracking-wider mb-1">Operations</div>
        <h1 className="text-2xl font-bold text-white">Historical Database Viewer</h1>
        <p className="text-gray-400 text-sm mt-1">
          Time-series browser · Real Kaggle datasets · CSS/SVG charts
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap">
        {TABS.map((t, i) => (
          <button key={i} onClick={() => { setTab(i); setFilterVal(''); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === i
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-gray-400 hover:bg-[#1e2a45] hover:text-gray-200 border border-transparent'
            }`}>{t}</button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Rows:</span>
          {LIMITS.map(l => (
            <button key={l} onClick={() => setLimit(l)}
              className={`px-2 py-1 rounded text-xs ${limit === l ? 'bg-amber-500 text-black font-bold' : 'bg-[#1e2a45] text-gray-400 hover:text-gray-200'}`}>
              {l}
            </button>
          ))}
          <button onClick={() => setLimit(99999)}
            className={`px-2 py-1 rounded text-xs ${limit === 99999 ? 'bg-amber-500 text-black font-bold' : 'bg-[#1e2a45] text-gray-400 hover:text-gray-200'}`}>
            All
          </button>
        </div>
        {data?.unique_values_col0 && data.unique_values_col0.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Filter {filterLabel}:</span>
            <select value={filterVal} onChange={e => setFilterVal(e.target.value)}
              className="bg-[#0a0e1a] border border-[#1e2a45] text-gray-300 text-xs rounded px-2 py-1">
              <option value="">All</option>
              {data.unique_values_col0.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        )}
      </div>

      {loading && (
        <div className="text-amber-400 animate-pulse text-center py-8">Loading dataset…</div>
      )}

      {data?.error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
          {data.error}
          {data._reason && <div className="text-xs text-gray-500 mt-1">{data._reason}</div>}
          {data.path && <div className="text-xs text-gray-600 mt-1 font-mono">Expected: {data.path}</div>}
        </div>
      )}

      {data && !data.error && !loading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              <span className="text-white font-semibold">{data.total_rows.toLocaleString()}</span> rows · {data.description}
            </div>
            <div className="text-xs text-gray-600 font-mono truncate max-w-xs">{data.path}</div>
          </div>

          {/* Chart */}
          {data.rows.length > 0 && chartConf.yKeys.filter(k => data.headers.includes(k)).length > 0 && (
            <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
              <h3 className="text-sm text-gray-300 mb-3">
                {TABS[tab]} — {chartConf.yKeys.filter(k => data.headers.includes(k)).join(' / ')} over time
              </h3>
              {tab === 2 ? (
                <ScatterChart rows={data.rows} xKey="Max_Pressure_psi" yKey="Corrosion_Impact_Percent" />
              ) : (
                <LineChart rows={data.rows} headers={data.headers} xKey={chartConf.xKey} yKeys={chartConf.yKeys.filter(k => data.headers.includes(k))} />
              )}
            </div>
          )}

          {/* Table */}
          <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-[#0a0e1a]">
                  <tr>
                    {data.headers.slice(0, 10).map(h => (
                      <th key={h} className="py-2 px-3 text-left text-gray-500 font-medium border-b border-[#1e2a45] whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.rows.slice(0, 50).map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-[#0f1629]' : 'bg-[#0a0e1a]'}>
                      {data.headers.slice(0, 10).map(h => (
                        <td key={h} className="py-1.5 px-3 text-gray-300 border-b border-[#1e2a45]/50 whitespace-nowrap">
                          {row[h] ?? '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.rows.length > 50 && (
              <div className="px-3 py-2 text-xs text-gray-600 border-t border-[#1e2a45]">
                Showing 50 of {data.rows.length} rows
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
