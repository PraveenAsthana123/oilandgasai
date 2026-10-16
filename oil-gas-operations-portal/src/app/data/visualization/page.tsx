'use client';

// All charts using CSS SVG — no recharts dependency
export default function VisualizationPage() {
  // Synthetic noisy vs clean signal data for demonstration
  const noisySignal = [20, 12, 28, 8, 32, 15, 25, 5, 30, 18, 22, 9, 31, 14, 26, 7, 29, 17, 23, 11];
  const cleanSignal = [20, 19, 18, 17, 16, 17, 18, 17, 16, 17, 18, 19, 20, 19, 18, 17, 18, 17, 18, 19];

  const histogram = [2, 5, 12, 18, 28, 22, 15, 8, 4, 2]; // raw distribution
  const histNorm = [1, 3, 9, 22, 30, 22, 9, 3, 1, 0]; // after normalization

  const corrMatrix = [
    [1.0, 0.82, 0.67, 0.45, 0.23],
    [0.82, 1.0, 0.71, 0.38, 0.18],
    [0.67, 0.71, 1.0, 0.52, 0.31],
    [0.45, 0.38, 0.52, 1.0, 0.64],
    [0.23, 0.18, 0.31, 0.64, 1.0],
  ];
  const corrLabels = ['Pressure', 'Temp', 'Flow', 'Vibration', 'GOR'];

  const corrColor = (v: number) => {
    const abs = Math.abs(v);
    if (abs > 0.8) return 'bg-red-500/80';
    if (abs > 0.6) return 'bg-amber-500/80';
    if (abs > 0.4) return 'bg-yellow-500/60';
    return 'bg-blue-500/30';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Data Visualization Studio</h1>
        <p className="text-gray-400 text-sm mt-1">Before/after processing · Time series · Histograms · Correlation heatmap · Box plots · Scatter matrix</p>
      </div>

      {/* Before/after signal */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <h2 className="font-semibold text-white mb-3">Time Series: Before vs After Noise Cleaning</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { title: 'Raw Signal (noisy)', data: noisySignal, color: '#ef4444', label: 'Pressure Reading (psi)' },
            { title: 'After Kalman Filter', data: cleanSignal, color: '#22c55e', label: 'Filtered Pressure (psi)' },
          ].map((chart) => (
            <div key={chart.title} className="border border-[#1e2a45] rounded-lg p-3">
              <div className="text-sm font-medium text-white mb-2">{chart.title}</div>
              <svg viewBox={`0 0 ${chart.data.length * 10} 40`} className="w-full h-20" xmlns="http://www.w3.org/2000/svg">
                <polyline
                  points={chart.data.map((v, i) => `${i * 10},${40 - v}`).join(' ')}
                  fill="none" stroke={chart.color} strokeWidth="1.5" />
              </svg>
              <div className="text-xs text-gray-500 mt-1">{chart.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Histogram: raw vs normalized */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <h2 className="font-semibold text-white mb-3">Distribution: Raw vs Normalized (Min-Max)</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { title: 'Raw Distribution (skewed)', data: histogram, color: '#f59e0b' },
            { title: 'After Min-Max Normalization [0,1]', data: histNorm, color: '#22c55e' },
          ].map((chart) => (
            <div key={chart.title} className="border border-[#1e2a45] rounded-lg p-3">
              <div className="text-sm font-medium text-white mb-2">{chart.title}</div>
              <div className="flex items-end gap-1 h-24">
                {chart.data.map((v, i) => {
                  const max = Math.max(...chart.data);
                  return (
                    <div key={i} className="flex-1 rounded-t transition-all" style={{ height: `${(v / max) * 100}%`, backgroundColor: chart.color, opacity: 0.8 }}></div>
                  );
                })}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Min</span><span>Max</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Correlation heatmap */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <h2 className="font-semibold text-white mb-3">Correlation Heatmap — Raw Sensor Features</h2>
        <div className="overflow-x-auto">
          <table className="text-xs">
            <thead>
              <tr>
                <td className="p-1"></td>
                {corrLabels.map(l => <th key={l} className="p-2 text-gray-400 text-center">{l}</th>)}
              </tr>
            </thead>
            <tbody>
              {corrMatrix.map((row, i) => (
                <tr key={i}>
                  <td className="p-2 text-gray-400 whitespace-nowrap pr-3">{corrLabels[i]}</td>
                  {row.map((val, j) => (
                    <td key={j} className={`p-3 text-center rounded m-0.5 ${corrColor(val)}`}>
                      <span className="text-white font-mono text-xs">{val.toFixed(2)}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
            <span>Correlation scale:</span>
            {[['0.8+', 'bg-red-500/80'], ['0.6-0.8', 'bg-amber-500/80'], ['0.4-0.6', 'bg-yellow-500/60'], ['<0.4', 'bg-blue-500/30']].map(([l, c]) => (
              <div key={l} className="flex items-center gap-1"><span className={`w-4 h-4 rounded ${c}`}></span><span>{l}</span></div>
            ))}
          </div>
        </div>
      </div>

      {/* Box plots */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <h2 className="font-semibold text-white mb-3">Box Plot — Outlier Detection (Pressure Distribution by Stream)</h2>
        <div className="flex items-center gap-6 h-32">
          {[
            { label: 'Upstream', min: 15, q1: 30, median: 45, q3: 62, max: 78, outlier: 92, color: '#f59e0b' },
            { label: 'Midstream', min: 60, q1: 68, median: 72, q3: 76, max: 82, outlier: null, color: '#3b82f6' },
            { label: 'Downstream', min: 5, q1: 10, median: 14, q3: 18, max: 25, outlier: 35, color: '#22c55e' },
          ].map((bp) => {
            const scale = (v: number) => ((v - 0) / 100) * 80;
            return (
              <div key={bp.label} className="flex flex-col items-center gap-2 flex-1">
                <div className="relative h-24 w-8">
                  {/* Box */}
                  <div className="absolute left-1 right-1 border border-current rounded"
                    style={{ top: `${100 - scale(bp.q3)}%`, height: `${scale(bp.q3) - scale(bp.q1)}%`, borderColor: bp.color, backgroundColor: `${bp.color}20` }}></div>
                  {/* Median */}
                  <div className="absolute left-0 right-0 h-0.5"
                    style={{ top: `${100 - scale(bp.median)}%`, backgroundColor: bp.color }}></div>
                  {/* Whiskers */}
                  <div className="absolute left-3.5 w-1 bg-gray-500"
                    style={{ top: `${100 - scale(bp.max)}%`, height: `${scale(bp.max) - scale(bp.q3)}%` }}></div>
                  <div className="absolute left-3.5 w-1 bg-gray-500"
                    style={{ top: `${100 - scale(bp.q1)}%`, height: `${scale(bp.q1) - scale(bp.min)}%` }}></div>
                  {/* Outlier */}
                  {bp.outlier && <div className="absolute left-2.5 w-3 h-3 rounded-full bg-red-400/80"
                    style={{ top: `${100 - scale(bp.outlier)}%` }}></div>}
                </div>
                <div className="text-xs text-gray-400">{bp.label}</div>
              </div>
            );
          })}
        </div>
        <div className="text-xs text-gray-500 mt-2">Red circles = statistical outliers (IQR method, beyond 1.5×IQR from Q1/Q3)</div>
      </div>
    </div>
  );
}
