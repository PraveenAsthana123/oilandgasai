'use client';
export default function FeatureEngineeringPage() {
  const features = [
    { group: 'Rolling Statistics', features: [
      { name: 'rolling_mean_5m', formula: 'mean(x[t-5:t])', domain: 'All sensors', purpose: 'Smooth short-term fluctuations' },
      { name: 'rolling_std_15m', formula: 'std(x[t-15:t])', domain: 'Vibration, pressure', purpose: 'Detect increasing variability — wear indicator' },
      { name: 'rolling_min_max_ratio', formula: 'min/max over window', domain: 'Temperature', purpose: 'Detect thermal cycling patterns' },
    ]},
    { group: 'Lag Features', features: [
      { name: 'lag_1h', formula: 'x[t-60]', domain: 'Production rates', purpose: 'Auto-regressive input for LSTM' },
      { name: 'lag_24h', formula: 'x[t-1440]', domain: 'All time series', purpose: 'Capture daily periodicity' },
      { name: 'delta_lag', formula: 'x[t] - x[t-k]', domain: 'Pressure, flow', purpose: 'Rate-of-change feature for trend detection' },
    ]},
    { group: 'Spectral Features', features: [
      { name: 'fft_dominant_freq', formula: 'argmax(|FFT(x)|)', domain: 'Vibration', purpose: 'Dominant fault frequency identification' },
      { name: 'spectral_energy_band', formula: 'Σ|FFT(x)|² in [f1,f2]', domain: 'Vibration, seismic', purpose: 'Energy in bearing defect frequency bands' },
      { name: 'kurtosis_spectral', formula: 'E[X⁴]/E[X²]²', domain: 'Vibration', purpose: 'Impulsiveness — early bearing fault indicator' },
    ]},
    { group: 'Domain-Derived KPIs', features: [
      { name: 'gor', formula: 'gas_rate / oil_rate', domain: 'Production', purpose: 'Gas-oil ratio — reservoir behavior indicator' },
      { name: 'water_cut', formula: 'water_rate / (oil+water)', domain: 'Production', purpose: 'Aquifer influx, lift efficiency' },
      { name: 'compression_ratio', formula: 'P_discharge / P_suction', domain: 'Compression', purpose: 'Compressor operating point efficiency' },
      { name: 'pipeline_delta_p_per_km', formula: 'ΔP / length', domain: 'Pipeline', purpose: 'Hydraulic friction factor, fouling indicator' },
    ]},
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Feature Engineering</h1>
        <p className="text-gray-400 text-sm mt-1">Rolling stats · Lag features · Spectral features · Domain KPIs</p></div>
      {features.map((g) => (
        <div key={g.group} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          <h2 className="font-semibold text-white mb-3">⚒️ {g.group}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-400 border-b border-[#1e2a45]">
                  {['Feature Name', 'Formula', 'Domain', 'ML Purpose'].map(h => (
                    <th key={h} className="text-left py-2 px-2 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {g.features.map((f) => (
                  <tr key={f.name} className="border-b border-[#1e2a45]/50">
                    <td className="py-2 px-2 font-mono text-amber-400">{f.name}</td>
                    <td className="py-2 px-2 font-mono text-blue-400/80 text-xs">{f.formula}</td>
                    <td className="py-2 px-2 text-gray-400">{f.domain}</td>
                    <td className="py-2 px-2 text-gray-300">{f.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
