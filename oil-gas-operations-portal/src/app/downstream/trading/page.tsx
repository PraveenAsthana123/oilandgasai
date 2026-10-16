'use client';
import { useEffect, useState } from 'react';

export default function TradingPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  useEffect(() => { fetch('/api/downstream/trading').then(r => r.json()).then(d => setData(d.metrics)); }, []);
  const d = data as Record<string, unknown> | null;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Commercial & Trading</h1>
        <p className="text-gray-400 text-sm mt-1">Price forecasting · Cargo optimization · Contract management · Hedging</p></div>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Open Contracts', value: d ? String(d.open_contracts) : '—', icon: '📄' },
          { label: 'Cargo Value', value: d ? `$${d.cargo_value_musd}M` : '—', icon: '🚢' },
          { label: 'Hedge Ratio', value: d ? `${d.hedge_ratio_pct}%` : '—', icon: '🛡️' },
          { label: 'vs Benchmark', value: d ? `+${d.realized_vs_benchmark_pct}%` : '—', icon: '📈' },
          { label: '30-day Price Forecast', value: d ? `$${d.price_forecast_30d_usd_bbl}/bbl` : '—', icon: '🔮' },
          { label: 'Counterparty Exposure', value: d ? `$${d.counterparty_exposure_musd}M` : '—', icon: '⚠️' },
          { label: 'Arbitrage Opps', value: d ? String(d.arbitrage_opportunities) : '—', icon: '💡' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <div className="text-xl mb-2">{kpi.icon}</div>
            <div className="text-xl font-bold text-white">{kpi.value}</div>
            <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <h2 className="font-semibold text-white mb-3">Price Forecasting Model — LSTM + Fundamental</h2>
        <div className="grid grid-cols-3 gap-3 text-xs">
          {[
            { factor: 'Supply/Demand', weight: '35%', source: 'EIA weekly inventory, IEA balance' },
            { factor: 'Technical Signals', weight: '25%', source: 'Moving avg, RSI, Bollinger bands' },
            { factor: 'Geopolitical', weight: '20%', source: 'NLP news sentiment, geopolitical index' },
            { factor: 'Derivatives', weight: '15%', source: 'Futures curve, options market' },
            { factor: 'Macro', weight: '5%', source: 'USD index, interest rates, GDP' },
          ].map((f) => (
            <div key={f.factor} className="border border-[#1e2a45] rounded-lg p-3">
              <div className="text-white font-medium">{f.factor}</div>
              <div className="text-amber-400 text-lg font-bold">{f.weight}</div>
              <div className="text-gray-500">{f.source}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
