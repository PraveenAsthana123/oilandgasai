'use client';

const techniques = [
  {
    dataType: 'Seismic Data',
    icon: '🌊',
    methods: [
      { name: 'Band-pass Filtering', freq: '10-80 Hz', desc: 'Remove low-freq ground roll and high-freq ambient noise', perf: 'SNR +8 dB' },
      { name: 'f-k Filtering', freq: 'Wavenumber domain', desc: 'Remove coherent noise with known dip/velocity', perf: 'Coherent noise -95%' },
      { name: 'DL Denoising (U-Net)', freq: 'Learned frequency', desc: 'Supervised learning from noise-free synthetic data', perf: 'PSNR 28+ dB' },
      { name: 'Wavelet Denoising', freq: 'Multi-scale', desc: 'Thresholding in wavelet domain (Daubechies 4)', perf: 'Adaptive, non-linear' },
    ]
  },
  {
    dataType: 'Vibration Signals',
    icon: '📳',
    methods: [
      { name: 'FFT Filtering', freq: '0-5000 Hz', desc: 'Remove frequency bands unrelated to fault signatures', perf: 'Bearing fault SNR +15 dB' },
      { name: 'Wavelet Transform', freq: 'Multi-resolution', desc: 'Time-frequency representation, transient detection', perf: 'Impact isolation' },
      { name: 'EEMD', freq: 'Adaptive IMFs', desc: 'Ensemble Empirical Mode Decomposition for non-linear signals', perf: 'Mode mixing eliminated' },
      { name: 'Envelope Analysis', freq: 'High freq demod', desc: 'Hilbert transform, detect bearing defect frequencies', perf: 'BPFO/BPFI detection' },
    ]
  },
  {
    dataType: 'IoT / Sensor Signals',
    icon: '📡',
    methods: [
      { name: 'Kalman Filter', freq: 'State-space', desc: 'Optimal linear filter for Gaussian noise, temperature/pressure', perf: 'RMSE -60% vs raw' },
      { name: 'Median Filter', freq: 'Time domain', desc: 'Remove impulse/spike noise, preserves edge features', perf: 'Spike suppression' },
      { name: 'LOESS Smoothing', freq: 'Adaptive window', desc: 'Locally weighted regression, non-parametric smoothing', perf: 'Trend preservation' },
      { name: 'Butterworth Low-pass', freq: 'Cutoff: 0.1 Hz', desc: 'Slow process variables, remove electrical interference', perf: 'Flat passband' },
    ]
  },
  {
    dataType: 'Inspection Images',
    icon: '📸',
    methods: [
      { name: 'Gaussian Blur', freq: 'Spatial', desc: 'Reduce high-frequency Gaussian image noise', perf: 'σ=1.5 typical' },
      { name: 'Median Filter', freq: 'Spatial', desc: 'Remove salt-and-pepper noise, preserve edges', perf: '3×3 to 7×7 kernel' },
      { name: 'Bilateral Filter', freq: 'Edge-preserving', desc: 'Smooth while preserving corrosion/defect edges', perf: 'Edge contrast preserved' },
      { name: 'DnCNN Denoiser', freq: 'Learned spatial', desc: 'Residual CNN trained on oil/gas inspection images', perf: 'SSIM >0.95' },
    ]
  },
];

export default function NoiseCleaningPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Signal Noise Cleaning</h1>
        <p className="text-gray-400 text-sm mt-1">Seismic denoising · Sensor signal filtering · Vibration noise removal · Image denoising</p>
      </div>

      {techniques.map((group) => (
        <div key={group.dataType} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
            <span>{group.icon}</span>
            {group.dataType}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {group.methods.map((m) => (
              <div key={m.name} className="border border-[#1e2a45] rounded-lg p-3 text-xs">
                <div className="flex items-start justify-between mb-1">
                  <div className="font-medium text-amber-400">{m.name}</div>
                  <div className="text-green-400 font-mono text-xs ml-2 whitespace-nowrap">{m.perf}</div>
                </div>
                <div className="text-blue-400/70 mb-1">Freq: {m.freq}</div>
                <div className="text-gray-400">{m.desc}</div>
              </div>
            ))}
          </div>

          {/* CSS SVG before/after signal visualization */}
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="border border-[#1e2a45] rounded-lg p-3">
              <div className="text-xs text-red-400 mb-2">Before Denoising (noisy signal)</div>
              <svg viewBox="0 0 200 40" className="w-full h-12" xmlns="http://www.w3.org/2000/svg">
                <polyline points="0,20 5,12 10,28 15,8 20,32 25,15 30,25 35,5 40,30 45,18 50,22 55,9 60,31 65,14 70,26 75,7 80,29 85,17 90,23 95,11 100,27 105,16 110,24 115,6 120,32 125,19 130,21 135,10 140,30 145,20 150,22 155,8 160,28 165,15 170,25 175,12 180,20 185,18 190,22 195,16 200,20"
                  fill="none" stroke="#ef4444" strokeWidth="1.5" />
              </svg>
            </div>
            <div className="border border-[#1e2a45] rounded-lg p-3">
              <div className="text-xs text-green-400 mb-2">After Denoising (clean signal)</div>
              <svg viewBox="0 0 200 40" className="w-full h-12" xmlns="http://www.w3.org/2000/svg">
                <polyline points="0,20 10,18 20,16 30,14 40,15 50,17 60,19 70,18 80,16 90,15 100,17 110,19 120,20 130,18 140,17 150,19 160,20 170,18 180,16 190,17 200,19"
                  fill="none" stroke="#22c55e" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
