'use client';
import { useEffect, useState } from 'react';

const DIST_FLOW = [
  { id: 'tank', label: 'Tank Farm', x: 20, width: 90 },
  { id: 'additive', label: 'Additive Injection', x: 155, width: 125 },
  { id: 'rack', label: 'Loading Rack', x: 330, width: 110 },
  { id: 'pipeline', label: 'Pipeline Delivery', x: 490, width: 125 },
  { id: 'marine', label: 'Marine Loading', x: 665, width: 110 },
  { id: 'customer', label: 'Customer Delivery', x: 825, width: 130 },
];

const LOADING_MODES = [
  {
    mode: 'Truck Loading (Rack)',
    icon: '🚛',
    steps: [
      'Driver presents at kiosk — scans BOL, PIN verification',
      'Bottom loading arm connection (safer, reduced VOC emissions)',
      'Vapor recovery system connects before product flow',
      'Additive injection — detergent (gasoline), lubricity improver (diesel)',
      'Mass flow meter measures product (API-certified)',
      'Bill of Lading auto-generated, electronic signature',
      'Truck departs — weight check at exit scale',
    ],
    kpis: ['Rack throughput (trucks/hr)', 'Average loading time (min)', 'Vapor recovery efficiency (%)', 'Bill of Lading accuracy (%)'],
  },
  {
    mode: 'Pipeline Delivery',
    icon: '🔧',
    steps: [
      'Batch scheduling — sequence products in mainline (gasoline → diesel → jet)',
      'Interface management — contamination zone identified, segregated',
      'Injection at origin terminal — measured and scheduled',
      'SCADA monitoring — flow rate, pressure at all station points',
      'Delivery to destination terminal — custody transfer metering',
      'Interface product re-processed or downgraded (off-spec zone)',
    ],
    kpis: ['Batch contamination volume (bbl)', 'On-time delivery rate (%)', 'Meter accuracy (%)', 'Pipeline utilization (%)'],
  },
  {
    mode: 'Marine Loading',
    icon: '🚢',
    steps: [
      'Vessel arrives — mooring, manifold connection',
      'Loading arm connection — vapor recovery system engaged',
      'Pre-loading ullage survey by surveyor',
      'API gravity and temperature verification of cargo',
      'Loading commences — mass flow and volume tracked real-time',
      'Post-loading shore quantity measured (mass + volume)',
      'Draft survey (independent surveyor) for B/L quantity',
      'Certificate of Quality + Bill of Lading issued',
    ],
    kpis: ['Marine loading rate (bbl/hr)', 'Laytime used (%)', 'Quantity dispute rate (%)', 'Vapor recovery rate (%)'],
  },
];

const AI_MODELS = [
  { model: 'Loading Scheduler', type: 'ML + LP', desc: 'Optimizes loading rack throughput, minimizes truck queue time; plans marine loading around tidal windows and vessel schedules', step: 'Rack / Marine' },
  { model: 'Contamination Predictor', type: 'ML', desc: 'Predicts interface contamination volume when switching between products in a pipeline (e.g. gasoline → diesel transition). Inputs: flow velocity, pipe diameter, batch order', step: 'Pipeline' },
  { model: 'Additive Dosing Optimizer', type: 'ML', desc: 'Adjusts additive injection rate based on product specification needs vs dosing cost. Considers base product quality to avoid over/under treatment', step: 'Additive Injection' },
  { model: 'Demand Forecaster (Distribution)', type: 'ML Time Series', desc: 'Forecasts product demand by grade and region (30-day horizon) from historical rack volumes, weather, economic indicators → drives tank farm scheduling', step: 'Tank Farm' },
];

export default function DistributionProcessPage() {
  const [activeMode, setActiveMode] = useState(0);
  const [activeTab, setActiveTab] = useState('loading');

  useEffect(() => {}, []);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded text-xs font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30">P-DS-04</span>
          <span className="text-gray-500 text-sm">Downstream / Distribution</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Product Distribution Process</h1>
        <p className="text-gray-400 text-sm mt-1">Tank farm → additive injection → loading rack → pipeline → marine loading → customer delivery</p>
      </div>

      {/* Flow SVG */}
      <div className="bg-[#0d1424] border border-[#1e2a45] rounded-xl p-6 overflow-x-auto">
        <svg width="1000" height="90" viewBox="0 0 1000 90" className="min-w-[960px]">
          {DIST_FLOW.slice(0, -1).map((node, i) => {
            const next = DIST_FLOW[i + 1];
            const x1 = node.x + node.width;
            const x2 = next.x;
            return (
              <g key={`c-${i}`}>
                <line x1={x1} y1="40" x2={x2} y2="40" stroke="#374151" strokeWidth="2" />
                <polygon points={`${x2},36 ${x2 - 8},32 ${x2 - 8},44`} fill="#374151" />
              </g>
            );
          })}
          {DIST_FLOW.map((node, i) => (
            <g key={node.id}>
              <rect x={node.x} y="15" width={node.width} height="50" rx="6"
                fill="#111827"
                stroke={i === 0 ? '#92400e' : i === 5 ? '#22c55e' : '#374151'}
                strokeWidth={i === 0 || i === 5 ? 2 : 1.5} />
              <text x={node.x + node.width / 2} y="40" textAnchor="middle" fill="white" fontSize="9" fontWeight="600">
                {node.label.length > 16 ? node.label.substring(0, 15) + '…' : node.label}
              </text>
            </g>
          ))}
          {/* Branch indicators */}
          <line x1="385" y1="65" x2="385" y2="82" stroke="#f59e0b" strokeWidth="1.5" />
          <text x="388" y="90" fill="#f59e0b" fontSize="7">Truck/Pipeline/Marine</text>
        </svg>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#1e2a45]">
        {[
          { id: 'loading', label: 'Loading Operations' },
          { id: 'ai', label: 'AI Models' },
          { id: 'kpis', label: 'KPIs' },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === t.id ? 'text-amber-400 border-b-2 border-amber-500' : 'text-gray-400 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Loading Operations */}
      {activeTab === 'loading' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {LOADING_MODES.map((m, i) => (
              <button key={m.mode} onClick={() => setActiveMode(i)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-2 ${activeMode === i ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'bg-[#1e2a45]/40 text-gray-400 border border-[#1e2a45] hover:text-white'}`}>
                <span>{m.icon}</span> {m.mode}
              </button>
            ))}
          </div>
          <div className="bg-[#0d1424] border border-[#1e2a45] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{LOADING_MODES[activeMode].icon}</span>
              <h3 className="text-white font-semibold">{LOADING_MODES[activeMode].mode}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-gray-400 text-xs font-semibold mb-3">PROCESS STEPS</div>
                <div className="space-y-2">
                  {LOADING_MODES[activeMode].steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                      <span className="text-gray-300 text-sm">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-xs font-semibold mb-3">KEY PERFORMANCE INDICATORS</div>
                <div className="space-y-2">
                  {LOADING_MODES[activeMode].kpis.map((kpi) => (
                    <div key={kpi} className="bg-[#0a0e1a] rounded-lg p-3 border border-[#1e2a45]">
                      <span className="text-amber-400 text-sm">📊 {kpi}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
                    <span className="px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400">{m.step}</span>
                  </div>
                  <div className="text-gray-400 text-sm">{m.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* KPIs */}
      {activeTab === 'kpis' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Loading Rack Utilization', value: '> 85%', context: 'trucks/day vs capacity' },
            { label: 'On-Time Delivery Rate', value: '> 98%', context: 'scheduled vs actual' },
            { label: 'Truck Queue Time', value: '< 20 min', context: 'average wait at rack' },
            { label: 'Contamination Volume', value: '< 0.5%', context: 'of batch volume' },
            { label: 'Vapor Recovery Efficiency', value: '> 95%', context: 'VOC capture rate' },
            { label: 'Bill of Lading Accuracy', value: '> 99.9%', context: 'volume accuracy' },
            { label: 'Marine Loading Rate', value: '5,000–30,000 bbl/hr', context: 'product-dependent' },
            { label: 'Additive Dosing Accuracy', value: '±2%', context: 'vs target dose' },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-[#0d1424] border border-[#1e2a45] rounded-xl p-4">
              <div className="text-gray-500 text-xs mb-1">{kpi.label}</div>
              <div className="text-amber-400 font-bold text-xl">{kpi.value}</div>
              <div className="text-gray-600 text-xs mt-1">{kpi.context}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
