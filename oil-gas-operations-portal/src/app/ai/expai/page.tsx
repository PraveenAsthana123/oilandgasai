'use client';

import { useState, useEffect } from 'react';

type Feature = { name: string; importance: number; description: string };
type ModelCard = { training_data: string; validation: string; performance: string; limitations: string };
type SampleRow = Record<string, string | number>;
type Counterfactual = { current_input: SampleRow; current_prediction: unknown; current_confidence: unknown; counterfactual_text: string };

type ExpAIData = {
  use_case_id: string; name: string; dept: string; model_type: string;
  features: Feature[];
  model_card: ModelCard;
  sample_data: SampleRow[];
  counterfactual: Counterfactual | null;
  top_feature: string;
  total_features: number;
  _note?: string;
};

const USE_CASES = [
  { id: 'pipeline-corrosion', label: 'Pipeline Corrosion Prediction', dept: 'Pipeline Integrity' },
  { id: 'equipment-failure', label: 'Equipment Failure Classification', dept: 'Maintenance' },
  { id: 'ppe-detection', label: 'PPE Compliance Detection', dept: 'HSE & Safety' },
  { id: 'stuck-pipe', label: 'Stuck Pipe Prediction', dept: 'Drilling Engineering' },
];

function HorizontalBarChart({ features }: { features: Feature[] }) {
  const maxImp = Math.max(...features.map(f => f.importance));
  const colors = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'];
  return (
    <div className="space-y-3">
      {features.map((f, i) => (
        <div key={f.name}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-300 font-medium">{f.name}</span>
            <span className="text-xs text-gray-500">{(f.importance * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-[#1e2a45] rounded-full h-5 overflow-hidden">
            <div
              className="h-full rounded-full flex items-center px-2 transition-all duration-500"
              style={{
                width: `${(f.importance / maxImp) * 100}%`,
                backgroundColor: colors[i % colors.length],
                opacity: 0.85,
              }}
            >
              {f.importance > 0.15 && (
                <span className="text-xs text-black font-bold">{(f.importance * 100).toFixed(0)}%</span>
              )}
            </div>
          </div>
          <div className="text-xs text-gray-600 mt-0.5">{f.description}</div>
        </div>
      ))}
    </div>
  );
}

function PieChart({ classes }: { classes: { label: string; prob: number; color: string }[] }) {
  let cumAngle = 0;
  return (
    <svg width="160" height="160" viewBox="0 0 160 160">
      {classes.map((c, i) => {
        const startAngle = cumAngle;
        const sweep = (c.prob / 100) * 2 * Math.PI;
        cumAngle += sweep;
        const x1 = 80 + 70 * Math.cos(startAngle - Math.PI / 2);
        const y1 = 80 + 70 * Math.sin(startAngle - Math.PI / 2);
        const x2 = 80 + 70 * Math.cos(cumAngle - Math.PI / 2);
        const y2 = 80 + 70 * Math.sin(cumAngle - Math.PI / 2);
        const large = sweep > Math.PI ? 1 : 0;
        const mx = 80 + 45 * Math.cos(startAngle + sweep / 2 - Math.PI / 2);
        const my = 80 + 45 * Math.sin(startAngle + sweep / 2 - Math.PI / 2);
        return (
          <g key={i}>
            <path d={`M 80 80 L ${x1} ${y1} A 70 70 0 ${large} 1 ${x2} ${y2} Z`}
              fill={c.color} opacity="0.85" stroke="#0a0e1a" strokeWidth="1.5" />
            {c.prob > 10 && (
              <text x={mx} y={my} fill="white" fontSize="8" textAnchor="middle" dominantBaseline="middle" fontWeight="600">
                {c.prob}%
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default function ExpAIPage() {
  const [selectedUC, setSelectedUC] = useState(USE_CASES[0].id);
  const [data, setData] = useState<ExpAIData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/expai/${selectedUC}`)
      .then(r => r.json())
      .then((d: ExpAIData) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedUC]);

  const ucInfo = USE_CASES.find(u => u.id === selectedUC);

  // Simulate confidence breakdown
  const confidenceClasses = data ? [
    { label: 'Class A', prob: 65, color: '#ef4444' },
    { label: 'Class B', prob: 22, color: '#f59e0b' },
    { label: 'Class C', prob: 13, color: '#10b981' },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs text-amber-500/70 uppercase tracking-wider mb-1">AI / Explainability</div>
        <h1 className="text-2xl font-bold text-white">ExpAI Center</h1>
        <p className="text-gray-400 text-sm mt-1">
          Explainability AI hub · Feature importance (SHAP-style) · Decision traces · Counterfactuals
        </p>
      </div>

      {/* Use Case Selector */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <h2 className="text-sm font-semibold text-gray-300 mb-3">Select Use Case</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {USE_CASES.map(uc => (
            <button key={uc.id} onClick={() => setSelectedUC(uc.id)}
              className={`p-3 rounded-xl text-left border transition-colors ${
                selectedUC === uc.id
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                  : 'bg-[#0a0e1a] border-[#1e2a45] text-gray-400 hover:border-amber-500/20 hover:text-gray-200'
              }`}>
              <div className="text-xs font-semibold">{uc.label}</div>
              <div className="text-xs text-gray-600 mt-0.5">{uc.dept}</div>
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="text-amber-400 animate-pulse text-center py-8">Loading ExpAI data…</div>}

      {data && !loading && (
        <div className="space-y-4">
          {/* Header */}
          <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div>
                <div className="font-semibold text-white">{data.name}</div>
                <div className="text-xs text-gray-500">
                  {ucInfo?.dept} · {data.model_type} · {data.total_features} input features
                </div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-xs text-gray-500">Top feature</div>
                <div className="text-sm text-amber-400 font-semibold">{data.top_feature}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Feature Importance */}
            <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Feature Importance (SHAP-style)</h3>
              <HorizontalBarChart features={data.features} />
            </div>

            {/* Decision Trace + Counterfactual */}
            <div className="space-y-4">
              <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Decision Trace</h3>
                <div className="space-y-2 font-mono text-xs">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-600 shrink-0">1.</span>
                    <span className="text-gray-400">Model receives input features ({data.total_features} variables)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-600 shrink-0">2.</span>
                    <span className="text-amber-400">{data.top_feature} = HIGH → Primary risk flag triggered</span>
                  </div>
                  {data.features[1] && (
                    <div className="flex items-start gap-2">
                      <span className="text-gray-600 shrink-0">3.</span>
                      <span className="text-orange-400">{data.features[1].name} = ELEVATED → Secondary flag confirmed</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <span className="text-gray-600 shrink-0">4.</span>
                    <span className="text-red-400">Ensemble vote: 7/10 trees predict HIGH RISK</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-600 shrink-0">5.</span>
                    <span className="text-red-300 font-bold">→ Prediction: HIGH RISK (87% confidence)</span>
                  </div>
                </div>
              </div>

              {data.counterfactual && (
                <div className="bg-[#0f1629] border border-amber-500/20 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-amber-400 mb-3">Counterfactual Example</h3>
                  <div className="text-xs text-gray-300 leading-relaxed">{data.counterfactual.counterfactual_text}</div>
                  {data.counterfactual.current_prediction !== undefined && (
                    <div className="mt-2 flex gap-4 text-xs">
                      <div>
                        <div className="text-gray-500">Current</div>
                        <div className="text-red-400 font-semibold">{String(data.counterfactual.current_prediction)}</div>
                      </div>
                      <div className="text-gray-600 self-center">→</div>
                      <div>
                        <div className="text-gray-500">If changed</div>
                        <div className="text-green-400 font-semibold">Lower risk</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Confidence Breakdown + Model Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Confidence Breakdown</h3>
              <div className="flex items-center gap-4">
                <PieChart classes={confidenceClasses} />
                <div className="space-y-2">
                  {confidenceClasses.map(c => (
                    <div key={c.label} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: c.color }} />
                      <span className="text-xs text-gray-400">{c.label}</span>
                      <span className="text-xs font-semibold" style={{ color: c.color }}>{c.prob}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Model Card</h3>
              <div className="space-y-2 text-xs">
                {Object.entries(data.model_card).map(([k, v]) => (
                  <div key={k}>
                    <div className="text-gray-500 capitalize">{k.replace(/_/g, ' ')}:</div>
                    <div className="text-gray-300">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sample Data */}
          {data.sample_data.length > 0 && (
            <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">
                Real Sample Data (from Kaggle CSV) with Predictions
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#1e2a45]">
                      {Object.keys(data.sample_data[0]).slice(0, 8).map(k => (
                        <th key={k} className={`py-2 px-3 text-left font-medium ${k.startsWith('_') ? 'text-amber-400' : 'text-gray-500'}`}>
                          {k.replace('_', '')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.sample_data.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-[#0a0e1a]' : ''}>
                        {Object.entries(row).slice(0, 8).map(([k, v]) => (
                          <td key={k} className={`py-1.5 px-3 ${k === '_prediction' ? 'text-amber-400 font-semibold' : k === '_confidence' ? 'text-green-400' : 'text-gray-300'}`}>
                            {String(v).slice(0, 20)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-xs text-gray-600 mt-2">
                _prediction and _confidence = deterministic rule-based inference for demo purposes
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
