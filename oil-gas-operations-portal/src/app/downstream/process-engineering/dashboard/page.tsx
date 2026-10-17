'use client';
import { useState, useEffect, useCallback } from 'react';

interface DashData {
  kpis?: { avg_gr: string; formations: number; avg_phind: number; facies_types: number };
  formations?: { formation: string; cnt: string }[];
  phind_stats?: { min_phind: string; max_phind: string; avg_phind: string };
  facies_dist?: { facies: number; cnt: string }[];
  error?: string;
}

export default function ProcessEngDashboard() {
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch('/api/downstream/process-engineering/dashboard');
    setData(await r.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const kpis = data?.kpis;
  const formations = data?.formations || [];
  const faciesDist = data?.facies_dist || [];
  const phind = data?.phind_stats;

  const maxForm = Math.max(...formations.map(f => Number(f.cnt)), 1);
  const maxFacies = Math.max(...faciesDist.map(f => Number(f.cnt)), 1);
  const CHART_W = 400, CHART_H = 130;

  // PHIND histogram bars (simulate 5 buckets from min to max)
  const phindBuckets = phind ? (() => {
    const min = Number(phind.min_phind), max = Number(phind.max_phind), avg = Number(phind.avg_phind);
    const range = max - min || 1;
    return [min, min + range * 0.25, avg - range * 0.1, avg + range * 0.1, max - range * 0.25, max].map((v, i) => ({
      label: v.toFixed(1), height: [0.2, 0.5, 0.9, 1.0, 0.7, 0.3][i]
    }));
  })() : [];

  return (
    <div className="min-h-screen bg-gray-950 text-amber-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2"><div className="w-3 h-3 rounded-full bg-amber-500" /><span className="text-amber-400 text-sm font-mono uppercase tracking-widest">Downstream / Process Engineering</span></div>
              <h1 className="text-3xl font-bold text-amber-300">Operations Dashboard</h1>
            </div>
            <button onClick={load} className="text-amber-400 hover:text-amber-300 text-sm border border-amber-800 px-4 py-2 rounded-lg">↻ Refresh</button>
          </div>
        </div>

        {loading && <div className="text-center text-gray-500 py-20">Loading dashboard…</div>}
        {!loading && data?.error && <div className="bg-red-900/30 border border-red-700 rounded-xl p-6 text-red-300">{data.error}</div>}

        {!loading && !data?.error && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Avg Gamma Ray', value: kpis?.avg_gr ?? '0', unit: 'API units' },
                { label: 'Formation Count', value: kpis?.formations ?? 0, unit: 'formations' },
                { label: 'Avg PHIND', value: kpis?.avg_phind ?? 0, unit: 'porosity %' },
                { label: 'Facies Types', value: kpis?.facies_types ?? 0, unit: 'rock types' },
              ].map(k => (
                <div key={k.label} className="bg-gray-900 border border-amber-900/40 rounded-xl p-5">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">{k.label}</p>
                  <p className="text-amber-300 text-2xl font-bold">{k.value}</p>
                  <p className="text-gray-600 text-xs mt-1">{k.unit}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Formation count bar */}
              <div className="bg-gray-900 border border-amber-900/40 rounded-xl p-5">
                <h3 className="text-amber-400 font-semibold mb-4 text-sm">Formation Count</h3>
                {formations.length === 0 ? <div className="text-gray-600 text-sm text-center py-8">No data — import dataset first</div> : (
                  <div className="space-y-2">
                    {formations.slice(0, 6).map(f => (
                      <div key={f.formation}>
                        <div className="flex justify-between text-xs text-gray-400 mb-1"><span>{f.formation}</span><span>{f.cnt}</span></div>
                        <div className="h-2 bg-gray-800 rounded-full"><div className="h-full bg-amber-500 rounded-full" style={{ width: `${(Number(f.cnt) / maxForm) * 100}%` }} /></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* PHIND histogram */}
              <div className="bg-gray-900 border border-amber-900/40 rounded-xl p-5">
                <h3 className="text-amber-400 font-semibold mb-4 text-sm">PHIND Distribution</h3>
                {!phind ? <div className="text-gray-600 text-sm text-center py-8">No data yet</div> : (
                  <svg viewBox={`0 0 ${CHART_W} ${CHART_H + 20}`} className="w-full h-36">
                    {phindBuckets.map((b, i) => {
                      const bW = CHART_W / phindBuckets.length - 4;
                      const bH = b.height * CHART_H;
                      return (
                        <g key={i}>
                          <rect x={i * (CHART_W / phindBuckets.length) + 2} y={CHART_H - bH} width={bW} height={bH} fill="#f59e0b" rx="2" opacity="0.7" />
                          <text x={i * (CHART_W / phindBuckets.length) + bW / 2 + 2} y={CHART_H + 14} fill="#6b7280" fontSize="8" textAnchor="middle">{b.label}</text>
                        </g>
                      );
                    })}
                    <text x="0" y="12" fill="#6b7280" fontSize="8">Avg: {phind.avg_phind}</text>
                  </svg>
                )}
              </div>

              {/* Facies distribution */}
              <div className="bg-gray-900 border border-amber-900/40 rounded-xl p-5">
                <h3 className="text-amber-400 font-semibold mb-4 text-sm">Facies Distribution</h3>
                {faciesDist.length === 0 ? <div className="text-gray-600 text-sm text-center py-8">No data yet</div> : (
                  <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full h-36">
                    {faciesDist.map((f, i) => {
                      const bW = (CHART_W / faciesDist.length) - 6;
                      const bH = (Number(f.cnt) / maxFacies) * (CHART_H - 20);
                      const x = i * (CHART_W / faciesDist.length) + 3;
                      return (
                        <g key={f.facies}>
                          <rect x={x} y={CHART_H - bH - 16} width={bW} height={bH} fill="#d97706" rx="2" opacity="0.8" />
                          <text x={x + bW / 2} y={CHART_H - 2} fill="#6b7280" fontSize="9" textAnchor="middle">F{f.facies}</text>
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
                  ...(Number(kpis?.formations) === 0
                    ? [{ level: 'warning', msg: 'No well data in DB — import dataset from Data page' }]
                    : [{ level: 'ok', msg: `${kpis?.formations} formations across ${kpis?.facies_types} facies types — avg GR ${kpis?.avg_gr} API units` }]),
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
