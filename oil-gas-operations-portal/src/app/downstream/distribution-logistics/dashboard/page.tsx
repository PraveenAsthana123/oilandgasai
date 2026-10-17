'use client';
import { useState, useEffect, useCallback } from 'react';

interface DashData {
  kpis?: { total_shipments: number; avg_delivery_days: number; on_time_rate_pct: string; cost_per_unit: number };
  status_breakdown?: { status: string; cnt: string }[];
  delayed?: number;
  error?: string;
}

export default function LogisticsDashboard() {
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { setLoading(true); setData(await (await fetch('/api/downstream/distribution-logistics/dashboard')).json()); setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);

  const kpis = data?.kpis;
  const statuses = data?.status_breakdown || [];
  const maxCnt = Math.max(...statuses.map(s => Number(s.cnt)), 1);
  const CHART_W = 400, CHART_H = 130;

  // Delivery gauge (arc representing on-time rate)
  const onTimeNum = parseFloat(kpis?.on_time_rate_pct ?? '0');
  const gaugeArc = (onTimeNum / 100) * Math.PI;
  const r = 55, cx = 80, cy = 80;
  const startX = cx - r, startY = cy;
  const endX = cx + Math.cos(Math.PI - gaugeArc) * r;
  const endY = cy - Math.sin(Math.PI - gaugeArc) * r;

  return (
    <div className="min-h-screen bg-gray-950 text-amber-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div><div className="flex items-center gap-3 mb-2"><div className="w-3 h-3 rounded-full bg-amber-500" /><span className="text-amber-400 text-sm font-mono uppercase tracking-widest">Downstream / Distribution Logistics</span></div><h1 className="text-3xl font-bold text-amber-300">Operations Dashboard</h1></div>
            <button onClick={load} className="text-amber-400 hover:text-amber-300 text-sm border border-amber-800 px-4 py-2 rounded-lg">↻ Refresh</button>
          </div>
        </div>
        {loading && <div className="text-center text-gray-500 py-20">Loading dashboard…</div>}
        {!loading && data?.error && <div className="bg-red-900/30 border border-red-700 rounded-xl p-6 text-red-300">{data.error}</div>}
        {!loading && !data?.error && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Shipments', value: kpis?.total_shipments?.toLocaleString() ?? '0', unit: 'records' },
                { label: 'Avg Delivery Time', value: kpis?.avg_delivery_days?.toFixed(1) ?? '0', unit: 'waiting time units' },
                { label: 'On-Time Rate', value: `${kpis?.on_time_rate_pct ?? '0'}%`, unit: 'of total shipments' },
                { label: 'Cost per Unit', value: `$${kpis?.cost_per_unit?.toFixed(2) ?? '0'}`, unit: 'avg transaction' },
              ].map(k => (
                <div key={k.label} className="bg-gray-900 border border-amber-900/40 rounded-xl p-5">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">{k.label}</p>
                  <p className="text-amber-300 text-2xl font-bold">{k.value}</p>
                  <p className="text-gray-600 text-xs mt-1">{k.unit}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* On-time gauge */}
              <div className="bg-gray-900 border border-amber-900/40 rounded-xl p-5">
                <h3 className="text-amber-400 font-semibold mb-4 text-sm">On-Time Delivery Rate</h3>
                {kpis?.total_shipments === 0 ? <div className="text-gray-600 text-sm text-center py-8">No data — import dataset first</div> : (
                  <svg viewBox="0 0 160 100" className="w-full h-28">
                    <path d={`M ${startX} ${startY} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="#374151" strokeWidth="12" />
                    <path d={`M ${startX} ${startY} A ${r} ${r} 0 0 1 ${endX} ${endY}`} fill="none" stroke="#f59e0b" strokeWidth="12" strokeLinecap="round" />
                    <text x={cx} y={cy - 10} textAnchor="middle" fill="#f59e0b" fontSize="20" fontWeight="bold">{kpis?.on_time_rate_pct}%</text>
                    <text x={cx} y={cy + 6} textAnchor="middle" fill="#6b7280" fontSize="9">on-time rate</text>
                    <text x={startX + 4} y={cy + 16} fill="#6b7280" fontSize="8">0%</text>
                    <text x={cx + r - 10} y={cy + 16} fill="#6b7280" fontSize="8">100%</text>
                  </svg>
                )}
              </div>

              {/* Status breakdown */}
              <div className="bg-gray-900 border border-amber-900/40 rounded-xl p-5">
                <h3 className="text-amber-400 font-semibold mb-4 text-sm">Shipment Status Breakdown</h3>
                {statuses.length === 0 ? <div className="text-gray-600 text-sm text-center py-8">No data yet</div> : (
                  <div className="space-y-2">
                    {statuses.slice(0, 6).map(s => (
                      <div key={s.status}>
                        <div className="flex justify-between text-xs text-gray-400 mb-1"><span>{s.status || 'Unknown'}</span><span>{s.cnt}</span></div>
                        <div className="h-2 bg-gray-800 rounded-full"><div className="h-full bg-amber-500 rounded-full" style={{ width: `${(Number(s.cnt) / maxCnt) * 100}%` }} /></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Delivery performance bar */}
              <div className="bg-gray-900 border border-amber-900/40 rounded-xl p-5">
                <h3 className="text-amber-400 font-semibold mb-4 text-sm">Delivery Performance Bars</h3>
                {statuses.length === 0 ? <div className="text-gray-600 text-sm text-center py-8">No data yet</div> : (
                  <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full h-36">
                    {statuses.slice(0, 5).map((s, i) => {
                      const bW = CHART_W / 5 - 8;
                      const bH = (Number(s.cnt) / maxCnt) * (CHART_H - 20);
                      const x = i * (CHART_W / 5) + 4;
                      return (
                        <g key={s.status || i}>
                          <rect x={x} y={CHART_H - bH - 16} width={bW} height={bH} fill="#d97706" rx="2" opacity="0.8" />
                          <text x={x + bW / 2} y={CHART_H - 2} fill="#6b7280" fontSize="8" textAnchor="middle">{(s.status || 'N/A').slice(0, 7)}</text>
                        </g>
                      );
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
                  ...((kpis?.total_shipments ?? 0) === 0 ? [{ level: 'warning', msg: 'No logistics data — import dataset from Data page' }] : []),
                  ...((data?.delayed ?? 0) > 0 ? [{ level: 'warning', msg: `${data?.delayed} delayed shipments detected — investigate route bottlenecks` }] : []),
                  ...((kpis?.total_shipments ?? 0) > 0 && (data?.delayed ?? 0) === 0 ? [{ level: 'ok', msg: `${kpis?.total_shipments?.toLocaleString()} shipments tracked — avg delivery ${kpis?.avg_delivery_days?.toFixed(1)} time units` }] : []),
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
