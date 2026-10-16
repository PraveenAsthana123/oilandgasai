'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

type KPI = { label: string; value: string; unit: string };
type PainPoint = { title: string; description: string; cost: string; priority: string };
type BRDSection = { section: string; content: string; priority: string };
type UseCase = { name: string; ai_type: string; features: string; expected_output: string; status: string };
type DataSource = { name: string; type: string; columns: string; frequency: string };

type DeptData = {
  name: string; stream: string; team_size: number; reports_to: string;
  kpis: KPI[]; pain_points: PainPoint[]; brd: BRDSection[];
  use_cases: UseCase[]; data_sources: DataSource[];
  db_use_cases: UseCase[]; db_brd: BRDSection[];
};

const AI_TYPES = ['All', 'AI', 'ML', 'Statistical ML', 'ExpAI', 'ResAI', 'Conversational AI', 'Generative AI'];
const TABS = ['Overview', 'Pain Points & BRD', 'Use Cases', 'Data Sources', 'Reports', 'Dashboard', 'ExpAI', 'ResAI'];

const PRIORITY_COLORS: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  medium: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  low: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  must_have: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  should_have: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  could_have: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const AI_TYPE_COLORS: Record<string, string> = {
  'AI': 'bg-purple-500/20 text-purple-300',
  'ML': 'bg-blue-500/20 text-blue-300',
  'Statistical ML': 'bg-cyan-500/20 text-cyan-300',
  'ExpAI': 'bg-green-500/20 text-green-300',
  'ResAI': 'bg-teal-500/20 text-teal-300',
  'Conversational AI': 'bg-amber-500/20 text-amber-300',
  'Generative AI': 'bg-pink-500/20 text-pink-300',
};

function BarChart({ features }: { features: { name: string; importance: number }[] }) {
  const max = Math.max(...features.map(f => f.importance));
  return (
    <div className="space-y-2">
      {features.map(f => (
        <div key={f.name} className="flex items-center gap-3">
          <div className="w-32 text-xs text-gray-400 text-right truncate">{f.name}</div>
          <div className="flex-1 bg-[#1e2a45] rounded h-5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded flex items-center px-2 transition-all"
              style={{ width: `${(f.importance / max) * 100}%` }}
            >
              <span className="text-xs text-black font-bold">{(f.importance * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function KPIPieChart({ kpis }: { kpis: KPI[] }) {
  const colors = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'];
  return (
    <svg width="200" height="200" viewBox="0 0 200 200">
      {kpis.map((kpi, i) => {
        const angle = (i / kpis.length) * 2 * Math.PI;
        const nextAngle = ((i + 1) / kpis.length) * 2 * Math.PI;
        const x1 = 100 + 80 * Math.cos(angle - Math.PI / 2);
        const y1 = 100 + 80 * Math.sin(angle - Math.PI / 2);
        const x2 = 100 + 80 * Math.cos(nextAngle - Math.PI / 2);
        const y2 = 100 + 80 * Math.sin(nextAngle - Math.PI / 2);
        const largeArc = kpis.length > 2 ? 0 : 1;
        return (
          <g key={i}>
            <path
              d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`}
              fill={colors[i % colors.length]}
              opacity="0.8"
              stroke="#0f1629" strokeWidth="2"
            />
            <text
              x={(100 + 50 * Math.cos((angle + nextAngle) / 2 - Math.PI / 2)).toFixed(0)}
              y={(100 + 50 * Math.sin((angle + nextAngle) / 2 - Math.PI / 2)).toFixed(0)}
              fill="white" fontSize="9" textAnchor="middle" dominantBaseline="middle"
            >
              {kpi.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function DeptPage() {
  const params = useParams<{ dept: string }>();
  const dept = params?.dept ?? '';
  const [data, setData] = useState<DeptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Overview');
  const [aiFilter, setAiFilter] = useState('All');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!dept) return;
    setLoading(true);
    fetch(`/api/departments/${dept}`)
      .then(r => r.json())
      .then((d: DeptData & { error?: string }) => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, [dept]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-amber-400 animate-pulse text-lg">Loading {dept} department…</div>
    </div>
  );

  if (error || !data) return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-red-400">
      Error loading department: {error || 'No data returned'}
    </div>
  );

  const filteredUC = data.use_cases.filter(uc =>
    aiFilter === 'All' || uc.ai_type === aiFilter
  );

  const EXPAI_FEATURES = [
    { name: 'Primary_Param', importance: 0.38 },
    { name: 'Secondary_Param', importance: 0.26 },
    { name: 'Environmental', importance: 0.20 },
    { name: 'Historical_Trend', importance: 0.16 },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="text-xs text-amber-500/70 uppercase tracking-wider mb-1">
            {data.stream} · Department Deep-Dive
          </div>
          <h1 className="text-2xl font-bold text-white">{data.name}</h1>
          <div className="text-gray-400 text-sm mt-1">
            Team: {data.team_size} · Reports to: {data.reports_to}
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border capitalize ${
          data.stream === 'upstream' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
          data.stream === 'midstream' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
          data.stream === 'downstream' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
          'bg-gray-500/20 text-gray-400 border-gray-500/30'
        }`}>{data.stream}</span>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-6 border-b border-[#1e2a45] pb-2">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-t text-xs font-medium transition-colors ${
              tab === t
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 border-b-transparent'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#1e2a45]'
            }`}>{t}</button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {tab === 'Overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.kpis.map((kpi, i) => (
              <div key={i} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
                <div className="text-xs text-gray-500 mb-1">{kpi.label}</div>
                <div className="text-2xl font-bold text-amber-400">{kpi.value}</div>
                <div className="text-xs text-gray-500">{kpi.unit}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Department KPI Chart</h3>
              <div className="flex justify-center">
                <KPIPieChart kpis={data.kpis} />
              </div>
              <div className="mt-2 space-y-1">
                {data.kpis.map((k, i) => {
                  const c = ['text-amber-400','text-blue-400','text-green-400','text-purple-400'];
                  return <div key={i} className={`text-xs ${c[i%4]}`}>● {k.label}: {k.value} {k.unit}</div>;
                })}
              </div>
            </div>
            <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Quick Summary</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Stream:</dt>
                  <dd className="text-amber-400 capitalize">{data.stream}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Team Size:</dt>
                  <dd className="text-white">{data.team_size} personnel</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Reports To:</dt>
                  <dd className="text-white">{data.reports_to}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Use Cases:</dt>
                  <dd className="text-white">{data.use_cases.length} planned</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Pain Points:</dt>
                  <dd className="text-red-400">{data.pain_points.length} identified</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Data Sources:</dt>
                  <dd className="text-blue-400">{data.data_sources.length} sources</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}

      {/* PAIN POINTS & BRD TAB */}
      {tab === 'Pain Points & BRD' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Pain Points</h2>
            <div className="space-y-3">
              {data.pain_points.map((pp, i) => (
                <div key={i} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white text-sm">{pp.title}</span>
                        <span className={`px-2 py-0.5 rounded text-xs border capitalize ${PRIORITY_COLORS[pp.priority] || PRIORITY_COLORS.medium}`}>
                          {pp.priority}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">{pp.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Impact</div>
                      <div className="text-red-400 text-sm font-semibold">{pp.cost}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Business Requirements Document</h2>
            <div className="space-y-3">
              {data.brd.map((b, i) => (
                <div key={i} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-amber-400 font-semibold text-sm">{b.section}</span>
                    <span className={`px-2 py-0.5 rounded text-xs border ${PRIORITY_COLORS[b.priority] || PRIORITY_COLORS.medium}`}>
                      {b.priority.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">{b.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* USE CASES TAB */}
      {tab === 'Use Cases' && (
        <div>
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {AI_TYPES.map(t => (
              <button key={t} onClick={() => setAiFilter(t)}
                className={`px-3 py-1 rounded text-xs transition-colors ${
                  aiFilter === t
                    ? 'bg-amber-500 text-black font-semibold'
                    : 'bg-[#1e2a45] text-gray-400 hover:text-gray-200'
                }`}>{t}</button>
            ))}
          </div>
          <div className="text-xs text-gray-500 mb-3">{filteredUC.length} use case(s) for {data.name}</div>
          <div className="space-y-3">
            {filteredUC.map((uc, i) => (
              <div key={i} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-semibold text-white">{uc.name}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${AI_TYPE_COLORS[uc.ai_type] || 'bg-gray-500/20 text-gray-300'}`}>
                        {uc.ai_type}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs bg-gray-500/20 text-gray-400 capitalize">{uc.status}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Input Features: </span>
                        <span className="text-gray-300">{uc.features}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Expected Output: </span>
                        <span className="text-gray-300">{uc.expected_output}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredUC.length === 0 && (
              <div className="text-center text-gray-500 py-8">No use cases for AI type: {aiFilter}</div>
            )}
          </div>
        </div>
      )}

      {/* DATA SOURCES TAB */}
      {tab === 'Data Sources' && (
        <div className="space-y-4">
          {data.data_sources.map((ds, i) => (
            <div key={i} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-semibold text-white">{ds.name}</div>
                  <div className="text-xs text-blue-400">{ds.type}</div>
                </div>
                <div className="text-xs text-gray-500">Freq: <span className="text-amber-400">{ds.frequency}</span></div>
              </div>
              <div className="text-xs text-gray-500 mb-1">Schema / Columns:</div>
              <div className="bg-[#0a0e1a] rounded p-2 font-mono text-xs text-green-400 overflow-x-auto">
                {ds.columns}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* REPORTS TAB */}
      {tab === 'Reports' && (
        <div className="space-y-4">
          <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-6 text-center">
            <div className="text-4xl mb-3">📊</div>
            <div className="text-gray-300 font-semibold">Automated Reports</div>
            <div className="text-gray-500 text-sm mt-2">
              ⚠️ No reports generated yet for {data.name}.<br/>
              Reports are generated by scheduled jobs or triggered manually via the Jobs page.
            </div>
            <a href="/jobs" className="mt-4 inline-block px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg text-sm border border-amber-500/30 hover:bg-amber-500/30">
              Go to Jobs → Run J07 Daily Safety Briefing
            </a>
          </div>
          <div className="text-xs text-gray-600 text-center">
            Report data stored in ogo_job_run table when jobs complete.
          </div>
        </div>
      )}

      {/* DASHBOARD TAB */}
      {tab === 'Dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.kpis.map((kpi, i) => {
              const colors = ['text-amber-400', 'text-blue-400', 'text-green-400', 'text-purple-400'];
              return (
                <div key={i} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4 text-center">
                  <div className="text-xs text-gray-500 mb-1">{kpi.label}</div>
                  <div className={`text-3xl font-bold ${colors[i % 4]}`}>{kpi.value}</div>
                  <div className="text-xs text-gray-600">{kpi.unit}</div>
                </div>
              );
            })}
          </div>
          <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Use Case Status Distribution</h3>
            <svg width="100%" height="40" viewBox="0 0 600 40" className="max-w-lg">
              {data.use_cases.map((uc, i) => (
                <g key={i}>
                  <rect x={i * (600 / Math.max(data.use_cases.length, 1))} y="0" width={600 / Math.max(data.use_cases.length, 1) - 4} height="40"
                    fill="#f59e0b" opacity="0.3" rx="4" />
                  <text x={i * (600 / Math.max(data.use_cases.length, 1)) + 6} y="24" fill="#f59e0b" fontSize="9">
                    {uc.name.slice(0, 12)}
                  </text>
                </g>
              ))}
            </svg>
            <div className="text-xs text-gray-500 mt-2">
              ⚠️ Dept DB empty — Showing use case breakdown from static knowledge base. Connect DB for real metrics.
            </div>
          </div>
        </div>
      )}

      {/* EXPAI TAB */}
      {tab === 'ExpAI' && (
        <div className="space-y-6">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-amber-400 text-sm">
            Explainability AI — showing example feature importance for {data.name} use cases.
            For full per-use-case ExpAI, visit the <a href="/ai/expai" className="underline">ExpAI Center</a>.
          </div>
          {data.use_cases.slice(0, 2).map((uc, i) => (
            <div key={i} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="font-semibold text-white">{uc.name}</span>
                <span className={`px-2 py-0.5 rounded text-xs ${AI_TYPE_COLORS[uc.ai_type] || 'bg-gray-500/20 text-gray-300'}`}>
                  {uc.ai_type}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Feature Importance (SHAP-style)</div>
                  <BarChart features={EXPAI_FEATURES} />
                </div>
                <div className="space-y-3">
                  <div className="bg-[#0a0e1a] rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Decision Trace</div>
                    <div className="text-xs text-green-400 font-mono">
                      Input received → Feature extraction → Primary_Param=HIGH → Secondary=ELEVATED → Risk: <span className="text-red-400">Critical (87%)</span>
                    </div>
                  </div>
                  <div className="bg-[#0a0e1a] rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Counterfactual</div>
                    <div className="text-xs text-amber-400">
                      If Primary_Param was within normal range, prediction would change to: <span className="text-green-400">Normal (74% confidence)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RESAI TAB */}
      {tab === 'ResAI' && (
        <div className="space-y-4">
          <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <h3 className="text-sm font-semibold text-amber-400 mb-3">Data Provenance for {data.name}</h3>
            <div className="space-y-2">
              {data.data_sources.map((ds, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="text-gray-300">{ds.name}</span>
                  <span className="text-gray-600">→</span>
                  <span className="text-blue-400">{ds.type}</span>
                  <span className="text-gray-600">→</span>
                  <span className="text-green-400">Model Training</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Privacy Controls</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2"><span className="text-green-400">●</span><span>Sensor data: No PII</span></div>
                <div className="flex items-center gap-2"><span className="text-green-400">●</span><span>Operational data: No PII</span></div>
                <div className="flex items-center gap-2"><span className="text-amber-400">●</span><span>Worker images: Anonymized</span></div>
                <div className="flex items-center gap-2"><span className="text-blue-400">●</span><span>Retention: 7 years (regulatory)</span></div>
              </div>
            </div>
            <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Model Risk Rating</h3>
              <div className="space-y-2 text-sm">
                {data.use_cases.map((uc, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-gray-400 truncate">{uc.name}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      uc.name.toLowerCase().includes('safety') || uc.name.toLowerCase().includes('kick') || uc.name.toLowerCase().includes('stuck')
                        ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {uc.name.toLowerCase().includes('safety') || uc.name.toLowerCase().includes('kick') ? 'High Risk' : 'Medium Risk'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Governance Approval Status</h3>
            <div className="text-xs text-gray-500">
              ⚠️ No models deployed yet — governance approval workflow pending.
              Visit <a href="/ai/resai" className="text-amber-400 underline">ResAI Center</a> for full governance hub.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
