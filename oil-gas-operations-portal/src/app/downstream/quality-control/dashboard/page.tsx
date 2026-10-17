'use client';
import { useState, useEffect, useCallback } from 'react';

interface DashData {
  kpis?: { gr_min: string; gr_max: string; gr_avg: string; pe_avg: number; pass: number; fail: number; avg_quality_score: number };
  formation_quality?: { formation: string; avg_q: string }[];
  error?: string;
}

export default function QualityDashboard() {
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { setLoading(true); const r = await fetch('/api/downstream/quality-control/dashboard'); setData(await r.json()); setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);

  const kpis = data?.kpis;
  const formations = data?.formation_quality || [];
  const total = (kpis?.pass ?? 0) + (kpis?.fail ?? 0);
  const passRate = total > 0 ? ((kpis?.pass ?? 0) / total * 100).toFixed(1) : '0';
  const maxQ = Math.max(...formations.map(f => Number(f.avg_q)), 0.01);
  const CHART_W = 400, CHART_H = 130;

  // Quality score donut SVG
  const passPct = total > 0 ? (kpis?.pass ?? 0) / total : 0;
  const r = 50, cx = 70, cy = 70;
  const circumference = 2 * Math.PI * r;
  const passArc = circumference * passPct;

  return (
    <div className="min-h-screen bg-gray-950 text-amber-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div><div className="flex items-center gap-3 mb-2"><div className="w-3 h-3 rounded-full bg-amber-500" /><span className="text-amber-400 text-sm font-mono uppercase tracking-widest">Downstream / Quality Control</span></div><h1 className="text-3xl font-bold text-amber-300">Operations Dashboard</h1></div>
            <button onClick={load} className="text-amber-400 hover:text-amber-300 text-sm border border-amber-800 px-4 py-2 rounded-lg">↻ Refresh</button>
          </div>
        </div>
        {loading && <div className="text-center text-gray-500 py-20">Loading dashboard…</div>}
        {!loading && data?.error && <div className="bg-red-900/30 border border-red-700 rounded-xl p-6 text-red-300">{data.error}</div>}
        {!loading && !data?.error && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'GR Min/Max', value: `${kpis?.gr_min ?? 0} – ${kpis?.gr_max ?? 0}`, unit: 'API units' },
                { label: 'Avg Gamma Ray', value: kpis?.gr_avg ?? '0', unit: 'API units' },
                { label: 'PE Average', value: kpis?.pe_avg?.toFixed(2) ?? '0', unit: 'photoelectric factor' },
                { label: 'Pass/Fail Ratio', value: `${kpis?.pass ?? 0} / ${kpis?.fail ?? 0}`, unit: `${passRate}% pass rate` },
              ].map(k => (
                <div key={k.label} className="bg-gray-900 border border-amber-900/40 rounded-xl p-5">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">{k.label}</p>
                  <p className="text-amber-300 text-xl font-bold">{k.value}</p>
                  <p className="text-gray-600 text-xs mt-1">{k.unit}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Pass/fail donut */}
              <div className="bg-gray-900 border border-amber-900/40 rounded-xl p-5">
                <h3 className="text-amber-400 font-semibold mb-4 text-sm">Pass / Fail Ratio</h3>
                {total === 0 ? <div className="text-gray-600 text-sm text-center py-8">No data — import dataset first</div> : (
                  <div className="flex items-center gap-4">
                    <svg viewBox="0 0 140 140" className="w-28 h-28 shrink-0">
                      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#374151" strokeWidth="14" />
                      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#22c55e" strokeWidth="14"
                        strokeDasharray={`${passArc} ${circumference}`}
                        strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} />
                      <text x={cx} y={cy - 6} textAnchor="middle" fill="#f59e0b" fontSize="18" fontWeight="bold">{passRate}%</text>
                      <text x={cx} y={cy + 14} textAnchor="middle" fill="#6b7280" fontSize="9">pass rate</text>
                    </svg>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500" /><span className="text-gray-400 text-xs">Pass: {kpis?.pass}</span></div>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /><span className="text-gray-400 text-xs">Fail: {kpis?.fail}</span></div>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500" /><span className="text-gray-400 text-xs">Avg score: {kpis?.avg_quality_score?.toFixed(3)}</span></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Formation quality scores */}
              <div className="bg-gray-900 border border-amber-900/40 rounded-xl p-5">
                <h3 className="text-amber-400 font-semibold mb-4 text-sm">Formation Quality Score</h3>
                {formations.length === 0 ? <div className="text-gray-600 text-sm text-center py-8">No data yet</div> : (
                  <div className="space-y-2">
                    {formations.slice(0, 6).map(f => (
                      <div key={f.formation}>
                        <div className="flex justify-between text-xs text-gray-400 mb-1"><span>{f.formation}</span><span>{Number(f.avg_q).toFixed(3)}</span></div>
                        <div className="h-2 bg-gray-800 rounded-full"><div className="h-full bg-amber-500 rounded-full" style={{ width: `${(Number(f.avg_q) / maxQ) * 100}%` }} /></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Formation bar chart */}
              <div className="bg-gray-900 border border-amber-900/40 rounded-xl p-5">
                <h3 className="text-amber-400 font-semibold mb-4 text-sm">Quality Index Trend (by Formation)</h3>
                {formations.length === 0 ? <div className="text-gray-600 text-sm text-center py-8">No data yet</div> : (
                  <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full h-36">
                    {formations.slice(0, 6).map((f, i) => {
                      const bW = CHART_W / 6 - 6;
                      const bH = (Number(f.avg_q) / maxQ) * (CHART_H - 20);
                      const x = i * (CHART_W / 6) + 3;
                      return (
                        <g key={f.formation}>
                          <rect x={x} y={CHART_H - bH - 16} width={bW} height={bH} fill="#d97706" rx="2" opacity="0.8" />
                          <text x={x + bW / 2} y={CHART_H - 2} fill="#6b7280" fontSize="8" textAnchor="middle">{f.formation.slice(0, 5)}</text>
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
                  ...(total === 0 ? [{ level: 'warning', msg: 'No quality data — import dataset from Data page' }] : []),
                  ...((kpis?.fail ?? 0) > 0 ? [{ level: 'warning', msg: `${kpis?.fail} off-spec records detected (quality score < 0.6) — run root cause analysis` }] : []),
                  ...(total > 0 && (kpis?.fail ?? 0) === 0 ? [{ level: 'ok', msg: `All ${total} records within spec — quality score avg ${kpis?.avg_quality_score?.toFixed(3)}` }] : []),
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
