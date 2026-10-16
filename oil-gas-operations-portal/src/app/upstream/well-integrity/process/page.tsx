'use client';
import { useEffect, useState } from 'react';

const BARRIERS = [
  {
    id: 'B1',
    name: 'Production Tubing + DHSV',
    component: 'Production tubing string + Deep Hole Safety Valve (DHSV) + tubing hanger',
    status: 'verified',
    last_test: '2024-10-01',
    next_test_due: '2025-04-01',
    integrity_score: 94,
    test_type: 'DHSV function test + wellbore pressure test',
  },
  {
    id: 'B2',
    name: 'Production Casing + Packer',
    component: '7" production casing string + production packer + TRSV (Tubing Retrievable Safety Valve)',
    status: 'verified',
    last_test: '2024-07-15',
    next_test_due: '2025-01-15',
    integrity_score: 88,
    test_type: 'Packer leak-off test + annulus pressure test',
  },
  {
    id: 'B3',
    name: 'Intermediate Casing + Cement',
    component: '9-5/8" intermediate casing + primary cement + DV (diverter valve)',
    status: 'degraded',
    last_test: '2024-03-20',
    next_test_due: '2024-09-20',
    integrity_score: 71,
    test_type: 'Casing pressure test + CBL/VDL re-run',
    issue: 'Micro-annulus on CBL at 2400-2500m — monitoring quarterly',
  },
  {
    id: 'B4',
    name: 'Surface Casing + Cement + Wellhead',
    component: '13-3/8" surface casing + lead/tail cement to surface + wellhead body + casing head + BOP',
    status: 'verified',
    last_test: '2024-11-01',
    next_test_due: '2025-05-01',
    integrity_score: 97,
    test_type: 'Wellhead pressure test + BOP function test + casing integrity test',
  },
];

const STEPS = [
  {
    step: 1, name: 'Barrier Identification & Documentation', color: '#3b82f6',
    activities: ['Identify all well barriers per NORSOK D-010 / AER Directive 009', 'Document barrier envelope (barrier element + verification test type + acceptance criteria)', 'Create well schematic with barrier verification status', 'Assign barrier status (verified / degraded / failed)'],
    inputs: 'Well completion report, cement evaluation logs (CBL/VDL/USIT), wellhead equipment datasheet',
    outputs: 'Well barrier schematic (WBS), barrier status register, annual well integrity report',
    ai: [{ name: 'Barrier Status ML', desc: 'Classifies barrier element status from test pressure trend history and log data', type: 'ML Classifier' }],
    kpis: [{ label: 'Wells with Verified Barriers', target: '>95%', unit: '%' }, { label: 'Annual Integrity Report Completion', target: '100%', unit: 'on time' }],
    duration: '2–4 weeks/well',
  },
  {
    step: 2, name: 'Risk Assessment & Prioritization', color: '#f59e0b',
    activities: ['Consequence × likelihood risk matrix for each barrier element', 'Age-based deterioration model (years since cement / tubing installation)', 'Historical incident comparison (same formation / same casing vintage)', 'Risk ranking for inspection/intervention scheduling'],
    inputs: 'Barrier status register, well age, production history, failure database',
    outputs: 'Well integrity risk register, prioritized intervention list, budget estimate',
    ai: [{ name: 'Well Integrity Risk Scorer', desc: 'ML risk score from barrier status, well age, casing thickness measurements, production corrosiveness indicators', type: 'ML Regression' }],
    kpis: [{ label: 'High-Risk Wells Addressed', target: '100% within 90 days', unit: 'days' }, { label: 'Risk Register Currency', target: 'Updated monthly', unit: 'frequency' }],
    duration: 'Monthly review',
  },
  {
    step: 3, name: 'Continuous Monitoring', color: '#8b5cf6',
    activities: ['Annulus pressure monitoring (A/B/C annulus daily readings)', 'Corrosion coupon retrieval and analysis (quarterly)', 'Wall thickness measurement (EM inspection tool or caliper log)', 'Flow-behind-casing surveillance (acoustic tool)', 'Wellhead erosion/corrosion visual inspection'],
    inputs: 'SCADA annulus pressure data, corrosion coupon lab results, inspection tool logs',
    outputs: 'Annulus pressure trend report, corrosion rate (mm/yr), wall thickness map, remediation trigger alerts',
    ai: [
      { name: 'Corrosion Rate Predictor', desc: 'ML from wall thickness measurements over time — predicts years to minimum acceptable wall thickness (MAT). Inputs: wall thickness history, H2S/CO2 partial pressure, temperature, flow velocity, inhibitor dose.', type: 'Time-Series ML' },
      { name: 'Annulus Pressure Anomaly Detector', desc: 'Detects sustained casing pressure (SCP) — classifies as annular fluid expansion vs. active leak vs. tubing leak', type: 'Anomaly Detection' },
    ],
    kpis: [{ label: 'Annulus Pressure Monitoring Coverage', target: '100% of wells', unit: '%' }, { label: 'Corrosion Rate', target: '<0.1 mm/yr', unit: 'mm/yr' }],
    duration: 'Continuous (SCADA)',
  },
  {
    step: 4, name: 'Inspection & Testing', color: '#10b981',
    activities: ['DHSV (Deep Hole Safety Valve) function test — pressure test per API 14A', 'Casing pressure test (surface to depth)', 'Cement bond log (CBL/VDL/USIT) re-run for degraded barriers', 'Corrosion/scale caliper log', 'Tubing inspection (UT wall thickness log)'],
    inputs: 'Well integrity risk priority list, test schedule, tool availability',
    outputs: 'Test record (pass/fail), CBL log, inspection report, updated barrier status',
    ai: [
      { name: 'DHSV Test Optimizer', desc: 'ML schedules DHSV tests based on failure probability model — extends test interval for low-risk valves, shortens for high-risk. Complies with AER minimum test frequency.', type: 'Scheduling ML' },
      { name: 'Cement Evaluation AI', desc: 'Acoustic impedance from sonic/USIT log → classifies cement bond quality (good bond / micro-annulus / free pipe) at each depth point', type: 'Acoustic ML' },
    ],
    kpis: [{ label: 'DHSV Test Pass Rate', target: '>99%', unit: '%' }, { label: 'Overdue DHSV Tests', target: '0', unit: 'count' }],
    duration: 'Annual (minimum)',
  },
  {
    step: 5, name: 'Intervention & Remediation', color: '#ef4444',
    activities: ['Tubing replacement (workover rig)', 'Cement squeeze (repair micro-annulus or poor bond zone)', 'Scale removal (chemical/mechanical)', 'DHSV replacement (wireline or workover)', 'Casing repair (patch or liner)'],
    inputs: 'Intervention design, workover rig contract, regulatory waiver if needed',
    outputs: 'Post-intervention well test, updated CBL, well status change (degraded → verified)',
    ai: [{ name: 'Intervention Cost-Benefit ML', desc: 'Calculates NPV of intervention vs. risk of failure — prioritizes workovers by expected risk reduction per CAD spent', type: 'Economic ML' }],
    kpis: [{ label: 'Post-Intervention Success Rate', target: '>90%', unit: '% barriers restored to verified' }, { label: 'Workover Cost vs. Budget', target: '±20% AFE', unit: '%' }],
    duration: '3–30 days (intervention-dependent)',
  },
  {
    step: 6, name: 'Documentation & Reporting', color: '#6b7280',
    activities: ['Update well barrier schematic (WBS) after every test/intervention', 'File annual well integrity report to AER (Alberta)/BCOGC (BC)', 'Update criticality register and 5-year well integrity plan', 'Lessons learned distribution (failure modes, corrective actions)'],
    inputs: 'Test records, intervention reports, regulator reporting template',
    outputs: 'Submitted regulatory report, updated WBS, closed audit findings, 5-year integrity plan',
    ai: [{ name: 'Regulatory Report Compiler', desc: 'Assembles required AER well integrity data from SCADA + test records into regulatory submission format automatically', type: 'NLP + Automation' }],
    kpis: [{ label: 'Regulatory Submission On-Time', target: '100%', unit: '%' }, { label: 'Open Audit Findings', target: '0 critical', unit: 'count' }],
    duration: 'Annual',
  },
];

const STATUS_CONFIG: Record<string, { color: string; label: string; bg: string }> = {
  verified: { color: '#22c55e', label: 'Verified', bg: 'bg-green-900/20 border-green-700' },
  degraded: { color: '#f59e0b', label: 'Degraded', bg: 'bg-amber-900/20 border-amber-700' },
  failed: { color: '#ef4444', label: 'Failed', bg: 'bg-red-900/20 border-red-700' },
};

export default function WellIntegrityProcessPage() {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  useEffect(() => { fetch('/api/upstream/process?section=well-integrity').catch(() => {}); }, []);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="font-mono text-xs text-amber-400 bg-amber-900/20 border border-amber-800/40 px-2 py-1 rounded">P-US-06</span>
          <h1 className="text-2xl font-bold text-white">Well Integrity Process</h1>
        </div>
        <p className="text-gray-400 text-sm">
          Multi-barrier approach · Barrier Identification → Risk Assessment → Monitoring → Inspection → Intervention → Documentation
        </p>
      </div>

      {/* SVG Flow */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4">Well Integrity Management Process Flow</h2>
        <div className="overflow-x-auto">
          <svg width="960" height="160" viewBox="0 0 960 160" className="block min-w-[700px]">
            <rect width="960" height="160" fill="#0a0e1a" rx="12" />
            <defs>
              <marker id="arrwi" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#374151" />
              </marker>
            </defs>
            {[
              { x: 10, label: 'Barrier\nIdentification', color: '#3b82f6' },
              { x: 170, label: 'Risk\nAssessment', color: '#f59e0b' },
              { x: 330, label: 'Continuous\nMonitoring', color: '#8b5cf6' },
              { x: 490, label: 'Inspection\n& Testing', color: '#10b981' },
              { x: 650, label: 'Intervention\n& Remediation', color: '#ef4444' },
              { x: 810, label: 'Documentation\n& Reporting', color: '#6b7280' },
            ].map((node, i, arr) => (
              <g key={node.label}>
                {i < arr.length - 1 && (
                  <line x1={node.x + 135} y1={80} x2={arr[i + 1].x} y2={80}
                    stroke="#374151" strokeWidth="2" markerEnd="url(#arrwi)" />
                )}
                <rect x={node.x} y={50} width={135} height={60} rx="8"
                  fill={node.color + '22'} stroke={node.color} strokeWidth="2" />
                {node.label.split('\n').map((line, li) => (
                  <text key={li} x={node.x + 67} y={li === 0 ? 76 : 92} textAnchor="middle"
                    fill={node.color} fontSize="11" fontWeight="600">{line}</text>
                ))}
                <circle cx={node.x + 67} cy={28} r={14} fill={node.color + '33'} stroke={node.color} strokeWidth="1" />
                <text x={node.x + 67} y={33} textAnchor="middle" fill={node.color} fontSize="11" fontWeight="700">{i + 1}</text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Swiss Cheese Model — Barrier Status */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-6">
        <h2 className="text-white font-semibold mb-2">Well Barrier Status — Swiss Cheese Model</h2>
        <p className="text-gray-400 text-xs mb-4">4-barrier envelope per NORSOK D-010 / AER Directive 009. A well is safe when NO failure path aligns across all 4 barriers (Swiss Cheese: holes must not stack).</p>
        <div className="overflow-x-auto">
          <svg width="800" height="220" viewBox="0 0 800 220" className="block min-w-[600px]">
            <rect width="800" height="220" fill="#0a0e1a" rx="8" />
            {/* Reservoir pressure source */}
            <rect x="10" y="80" width="80" height="60" rx="6" fill="#ef444422" stroke="#ef4444" strokeWidth="1.5" />
            <text x="50" y="107" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="600">Reservoir</text>
            <text x="50" y="120" textAnchor="middle" fill="#ef4444" fontSize="9">Pressure</text>
            <line x1="90" y1="110" x2="120" y2="110" stroke="#374151" strokeWidth="2" markerEnd="url(#arrwi2)" />
            <defs>
              <marker id="arrwi2" markerWidth="6" markerHeight="5" refX="6" refY="2.5" orient="auto">
                <polygon points="0 0, 6 2.5, 0 5" fill="#374151" />
              </marker>
            </defs>
            {BARRIERS.map((b, i) => {
              const cfg = STATUS_CONFIG[b.status];
              const x = 120 + i * 150;
              const scoreColor = b.integrity_score >= 90 ? '#22c55e' : b.integrity_score >= 75 ? '#f59e0b' : '#ef4444';
              return (
                <g key={b.id}>
                  <rect x={x} y={20} width={130} height={180} rx="8"
                    fill={cfg.color + '15'} stroke={cfg.color} strokeWidth="2" />
                  <text x={x + 65} y={42} textAnchor="middle" fill={cfg.color} fontSize="10" fontWeight="700">{b.id}</text>
                  <text x={x + 65} y={57} textAnchor="middle" fill="#d1d5db" fontSize="8">{b.name.split('+')[0]}</text>
                  <rect x={x + 10} y={68} width={110} height={18} rx="4" fill={cfg.color + '20'} stroke={cfg.color} strokeWidth="0.5" />
                  <text x={x + 65} y={81} textAnchor="middle" fill={cfg.color} fontSize="9" fontWeight="600">{cfg.label.toUpperCase()}</text>
                  <text x={x + 65} y={106} textAnchor="middle" fill={scoreColor} fontSize="22" fontWeight="700">{b.integrity_score}</text>
                  <text x={x + 65} y={118} textAnchor="middle" fill="#6b7280" fontSize="8">/100 score</text>
                  <text x={x + 65} y={138} textAnchor="middle" fill="#9ca3af" fontSize="8">Tested: {b.last_test}</text>
                  <text x={x + 65} y={151} textAnchor="middle" fill="#9ca3af" fontSize="8">Due: {b.next_test_due}</text>
                  {b.issue && (
                    <text x={x + 65} y={172} textAnchor="middle" fill="#f59e0b" fontSize="7" fontStyle="italic">⚠ {b.issue.substring(0, 28)}</text>
                  )}
                  {i < BARRIERS.length - 1 && (
                    <line x1={x + 130} y1={110} x2={x + 150} y2={110} stroke="#374151" strokeWidth="1.5" />
                  )}
                </g>
              );
            })}
            {/* Surface / Atmosphere */}
            <rect x="740" y="80" width="50" height="60" rx="6" fill="#22c55e22" stroke="#22c55e" strokeWidth="1.5" />
            <text x="765" y="107" textAnchor="middle" fill="#22c55e" fontSize="9" fontWeight="600">Surface</text>
            <text x="765" y="120" textAnchor="middle" fill="#22c55e" fontSize="9">Safe</text>
          </svg>
        </div>
        <div className="flex gap-4 mt-3">
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <div key={k} className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: v.color }}></div>
              <span className="text-gray-400">{v.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Process Step Detail */}
      <div className="space-y-4">
        {STEPS.map(step => (
          <div key={step.step} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden"
            style={{ borderLeftColor: step.color, borderLeftWidth: 4 }}>
            <button className="w-full flex items-center gap-4 p-4 text-left hover:bg-[#131d35] transition-colors"
              onClick={() => setActiveStep(activeStep === step.step ? null : step.step)}>
              <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: step.color + '33', color: step.color, border: `1px solid ${step.color}` }}>
                {step.step}
              </div>
              <div className="flex-1">
                <div className="text-white font-medium">{step.name}</div>
                <div className="text-xs text-gray-400">{step.duration}</div>
              </div>
              <span className="text-gray-400">{activeStep === step.step ? '▲' : '▼'}</span>
            </button>
            {activeStep === step.step && (
              <div className="p-4 border-t border-[#1e2a45] grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Input</div>
                    <div className="text-sm text-gray-300 bg-[#0a0e1a] border border-[#1e2a45] rounded p-2">{step.inputs}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Activities</div>
                    <ul className="space-y-1">
                      {step.activities.map((a, i) => (
                        <li key={i} className="text-sm text-gray-300 flex gap-2">
                          <span className="text-amber-500 mt-0.5">▸</span><span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Output</div>
                    <div className="text-sm text-gray-300 bg-[#0a0e1a] border border-[#1e2a45] rounded p-2">{step.outputs}</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-purple-400 uppercase tracking-wider mb-1">⚡ AI Integration</div>
                    {step.ai.map(ai => (
                      <div key={ai.name} className="bg-purple-900/10 border border-purple-800/30 rounded p-3 mb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-purple-300 font-semibold">{ai.name}</span>
                          <span className="text-xs text-purple-600 bg-purple-900/40 px-1.5 py-0.5 rounded">{ai.type}</span>
                        </div>
                        <div className="text-xs text-gray-400">{ai.desc}</div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">KPIs</div>
                    {step.kpis.map(kpi => (
                      <div key={kpi.label} className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">{kpi.label}</span>
                        <span className="text-white font-mono">{kpi.target} <span className="text-gray-500">{kpi.unit}</span></span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
