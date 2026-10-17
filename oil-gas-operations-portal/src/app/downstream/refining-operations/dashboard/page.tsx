'use client';
import { useState, useEffect, useCallback } from 'react';

interface DashData {
  kpis?: { total_mmbbl: string; commodity_count: number; states_count: number; avg_monthly_vol: string };
  yield_by_commodity?: { commodity: string; vol: string }[];
  monthly_trend?: { month: string; vol: string }[];
  top_states?: { state: string; vol: string }[];
  error?: string;
}

export default function RefiningDashboard() {
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch('/api/downstream/refining-operations/dashboard');
    setData(await r.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const kpis = data?.kpis;
  const commodities = data?.yield_by_commodity || [];
  const trend = data?.monthly_trend || [];
  const states = data?.top_states || [];

  // Chart helpers
  const maxVol = Math.max(...commodities.map(c => Number(c.vol)), 1);
  const maxTrend = Math.max(...trend.map(t => Number(t.vol)), 1);
  const maxState = Math.max(...states.map(s => Number(s.vol)), 1);

  const CHART_W = 400, CHART_H = 140;

  const trendPath = trend.length > 1 ? trend.map((t, i) => {
    const x = (i / (trend.length - 1)) * CHART_W;
    const y = CHART_H - (Number(t.vol) / maxTrend) * CHART_H;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ') : '';

  return (
    <div className="min-h-screen bg-gray-950 text-amber-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-amber-400 text-sm font-mono uppercase tracking-widest">Downstream / Refining Operations</span>
              </div>
              <h1 className="text-3xl font-bold text-amber-300">Operations Dashboard</h1>
            </div>
            <button onClick={load} className="text-amber-400 hover:text-amber-300 text-sm border border-amber-800 px-4 py-2 rounded-lg">
              ↻ Refresh
            </button>
          </div>
        </div>

        {loading && <div className="text-center text-gray-500 py-20">Loading dashboard…</div>}

        {!loading && data?.error && (
          <div className="bg-red-900/30 border border-red-700 rounded-xl p-6 text-red-300">{data.error}</div>
        )}

        {!loading && !data?.error && (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Crude Processed', value: kpis?.total_mmbbl ?? '0', unit: 'MMbbl' },
                { label: 'Commodities Tracked', value: kpis?.commodity_count ?? 0, unit: 'types' },
                { label: 'States Producing', value: kpis?.states_count ?? 0, unit: 'states' },
                { label: 'Avg Monthly Volume', value: kpis?.avg_monthly_vol ?? '0', unit: 'MMbbl/mo' },
              ].map(k => (
                <div key={k.label} className="bg-gray-900 border border-amber-900/40 rounded-xl p-5">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">{k.label}</p>
                  <p className="text-amber-300 text-2xl font-bold">{k.value}</p>
                  <p className="text-gray-600 text-xs mt-1">{k.unit}</p>
                </div>
              ))}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Commodity yield pie (bar proxy) */}
              <div className="bg-gray-900 border border-amber-900/40 rounded-xl p-5">
                <h3 className="text-amber-400 font-semibold mb-4 text-sm">Yield by Commodity</h3>
                {commodities.length === 0 ? (
                  <div className="text-gray-600 text-center py-8 text-sm">No data — import dataset first</div>
                ) : (
                  <div className="space-y-2">
                    {commodities.slice(0, 6).map(c => (
                      <div key={c.commodity}>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>{c.commodity || 'Unknown'}</span>
                          <span>{(Number(c.vol) / 1e6).toFixed(1)}M</span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${(Number(c.vol) / maxVol) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Monthly throughput trend */}
              <div className="bg-gray-900 border border-amber-900/40 rounded-xl p-5">
                <h3 className="text-amber-400 font-semibold mb-4 text-sm">Monthly Throughput Trend</h3>
                {trend.length < 2 ? (
                  <div className="text-gray-600 text-center py-8 text-sm">No trend data yet</div>
                ) : (
                  <svg viewBox={`0 0 ${CHART_W} ${CHART_H + 20}`} className="w-full h-36">
                    <defs>
                      <linearGradient id="refTrendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d={`${trendPath} L ${CHART_W} ${CHART_H} L 0 ${CHART_H} Z`} fill="url(#refTrendGrad)" />
                    <path d={trendPath} fill="none" stroke="#f59e0b" strokeWidth="2" />
                    {trend.map((t, i) => (
                      <circle key={i} cx={(i / (trend.length - 1)) * CHART_W} cy={CHART_H - (Number(t.vol) / maxTrend) * CHART_H} r="3" fill="#f59e0b" />
                    ))}
                    <text x="0" y={CHART_H + 16} fill="#6b7280" fontSize="9">{trend[0]?.month}</text>
                    <text x={CHART_W} y={CHART_H + 16} fill="#6b7280" fontSize="9" textAnchor="end">{trend[trend.length - 1]?.month}</text>
                  </svg>
                )}
              </div>

              {/* Top states bar */}
              <div className="bg-gray-900 border border-amber-900/40 rounded-xl p-5">
                <h3 className="text-amber-400 font-semibold mb-4 text-sm">Top Refining States</h3>
                {states.length === 0 ? (
                  <div className="text-gray-600 text-center py-8 text-sm">No state data yet</div>
                ) : (
                  <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full h-36">
                    {states.slice(0, 6).map((s, i) => {
                      const barW = (CHART_W / 6) - 8;
                      const barH = (Number(s.vol) / maxState) * (CHART_H - 24);
                      const x = i * (CHART_W / 6) + 4;
                      return (
                        <g key={s.state || i}>
                          <rect x={x} y={CHART_H - barH - 20} width={barW} height={barH} fill="#d97706" rx="2" opacity="0.8" />
                          <text x={x + barW / 2} y={CHART_H - 4} fill="#6b7280" fontSize="8" textAnchor="middle">
                            {(s.state || '?').slice(0, 4)}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                )}
              </div>
            </div>

            {/* Alert feed */}
            <div className="bg-gray-900 border border-amber-900/40 rounded-xl p-6">
              <h3 className="text-amber-400 font-semibold mb-4">Alert Feed</h3>
              <div className="space-y-3">
                {[
                  { level: 'info', msg: 'Dashboard loaded from live DB aggregations' },
                  ...(Number(kpis?.total_mmbbl) === 0
                    ? [{ level: 'warning', msg: 'No production data in DB — import dataset from Data page' }]
                    : [{ level: 'ok', msg: `${kpis?.commodity_count} commodity types tracked across ${kpis?.states_count} producing states` }]),
                ].map((a, i) => (
                  <div key={i} className={`flex items-center gap-3 rounded-lg p-3 text-sm ${
                    a.level === 'warning' ? 'bg-amber-900/20 border border-amber-700/50 text-amber-300' :
                    a.level === 'ok' ? 'bg-green-900/20 border border-green-700/50 text-green-300' :
                    'bg-gray-800 border border-gray-700 text-gray-400'
                  }`}>
                    <span>{a.level === 'warning' ? '⚠' : a.level === 'ok' ? '✓' : 'ℹ'}</span>
                    <span>{a.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
