'use client';
export default function StatisticalMLPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Statistical ML Models</h1>
        <p className="text-gray-400 text-sm mt-1">Arps decline · Material balance · SPC control charts · Reliability Weibull · Monte Carlo</p>
      </div>

      {/* Arps Decline */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <h2 className="font-semibold text-white mb-3">📉 Arps Decline Curve Analysis</h2>
        <div className="grid grid-cols-3 gap-3 text-xs mb-4">
          {[
            { type: 'Hyperbolic', eq: 'q(t) = qᵢ/(1+b·Dᵢ·t)^(1/b)', param: '0 < b < 1', eur: 'Variable rate change, most common for unconventional' },
            { type: 'Exponential', eq: 'q(t) = qᵢ · exp(-Dᵢ·t)', param: 'b = 0', eur: 'Constant decline rate, boundary dominated flow' },
            { type: 'Harmonic', eq: 'q(t) = qᵢ/(1+Dᵢ·t)', param: 'b = 1', eur: 'Fracture-dominated, gravity drainage CBM' },
          ].map((m) => (
            <div key={m.type} className="border border-[#1e2a45] rounded-lg p-3">
              <div className="text-amber-400 font-medium mb-1">{m.type}</div>
              <div className="font-mono bg-[#0a0e1a] px-2 py-1 rounded text-blue-400 mb-2">{m.eq}</div>
              <div className="text-gray-500">b: {m.param}</div>
              <div className="text-gray-400 mt-1">{m.eur}</div>
            </div>
          ))}
        </div>
        <div className="text-xs text-gray-500 bg-[#0a0e1a] p-3 rounded">
          <span className="text-amber-400">EUR Calculation:</span> EUR = qᵢ/[(1-b)·Dᵢ] × [1 - (qₐᵦₐₙ/qᵢ)^(1-b)] (Hyperbolic)
          &nbsp;·&nbsp; P10/P50/P90 from Monte Carlo sampling of {'{'}qᵢ, Dᵢ, b{'}'} parameter uncertainty
        </div>
      </div>

      {/* Weibull */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <h2 className="font-semibold text-white mb-3">⚙️ Weibull Reliability Analysis</h2>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <div className="font-mono bg-[#0a0e1a] px-3 py-2 rounded text-blue-400 mb-3">
              F(t) = 1 - exp(-(t/η)^β)<br/>
              f(t) = (β/η)·(t/η)^(β-1)·exp(-(t/η)^β)<br/>
              h(t) = (β/η)·(t/η)^(β-1)  [hazard function]
            </div>
            <div className="space-y-1 text-gray-400">
              <div><span className="text-amber-400">η (scale):</span> Characteristic life (63.2% fail by η)</div>
              <div><span className="text-amber-400">β (shape):</span> β&lt;1 early failures, β=1 random, β&gt;1 wear-out</div>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { asset: 'ESP Pumps', beta: '2.4', eta_hrs: '14,200', mttf: '12,600 hrs', mode: 'Wear-out' },
              { asset: 'Compressor Bearings', beta: '1.8', eta_hrs: '22,000', mttf: '19,500 hrs', mode: 'Wear-out' },
              { asset: 'Control Valves', beta: '0.8', eta_hrs: '18,000', mttf: '22,000 hrs', mode: 'Early failure' },
              { asset: 'Sealing Systems', beta: '3.1', eta_hrs: '8,500', mttf: '7,700 hrs', mode: 'Rapid wear-out' },
            ].map((a) => (
              <div key={a.asset} className="flex items-center gap-2 border border-[#1e2a45] rounded px-3 py-2">
                <div className="flex-1 text-gray-300">{a.asset}</div>
                <div className="text-xs font-mono text-amber-400">β={a.beta}</div>
                <div className="text-xs text-gray-500">MTTF: {a.mttf}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Material Balance */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <h2 className="font-semibold text-white mb-3">🧪 Material Balance — Havlena-Odeh Method</h2>
        <div className="font-mono bg-[#0a0e1a] px-3 py-3 rounded text-xs text-blue-400 mb-3">
          F = N(Eₒ + m·Eᵍ + (1+m)·Efw) + We<br/><br/>
          where:<br/>
          F = Nₚ[Bₒ + (Rₚ-Rsₒ)Bᵍ] + WₚBw  [reservoir voidage]<br/>
          Eₒ = (Bₒ-Bₒᵢ) + (Rsₒᵢ-Rsₒ)Bᵍ  [oil+dissolved gas expansion]<br/>
          Eᵍ = Bᵍᵢ(Bᵍ/Bᵍᵢ - 1)  [free gas expansion]<br/>
          Efw = (1+m)Bₒᵢ(cwSwi+cf)/(1-Swi)·ΔP  [connate water + pore volume]
        </div>
        <div className="text-xs text-gray-400">Plot F vs (Eₒ + m·Eᵍ) — straight line slope = N (OOIP), intercept = We contribution</div>
      </div>

      {/* SPC */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <h2 className="font-semibold text-white mb-3">📊 Statistical Process Control — Control Charts</h2>
        <div className="grid grid-cols-3 gap-3 text-xs">
          {[
            { chart: 'X̄-R Chart', eq: 'UCL = X̄ + A₂·R̄  |  LCL = X̄ - A₂·R̄', use: 'Variable measurement monitoring (continuous sensor data)' },
            { chart: 'CUSUM Chart', eq: 'Cₜ⁺ = max(0, Cₜ₋₁⁺ + (xₜ - μ₀ - k))  |  h = decision interval', use: 'Detect small persistent shifts, early equipment degradation' },
            { chart: 'EWMA Chart', eq: 'Zₜ = λxₜ + (1-λ)Zₜ₋₁  |  UCL = μ₀ + Lσ√(λ/(2-λ))', use: 'Autocorrelated sensor data, gradual process drift' },
          ].map((c) => (
            <div key={c.chart} className="border border-[#1e2a45] rounded-lg p-3">
              <div className="text-amber-400 font-medium mb-1">{c.chart}</div>
              <div className="font-mono text-blue-400 text-xs bg-[#0a0e1a] p-2 rounded mb-2 break-all">{c.eq}</div>
              <div className="text-gray-400">{c.use}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Monte Carlo */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <h2 className="font-semibold text-white mb-3">🎲 Monte Carlo — Reserves Uncertainty Quantification</h2>
        <div className="grid grid-cols-4 gap-3 text-xs">
          {[
            { step: '1. Define Inputs', desc: 'P(OOIP), P(Recovery Factor), P(Decline Rate) with probability distributions (triangular/lognormal)', icon: '📊' },
            { step: '2. Sample', desc: 'N=10,000+ random draws from each input distribution using Latin Hypercube Sampling', icon: '🎯' },
            { step: '3. Propagate', desc: 'Run decline curve model for each sample set. Each run gives one EUR estimate', icon: '🔄' },
            { step: '4. Output P10/P50/P90', desc: 'Rank-order EUR results. P10=low case, P50=best estimate, P90=high case for SEC reporting', icon: '📈' },
          ].map((s) => (
            <div key={s.step} className="border border-[#1e2a45] rounded-lg p-3">
              <div className="text-xl mb-1">{s.icon}</div>
              <div className="text-amber-400 font-medium">{s.step}</div>
              <div className="text-gray-400 mt-1">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
