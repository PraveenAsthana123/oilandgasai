'use client';

const STREAMS = [
  {
    name: 'Upstream',
    icon: '🛢️',
    color: 'border-blue-600',
    headerBg: 'bg-blue-900/40',
    description: 'Exploration & Production — wells, reservoirs, drilling',
    products: [
      { name: 'AI Reservoir Monitoring SaaS', price: '$25K-50K/asset/year', description: 'Real-time reservoir pressure, temperature, and production monitoring with ML anomaly detection' },
      { name: 'Seismic Interpretation Service', price: '$500K-2M/project', description: 'AI-accelerated seismic interpretation reducing cycle time from months to weeks' },
      { name: 'Production Optimization AI', price: '$15K-30K/well/year', description: 'Continuous optimization of well parameters — choke, pump settings, injection rates' },
      { name: 'Drilling Advisory AI', price: '$200K-800K/well', description: 'Real-time drilling parameter optimization, ROP improvement, formation evaluation' },
      { name: 'Well Integrity Monitoring', price: '$10K-20K/well/year', description: 'Continuous casing/tubing integrity monitoring, corrosion prediction, failure prevention' },
    ],
    customers: ['Suncor Energy', 'CNRL', 'Cenovus', 'Husky Energy', 'MEG Energy', 'Vermilion Energy'],
  },
  {
    name: 'Midstream',
    icon: '🔄',
    color: 'border-yellow-600',
    headerBg: 'bg-yellow-900/40',
    description: 'Transportation, Processing & Storage — pipelines, compressors, terminals',
    products: [
      { name: 'Pipeline Leak Detection AI', price: '$1M-4M/500km', description: 'Advanced acoustic and pressure-based leak detection with <1% false positive rate' },
      { name: 'Compressor Predictive Maintenance', price: '$20K-40K/compressor/year', description: 'Vibration analysis, thermal imaging integration, failure prediction 2-4 weeks in advance' },
      { name: 'SCADA AI Analytics', price: '$500K-1.5M/site', description: 'Layer AI analytics on existing SCADA, pattern recognition, optimization recommendations' },
      { name: 'Corrosion Monitoring Service', price: '$15K-30K/km/year', description: 'Smart pig data analysis, external corrosion monitoring, remaining life estimation' },
      { name: 'Pigging Optimization', price: '$100K-400K/year', description: 'Optimize pig scheduling based on product flow, contamination risk, regulatory requirements' },
    ],
    customers: ['TC Energy', 'Enbridge', 'Pembina Pipeline', 'Gibson Energy', 'Keyera Corp'],
  },
  {
    name: 'Downstream',
    icon: '🏭',
    color: 'border-purple-600',
    headerBg: 'bg-purple-900/40',
    description: 'Refining, Petrochemicals & Distribution — refineries, fractionators',
    products: [
      { name: 'Refinery Optimization AI', price: '$2M-8M/refinery', description: 'Multi-variable optimization across crude distillation, FCC, hydrotreater units' },
      { name: 'Crude Blending Optimizer', price: '$500K-2M/year', description: 'Real-time crude blend optimization maximizing distillate yield and meeting product specs' },
      { name: 'Product Quality Prediction', price: '$300K-1M/year', description: 'Predict product quality specifications in real-time, reduce lab sampling frequency 40%' },
      { name: 'Emission Monitoring AI', price: '$400K-1.5M/site', description: 'Continuous emission monitoring, regulatory compliance prediction, flare minimization' },
      { name: 'Flare Management AI', price: '$200K-800K/year', description: 'Minimize flaring through process optimization, root cause analysis, regulatory reporting' },
    ],
    customers: ['Imperial Oil', 'Shell Canada', 'Irving Oil', 'Federated Co-operatives'],
  },
];

export default function StreamsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Stream Product Catalog</h1>
        <p className="text-slate-400 text-sm mt-1">What we sell by O&G value chain stream</p>
      </div>

      {STREAMS.map(stream => (
        <div key={stream.name} className={`border rounded-lg overflow-hidden ${stream.color}`}>
          <div className={`px-4 py-3 flex items-center gap-3 ${stream.headerBg}`}>
            <span className="text-2xl">{stream.icon}</span>
            <div>
              <div className="font-bold text-white">{stream.name}</div>
              <div className="text-xs text-slate-300">{stream.description}</div>
            </div>
          </div>
          <div className="p-4 bg-[#0f1629]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {stream.products.map(p => (
                <div key={p.name} className="bg-[#0a0e1a] border border-[#1e2a45] rounded p-3">
                  <div className="font-medium text-white text-sm">{p.name}</div>
                  <div className="text-emerald-400 text-xs font-semibold mt-1">{p.price}</div>
                  <div className="text-slate-400 text-xs mt-1.5">{p.description}</div>
                </div>
              ))}
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Target Customers:</div>
              <div className="flex flex-wrap gap-2">
                {stream.customers.map(c => (
                  <span key={c} className="text-xs bg-[#1e2a45] text-slate-300 px-2 py-0.5 rounded">{c}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
