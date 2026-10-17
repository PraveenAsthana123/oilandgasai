'use client';
import { useEffect, useState } from 'react';

export default function ScadaProcessPage() {
  const [openSection, setOpenSection] = useState<string | null>('alarm-handling');
  const [_data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch('/api/midstream/scada').then(r => r.json()).then(d => setData(d.metrics));
  }, []);

  const alarmStates = [
    { state: 'Normal', color: 'green', next: 'Abnormal', condition: 'Tag value within normal operating range', action: 'No action required' },
    { state: 'Abnormal', color: 'red', next: 'Acknowledged', condition: 'Tag value breaches alarm setpoint limit', action: 'Alarm annunciated — operator must respond within response time' },
    { state: 'Acknowledged', color: 'yellow', next: 'Resolved', condition: 'Operator has seen alarm but tag still in abnormal state', action: 'Diagnose root cause — take corrective action' },
    { state: 'Shelved', color: 'blue', next: 'Abnormal / Normal', condition: 'Operator temporarily suspends alarm (max 24 hr)', action: 'Document reason — auto-unshelves after timeout — ISA-18.2 tracks all shelved alarms' },
    { state: 'Suppressed', color: 'purple', next: 'Normal (upon trigger clear)', condition: 'Alarm disabled because associated equipment is offline (permissive)', action: 'Re-enables automatically when equipment restarts — tracked in alarm management system' },
    { state: 'Resolved', color: 'gray', next: 'Normal', condition: 'Tag returned to normal range and alarm cleared', action: 'Record resolution in alarm management log — root cause if P1/P2' },
  ];

  const leakDetectionMethods = [
    {
      method: 'Mass Balance',
      description: 'Qin − Qout − ΔStorage = Leak. Compares measured inlet and outlet flow over a time window.',
      sensitivity: '1–3% of nominal flow rate',
      response: '15–60 min (depends on pipe volume and flow rates)',
      strength: 'Simple, always on, covers entire pipeline',
      weakness: 'Low sensitivity for small leaks, affected by line pack changes',
      kaggle: 'pipeline-operations dataset (pressure, temperature, grade — can train mass balance anomaly model)',
    },
    {
      method: 'Pressure Point Analysis (PPA)',
      description: 'Compares real-time pressure readings at multiple RTU stations against expected hydraulic gradient.',
      sensitivity: '0.5–1% of nominal flow',
      response: '5–20 min',
      strength: 'Good for larger leaks, identifies approximate location along pipeline',
      weakness: 'Affected by pump transients, batch interface changes, ambient temperature effects',
      kaggle: null,
    },
    {
      method: 'Real-Time Transient Model (RTTM)',
      description: 'Hydraulic pipeline simulator running in real-time. Compares simulated vs measured pressures and flows to detect discrepancies.',
      sensitivity: '0.25–0.5% of nominal flow',
      response: '2–10 min',
      strength: 'Highest sensitivity, provides leak location estimate (±500 m), handles transients gracefully',
      weakness: 'Requires accurate pipe model (friction factors, elevations), computationally intensive, high maintenance',
      kaggle: null,
    },
    {
      method: 'Statistical Process Control (SPC/CUSUM/EWMA)',
      description: 'Tracks cumulative sum (CUSUM) or exponentially weighted moving average (EWMA) of normalized residuals from individual sensor readings.',
      sensitivity: 'Can detect 0.1% anomalies after enough accumulation',
      response: '30–120 min (depends on leak rate and control chart sensitivity)',
      strength: 'Detects slow, gradual leaks that other methods miss',
      weakness: 'Slow response for large sudden leaks, needs good baseline, false positives from operational changes',
      kaggle: 'environmental-telemetry (ts, device, co, lpg — directly analogous for CUSUM anomaly detection on sensor time series)',
    },
  ];

  const cyberSecurityThreats = [
    { threat: 'Unauthorized Remote Access', risk: 'High', method: 'Brute-force OPC/Modbus protocol, VPN credential theft, RDP exploit', control: 'Multi-factor authentication on VPN + OT network, role-based access, session recording' },
    { threat: 'Malware / Ransomware on HMI', risk: 'Critical', method: 'USB-borne malware, phishing email on IT network bridging to OT', control: 'Air gap or DMZ between IT/OT, whitelist-only execution on SCADA servers, regular patching' },
    { threat: 'False Data Injection (FDI)', risk: 'High', method: 'Attacker modifies sensor readings to cause incorrect operator response or hide real leak', control: 'Cross-validate sensors against physics-based model, anomaly detection on sensor patterns' },
    { threat: 'Denial of Service (DoS) on RTUs', risk: 'High', method: 'Flood RTU with protocol commands → overwhelm CPU → data loss to SCADA', control: 'Rate limiting on all protocol connections, redundant communication paths' },
    { threat: 'Supply Chain / Firmware Attack', risk: 'Medium', method: 'Compromised firmware update on RTU or SCADA server component', control: 'Signed firmware updates, hardware security modules, SBOM (software bill of materials) tracking' },
  ];

  const aiModels = [
    {
      name: 'Leak Detection System',
      tech: 'Statistical ML + pressure wave analysis',
      desc: 'Compares inlet vs outlet mass balance (integrated from fiscal meters) plus pressure transient pattern recognition. Calculates leak probability (0–100%) and estimated leak location (km from reference point). Threshold: >70% probability triggers P1 alarm. Validated against API 1130 requirements.',
      inputs: ['Upstream/downstream flow meters (m³/hr)', 'Pressure at all RTU stations (bar)', 'Temperature at key points (°C)', 'Hydraulic model residuals from RTTM'],
      outputs: ['Leak probability %', 'Estimated leak rate (m³/hr)', 'Estimated leak location (km)', 'Confidence interval (±km)'],
      kaggle: 'environmental-telemetry — ts, co, lpg, smoke (directly analogous sensor anomaly detection training)',
    },
    {
      name: 'Alarm Rationalization Engine',
      tech: 'ML classification (Random Forest + rule engine)',
      desc: 'Classifies each incoming alarm across two dimensions: Category (Safety / Process / Equipment / Diagnostic) and Type (Genuine / Nuisance-chattering / Spurious-transient). Suppresses chattering alarms (same alarm activating >3 times in 10 minutes), prioritizes safety alarms, reduces total alarm load per ISA-18.2 target (<150 standing alarms per operator). Learns from operator response history.',
      inputs: ['Alarm tag, priority, setpoint, current value', 'Time since last activation', 'Operator response time and action', 'Equipment state (running / standby / maintenance)'],
      outputs: ['Alarm classification label', 'Suppression recommendation (Y/N + duration)', 'Priority adjustment recommendation', 'Rationalization report (monthly)'],
      kaggle: null,
    },
    {
      name: 'Process Variable Forecaster',
      tech: 'LSTM (Long Short-Term Memory) time series',
      desc: 'Predicts all key SCADA process variables 30 minutes into the future using 90-day rolling training window. Enables proactive operator response before alarm threshold is reached. Uncertainty bounds shown on HMI trend. Model retrained weekly on latest data.',
      inputs: ['Last 4 hours of all key SCADA tags at 1-minute intervals', 'Current setpoints and control mode', 'Time of day, ambient temperature (correlated factors)'],
      outputs: ['Forecast value (5, 15, 30 min ahead)', 'Upper/lower 95% confidence bounds', 'Trend direction label (rising/stable/falling)', 'Time-to-alarm estimate (min) if trend continues'],
      kaggle: 'environmental-telemetry (ts, device, co, lpg — multi-variate time series LSTM training)',
    },
    {
      name: 'Cybersecurity Anomaly Detector',
      tech: 'Statistical baseline + ML one-class SVM',
      desc: 'Establishes normal SCADA command patterns for each operator and RTU connection. Detects unusual remote access patterns, unusual command sequences, unusual protocol traffic volumes. Raises alert to OT Security team without interrupting operations. Complements NERC CIP cybersecurity controls.',
      inputs: ['SCADA server login/command audit log', 'RTU connection timestamps and command types', 'Protocol traffic volume (Modbus, DNP3, OPC-DA)', 'Operator identity, role, time of day'],
      outputs: ['Anomaly score per session', 'Alert to OT SOC (Security Operations Center)', 'Forensic event timeline for investigation', 'Monthly threat summary report'],
      kaggle: null,
    },
  ];

  const sections = [
    { id: 'alarm-handling', title: 'Alarm Handling Decision Flow' },
    { id: 'alarm-states', title: 'Alarm State Machine' },
    { id: 'leak-detection', title: 'Leak Detection Methods' },
    { id: 'cybersecurity', title: 'OT Cybersecurity Threats & Controls' },
    { id: 'ai-models', title: 'AI Models in Detail' },
    { id: 'scada-kpis', title: 'SCADA KPIs & Regulatory' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <span className="text-amber-400 font-mono text-sm font-bold bg-amber-500/10 px-2 py-0.5 rounded">P-MS-04</span>
          <h1 className="text-2xl font-bold text-white">SCADA & Control Process</h1>
        </div>
        <p className="text-gray-400 text-sm">
          Pipeline SCADA monitoring, alarm management, leak detection, and OT cybersecurity
        </p>
        <div className="flex gap-4 mt-2 text-xs text-gray-500">
          <span>🖥️ 20,000+ real-time data points</span>
          <span>🤖 4 AI models</span>
          <span>📊 Kaggle: environmental-telemetry, pipeline-operations</span>
        </div>
      </div>

      {/* Alarm Handling Decision Flow SVG */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-6">
        <h2 className="text-xs font-semibold text-amber-400 mb-4 uppercase tracking-wider">Alarm Handling Decision Flow</h2>
        <div className="space-y-2">
          {[
            { step: 'Sensor triggers alarm', color: 'amber', indent: 0, branch: false },
            { step: 'Level 1: Is it a nuisance/chattering alarm?', color: 'blue', indent: 0, branch: true },
            { step: 'YES → Suppress alarm. Log to nuisance alarm register. Schedule rationalization review.', color: 'gray', indent: 1, branch: false },
            { step: 'NO → Continue to Level 2 assessment', color: 'amber', indent: 1, branch: false },
            { step: 'Level 2: Is it a Safety alarm (P1)?', color: 'red', indent: 0, branch: true },
            { step: 'YES → Activate Emergency Shutdown Sequence. Notify control room supervisor. Initiate ERP.', color: 'red', indent: 1, branch: false },
            { step: 'NO → Continue to Level 3 operator response', color: 'amber', indent: 1, branch: false },
            { step: 'Level 3: Operator Acknowledgement Required', color: 'yellow', indent: 0, branch: false },
            { step: 'Operator diagnoses root cause (with AI Process Variable Forecaster assist)', color: 'blue', indent: 1, branch: false },
            { step: 'Operator takes corrective action (setpoint change, valve adjustment, start standby pump)', color: 'blue', indent: 1, branch: false },
            { step: 'Verify: does parameter return to normal range within expected time?', color: 'yellow', indent: 1, branch: true },
            { step: 'YES → Close alarm. Log response time and action taken.', color: 'green', indent: 2, branch: false },
            { step: 'NO → Escalate to P2 → involve field technician → update incident log', color: 'orange', indent: 2, branch: false },
          ].map((item, i) => (
            <div
              key={i}
              className={`text-xs py-2 px-3 rounded border ${
                item.color === 'amber' ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' :
                item.color === 'red' ? 'bg-red-500/10 border-red-500/30 text-red-300' :
                item.color === 'yellow' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300' :
                item.color === 'blue' ? 'bg-blue-500/10 border-blue-500/30 text-blue-300' :
                item.color === 'green' ? 'bg-green-500/10 border-green-500/30 text-green-300' :
                item.color === 'orange' ? 'bg-orange-500/10 border-orange-500/30 text-orange-300' :
                'bg-gray-500/10 border-gray-500/30 text-gray-400'
              }`}
              style={{ marginLeft: item.indent * 24 }}
            >
              {item.branch && <span className="mr-1 font-bold">?</span>}
              {item.step}
            </div>
          ))}
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex flex-wrap gap-2">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setOpenSection(openSection === s.id ? null : s.id)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              openSection === s.id
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                : 'bg-[#0f1629] border-[#1e2a45] text-gray-400 hover:text-amber-400 hover:border-amber-500/30'
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>

      {/* Alarm State Machine */}
      {openSection === 'alarm-states' && (
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          <h2 className="text-sm font-semibold text-amber-400 mb-4">Alarm State Machine (ISA-18.2 Compliant)</h2>
          {/* SVG State Diagram */}
          <div className="overflow-x-auto mb-4">
            <svg viewBox="0 0 900 120" className="w-full min-w-[700px]" style={{ height: 120 }}>
              <defs>
                <marker id="arrowSM" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L6,3 z" fill="#9ca3af" />
                </marker>
              </defs>
              {[
                { x: 10, label: 'Normal', color: '#166534', border: '#22c55e' },
                { x: 170, label: 'Abnormal', color: '#7f1d1d', border: '#ef4444' },
                { x: 340, label: 'Acknowledged', color: '#713f12', border: '#eab308' },
                { x: 520, label: 'Shelved', color: '#1e3a5f', border: '#3b82f6' },
                { x: 690, label: 'Resolved', color: '#1f2937', border: '#6b7280' },
              ].map((s, i) => (
                <g key={i}>
                  <rect x={s.x} y={30} width={145} height={55} rx="8" fill={s.color} stroke={s.border} strokeWidth="1.5" />
                  <foreignObject x={s.x + 4} y={33} width={137} height={49}>
                    <div className="flex items-center justify-center h-full">
                      <span style={{ fontSize: 12, color: '#f3f4f6', fontWeight: 600 }}>{s.label}</span>
                    </div>
                  </foreignObject>
                  {i < 4 && (
                    <line x1={s.x + 148} y1={57} x2={s.x + 163} y2={57} stroke="#9ca3af" strokeWidth="1.5" markerEnd="url(#arrowSM)" />
                  )}
                </g>
              ))}
              {/* Return arrow from Resolved to Normal */}
              <path d="M840,87 Q440,105 155,87" fill="none" stroke="#22c55e" strokeWidth="1" strokeDasharray="4,4" markerEnd="url(#arrowSM)" />
              <text x="450" y="105" textAnchor="middle" fill="#22c55e" fontSize="9">Parameter returns to normal range</text>
            </svg>
          </div>
          <div className="space-y-2">
            {alarmStates.map((as, i) => (
              <div key={i} className="flex items-start gap-3 text-xs border border-[#1e2a45] rounded p-2">
                <div className={`shrink-0 w-24 font-bold ${
                  as.color === 'green' ? 'text-green-400' : as.color === 'red' ? 'text-red-400' :
                  as.color === 'yellow' ? 'text-yellow-400' : as.color === 'blue' ? 'text-blue-400' :
                  as.color === 'purple' ? 'text-purple-400' : 'text-gray-400'
                }`}>{as.state}</div>
                <div className="text-gray-500 shrink-0 w-36">{as.condition}</div>
                <div className="text-gray-400">{as.action}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leak Detection Methods */}
      {openSection === 'leak-detection' && (
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          <h2 className="text-sm font-semibold text-amber-400 mb-4">Leak Detection Methods — API 1130 Comparison</h2>
          <div className="space-y-3">
            {leakDetectionMethods.map((ldm, i) => (
              <div key={i} className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg p-3">
                <div className="text-sm font-semibold text-white mb-1">{ldm.method}</div>
                <div className="text-xs text-gray-400 mb-2">{ldm.description}</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <div><span className="text-amber-400">Sensitivity: </span><span className="text-gray-400">{ldm.sensitivity}</span></div>
                  <div><span className="text-amber-400">Response time: </span><span className="text-gray-400">{ldm.response}</span></div>
                  <div><span className="text-green-400">Strength: </span><span className="text-gray-400">{ldm.strength}</span></div>
                  <div><span className="text-red-400">Weakness: </span><span className="text-gray-400">{ldm.weakness}</span></div>
                </div>
                {ldm.kaggle && (
                  <div className="mt-2 text-xs text-blue-400">📊 Kaggle: {ldm.kaggle}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cybersecurity */}
      {openSection === 'cybersecurity' && (
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          <h2 className="text-sm font-semibold text-amber-400 mb-4">OT Cybersecurity Threats & Controls (NERC CIP aligned)</h2>
          <div className="space-y-2">
            {cyberSecurityThreats.map((ct, i) => (
              <div key={i} className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg p-3">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-white font-medium text-sm">{ct.threat}</span>
                  <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                    ct.risk === 'Critical' ? 'bg-red-500/20 text-red-400' :
                    ct.risk === 'High' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>{ct.risk}</span>
                </div>
                <div className="text-xs text-gray-500 mb-1">Attack vector: {ct.method}</div>
                <div className="text-xs text-green-400">Controls: {ct.control}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 bg-purple-500/5 border border-purple-500/20 rounded-lg p-3">
            <div className="text-xs font-semibold text-purple-400 mb-1">Regulatory Framework</div>
            <div className="flex flex-wrap gap-1">
              {['NERC CIP-002 through CIP-014 (critical infrastructure protection)', 'IEC 62443 (OT security standard)', 'API 1164 (pipeline SCADA security)', 'NIST CSF (cybersecurity framework)'].map((r, i) => (
                <span key={i} className="text-xs px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded">{r}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Models */}
      {openSection === 'ai-models' && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">AI Models — SCADA Integration Detail</h2>
          {aiModels.map((ai, i) => (
            <div key={i} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-amber-400 text-lg">⚡</span>
                <span className="text-amber-400 font-semibold">{ai.name}</span>
                <span className="text-xs text-gray-500 bg-[#0a0e1a] px-2 py-0.5 rounded">{ai.tech}</span>
              </div>
              <div className="text-sm text-gray-400 mb-3">{ai.desc}</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-semibold text-amber-400 mb-1">Inputs</div>
                  <ul className="space-y-0.5">
                    {ai.inputs.map((inp, j) => (
                      <li key={j} className="text-xs text-gray-400 flex items-start gap-1">
                        <span className="text-amber-500 shrink-0">•</span>{inp}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-xs font-semibold text-amber-400 mb-1">Outputs</div>
                  <ul className="space-y-0.5">
                    {ai.outputs.map((out, j) => (
                      <li key={j} className="text-xs text-gray-400 flex items-start gap-1">
                        <span className="text-green-500 shrink-0">→</span>{out}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {ai.kaggle && (
                <div className="mt-2 text-xs text-blue-400">📊 Kaggle: {ai.kaggle}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* SCADA KPIs */}
      {openSection === 'scada-kpis' && (
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          <h2 className="text-sm font-semibold text-amber-400 mb-4">SCADA KPIs & Regulatory Standards</h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { kpi: 'SCADA system uptime %', target: '≥ 99.9% (8.77 hr downtime/year max)', std: 'Internal SLA' },
              { kpi: 'Standing alarms (per operator)', target: '< 150 alarms at any time', std: 'ISA-18.2' },
              { kpi: 'Alarm response time (P1)', target: '< 5 minutes for Safety alarms', std: 'Internal ERP' },
              { kpi: 'Alarm flood events', target: '< 10 alarms/10 min = flood; target 0 floods/month', std: 'ISA-18.2' },
              { kpi: 'Leak detection sensitivity', target: '≤ 1% of nominal flow rate (RTTM)', std: 'API 1130' },
              { kpi: 'False positive alarms (leak)', target: '≤ 2 per month', std: 'API 1130 Appendix B' },
              { kpi: 'SCADA data historian completeness', target: '> 99.5% all tags recorded', std: 'Internal' },
              { kpi: 'Cybersecurity incidents', target: 'Zero unauthorized access events', std: 'NERC CIP' },
            ].map((k, i) => (
              <div key={i} className="bg-[#0a0e1a] border border-[#1e2a45] rounded p-2 text-xs">
                <div className="text-white font-medium">{k.kpi}</div>
                <div className="text-amber-400 mt-0.5">{k.target}</div>
                <div className="text-gray-500 mt-0.5">Standard: {k.std}</div>
              </div>
            ))}
          </div>
          <div className="text-xs font-semibold text-amber-400 mb-2">Regulatory Standards</div>
          <div className="flex flex-wrap gap-1">
            {['ISA-18.2 (Alarm Management)', 'API 1130 (Computational Pipeline Monitoring)', 'NERC CIP-002 to CIP-014 (cybersecurity)', 'IEC 62443 (OT security)', 'API 1164 (pipeline SCADA security)', 'NIST CSF'].map((r, i) => (
              <span key={i} className="text-xs px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded">{r}</span>
            ))}
          </div>
        </div>
      )}

      {/* SCADA Architecture Overview */}
      {openSection === 'alarm-handling' && (
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          <h2 className="text-sm font-semibold text-amber-400 mb-4">SCADA Architecture — Pipeline Control System</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { layer: 'Field Layer (Level 0-1)', components: ['RTUs (Remote Terminal Units)', 'PLCs (Programmable Logic Controllers)', 'Sensors: P, T, flow, density, vibration', 'Actuators: control valves, motor starters', 'Emergency Shutdown Devices (ESD)'], color: 'amber' },
              { layer: 'Control Layer (Level 2)', components: ['SCADA Master Station (redundant)', 'DCS (Distributed Control System) at compressor stations', 'HMI workstations (Operator Interface)', 'Engineering workstation (tuning)', 'Historian server (OSI PI)'], color: 'blue' },
              { layer: 'Enterprise Layer (Level 3-4)', components: ['Operations database (schedulers/nominations)', 'Pipeline simulation (PIPEQUEST / GREENPIPE)', 'Gas accounting / measurement system', 'Corporate IT network (one-way DMZ to OT)', 'AI/ML analytics platform'], color: 'purple' },
            ].map((layer, i) => (
              <div key={i} className={`bg-[#0a0e1a] border ${
                layer.color === 'amber' ? 'border-amber-500/30' :
                layer.color === 'blue' ? 'border-blue-500/30' : 'border-purple-500/30'
              } rounded-lg p-3`}>
                <div className={`text-xs font-semibold mb-2 ${
                  layer.color === 'amber' ? 'text-amber-400' :
                  layer.color === 'blue' ? 'text-blue-400' : 'text-purple-400'
                }`}>{layer.layer}</div>
                <ul className="space-y-1">
                  {layer.components.map((c, j) => (
                    <li key={j} className="text-xs text-gray-400 flex items-start gap-1">
                      <span className={`shrink-0 ${
                        layer.color === 'amber' ? 'text-amber-500' :
                        layer.color === 'blue' ? 'text-blue-500' : 'text-purple-500'
                      }`}>•</span>{c}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-3 bg-red-500/5 border border-red-500/20 rounded p-3">
            <div className="text-xs font-semibold text-red-400 mb-1">Purdue Model Security Zones</div>
            <div className="text-xs text-gray-400">
              OT (Level 0-2) is physically separated from IT (Level 3-4) by a DMZ (demilitarized zone) or one-way data diode.
              No direct IP routing between OT and corporate network. All data transfer via historian with data diode or
              controlled relay. Remote access via dedicated jump server with MFA + session recording (CyberArk / BeyondTrust).
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
