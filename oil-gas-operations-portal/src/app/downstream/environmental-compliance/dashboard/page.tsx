'use client';
import { useState, useEffect, useCallback } from 'react';

interface DashData {
  kpis?: { total_ch4: number; countries_tracked: number; spills_recorded: number; total_spill_tonnes: number };
  emission_trend?: { year: number; total: string }[];
  top_emitters?: { country: string; total: string }[];
  error?: string;
}

export default function EnviroDashboard() {
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { setLoading(true); setData(await (await fetch('/api/downstream/environmental-compliance/dashboard')).json()); setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);

  const kpis = data?.kpis;
  const trend = data?.emission_trend || [];
  const emitters = data?.top_emitters || [];
  const CHART_W = 400, CHART_H = 130;
  const maxTrend = Math.max(...trend.map(t => Number(t.total)), 1);
  const maxEmit = Math.max(...emitters.map(e => Number(e.total)), 1);

  const trendPath = trend.length > 1 ? trend.map((t, i) => {
    const x = (i / (trend.length - 1)) * CHART_W;
    const y = CHART_H - (Number(t.total) / maxTrend) * CHART_H;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ') : '';

  return (
    <div className="min-h-screen bg-gray-950 text-amber-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div><div className="flex items-center gap-3 mb-2"><div className="w-3 h-3 rounded-full bg-amber-500" /><span className="text-amber-400 text-sm font-mono uppercase tracking-widest">Downstream / Environmental Compliance</span></div><h1 className="text-3xl font-bold text-amber-300">Operations Dashboard</h1></div>
            <button onClick={load} className="text-amber-400 hover:text-amber-300 text-sm border border-amber-800 px-4 py-2 rounded-lg">↻ Refresh</button>
          </div>
        </div>
        {loading && <div className="text-center text-gray-500 py-20">Loading dashboard…</div>}
        {!loading && data?.error && <div className="bg-red-900/30 border border-red-700 rounded-xl p-6 text-red-300">{data.error}</div>}
        {!loading && !data?.error && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total CH4 Emissions', value: kpis?.total_ch4 ? kpis.total_ch4.toLocaleString() : '0', unit: 'emission units' },
                { label: 'Countries Tracked', value: kpis?.countries_tracked ?? 0, unit: 'countries' },
                { label: 'Spill Incidents', value: kpis?.spills_recorded ?? 0, unit: 'incidents recorded' },
                { label: 'Total Spill Volume', value: kpis?.total_spill_tonnes ? kpis.total_spill_tonnes.toLocaleString() : '0', unit: 'tonnes max' },
              ].map(k => (
                <div key={k.label} className="bg-gray-900 border border-amber-900/40 rounded-xl p-5">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">{k.label}</p>
                  <p className="text-amber-300 text-2xl font-bold">{k.value}</p>
                  <p className="text-gray-600 text-xs mt-1">{k.unit}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Emission trend line */}
              <div className="bg-gray-900 border border-amber-900/40 rounded-xl p-5">
                <h3 className="text-amber-400 font-semibold mb-4 text-sm">CH4 Emission Trend (1990-2018)</h3>
                {trend.length < 2 ? <div className="text-gray-600 text-sm text-center py-8">No trend data — import methane dataset first</div> : (
                  <svg viewBox={`0 0 ${CHART_W} ${CHART_H + 20}`} className="w-full h-36">
                    <defs><linearGradient id="envTrendGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" /><stop offset="100%" stopColor="#f59e0b" stopOpacity="0" /></linearGradient></defs>
                    <path d={`${trendPath} L ${CHART_W} ${CHART_H} L 0 ${CHART_H} Z`} fill="url(#envTrendGrad)" />
                    <path d={trendPath} fill="none" stroke="#f59e0b" strokeWidth="2" />
                    <text x="0" y={CHART_H + 16} fill="#6b7280" fontSize="9">{trend[0]?.year}</text>
                    <text x={CHART_W} y={CHART_H + 16} fill="#6b7280" fontSize="9" textAnchor="end">{trend[trend.length - 1]?.year}</text>
                  </svg>
                )}
              </div>

              {/* Top emitters bar chart */}
              <div className="bg-gray-900 border border-amber-900/40 rounded-xl p-5">
                <h3 className="text-amber-400 font-semibold mb-4 text-sm">Top Emitters (by Country)</h3>
                {emitters.length === 0 ? <div className="text-gray-600 text-sm text-center py-8">No data yet</div> : (
                  <div className="space-y-2">
                    {emitters.slice(0, 6).map(e => (
                      <div key={e.country}>
                        <div className="flex justify-between text-xs text-gray-400 mb-1"><span>{e.country}</span><span>{Number(e.total).toLocaleString()}</span></div>
                        <div className="h-2 bg-gray-800 rounded-full"><div className="h-full bg-amber-500 rounded-full" style={{ width: `${(Number(e.total) / maxEmit) * 100}%` }} /></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top emitters SVG bar */}
              <div className="bg-gray-900 border border-amber-900/40 rounded-xl p-5">
                <h3 className="text-amber-400 font-semibold mb-4 text-sm">Emitter Bar Chart</h3>
                {emitters.length === 0 ? <div className="text-gray-600 text-sm text-center py-8">No data yet</div> : (
                  <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full h-36">
                    {emitters.slice(0, 6).map((e, i) => {
                      const bW = CHART_W / 6 - 6; const bH = (Number(e.total) / maxEmit) * (CHART_H - 20); const x = i * (CHART_W / 6) + 3;
                      return <g key={e.country}><rect x={x} y={CHART_H - bH - 16} width={bW} height={bH} fill="#d97706" rx="2" opacity="0.8" /><text x={x + bW / 2} y={CHART_H - 2} fill="#6b7280" fontSize="8" textAnchor="middle">{e.country.slice(0, 5)}</text></g>;
                    })}
                  </svg>
                )}
              </div>
            </div>

            <div className="bg-gray-900 border border-amber-900/40 rounded-xl p-6">
              <h3 className="text-amber-400 font-semibold mb-4">Alert Feed</h3>
              <div className="space-y-3">
                {[
                  { level: 'info', msg: 'Dashboard loaded from live DB aggregations' },
                  ...((kpis?.countries_tracked ?? 0) === 0 ? [{ level: 'warning', msg: 'No emissions data — import methane dataset from Data page' }] : []),
                  ...((kpis?.spills_recorded ?? 0) === 0 ? [{ level: 'warning', msg: 'No spill incidents loaded — import spill dataset from Data page' }] : []),
                  ...((kpis?.countries_tracked ?? 0) > 0 ? [{ level: 'ok', msg: `${kpis?.countries_tracked} countries tracked — ${kpis?.spills_recorded} spill incidents on record` }] : []),
                ].map((a, i) => (
                  <div key={i} className={`flex items-center gap-3 rounded-lg p-3 text-sm ${a.level === 'warning' ? 'bg-amber-900/20 border border-amber-700/50 text-amber-300' : a.level === 'ok' ? 'bg-green-900/20 border border-green-700/50 text-green-300' : 'bg-gray-800 border border-gray-700 text-gray-400'}`}>
                    <span>{a.level === 'warning' ? '⚠' : a.level === 'ok' ? '✓' : 'ℹ'}</span><span>{a.msg}</span>
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
