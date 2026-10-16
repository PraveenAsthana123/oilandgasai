'use client';
import { useState } from 'react';

export default function PricingPage() {
  // Crude Oil
  const [wtiBenchmark, setWtiBenchmark] = useState(95.50);
  const [wcsDifferential, setWcsDifferential] = useState(-18.50);
  const [apiGravityAdj, setApiGravityAdj] = useState(-2.00);
  const [sulphurAdj, setSulphurAdj] = useState(-1.50);
  const [transportDeduct, setTransportDeduct] = useState(-4.00);

  // Natural Gas
  const [aecoSpot, setAecoSpot] = useState(2.45);
  const [basisAdj, setBasisAdj] = useState(-0.30);
  const [seasonalAdj, setSeasonalAdj] = useState(0.15);
  const [btuAdj, setBtuAdj] = useState(0.08);

  // NGL
  const [ethane, setEthane] = useState(12.50);
  const [propane, setPropane] = useState(38.75);
  const [butane, setButane] = useState(45.20);
  const [pentanePlus, setPentanePlus] = useState(68.40);
  const [ethaneComp, setEthaneComp] = useState(30);
  const [propaneComp, setPropaneComp] = useState(40);
  const [butaneComp, setButaneComp] = useState(15);
  const [pentaneComp, setPentaneComp] = useState(15);

  // Margin calculator
  const [costBasis, setCostBasis] = useState(75.00);
  const [marginPct, setMarginPct] = useState(15);
  const [dealPrice, setDealPrice] = useState(0);
  const [requiresApproval, setRequiresApproval] = useState(false);

  // Computed prices
  const crudeNetback = wtiBenchmark + wcsDifferential + apiGravityAdj + sulphurAdj + transportDeduct;
  const gasNetback = aecoSpot + basisAdj + seasonalAdj + btuAdj;
  const totalComp = ethaneComp + propaneComp + butaneComp + pentaneComp;
  const nglBlended = totalComp > 0 ? ((ethane * ethaneComp + propane * propaneComp + butane * butaneComp + pentanePlus * pentaneComp) / totalComp) : 0;
  const floorPrice = costBasis * (1 + marginPct / 100);

  const handleDealPriceChange = (val: number) => {
    setDealPrice(val);
    setRequiresApproval(val < floorPrice);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Pricing Engine</h1>
        <p className="text-slate-400 text-sm mt-1">Oil & Gas commodity pricing with benchmark formulas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Crude Oil */}
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛢️</span>
            <h2 className="text-sm font-semibold text-white">Crude Oil Pricing</h2>
          </div>
          {[
            ['WTI Benchmark (CAD/bbl)', wtiBenchmark, setWtiBenchmark, false],
            ['WCS Differential (heavy discount)', wcsDifferential, setWcsDifferential, true],
            ['API Gravity Adjustment', apiGravityAdj, setApiGravityAdj, true],
            ['Sulphur % Adjustment', sulphurAdj, setSulphurAdj, true],
            ['Transportation Deduct', transportDeduct, setTransportDeduct, true],
          ].map(([label, val, setter, isAdj]: any) => (
            <div key={label as string}>
              <label className="block text-xs text-slate-400 mb-1">{label as string}</label>
              <input type="number" step="0.01" value={val as number} onChange={e => setter(parseFloat(e.target.value))} className="w-full bg-[#0a0e1a] border border-[#1e2a45] text-white text-sm rounded px-3 py-1.5" />
            </div>
          ))}
          <div className="pt-2 border-t border-[#1e2a45] flex justify-between items-center">
            <span className="text-sm text-slate-400">Netback Price (CAD/bbl)</span>
            <span className={`text-lg font-bold ${crudeNetback > 0 ? 'text-emerald-400' : 'text-red-400'}`}>${crudeNetback.toFixed(2)}</span>
          </div>
        </div>

        {/* Natural Gas */}
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔥</span>
            <h2 className="text-sm font-semibold text-white">Natural Gas Pricing</h2>
          </div>
          {[
            ['AECO Spot Price (CAD/GJ)', aecoSpot, setAecoSpot],
            ['Basis Differential', basisAdj, setBasisAdj],
            ['Seasonal Adjustment', seasonalAdj, setSeasonalAdj],
            ['BTU Content Adjustment', btuAdj, setBtuAdj],
          ].map(([label, val, setter]: any) => (
            <div key={label as string}>
              <label className="block text-xs text-slate-400 mb-1">{label as string}</label>
              <input type="number" step="0.01" value={val as number} onChange={e => setter(parseFloat(e.target.value))} className="w-full bg-[#0a0e1a] border border-[#1e2a45] text-white text-sm rounded px-3 py-1.5" />
            </div>
          ))}
          <div className="pt-2 border-t border-[#1e2a45] flex justify-between items-center">
            <span className="text-sm text-slate-400">Net Gas Price (CAD/GJ)</span>
            <span className={`text-lg font-bold ${gasNetback > 0 ? 'text-emerald-400' : 'text-red-400'}`}>${gasNetback.toFixed(2)}</span>
          </div>
        </div>

        {/* NGL Mix */}
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚗️</span>
            <h2 className="text-sm font-semibold text-white">NGL Mix Pricing</h2>
          </div>
          {[
            ['Ethane (CAD/bbl)', ethane, setEthane, ethaneComp, setEthaneComp],
            ['Propane (CAD/bbl)', propane, setPropane, propaneComp, setPropaneComp],
            ['Butane (CAD/bbl)', butane, setButane, butaneComp, setButaneComp],
            ['Pentane+ (CAD/bbl)', pentanePlus, setPentanePlus, pentaneComp, setPentaneComp],
          ].map(([label, price, setPrice, comp, setComp]: any) => (
            <div key={label as string} className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-slate-400 mb-1">{label as string}</label>
                <input type="number" step="0.01" value={price} onChange={e => setPrice(parseFloat(e.target.value))} className="w-full bg-[#0a0e1a] border border-[#1e2a45] text-white text-xs rounded px-2 py-1.5" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Composition %</label>
                <input type="number" value={comp} onChange={e => setComp(parseFloat(e.target.value))} className="w-full bg-[#0a0e1a] border border-[#1e2a45] text-white text-xs rounded px-2 py-1.5" />
              </div>
            </div>
          ))}
          <div className="pt-2 border-t border-[#1e2a45] flex justify-between items-center">
            <span className="text-sm text-slate-400">Blended NGL (CAD/bbl)</span>
            <span className="text-lg font-bold text-emerald-400">${nglBlended.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Margin Calculator */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
        <h2 className="text-sm font-semibold text-white mb-4">Margin Calculator & Discount Approval</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Cost Basis (CAD/unit)</label>
            <input type="number" step="0.01" value={costBasis} onChange={e => setCostBasis(parseFloat(e.target.value))} className="w-full bg-[#0a0e1a] border border-[#1e2a45] text-white text-sm rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Margin %</label>
            <input type="number" value={marginPct} onChange={e => setMarginPct(parseFloat(e.target.value))} className="w-full bg-[#0a0e1a] border border-[#1e2a45] text-white text-sm rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Floor Price (computed)</label>
            <div className="bg-[#0a0e1a] border border-[#1e2a45] text-emerald-400 font-bold text-sm rounded px-3 py-2">${floorPrice.toFixed(2)}</div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Deal Price (CAD/unit)</label>
            <input type="number" step="0.01" value={dealPrice} onChange={e => handleDealPriceChange(parseFloat(e.target.value))} className={`w-full bg-[#0a0e1a] border text-white text-sm rounded px-3 py-2 ${requiresApproval ? 'border-red-500' : 'border-[#1e2a45]'}`} />
          </div>
        </div>
        {requiresApproval && (
          <div className="mt-3 p-3 bg-red-900/30 border border-red-700 rounded-lg">
            <div className="text-red-300 text-sm font-semibold">⚠️ Approval Required</div>
            <div className="text-red-400 text-xs mt-1">Deal price ${dealPrice.toFixed(2)} is below floor price ${floorPrice.toFixed(2)}. Manager approval required before quoting.</div>
          </div>
        )}
        {!requiresApproval && dealPrice > 0 && (
          <div className="mt-3 p-3 bg-emerald-900/30 border border-emerald-700 rounded-lg">
            <div className="text-emerald-300 text-sm font-semibold">✓ Within Margin Policy</div>
            <div className="text-emerald-400 text-xs mt-1">Margin: {((dealPrice - costBasis) / costBasis * 100).toFixed(1)}% — authorized to quote without approval.</div>
          </div>
        )}
      </div>

      {/* Summary Table */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
        <h2 className="text-sm font-semibold text-white mb-3">Current Pricing Summary</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 border-b border-[#1e2a45]">
              <th className="text-left pb-2">Commodity</th>
              <th className="text-left pb-2">Benchmark</th>
              <th className="text-left pb-2">Adjustments</th>
              <th className="text-left pb-2">Net Price</th>
              <th className="text-left pb-2">Unit</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[#1e2a45]/40">
              <td className="py-2 text-white">Crude Oil (WCS)</td>
              <td className="py-2 text-slate-400">WTI ${wtiBenchmark.toFixed(2)}</td>
              <td className="py-2 text-red-400">{(wcsDifferential + apiGravityAdj + sulphurAdj + transportDeduct).toFixed(2)}</td>
              <td className="py-2 font-bold text-emerald-400">${crudeNetback.toFixed(2)}</td>
              <td className="py-2 text-slate-500">/bbl</td>
            </tr>
            <tr className="border-b border-[#1e2a45]/40">
              <td className="py-2 text-white">Natural Gas (AECO)</td>
              <td className="py-2 text-slate-400">AECO ${aecoSpot.toFixed(2)}</td>
              <td className="py-2 text-slate-400">{(basisAdj + seasonalAdj + btuAdj).toFixed(2)}</td>
              <td className="py-2 font-bold text-emerald-400">${gasNetback.toFixed(2)}</td>
              <td className="py-2 text-slate-500">/GJ</td>
            </tr>
            <tr>
              <td className="py-2 text-white">NGL Mix (blended)</td>
              <td className="py-2 text-slate-400">Component pricing</td>
              <td className="py-2 text-slate-400">Weighted avg</td>
              <td className="py-2 font-bold text-emerald-400">${nglBlended.toFixed(2)}</td>
              <td className="py-2 text-slate-500">/bbl</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
