'use client';

const USE_CASES = [
  {
    title: 'Predictive Equipment Failure',
    stream: 'all',
    valueProps: ['30-40% reduction in unplanned downtime', '25% maintenance cost reduction', '18-month average ROI payback'],
    roi: '$2-8M annual savings per site',
    competitors: 'Generic IoT platforms lack O&G domain models',
    pitch: 'Your compressors generate 10,000 sensor readings/minute. We trained on 50M hours of O&G equipment data. We predict failures 2-4 weeks before they happen — not after.',
  },
  {
    title: 'Production Optimization',
    stream: 'upstream',
    valueProps: ['2-5% production uplift', 'Automated choke/pump optimization', 'Reduces operator intervention 60%'],
    roi: '$500K-3M per well pad annually',
    competitors: 'Manual tuning and rule-based systems miss multi-variable interactions',
    pitch: 'Each well has 50+ interacting variables. Our ML models find the optimal operating point 24/7/365 — no engineer can match that bandwidth.',
  },
  {
    title: 'Pipeline Leak Detection',
    stream: 'midstream',
    valueProps: ['<1% false positive rate', 'Detect leaks 10× faster than SCADA alarms', 'Regulatory compliance out-of-box'],
    roi: 'Avoid $50M+ environmental liability per incident',
    competitors: 'Legacy pressure-volume balance methods: 3-5% false positives, slow detection',
    pitch: 'A pipeline leak that goes undetected for 4 hours costs $50M in cleanup and regulatory fines. Our AI detects in under 15 minutes.',
  },
  {
    title: 'Refinery Optimization',
    stream: 'downstream',
    valueProps: ['1-3% yield improvement', '$0.30-1.00/bbl margin improvement', 'Energy cost reduction 8-12%'],
    roi: '$5-20M annually per refinery',
    competitors: 'Traditional APC systems require manual tuning, can\'t adapt to crude slate changes',
    pitch: 'Every crude slate change costs you 2-4 hours of manual re-tuning. Our AI adapts in real-time — processing 200+ quality variables simultaneously.',
  },
  {
    title: 'Safety & Compliance AI',
    stream: 'all',
    valueProps: ['40% reduction in safety incidents', 'Automated regulatory reporting', 'Real-time H2S/flare monitoring'],
    roi: 'Avoid $500K average incident cost × 40% = $200K/incident prevented',
    competitors: 'Manual inspection schedules miss developing hazards',
    pitch: 'Safety regulators don\'t accept "we didn\'t know." Our AI monitors every safety-critical parameter continuously and escalates anomalies before incidents occur.',
  },
  {
    title: 'Reservoir Characterization',
    stream: 'upstream',
    valueProps: ['10-30% improvement in reserve estimates', '50% faster seismic interpretation', 'Reduce dry hole probability 20%'],
    roi: 'One prevented dry hole = $5-50M saved',
    competitors: 'Traditional geophysical methods take 6-12 months per interpretation cycle',
    pitch: 'Your seismic data contains the answer. Our AI reads it in weeks, not months — with better accuracy than a 5-person interpretation team.',
  },
];

export default function UseCasesPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">AI Solution Use Cases for Sales</h1>
        <p className="text-slate-400 text-sm mt-1">How to position AI value propositions to O&G clients</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {USE_CASES.map(uc => (
          <div key={uc.title} className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="font-semibold text-white">{uc.title}</div>
              <span className="text-xs bg-blue-800 text-blue-300 px-2 py-0.5 rounded capitalize">{uc.stream}</span>
            </div>

            <div className="bg-[#0a0e1a] rounded p-3 border-l-2 border-emerald-500">
              <div className="text-xs text-slate-400 mb-1">Sales Pitch</div>
              <div className="text-sm text-slate-200 italic">"{uc.pitch}"</div>
            </div>

            <div>
              <div className="text-xs text-slate-400 mb-1">Value Propositions</div>
              <ul className="space-y-1">
                {uc.valueProps.map(v => (
                  <li key={v} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="text-emerald-400 mt-0.5">✓</span>
                    {v}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <div className="bg-emerald-900/30 rounded p-2">
                <div className="text-xs text-emerald-400 font-semibold">ROI Proof Point</div>
                <div className="text-xs text-slate-300 mt-0.5">{uc.roi}</div>
              </div>
              <div className="bg-[#1e2a45]/50 rounded p-2">
                <div className="text-xs text-blue-400 font-semibold">vs. Competitors</div>
                <div className="text-xs text-slate-400 mt-0.5">{uc.competitors}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
