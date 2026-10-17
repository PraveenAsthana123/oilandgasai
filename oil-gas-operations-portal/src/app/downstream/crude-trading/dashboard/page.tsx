'use client';
import { useState, useEffect, useCallback } from 'react';

interface DashData {
  kpis?: { brent_price: number | null; wti_price: number | null; natgas_price: number | null };
  price_range_30d?: { symbol: string; low30: string; high30: string; avg_close: string }[];
  price_trend?: { symbol: string; trade_date: string; close_price: string }[];
  volume?: { symbol: string; avg_vol: string }[];
  error?: string;
}

export default function TradingDashboard() {
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { setLoading(true); setData(await (await fetch('/api/downstream/crude-trading/dashboard')).json()); setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);

  const kpis = data?.kpis;
  const trend = (data?.price_trend || []).filter(t => t.symbol === 'CL=F' || t.symbol === 'BZ=F');
  const brentTrend = (data?.price_trend || []).filter(t => t.symbol === 'BZ=F');
  const wtiTrend = (data?.price_trend || []).filter(t => t.symbol === 'CL=F');
  const allTrend = brentTrend.length > 0 ? brentTrend : wtiTrend;
  const CHART_W = 400, CHART_H = 130;
  const maxPrice = Math.max(...allTrend.map(t => Number(t.close_price)), 1);
  const minPrice = Math.min(...allTrend.map(t => Number(t.close_price)), 0);
  const priceRange = maxPrice - minPrice || 1;

  const trendPath = allTrend.length > 1 ? allTrend.map((t, i) => {
    const x = (i / (allTrend.length - 1)) * CHART_W;
    const y = CHART_H - ((Number(t.close_price) - minPrice) / priceRange) * CHART_H;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ') : '';

  const priceRanges = data?.price_range_30d || [];
  const volumes = data?.volume || [];
  const maxVol = Math.max(...volumes.map(v => Number(v.avg_vol)), 1);

  return (
    <div className="min-h-screen bg-gray-950 text-amber-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div><div className="flex items-center gap-3 mb-2"><div className="w-3 h-3 rounded-full bg-amber-500" /><span className="text-amber-400 text-sm font-mono uppercase tracking-widest">Downstream / Crude Trading</span></div><h1 className="text-3xl font-bold text-amber-300">Operations Dashboard</h1></div>
            <button onClick={load} className="text-amber-400 hover:text-amber-300 text-sm border border-amber-800 px-4 py-2 rounded-lg">↻ Refresh</button>
          </div>
        </div>
        {loading && <div className="text-center text-gray-500 py-20">Loading dashboard…</div>}
        {!loading && data?.error && <div className="bg-red-900/30 border border-red-700 rounded-xl p-6 text-red-300">{data.error}</div>}
        {!loading && !data?.error && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Brent Crude (BZ=F)', value: kpis?.brent_price ? `$${kpis.brent_price.toFixed(2)}` : '—', unit: 'USD/bbl' },
                { label: 'WTI Crude (CL=F)', value: kpis?.wti_price ? `$${kpis.wti_price.toFixed(2)}` : '—', unit: 'USD/bbl' },
                { label: 'Natural Gas (NG=F)', value: kpis?.natgas_price ? `$${kpis.natgas_price.toFixed(2)}` : '—', unit: 'USD/MMBtu' },
                { label: 'Instruments', value: priceRanges.length, unit: 'symbols tracked' },
              ].map(k => (
                <div key={k.label} className="bg-gray-900 border border-amber-900/40 rounded-xl p-5">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">{k.label}</p>
                  <p className="text-amber-300 text-2xl font-bold">{k.value}</p>
                  <p className="text-gray-600 text-xs mt-1">{k.unit}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Price trend line */}
              <div className="bg-gray-900 border border-amber-900/40 rounded-xl p-5">
                <h3 className="text-amber-400 font-semibold mb-4 text-sm">Price Trend ({allTrend[0]?.symbol || 'No data'})</h3>
                {allTrend.length < 2 ? <div className="text-gray-600 text-sm text-center py-8">No trend data — import dataset first</div> : (
                  <svg viewBox={`0 0 ${CHART_W} ${CHART_H + 20}`} className="w-full h-36">
                    <defs><linearGradient id="tradeTrendGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" /><stop offset="100%" stopColor="#f59e0b" stopOpacity="0" /></linearGradient></defs>
                    <path d={`${trendPath} L ${CHART_W} ${CHART_H} L 0 ${CHART_H} Z`} fill="url(#tradeTrendGrad)" />
                    <path d={trendPath} fill="none" stroke="#f59e0b" strokeWidth="2" />
                    {allTrend.map((t, i) => <circle key={i} cx={(i / (allTrend.length - 1)) * CHART_W} cy={CHART_H - ((Number(t.close_price) - minPrice) / priceRange) * CHART_H} r="2" fill="#f59e0b" />)}
                    <text x="0" y={CHART_H + 16} fill="#6b7280" fontSize="8">{allTrend[0]?.trade_date}</text>
                    <text x={CHART_W} y={CHART_H + 16} fill="#6b7280" fontSize="8" textAnchor="end">{allTrend[allTrend.length - 1]?.trade_date}</text>
                  </svg>
                )}
              </div>

              {/* 30-day price range */}
              <div className="bg-gray-900 border border-amber-900/40 rounded-xl p-5">
                <h3 className="text-amber-400 font-semibold mb-4 text-sm">30-Day Price Range</h3>
                {priceRanges.length === 0 ? <div className="text-gray-600 text-sm text-center py-8">No range data yet</div> : (
                  <div className="space-y-4">
                    {priceRanges.map(r => (
                      <div key={r.symbol}>
                        <div className="flex justify-between text-xs text-gray-400 mb-1"><span className="font-mono text-amber-400">{r.symbol}</span><span>avg ${r.avg_close}</span></div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>L: ${r.low30}</span>
                          <div className="flex-1 h-2 bg-gray-800 rounded-full relative">
                            <div className="absolute h-full bg-gradient-to-r from-red-600 via-amber-500 to-green-600 rounded-full w-full opacity-60" />
                          </div>
                          <span>H: ${r.high30}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Volume bar */}
              <div className="bg-gray-900 border border-amber-900/40 rounded-xl p-5">
                <h3 className="text-amber-400 font-semibold mb-4 text-sm">Avg Volume Traded</h3>
                {volumes.length === 0 ? <div className="text-gray-600 text-sm text-center py-8">No volume data yet</div> : (
                  <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full h-36">
                    {volumes.slice(0, 5).map((v, i) => {
                      const bW = CHART_W / 5 - 8; const bH = (Number(v.avg_vol) / maxVol) * (CHART_H - 20); const x = i * (CHART_W / 5) + 4;
                      return <g key={v.symbol}><rect x={x} y={CHART_H - bH - 16} width={bW} height={bH} fill="#d97706" rx="2" opacity="0.8" /><text x={x + bW / 2} y={CHART_H - 2} fill="#6b7280" fontSize="8" textAnchor="middle">{v.symbol.replace('=F','')}</text></g>;
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
                  ...(priceRanges.length === 0 ? [{ level: 'warning', msg: 'No price data — import energy market dataset from Data page' }] : []),
                  ...(kpis?.brent_price && kpis?.wti_price ? [{ level: 'ok', msg: `Brent-WTI spread: $${(kpis.brent_price - kpis.wti_price).toFixed(2)}/bbl — ${kpis.brent_price > kpis.wti_price ? 'Brent premium' : 'WTI premium'}` }] : []),
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
