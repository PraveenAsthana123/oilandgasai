'use client';

import { useState } from 'react';

const TABS = ['Data Provenance', 'Bias Audit', 'Privacy Controls', 'Fairness Metrics', 'Model Risk Rating', 'Incident Log', 'Approved Models'];

const MODELS = [
  {
    id: 'm1', name: 'Pipeline Corrosion Prediction', dept: 'Pipeline Integrity',
    training_data: 'Kaggle: market_pipe_thickness_loss_dataset.csv',
    source: 'Synthetic lab/field data',
    transformations: ['Normalization', 'Outlier removal (IQR)', 'Feature engineering: corrosion_rate from Δthickness/Δtime'],
    privacy: 'No PII — operational measurements only',
    retention: '7 years (PHMSA regulatory)',
    risk: 'medium',
    is_safety_critical: false,
    is_autonomous: false,
    blast_radius: 'Asset inspection delay — recoverable with manual inspection',
    approval_status: 'pending',
    bias_groups: [
      { group: 'Material: Carbon Steel', accuracy: 0.89, f1: 0.87 },
      { group: 'Material: Stainless Steel', accuracy: 0.84, f1: 0.82 },
      { group: 'Material: Cast Iron', accuracy: 0.78, f1: 0.75 },
    ],
  },
  {
    id: 'm2', name: 'Equipment Failure Classification', dept: 'Maintenance',
    training_data: 'Kaggle: AI4I predictive_maintenance.csv',
    source: 'Synthetic manufacturing sensor data',
    transformations: ['SMOTE oversampling (imbalanced classes)', 'Standardization', 'Label encoding'],
    privacy: 'No PII — machine sensor readings only',
    retention: '5 years (maintenance records retention policy)',
    risk: 'medium',
    is_safety_critical: false,
    is_autonomous: false,
    blast_radius: 'Missed maintenance window — potential unplanned downtime',
    approval_status: 'pending',
    bias_groups: [
      { group: 'Product Type H (High quality)', accuracy: 0.92, f1: 0.91 },
      { group: 'Product Type M (Medium quality)', accuracy: 0.87, f1: 0.85 },
      { group: 'Product Type L (Low quality)', accuracy: 0.81, f1: 0.79 },
    ],
  },
  {
    id: 'm3', name: 'PPE Compliance Detection', dept: 'HSE & Safety',
    training_data: 'Kaggle: PPE detection + construction images',
    source: 'Labeled workplace safety images',
    transformations: ['Augmentation (flip/rotate/brightness)', 'Bounding box normalization', 'Worker anonymization (face blur)'],
    privacy: 'Images anonymized — faces blurred before processing; consent framework in place for CCTV use',
    retention: '30 days rolling (CCTV policy)',
    risk: 'high',
    is_safety_critical: true,
    is_autonomous: false,
    blast_radius: 'Missed PPE non-compliance → regulatory violation, injury risk',
    approval_status: 'pending',
    bias_groups: [
      { group: 'Daytime (high lighting)', accuracy: 0.91, f1: 0.89 },
      { group: 'Dusk/Dawn (low lighting)', accuracy: 0.74, f1: 0.71 },
      { group: 'Night shift (artificial lighting)', accuracy: 0.68, f1: 0.65 },
    ],
  },
  {
    id: 'm4', name: 'Stuck Pipe Prediction', dept: 'Drilling Engineering',
    training_data: 'Internal well drilling database (50+ wells)',
    source: 'WITSML 1.4.1 drilling parameter feeds',
    transformations: ['Time-series resampling to 1Hz', 'LSTM sequence windows (60s)', 'Z-score normalization per well'],
    privacy: 'No PII — well engineering data; operational IP classification required',
    retention: '10 years (well records regulatory requirement)',
    risk: 'high',
    is_safety_critical: true,
    is_autonomous: false,
    blast_radius: 'False negative = missed stuck pipe → $500K/day NPT, potential well control incident',
    approval_status: 'pending',
    bias_groups: [
      { group: 'Vertical wells', accuracy: 0.91, f1: 0.89 },
      { group: 'Directional (30-60° deviation)', accuracy: 0.85, f1: 0.83 },
      { group: 'Horizontal/Extended Reach', accuracy: 0.78, f1: 0.76 },
    ],
  },
];

const RISK_COLORS: Record<string, string> = {
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  critical: 'bg-red-700/30 text-red-300 border-red-500/30',
};

export default function ResAIPage() {
  const [tab, setTab] = useState('Data Provenance');
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);

  const model = MODELS.find(m => m.id === selectedModel) ?? MODELS[0];

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs text-amber-500/70 uppercase tracking-wider mb-1">AI / Responsible AI</div>
        <h1 className="text-2xl font-bold text-white">ResAI Center</h1>
        <p className="text-gray-400 text-sm mt-1">
          Responsible AI governance · Data provenance · Bias audit · Privacy controls · Model risk
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-[#1e2a45] pb-2">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              tab === t
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#1e2a45]'
            }`}>{t}</button>
        ))}
      </div>

      {/* Model selector (shown for most tabs) */}
      {!['Incident Log', 'Approved Models'].includes(tab) && (
        <div className="flex gap-2 flex-wrap">
          {MODELS.map(m => (
            <button key={m.id} onClick={() => setSelectedModel(m.id)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                selectedModel === m.id
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-[#1e2a45] text-gray-400 hover:text-gray-200'
              }`}>{m.name.split(' ').slice(0, 2).join(' ')}</button>
          ))}
        </div>
      )}

      {/* DATA PROVENANCE */}
      {tab === 'Data Provenance' && (
        <div className="space-y-4">
          <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-1">{model.name}</h3>
            <div className="text-xs text-amber-400 mb-4">{model.dept}</div>
            <div className="flex items-center gap-2 flex-wrap text-sm mb-4">
              <div className="bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg border border-blue-500/20">
                Raw Source: {model.source}
              </div>
              <span className="text-gray-600">→</span>
              <div className="bg-purple-500/20 text-purple-400 px-3 py-1.5 rounded-lg border border-purple-500/20">
                Transformations
              </div>
              <span className="text-gray-600">→</span>
              <div className="bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg border border-green-500/20">
                Training Dataset
              </div>
              <span className="text-gray-600">→</span>
              <div className="bg-amber-500/20 text-amber-400 px-3 py-1.5 rounded-lg border border-amber-500/20">
                Deployed Model
              </div>
            </div>
            <div className="mb-3">
              <div className="text-xs text-gray-500 mb-1">Training Data:</div>
              <div className="text-sm text-gray-300">{model.training_data}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-2">Transformations Applied:</div>
              <div className="space-y-1">
                {model.transformations.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="text-amber-400">{i + 1}.</span>
                    <span className="text-gray-300">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BIAS AUDIT */}
      {tab === 'Bias Audit' && (
        <div className="space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-amber-400 text-xs">
            Bias audit checks whether model performance is consistent across operational groups.
            Significant accuracy gaps between groups indicate potential model bias requiring remediation.
          </div>
          <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-4">{model.name} — Accuracy by Group</h3>
            {model.bias_groups.map((g, i) => {
              const maxAcc = Math.max(...model.bias_groups.map(b => b.accuracy));
              const biasFlag = maxAcc - g.accuracy > 0.10;
              return (
                <div key={i} className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-300">{g.group}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold ${biasFlag ? 'text-red-400' : 'text-green-400'}`}>
                        Acc: {(g.accuracy * 100).toFixed(0)}%
                      </span>
                      <span className="text-xs text-gray-500">F1: {(g.f1 * 100).toFixed(0)}%</span>
                      {biasFlag && <span className="text-xs text-red-400">⚠️ Bias gap</span>}
                    </div>
                  </div>
                  <div className="w-full bg-[#1e2a45] rounded-full h-4 overflow-hidden">
                    <div className={`h-full rounded-full ${biasFlag ? 'bg-red-500' : 'bg-green-500'}`}
                      style={{ width: `${g.accuracy * 100}%`, opacity: 0.7 }} />
                  </div>
                </div>
              );
            })}
            <div className="text-xs text-gray-600 mt-2">
              Bias threshold: &gt;10% accuracy gap between groups triggers review
            </div>
          </div>
        </div>
      )}

      {/* PRIVACY CONTROLS */}
      {tab === 'Privacy Controls' && (
        <div className="space-y-4">
          <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">{model.name}</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 px-2 py-0.5 rounded text-xs ${model.privacy.includes('No PII') ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {model.privacy.includes('No PII') ? 'No PII' : 'PII Present'}
                </span>
                <span className="text-sm text-gray-300">{model.privacy}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-24 shrink-0">Data Retention:</span>
                <span className="text-sm text-gray-300">{model.retention}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-24 shrink-0">Consent Status:</span>
                <span className="text-sm text-blue-400">Operational data — no individual consent required</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-3">
              <div className="text-xs text-gray-500 mb-1">Sensor Data</div>
              <div className="text-green-400 text-sm font-semibold">No PII</div>
              <div className="text-xs text-gray-600">Operational readings only</div>
            </div>
            <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-3">
              <div className="text-xs text-gray-500 mb-1">Worker Images (PPE)</div>
              <div className="text-amber-400 text-sm font-semibold">Anonymized</div>
              <div className="text-xs text-gray-600">Faces blurred, 30-day rolling retention</div>
            </div>
            <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-3">
              <div className="text-xs text-gray-500 mb-1">Operational Geography</div>
              <div className="text-blue-400 text-sm font-semibold">Field-level only</div>
              <div className="text-xs text-gray-600">No precise worker location tracking</div>
            </div>
          </div>
        </div>
      )}

      {/* FAIRNESS METRICS */}
      {tab === 'Fairness Metrics' && (
        <div className="space-y-4">
          <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">{model.name} — Fairness Assessment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Demographic Parity</div>
                  <div className="text-sm text-amber-400">
                    {model.id === 'm3' ? '⚠️ Gap detected: Night shift detection rate 68% vs 91% daytime' : '✅ No demographic groups applicable to this model'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Equalized Odds</div>
                  <div className="text-sm text-gray-300">
                    False Negative Rate: {model.id === 'm4' ? '14% (horizontal wells) vs 9% (vertical)' : 'Within acceptable bounds'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Individual Fairness</div>
                  <div className="text-sm text-gray-300">Similar inputs produce similar outputs — validated by perturbation test</div>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-2">Group Performance Gap:</div>
                <svg width="100%" height="100" viewBox="0 0 280 100" className="border border-[#1e2a45] rounded-lg bg-[#0a0e1a]">
                  {model.bias_groups.map((g, i) => {
                    const barW = 60, gap = 20;
                    const x = i * (barW + gap) + 20;
                    const h = g.accuracy * 80;
                    const color = g.accuracy > 0.85 ? '#10b981' : g.accuracy > 0.75 ? '#f59e0b' : '#ef4444';
                    return (
                      <g key={i}>
                        <rect x={x} y={95 - h} width={barW} height={h} fill={color} opacity="0.7" rx="2" />
                        <text x={x + barW / 2} y="98" fill="#9ca3af" fontSize="7" textAnchor="middle">
                          Grp {i + 1}
                        </text>
                        <text x={x + barW / 2} y={93 - h} fill={color} fontSize="8" textAnchor="middle">
                          {(g.accuracy * 100).toFixed(0)}%
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODEL RISK RATING */}
      {tab === 'Model Risk Rating' && (
        <div className="space-y-3">
          {MODELS.map(m => (
            <div key={m.id} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-white">{m.name}</span>
                    <span className={`px-2 py-0.5 rounded text-xs border capitalize ${RISK_COLORS[m.risk]}`}>
                      {m.risk} risk
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-xs mb-2">
                    <div>
                      <span className="text-gray-500">Safety Critical: </span>
                      <span className={m.is_safety_critical ? 'text-red-400' : 'text-green-400'}>
                        {m.is_safety_critical ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Autonomous: </span>
                      <span className={m.is_autonomous ? 'text-red-400' : 'text-green-400'}>
                        {m.is_autonomous ? 'Yes (high risk)' : 'No (human-in-loop)'}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-500">Blast Radius: </span>
                    <span className="text-amber-400">{m.blast_radius}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* INCIDENT LOG */}
      {tab === 'Incident Log' && (
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-6 text-center">
          <div className="text-4xl mb-3">🔔</div>
          <div className="text-gray-300 font-semibold">AI Model Incident Log</div>
          <div className="text-gray-500 text-sm mt-2">
            ⚠️ No AI incidents logged yet (ogo_ai_incident table empty).<br/>
            Incidents are logged when model predictions cause downstream errors or safety events.
          </div>
          <div className="text-xs text-gray-600 mt-3">
            Table: ogo_ai_incident — columns: model_name, incident_type, description, severity, status, reported_at
          </div>
        </div>
      )}

      {/* APPROVED MODELS */}
      {tab === 'Approved Models' && (
        <div className="space-y-3">
          {MODELS.map(m => (
            <div key={m.id} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white text-sm">{m.name}</div>
                  <div className="text-xs text-gray-500">{m.dept}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    pending approval
                  </span>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
                {['Data Provenance', 'Bias Audit', 'Privacy Review', 'Risk Assessment'].map((step) => (
                  <div key={step} className="flex items-center gap-1">
                    <span className="text-amber-400">⏳</span>
                    <span className="text-gray-500">{step}</span>
                  </div>
                ))}
              </div>
              <div className="text-xs text-gray-600 mt-2">
                Complete governance checklist to unlock model deployment approval
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
