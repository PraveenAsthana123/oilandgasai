'use client';
export default function NormalizationPage() {
  const methods = [
    { name: 'Min-Max Scaling', formula: 'x′ = (x - x_min)/(x_max - x_min)', range: '[0, 1]', when: 'Bounded sensor ranges, neural network inputs, when bounds are known', warning: 'Sensitive to outliers — use after outlier removal' },
    { name: 'Z-Score (Standardization)', formula: 'x′ = (x - μ) / σ', range: 'N(0,1)', when: 'Unknown distribution, SVM, linear models, PCA input features', warning: 'Assumes approximate normality' },
    { name: 'Robust Scaling', formula: 'x′ = (x - Q50) / (Q75 - Q25)', range: 'Centered on median', when: 'Sensor data with outliers that cannot be removed (process anomalies)', warning: 'May compress valid extreme values' },
    { name: 'Unit Conversion', formula: 'x′ = x × conversion_factor', range: 'SI or field units', when: 'Mixing psi/bar, degC/degF, m/ft across datasets from different systems', warning: 'Must track unit system per feature carefully' },
  ];

  const sensorNorms = [
    { sensor: 'Wellhead Pressure', raw_unit: 'psi', raw_range: '0-8000', method: 'Min-Max + Z-score', norm_unit: '[0,1] then N(0,1)', reason: 'Input to LSTM + XGBoost (different models, different needs)' },
    { sensor: 'Temperature', raw_unit: '°F', raw_range: '50-600', method: 'Min-Max', norm_unit: '[0,1]', reason: 'Bounded range known, NN input' },
    { sensor: 'Vibration RMS', raw_unit: 'mm/s', raw_range: '0-50', method: 'Robust Scaling', norm_unit: 'IQR-centered', reason: 'Contains operational outliers (startup spikes)' },
    { sensor: 'Flow Rate', raw_unit: 'BOE/d or MMscf/d', raw_range: 'Variable', method: 'Unit conv + Min-Max', norm_unit: '[0,1] in SI', reason: 'Multi-stream data with different units' },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Normalization & Standardization</h1>
        <p className="text-gray-400 text-sm mt-1">Min-max · Z-score · Robust scaling · Unit conversion — by sensor type</p></div>
      <div className="grid grid-cols-2 gap-4">
        {methods.map((m) => (
          <div key={m.name} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <div className="font-medium text-white text-sm mb-2">{m.name}</div>
            <div className="font-mono text-blue-400 text-xs bg-[#0a0e1a] p-2 rounded mb-2">{m.formula}</div>
            <div className="text-xs space-y-1">
              <div><span className="text-gray-500">Output range:</span> <span className="text-amber-400">{m.range}</span></div>
              <div><span className="text-gray-500">Use when:</span> <span className="text-gray-300">{m.when}</span></div>
              <div className="text-amber-400/70">⚠ {m.warning}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <h2 className="font-semibold text-white mb-3">Normalization Method by Sensor Type</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-400 border-b border-[#1e2a45]">
                {['Sensor', 'Raw Unit', 'Raw Range', 'Method', 'Normalized Output', 'Reason'].map(h => (
                  <th key={h} className="text-left py-2 px-2 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sensorNorms.map((s) => (
                <tr key={s.sensor} className="border-b border-[#1e2a45]/50">
                  <td className="py-2 px-2 text-white">{s.sensor}</td>
                  <td className="py-2 px-2 text-amber-400/80 font-mono">{s.raw_unit}</td>
                  <td className="py-2 px-2 text-gray-400">{s.raw_range}</td>
                  <td className="py-2 px-2 text-blue-400">{s.method}</td>
                  <td className="py-2 px-2 text-green-400 font-mono">{s.norm_unit}</td>
                  <td className="py-2 px-2 text-gray-500">{s.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
