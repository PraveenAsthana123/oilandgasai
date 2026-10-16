'use client';
import { useEffect, useState } from 'react';

const PTW_STEPS = [
  { id: 'ptw1', label: 'Job Identification', sub: 'Work order raised', color: '#3b82f6', decision: null },
  { id: 'ptw2', label: 'Hazard Assessment (JSA)', sub: 'Job Safety Analysis completed', color: '#8b5cf6', decision: { q: 'Are all hazard controls adequate?', yes: 'Proceed to permit', no: 'Escalate to HSE Advisor' } },
  { id: 'ptw3', label: 'Permit Request', sub: 'Form submitted to area authority', color: '#f59e0b', decision: null },
  { id: 'ptw4', label: 'Permit Review', sub: 'Area Authority + Safety Officer review', color: '#ef4444', decision: { q: 'All controls confirmed in place?', yes: 'Authorize', no: 'Hold — remediate gap' } },
  { id: 'ptw5', label: 'Authorized', sub: 'Permit signed and issued', color: '#22c55e', decision: null },
  { id: 'ptw6', label: 'Job Execution', sub: 'Work performed per permit', color: '#10b981', decision: { q: 'New hazard identified?', yes: 'Suspend & reassess', no: 'Continue to completion' } },
  { id: 'ptw7', label: 'Sign-off & Close', sub: 'Permit closed, site reinstated', color: '#6b7280', decision: null },
];

const H2S_LEVELS = [
  { range: '0 ppm', label: 'Normal', action: 'No action — ambient monitoring only', color: '#22c55e' },
  { range: '1–5 ppm', label: 'Advisory', action: 'Increase monitoring frequency; brief crew; check detector calibration', color: '#84cc16' },
  { range: '5–10 ppm', label: 'Warning', action: 'Activate H2S alarm; don SCBA; notify supervisor; non-essential personnel evacuate upwind', color: '#f59e0b' },
  { range: '10–20 ppm', label: 'Alarm 1', action: 'Full evacuation to muster point; account for all personnel; incident commander activates ERP', color: '#f97316' },
  { range: '>20 ppm', label: 'Emergency', action: 'SCBA required for entry; rescue team activation; emergency services notification; H2S rescue protocol', color: '#ef4444' },
];

const RISK_MATRIX = {
  likelihood: ['Rare (1)', 'Unlikely (2)', 'Possible (3)', 'Likely (4)', 'Almost Certain (5)'],
  consequence: ['Insignificant (1)', 'Minor (2)', 'Moderate (3)', 'Major (4)', 'Catastrophic (5)'],
  matrix: [
    [1, 2, 3, 4, 5],
    [2, 4, 6, 8, 10],
    [3, 6, 9, 12, 15],
    [4, 8, 12, 16, 20],
    [5, 10, 15, 20, 25],
  ],
};

const SUB_PROCESSES = [
  {
    id: 'SP-US-07-1', name: 'Job Safety Analysis (JSA)',
    purpose: 'Systematically identify hazards in each job step and define controls before work starts.',
    steps: ['List all job steps in sequence', 'For each step: identify all hazards', 'Rate each hazard: Likelihood × Consequence (1–5 matrix)', 'Define control measures (eliminate/substitute/engineering/admin/PPE)', 'Re-rate residual risk after controls', 'Sign JSA — all crew members'],
    inputs: 'Job description, site plan, previous JSA for similar jobs', outputs: 'Completed JSA form, risk rating table, permit attachment',
    ai: 'JSA Hazard Generator (LLM — given job type + location, suggests typical hazards from historical database)', team: 'Permit holder + crew + HSE rep', duration: '30 min – 2 hrs per job',
    failures: ['Hazards missed in fast-paced operations', 'Controls not enforced in field', 'JSA not updated when scope changes'],
    actions: ['Mandatory crew participation (sign-off)', 'HSE spot check during execution', 'Stop Work Authority clearly communicated'],
  },
  {
    id: 'SP-US-07-2', name: 'PPE Selection Matrix',
    purpose: 'Ensure correct personal protective equipment is selected and worn for every task type.',
    ppe_table: [
      { task: 'General site work', ppe: ['Hard hat', 'Safety glasses', 'Safety boots', 'Hi-vis vest', 'Gloves'] },
      { task: 'Chemical handling', ppe: ['Chemical goggles', 'Face shield', 'Chemical gloves', 'Apron', 'Boots'] },
      { task: 'Work at height (>1.8m)', ppe: ['Full body harness', 'Lanyard/self-retracting lifeline', 'Helmet with chin strap', 'Gloves'] },
      { task: 'H2S hazard area', ppe: ['4-gas detector (H2S/CO/LEL/O2)', 'SCBA (for entry >10 ppm)', 'Hi-vis', 'H2S-rated boots'] },
      { task: 'Electrical work (>50V)', ppe: ['ARC flash suit (cal/cm²-rated)', 'Insulating gloves', 'Face shield', 'Safety glasses'] },
      { task: 'Sandblasting/grinding', ppe: ['Full face shield', 'Hearing protection', 'Dust respirator P100', 'Leather gloves', 'Hi-vis'] },
    ],
    inputs: 'Task type, chemical SDS, energy type present', outputs: 'Completed PPE checklist on permit',
    ai: 'PPE Compliance Monitor (CV object detection — camera feed → detect missing PPE → alert. Kaggle: ppe-images dataset — 2,801 images with YOLO bounding box annotations for helmet/vest/gloves detection)', team: 'HSE Team, Permit Holder', duration: 'Integrated in permit',
  },
  {
    id: 'SP-US-07-3', name: 'H2S Response Procedure',
    purpose: 'Structured response to H2S gas releases — from detection to rescue to medical care.',
    steps: ['Continuous H2S monitoring (fixed detectors + personal 4-gas)', 'Level thresholds trigger escalating response (see table)', 'At alarm: muster at designated assembly point', 'Head count — confirm all personnel accounted for', 'Rescue team enters with SCBA only', 'First aid / medical response for exposures', 'Investigation and safe re-entry procedure'],
    inputs: 'H2S detector reading, wind direction (from met station)', outputs: 'Incident report, medical record, H2S investigation report',
    ai: 'H2S Plume Predictor (ML using meteorological data — wind speed/direction/temperature to predict gas dispersion plume direction)', team: 'All site personnel (awareness), Emergency Response Team, HSE', duration: 'Event-driven',
    failures: ['Detector not calibrated', 'Evacuation route blocked', 'SCBA not accessible'], actions: ['Monthly bump test + calibration', 'Multiple muster points', 'SCBA inspection weekly'],
  },
  {
    id: 'SP-US-07-4', name: 'Incident Investigation',
    purpose: 'Determine root causes of incidents to prevent recurrence using systematic analysis.',
    steps: ['Secure scene and preserve evidence', 'Immediate notification (supervisor → HSE → management chain)', 'Witness interviews (within 2 hrs)', '5-Whys root cause analysis', 'Fishbone (Ishikawa) diagram for complex incidents', 'Corrective action register (CAPA)', 'Close-out and lessons-learned distribution'],
    inputs: 'Incident report, witness statements, site photographs, equipment records',
    outputs: 'Investigation report, CAPA tracker, lessons-learned bulletin, regulator notification (if reportable)',
    ai: 'Incident Pattern Analyzer (NLP + ML on incident reports — identifies systemic causes across multiple sites/incidents; flags recurring themes for management review)',
    formulas: ['TRIF = (Total Recordable Injuries × 200,000) / Total Hours Worked', 'LTIF = (Lost Time Injuries × 1,000,000) / Total Hours Worked'],
    team: 'HSE, Operations Manager, affected crew supervisor', duration: '24 hrs (initial) + 5 days (full)',
  },
  {
    id: 'SP-US-07-5', name: 'Emergency Response Plan (ERP)',
    purpose: 'Pre-planned coordinated response to site emergencies ensuring personnel safety and asset protection.',
    scenarios: [
      { scenario: 'Well Blowout', activation: 'IC declaration', command: 'Incident Commander + Blowout Specialist', actions: ['Evacuate non-essential', 'Contact wild well control contractor', 'Notify regulator (AER within 2 hrs)', 'Monitor from safe distance'] },
      { scenario: 'Major Fire', activation: 'Smoke/flame alarm or report', command: 'Incident Commander + Fire Warden', actions: ['Evacuate to muster point', 'Activate firewater system', 'Account for personnel', 'Emergency services call'] },
      { scenario: 'H2S Release (>20 ppm)', activation: 'H2S detector alarm', command: 'Incident Commander + H2S Rescue Team', actions: ['Evacuation upwind', 'SCBA rescue', 'Medical standby', 'Gas dispersion monitoring'] },
      { scenario: 'Medical Emergency', activation: 'First aider call', command: 'First Aider + Medic', actions: ['First aid initiation', 'Medevac request', 'Area secured', 'Report to management'] },
    ],
    inputs: 'Emergency notification, muster status', outputs: 'Incident report, regulator notification, post-incident debrief',
    ai: 'ERP Decision Support (Ollama LLM — "Given scenario type: {blowout/fire/H2S}, current head count: {n}, wind direction: {dir}, return the immediate response checklist")',
    team: 'All site personnel (trained in ERP), Incident Commander, Emergency Response Team', duration: 'Event-driven (drill: quarterly)',
  },
];

export default function HSEProcessPage() {
  const [activeTab, setActiveTab] = useState<'ptw' | 'h2s' | 'risk' | 'subs'>('ptw');
  const [openSub, setOpenSub] = useState<string | null>(null);
  useEffect(() => { fetch('/api/upstream/process?section=hse').catch(() => {}); }, []);

  const getRiskColor = (val: number) => {
    if (val >= 20) return '#ef4444';
    if (val >= 12) return '#f97316';
    if (val >= 6) return '#f59e0b';
    if (val >= 3) return '#84cc16';
    return '#22c55e';
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="font-mono text-xs text-amber-400 bg-amber-900/20 border border-amber-800/40 px-2 py-1 rounded">P-US-07</span>
          <h1 className="text-2xl font-bold text-white">HSE Management Process</h1>
        </div>
        <p className="text-gray-400 text-sm">
          Permit to Work · Job Safety Analysis · H2S Response · Incident Investigation · Emergency Response Plan
        </p>
      </div>

      {/* SVG Flow */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4">PTW (Permit to Work) Process Flow</h2>
        <div className="overflow-x-auto">
          <svg width="1000" height="200" viewBox="0 0 1000 200" className="block min-w-[800px]">
            <rect width="1000" height="200" fill="#0a0e1a" rx="12" />
            <defs>
              <marker id="arrhse" markerWidth="6" markerHeight="5" refX="6" refY="2.5" orient="auto">
                <polygon points="0 0, 6 2.5, 0 5" fill="#374151" />
              </marker>
            </defs>
            {PTW_STEPS.map((step, i) => {
              const x = 10 + i * 140;
              return (
                <g key={step.id}>
                  {i < PTW_STEPS.length - 1 && (
                    <line x1={x + 110} y1={90} x2={x + 140} y2={90}
                      stroke="#374151" strokeWidth="1.5" markerEnd="url(#arrhse)" />
                  )}
                  <rect x={x} y={60} width={110} height={60} rx="7"
                    fill={step.color + '22'} stroke={step.color} strokeWidth="1.5" />
                  <text x={x + 55} y={85} textAnchor="middle" fill={step.color} fontSize="10" fontWeight="600">{step.label}</text>
                  <text x={x + 55} y={100} textAnchor="middle" fill="#9ca3af" fontSize="8">{step.sub}</text>
                  {step.decision && (
                    <g>
                      <polygon points={`${x + 55},${130} ${x + 85},${155} ${x + 55},${180} ${x + 25},${155}`}
                        fill="#374151" stroke={step.color} strokeWidth="1" />
                      <text x={x + 55} y={159} textAnchor="middle" fill={step.color} fontSize="7">Decision</text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'ptw', label: 'PTW System', icon: '📋' },
          { id: 'h2s', label: 'H2S Response', icon: '☠️' },
          { id: 'risk', label: 'Risk Matrix', icon: '🎯' },
          { id: 'subs', label: 'Sub-processes', icon: '⚙️' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-amber-600 text-white'
                : 'bg-[#0f1629] border border-[#1e2a45] text-gray-300 hover:border-amber-600/50'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* PTW detail */}
      {activeTab === 'ptw' && (
        <div className="space-y-4">
          <h2 className="text-white font-semibold">PTW System — Step-by-Step with Decision Gates</h2>
          {PTW_STEPS.map(step => (
            <div key={step.id} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4"
              style={{ borderLeftColor: step.color, borderLeftWidth: 4 }}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: step.color + '33', color: step.color, border: `1px solid ${step.color}` }}>
                  {PTW_STEPS.indexOf(step) + 1}
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium">{step.label}</div>
                  <div className="text-xs text-gray-400 mb-2">{step.sub}</div>
                  {step.decision && (
                    <div className="bg-[#0a0e1a] border border-[#1e2a45] rounded p-3 mt-2">
                      <div className="text-xs text-yellow-400 font-semibold mb-1">◆ Decision Gate: {step.decision.q}</div>
                      <div className="flex gap-4 text-xs">
                        <span className="text-green-400">✓ YES: {step.decision.yes}</span>
                        <span className="text-red-400">✗ NO: {step.decision.no}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {/* AI section */}
          <div className="bg-purple-900/10 border border-purple-800/30 rounded-xl p-5">
            <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3">⚡ AI Integration — PTW System</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { name: 'Risk Score Calculator', desc: 'ML from job type + location + crew experience → predicts incident probability → auto-populates risk matrix cells', type: 'ML Classifier' },
                { name: 'PPE Compliance Monitor', desc: 'CV object detection — camera feed → detect missing PPE in real time → SMS alert to supervisor. Kaggle: ppe-images (2,801 YOLO-annotated images).', type: 'Computer Vision' },
                { name: 'Incident Pattern Analyzer', desc: 'NLP + ML on historical incident reports — identifies systemic causes, recurring hazard types, improvement opportunities', type: 'NLP + ML' },
              ].map(ai => (
                <div key={ai.name} className="bg-[#0a0e1a] border border-purple-800/20 rounded p-3">
                  <div className="text-xs text-purple-300 font-semibold mb-1">{ai.name}</div>
                  <div className="text-xs text-purple-600 bg-purple-900/30 px-1.5 py-0.5 rounded mb-1 inline-block">{ai.type}</div>
                  <div className="text-xs text-gray-400">{ai.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* H2S Response */}
      {activeTab === 'h2s' && (
        <div className="space-y-4">
          <h2 className="text-white font-semibold">H2S Detection & Response Levels</h2>
          <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e2a45]">
                  <th className="text-left p-3 text-gray-400">H2S Level</th>
                  <th className="text-left p-3 text-gray-400">Status</th>
                  <th className="text-left p-3 text-gray-400">Immediate Actions</th>
                </tr>
              </thead>
              <tbody>
                {H2S_LEVELS.map(level => (
                  <tr key={level.range} className="border-b border-[#1e2a45]">
                    <td className="p-3 font-mono font-bold" style={{ color: level.color }}>{level.range}</td>
                    <td className="p-3">
                      <span className="text-xs px-2 py-1 rounded font-semibold"
                        style={{ backgroundColor: level.color + '22', color: level.color, border: `1px solid ${level.color}` }}>
                        {level.label}
                      </span>
                    </td>
                    <td className="p-3 text-gray-300 text-xs">{level.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
            <h3 className="text-white font-semibold mb-3">H2S Response Escalation Flowchart</h3>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {[
                { label: 'Monitor 0 ppm', color: '#22c55e' },
                { label: '1–5 ppm Advisory', color: '#84cc16' },
                { label: '5–10 ppm Brief Crew', color: '#f59e0b' },
                { label: '10–20 ppm Alarm + Evacuate', color: '#f97316' },
                { label: '>20 ppm SCBA + Rescue', color: '#ef4444' },
                { label: 'Medical Response', color: '#ef4444' },
                { label: 'Safe Re-entry Procedure', color: '#3b82f6' },
              ].map((step, i, arr) => (
                <span key={step.label} className="flex items-center gap-1">
                  <span className="px-2 py-1 rounded text-white font-medium"
                    style={{ backgroundColor: step.color + '33', border: `1px solid ${step.color}`, color: step.color }}>
                    {step.label}
                  </span>
                  {i < arr.length - 1 && <span className="text-gray-600">→</span>}
                </span>
              ))}
            </div>
            <div className="mt-3 text-xs text-purple-300 bg-purple-900/10 border border-purple-800/30 rounded p-2">
              ⚡ AI: H2S Plume Predictor (ML meteorological model — predicts gas dispersion direction/concentration from met station data — recommends optimal muster point)
            </div>
          </div>
        </div>
      )}

      {/* Risk Matrix */}
      {activeTab === 'risk' && (
        <div className="space-y-4">
          <h2 className="text-white font-semibold">5×5 Risk Matrix (Likelihood × Consequence)</h2>
          <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5 overflow-x-auto">
            <table className="border-collapse">
              <thead>
                <tr>
                  <th className="w-32 p-2 text-gray-400 text-xs text-right pr-3">Likelihood →<br />Consequence ↓</th>
                  {RISK_MATRIX.likelihood.map(l => (
                    <th key={l} className="w-28 p-2 text-center text-xs text-gray-400 font-medium">{l}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RISK_MATRIX.consequence.map((c, ci) => (
                  <tr key={c}>
                    <td className="p-2 text-xs text-gray-400 text-right pr-3 font-medium">{c}</td>
                    {RISK_MATRIX.likelihood.map((_, li) => {
                      const val = RISK_MATRIX.matrix[ci][li];
                      const bg = getRiskColor(val);
                      return (
                        <td key={li} className="w-28 h-12 text-center font-bold text-sm border border-[#1e2a45]"
                          style={{ backgroundColor: bg + '33', color: bg }}>
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex gap-6 mt-3 text-xs">
              {[
                { range: '1–2', label: 'Very Low', color: '#22c55e' },
                { range: '3–5', label: 'Low', color: '#84cc16' },
                { range: '6–11', label: 'Medium', color: '#f59e0b' },
                { range: '12–19', label: 'High', color: '#f97316' },
                { range: '20–25', label: 'Very High / Stop Work', color: '#ef4444' },
              ].map(l => (
                <div key={l.range} className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: l.color + '44', border: `1px solid ${l.color}` }}></div>
                  <span style={{ color: l.color }}>{l.range}: {l.label}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Incident Metrics */}
          <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
            <h3 className="text-white font-semibold mb-3">Industry Standard Incident Rate Formulas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'TRIF (Total Recordable Incident Frequency)', formula: 'TRIF = (Total Recordable Injuries × 200,000) / Total Hours Worked', note: '200,000 = equivalent of 100 workers × 40 hrs/week × 50 weeks/year', target: '<0.5 (top quartile E&P)' },
                { name: 'LTIF (Lost Time Incident Frequency)', formula: 'LTIF = (Lost Time Incidents × 1,000,000) / Total Hours Worked', note: '1,000,000 = equivalent of 500 workers × 2,000 hrs/year', target: '<0.1 (top quartile E&P)' },
              ].map(eq => (
                <div key={eq.name} className="bg-[#0a0e1a] border border-[#1e2a45] rounded p-3">
                  <div className="text-xs text-amber-400 font-semibold mb-2">{eq.name}</div>
                  <code className="text-blue-300 text-xs font-mono block mb-1">{eq.formula}</code>
                  <div className="text-xs text-gray-500">{eq.note}</div>
                  <div className="text-xs text-green-400 mt-1">Target: {eq.target}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub-processes */}
      {activeTab === 'subs' && (
        <div className="space-y-2">
          <h2 className="text-white font-semibold mb-3">HSE Sub-process Detail (P-US-07)</h2>
          {SUB_PROCESSES.map(sp => (
            <div key={sp.id} className="border border-[#1e2a45] rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenSub(openSub === sp.id ? null : sp.id)}
                className="w-full flex items-center justify-between px-4 py-3 bg-[#0a0e1a] hover:bg-[#131d35] transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-amber-400">{sp.id}</span>
                  <span className="text-white text-sm font-medium">{sp.name}</span>
                </div>
                <span className="text-gray-400">{openSub === sp.id ? '▲' : '▼'}</span>
              </button>
              {openSub === sp.id && (
                <div className="p-4 bg-[#0f1629] border-t border-[#1e2a45] space-y-3 text-sm">
                  <div className="text-gray-300">{sp.purpose}</div>

                  {/* PPE table for SP-07-2 */}
                  {sp.ppe_table && (
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">PPE Selection Matrix</div>
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-[#1e2a45] text-gray-500">
                            <th className="text-left pb-1">Task Type</th>
                            <th className="text-left pb-1">Required PPE</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sp.ppe_table.map(row => (
                            <tr key={row.task} className="border-b border-[#1e2a45]">
                              <td className="py-2 text-gray-300">{row.task}</td>
                              <td className="py-2">
                                <div className="flex flex-wrap gap-1">
                                  {row.ppe.map(p => (
                                    <span key={p} className="bg-amber-900/20 border border-amber-800/30 text-amber-300 px-1.5 py-0.5 rounded text-xs">{p}</span>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Emergency scenarios for SP-07-5 */}
                  {sp.scenarios && (
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Emergency Scenarios</div>
                      <div className="space-y-2">
                        {sp.scenarios.map(sc => (
                          <div key={sc.scenario} className="bg-[#0a0e1a] border border-[#1e2a45] rounded p-3">
                            <div className="text-red-400 font-semibold text-xs mb-1">🚨 {sc.scenario}</div>
                            <div className="text-xs text-gray-400 mb-1">Activation: {sc.activation} | Command: {sc.command}</div>
                            <div className="flex flex-wrap gap-1">
                              {sc.actions.map((a, i) => (
                                <span key={i} className="text-xs text-gray-300 bg-[#131d35] border border-[#1e2a45] px-2 py-0.5 rounded">{i + 1}. {a}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Steps if available */}
                  {sp.steps && (
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Steps</div>
                      <ol className="list-decimal list-inside space-y-0.5">
                        {sp.steps.map((s, i) => <li key={i} className="text-gray-300 text-xs">{s}</li>)}
                      </ol>
                    </div>
                  )}

                  {sp.formulas && (
                    <div>
                      <div className="text-xs text-blue-400 uppercase tracking-wider mb-1">Formulas</div>
                      {sp.formulas.map(f => (
                        <code key={f} className="text-blue-300 text-xs font-mono block">{f}</code>
                      ))}
                    </div>
                  )}

                  <div className="text-xs text-purple-300 bg-purple-900/10 border border-purple-800/30 rounded p-2">
                    ⚡ AI: {sp.ai}
                  </div>
                  <div className="text-xs text-gray-400">Team: {sp.team}</div>
                  {sp.failures && (
                    <div className="flex gap-4">
                      <div>
                        <div className="text-xs text-red-400 mb-1">Common Failures</div>
                        {sp.failures.map((f, i) => <div key={i} className="text-xs text-red-300">• {f}</div>)}
                      </div>
                      <div>
                        <div className="text-xs text-green-400 mb-1">Corrective Actions</div>
                        {sp.actions?.map((a, i) => <div key={i} className="text-xs text-green-300">✓ {a}</div>)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
