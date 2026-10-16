'use client';
const steps = [
  {
    step: 1, name: 'Raw Sensor Data', icon: '📡', color: 'bg-red-500/20 border-red-500/40',
    input: 'SCADA tags, IoT sensors, lab data, seismic gathers',
    transform: 'None — raw acquisition',
    output: 'Raw time-series, images, text documents',
    quality: 42, issues: ['Missing values 8%', 'Outliers 3.2%', 'Duplicate records 1.1%', 'Unit inconsistency']
  },
  {
    step: 2, name: 'Noise Cleaning', icon: '🌊', color: 'bg-amber-500/20 border-amber-500/40',
    input: 'Raw sensor readings with noise, spikes, dropouts',
    transform: 'Kalman filter, median filter, wavelet denoising, DL denoising',
    output: 'Cleaned time series, enhanced images',
    quality: 72, issues: ['Residual artifacts 0.8%', 'Edge effects at boundaries']
  },
  {
    step: 3, name: 'Outlier Removal', icon: '🔍', color: 'bg-yellow-500/20 border-yellow-500/40',
    input: 'Cleaned signal with outlier events',
    transform: 'IQR method, Z-score, Isolation Forest, domain rules',
    output: 'Outlier-free dataset with flags for removed points',
    quality: 85, issues: ['Valid extremes may be removed — review flagged pts']
  },
  {
    step: 4, name: 'Feature Engineering', icon: '⚒️', color: 'bg-blue-500/20 border-blue-500/40',
    input: 'Clean time series, process variables, domain data',
    transform: 'Rolling stats (mean/std/min/max), lag features, FFT spectral, domain-derived (GOR, WCT, etc.)',
    output: 'Enriched feature matrix with 100+ engineered features',
    quality: 91, issues: ['Correlated features require dimensionality reduction']
  },
  {
    step: 5, name: 'Normalization / Scaling', icon: '⚖️', color: 'bg-purple-500/20 border-purple-500/40',
    input: 'Multi-scale feature matrix (psi, degF, bbl/d, Hz all mixed)',
    transform: 'Min-max scaling, Z-score normalization, Robust scaling (IQR), Unit conversion',
    output: 'Normalized feature matrix in [0,1] or N(0,1)',
    quality: 97, issues: ['Test set normalized with train-set statistics only']
  },
  {
    step: 6, name: 'ML-Ready Dataset', icon: '🧠', color: 'bg-green-500/20 border-green-500/40',
    input: 'Normalized, labeled feature matrix',
    transform: 'Train/val/test split, class balancing (SMOTE if needed), feature selection',
    output: 'ML-ready train/val/test tensors, feature importance ranking',
    quality: 99, issues: ['Temporal leakage prevented by time-based splitting']
  },
];

export default function DataPipelinePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Data Pipeline</h1>
        <p className="text-gray-400 text-sm mt-1">Raw Sensor Data → Noise Cleaning → Outlier Removal → Feature Engineering → Normalization → ML-Ready Dataset</p>
      </div>

      {/* Pipeline flow */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {steps.map((s, i) => (
          <div key={s.step} className="flex items-center gap-2 flex-shrink-0">
            <div className={`border rounded-lg px-3 py-2 text-xs text-center min-w-[90px] ${s.color}`}>
              <div className="text-lg mb-1">{s.icon}</div>
              <div className="text-white font-medium">{s.name}</div>
              <div className="text-green-400 text-xs mt-1">{s.quality}% quality</div>
            </div>
            {i < steps.length - 1 && <div className="text-amber-400 text-lg">›</div>}
          </div>
        ))}
      </div>

      {/* Step details */}
      {steps.map((s) => (
        <div key={s.step} className={`rounded-xl p-4 border ${s.color}`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">{s.icon}</span>
            <span className="font-semibold text-white">Step {s.step}: {s.name}</span>
            <div className="ml-auto flex items-center gap-2">
              <div className="text-xs text-gray-400">Data Quality:</div>
              <div className="h-2 w-24 bg-[#1e2a45] rounded-full">
                <div className={`h-full rounded-full ${s.quality >= 90 ? 'bg-green-500' : s.quality >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${s.quality}%` }}></div>
              </div>
              <div className={`text-xs font-mono ${s.quality >= 90 ? 'text-green-400' : s.quality >= 70 ? 'text-amber-400' : 'text-red-400'}`}>{s.quality}%</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div><div className="text-gray-500 mb-1">Input</div><div className="text-gray-300">{s.input}</div></div>
            <div><div className="text-gray-500 mb-1">Transformation</div><div className="text-amber-400/80">{s.transform}</div></div>
            <div><div className="text-gray-500 mb-1">Output</div><div className="text-green-400/80">{s.output}</div></div>
          </div>
          {s.issues.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {s.issues.map((issue, i) => (
                <span key={i} className="text-xs text-amber-400/60 bg-amber-500/10 px-2 py-0.5 rounded">⚠ {issue}</span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
