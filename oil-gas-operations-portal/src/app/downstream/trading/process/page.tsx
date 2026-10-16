'use client';
import { useEffect, useState } from 'react';

const TRADING_FLOW = [
  { id: 'intel', label: 'Market Intelligence', x: 20, width: 130 },
  { id: 'decision', label: 'Trade Decision', x: 195, width: 115 },
  { id: 'contract', label: 'Contract Execution', x: 360, width: 135 },
  { id: 'logistics', label: 'Logistics', x: 545, width: 100 },
  { id: 'delivery', label: 'Delivery', x: 695, width: 90 },
  { id: 'settlement', label: 'Settlement', x: 835, width: 100 },
];

const CRUDE_GRADES = [
  { grade: 'WTI (West Texas Intermediate)', origin: 'USA (Cushing, OK)', api: '39.6', sulphur: '0.24%', benchmark: 'NYMEX light sweet' },
  { grade: 'Brent Blend', origin: 'North Sea (UK)', api: '38.3', sulphur: '0.37%', benchmark: 'ICE global benchmark' },
  { grade: 'WCS (Western Canadian Select)', origin: 'Canada (Alberta)', api: '20.5', sulphur: '3.3%', benchmark: 'WTI minus differential' },
  { grade: 'Maya', origin: 'Mexico', api: '21.3', sulphur: '3.3%', benchmark: 'USGC heavy sour' },
];

const AI_MODELS = [
  { model: 'Price Forecaster (LSTM)', type: 'LSTM Time Series', input: 'WTI/Brent/WCS 5-year price history, inventory data, geopolitical events', output: '30-day price forecast with confidence intervals' },
  { model: 'Optimal Crude Selection (LP + ML)', type: 'LP + ML', input: 'Current refinery configuration, product demand forecast, crude prices + differentials', output: 'Optimal crude slate → maximum gross margin ($/bbl)' },
  { model: 'Contract Risk Analyzer', type: 'NLP + ML', input: 'Contract text, industry standard terms database', output: 'Flagged unfavorable clauses, risk score, comparison vs industry standard' },
  { model: 'Margin Optimizer (Products)', type: 'LP Optimization', input: 'Product inventory, spot prices, rack prices, export opportunities', output: 'Optimal sales mix (rack/spot/export) for net margin maximization' },
  { model: 'Product Demand Forecaster', type: 'ML (XGBoost + LSTM)', input: 'Historical demand by grade, weather, economic indicators, competitive price data', output: 'Next 30-day product demand by grade and region' },
  { model: 'CAD/USD Rate Impact Model', type: 'ML', input: 'FX rate, WCS differential, pipeline capacity (TMX), refinery netback', output: 'Net impact of FX change on WCS procurement cost → hedge decision signal' },
];

const PRODUCT_POSITIONS = [
  { product: 'Gasoline', pricingBasis: 'NYMEX RBOB + rack differential', salesTotally: 'Rack + Spot wholesale + Export', hedging: 'NYMEX RBOB futures' },
  { product: 'Diesel (ULSD)', pricingBasis: 'NYMEX ULSD + differential', salesTotally: 'Rack + Spot + Pipeline + Export', hedging: 'NYMEX ULSD futures' },
  { product: 'Jet Fuel (ATF)', pricingBasis: 'Platts jet kero CIF', salesTotally: 'Airline direct contracts + spot', hedging: 'Jet fuel swaps' },
  { product: 'LPG (Propane/Butane)', pricingBasis: 'Conway / Mont Belvieu', salesTotally: 'Spot + seasonal contracts', hedging: 'Propane futures' },
];

export default function TradingProcessPage() {
  const [activeTab, setActiveTab] = useState('crude');

  useEffect(() => {}, []);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded text-xs font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30">P-DS-05</span>
          <span className="text-gray-500 text-sm">Downstream / Commercial &amp; Trading</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Commercial &amp; Trading Process</h1>
        <p className="text-gray-400 text-sm mt-1">Crude procurement · Product trading · Hedging · Margin optimization · WCS/CAD context</p>
      </div>

      {/* Flow SVG */}
      <div className="bg-[#0d1424] border border-[#1e2a45] rounded-xl p-6 overflow-x-auto">
        <svg width="980" height="90" viewBox="0 0 980 90" className="min-w-[940px]">
          {TRADING_FLOW.slice(0, -1).map((node, i) => {
            const next = TRADING_FLOW[i + 1];
            const x1 = node.x + node.width;
            const x2 = next.x;
            return (
              <g key={`c-${i}`}>
                <line x1={x1} y1="40" x2={x2} y2="40" stroke="#374151" strokeWidth="2" />
                <polygon points={`${x2},36 ${x2 - 8},32 ${x2 - 8},44`} fill="#374151" />
              </g>
            );
          })}
          {TRADING_FLOW.map((node, i) => (
            <g key={node.id}>
              <rect x={node.x} y="15" width={node.width} height="50" rx="6"
                fill="#111827"
                stroke={i === 1 ? '#f59e0b' : i === 5 ? '#22c55e' : '#374151'}
                strokeWidth={i === 1 || i === 5 ? 2 : 1.5} />
              <text x={node.x + node.width / 2} y="40" textAnchor="middle" fill="white" fontSize="9" fontWeight="600">
                {node.label.length > 16 ? node.label.substring(0, 15) + '…' : node.label}
              </text>
              {i === 1 && <text x={node.x + node.width / 2} y="54" textAnchor="middle" fill="#f59e0b" fontSize="7">⚡ LP+ML</text>}
              {i === 5 && <text x={node.x + node.width / 2} y="54" textAnchor="middle" fill="#22c55e" fontSize="7">PnL Reported</text>}
            </g>
          ))}
        </svg>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#1e2a45]">
        {[
          { id: 'crude', label: 'Crude Procurement' },
          { id: 'products', label: 'Product Trading' },
          { id: 'ai', label: 'AI Models' },
          { id: 'canadian', label: 'Canadian Context' },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === t.id ? 'text-amber-400 border-b-2 border-amber-500' : 'text-gray-400 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Crude Procurement */}
      {activeTab === 'crude' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0d1424] border border-[#1e2a45] rounded-xl p-5">
              <h3 className="text-white font-semibold mb-3">Procurement Modes</h3>
              <div className="space-y-3">
                <div className="bg-[#0a0e1a] rounded-lg p-3 border border-amber-500/20">
                  <div className="text-amber-400 text-xs font-semibold mb-1">SPOT MARKET</div>
                  <div className="text-gray-300 text-sm">WTI, Brent, WCS, Maya benchmarks + quality differentials (API gravity, sulphur)</div>
                  <div className="text-gray-500 text-xs mt-1">Pricing: benchmark ± differential per contract</div>
                </div>
                <div className="bg-[#0a0e1a] rounded-lg p-3 border border-blue-500/20">
                  <div className="text-blue-400 text-xs font-semibold mb-1">TERM CONTRACTS</div>
                  <div className="text-gray-300 text-sm">Monthly volumes, fixed or formula-based pricing (e.g. WCS = WTI − $15/bbl)</div>
                  <div className="text-gray-500 text-xs mt-1">Provides volume certainty; locks in differential</div>
                </div>
              </div>
            </div>
            <div className="bg-[#0d1424] border border-[#1e2a45] rounded-xl p-5">
              <h3 className="text-white font-semibold mb-3">Quality Premium / Discount</h3>
              <p className="text-gray-400 text-sm mb-3">Crude price is adjusted vs benchmark based on:</p>
              <div className="space-y-2">
                {[
                  { factor: 'API Gravity', effect: 'Higher API → higher premium (lighter = more gasoline/naphtha)' },
                  { factor: 'Sulphur Content', effect: 'Higher sulphur → deeper discount (more treating cost)' },
                  { factor: 'TAN (Total Acid Number)', effect: 'High TAN → discount (corrosion of refinery equipment)' },
                  { factor: 'Metals (Ni+V)', effect: 'High metals → discount (FCC catalyst poisoning)' },
                ].map(({ factor, effect }) => (
                  <div key={factor} className="flex items-start gap-2">
                    <span className="text-amber-400 text-xs mt-0.5">▸</span>
                    <div>
                      <span className="text-gray-200 text-sm font-medium">{factor}: </span>
                      <span className="text-gray-400 text-sm">{effect}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Crude Grades Table */}
          <div className="bg-[#0d1424] border border-[#1e2a45] rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">Reference Crude Grades</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1e2a45]">
                    {['Grade', 'Origin', 'API Gravity', 'Sulphur', 'Benchmark Role'].map(h => (
                      <th key={h} className="text-left text-gray-400 font-medium py-2 px-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CRUDE_GRADES.map((c) => (
                    <tr key={c.grade} className="border-b border-[#1e2a45]/50 hover:bg-[#1e2a45]/20 transition-colors">
                      <td className="py-2 px-3 text-amber-400 font-medium">{c.grade}</td>
                      <td className="py-2 px-3 text-gray-300">{c.origin}</td>
                      <td className="py-2 px-3 text-blue-400 font-mono">{c.api}°</td>
                      <td className="py-2 px-3 text-gray-400 font-mono">{c.sulphur}</td>
                      <td className="py-2 px-3 text-gray-400 text-xs">{c.benchmark}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Product Trading */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="bg-[#0d1424] border border-[#1e2a45] rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">Product Trading Positions</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1e2a45]">
                    {['Product', 'Pricing Basis', 'Sales Channels', 'Hedging Instrument'].map(h => (
                      <th key={h} className="text-left text-gray-400 font-medium py-2 px-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PRODUCT_POSITIONS.map((p) => (
                    <tr key={p.product} className="border-b border-[#1e2a45]/50">
                      <td className="py-2 px-3 text-amber-400 font-medium">{p.product}</td>
                      <td className="py-2 px-3 text-gray-300 text-xs">{p.pricingBasis}</td>
                      <td className="py-2 px-3 text-gray-400 text-xs">{p.salesTotally}</td>
                      <td className="py-2 px-3 text-blue-400 text-xs">{p.hedging}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { k: 'Rack vs Rack Arbitrage', v: 'Compare rack prices across terminals → route product to highest-netback terminal' },
              { k: 'Spot vs Term Trade-off', v: 'Spot allows flexibility; term provides volume certainty — balance based on inventory and crack spread outlook' },
              { k: 'Export Arbitrage', v: 'When domestic rack < international spot netback → export to international market' },
            ].map(({ k, v }) => (
              <div key={k} className="bg-[#0d1424] border border-[#1e2a45] rounded-xl p-4">
                <div className="text-amber-400 text-xs font-semibold mb-2">{k}</div>
                <div className="text-gray-400 text-sm">{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Models */}
      {activeTab === 'ai' && (
        <div className="space-y-4">
          {AI_MODELS.map((m) => (
            <div key={m.model} className="bg-[#0d1424] border border-[#1e2a45] rounded-xl p-4 hover:border-amber-500/30 transition-colors">
              <div className="flex items-start gap-3">
                <span className="text-amber-400 text-lg">⚡</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-white font-medium">{m.model}</span>
                    <span className="px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400">{m.type}</span>
                  </div>
                  <div className="text-gray-400 text-xs mb-1"><span className="text-gray-500">Input: </span>{m.input}</div>
                  <div className="text-green-400 text-xs"><span className="text-gray-500">Output: </span>{m.output}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Canadian Context */}
      {activeTab === 'canadian' && (
        <div className="space-y-4">
          <div className="bg-[#0d1424] border border-amber-500/20 rounded-xl p-5">
            <h3 className="text-amber-400 font-semibold mb-3">🍁 Canadian Crude Market Context</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'WCS Differential', desc: 'Western Canadian Select trades at a discount vs WTI (typically $10–$25/bbl) due to higher sulphur (3.3%) and lower API (20.5°). Differential widens when pipeline capacity is constrained.' },
                { title: 'Trans Mountain Pipeline (TMX)', desc: 'Twinned TMX pipeline (increased to ~900,000 bpd in 2024) provides access to tidewater → BC coast → Asia-Pacific markets, reducing WCS discount structurally.' },
                { title: 'CAD/USD Exchange Rate', desc: 'Crude priced in USD; refinery revenues partially CAD (domestic rack sales). A weaker CAD increases CAD-equivalent crude cost but also boosts export product revenues. Net impact modeled per scenario.' },
                { title: 'Alberta Royalty & Tax', desc: 'Alberta Crown royalty on oil sands production varies 1–40% based on WTI price and project payout status. Feeds into crude supply cost model.' },
              ].map(({ title, desc }) => (
                <div key={title} className="bg-[#0a0e1a] rounded-lg p-4 border border-[#1e2a45]">
                  <div className="text-white font-medium text-sm mb-2">{title}</div>
                  <div className="text-gray-400 text-sm">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
