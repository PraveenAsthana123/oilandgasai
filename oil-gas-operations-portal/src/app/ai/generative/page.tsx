'use client';

import { useState } from 'react';

const CONTENT_TYPES = [
  {
    id: 'daily_production',
    label: 'Daily Production Report',
    icon: '📊',
    fields: [
      { key: 'date', label: 'Date', placeholder: 'e.g. 2026-10-16' },
      { key: 'facility', label: 'Facility', placeholder: 'e.g. Platform Alpha, Refinery Unit 1' },
      { key: 'notes', label: 'Key Highlights', placeholder: 'e.g. Production 95,000 bpd, compressor trip at 14:30, restored 16:00' },
    ],
  },
  {
    id: 'weekly_safety',
    label: 'Weekly Safety Report',
    icon: '⛑️',
    fields: [
      { key: 'date', label: 'Week Ending', placeholder: 'e.g. 2026-10-18' },
      { key: 'notes', label: 'Safety Events', placeholder: 'e.g. 2 near-misses (dropped object, vehicle speeding), 47 safety observations, 0 recordable incidents' },
    ],
  },
  {
    id: 'monthly_maintenance',
    label: 'Monthly Maintenance Summary',
    icon: '🔧',
    fields: [
      { key: 'month', label: 'Month', placeholder: 'e.g. October 2026' },
      { key: 'facility', label: 'Facility', placeholder: 'e.g. Drilling Rig, Refinery Unit 3' },
      { key: 'notes', label: 'Key Maintenance Details', placeholder: 'e.g. PM completion 94%, 12 corrective WOs, MTBF improved to 2,400 hrs' },
    ],
  },
  {
    id: 'incident_rca',
    label: 'Incident RCA (5-Whys)',
    icon: '⚠️',
    fields: [
      { key: 'incident_type', label: 'Incident Type', placeholder: 'e.g. Compressor surge trip, Pipe flange leak, Forklift collision' },
      { key: 'date', label: 'Date', placeholder: 'e.g. 2026-10-15' },
      { key: 'notes', label: 'Description', placeholder: 'e.g. Centrifugal compressor C-101 surged at 22:15, trip activated, production lost for 4 hours' },
    ],
  },
  {
    id: 'regulatory_compliance',
    label: 'Regulatory Compliance Report',
    icon: '📋',
    fields: [
      { key: 'period', label: 'Reporting Period', placeholder: 'e.g. Q3 2026' },
      { key: 'notes', label: 'Regulatory Scope', placeholder: 'e.g. EPA, OSHA 1910, API RP 14C, PHMSA 195' },
    ],
  },
  {
    id: 'safe_work_procedure',
    label: 'Safe Work Procedure',
    icon: '🛡️',
    fields: [
      { key: 'task', label: 'Task', placeholder: 'e.g. Pump mechanical seal replacement, Heat exchanger bundle removal' },
      { key: 'equipment', label: 'Equipment', placeholder: 'e.g. Centrifugal pump, shell-and-tube exchanger' },
      { key: 'notes', label: 'Known Hazards', placeholder: 'e.g. Hydrocarbon release, rotating equipment, high temperature surfaces, H2S exposure' },
    ],
  },
  {
    id: 'anomaly_explanation',
    label: 'Anomaly Explanation',
    icon: '🔍',
    fields: [
      { key: 'notes', label: 'Anomaly Reading', placeholder: 'e.g. Compressor suction pressure dropped from 45 to 32 psi in 10 min, flow rate constant, inlet temp rose 8°C' },
    ],
  },
  {
    id: 'rca_5whys',
    label: 'Root Cause Analysis (5-Whys)',
    icon: '🌊',
    fields: [
      { key: 'notes', label: 'Problem Statement', placeholder: 'e.g. Heat exchanger E-201 fouling rate doubled in 3 months, requiring cleaning every 6 weeks instead of 3 months' },
    ],
  },
  {
    id: 'meeting_minutes',
    label: 'Meeting Minutes',
    icon: '📝',
    fields: [
      { key: 'meeting_type', label: 'Meeting Type', placeholder: 'e.g. Daily Operations Review, HAZOP Study, Project Kickoff' },
      { key: 'date', label: 'Date', placeholder: 'e.g. 2026-10-16' },
      { key: 'notes', label: 'Discussion Points', placeholder: 'e.g. - Reviewed production shortfall, identified compressor issue as root cause; Action: Operations to replace seal by Friday; - Discussed Q4 turnaround schedule' },
    ],
  },
];

export default function GenerativeAIPage() {
  const [selectedType, setSelectedType] = useState(CONTENT_TYPES[0].id);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ content: string; model: string; gen_ms: number; word_count: number } | null>(null);
  const [error, setError] = useState('');

  const contentType = CONTENT_TYPES.find(c => c.id === selectedType) ?? CONTENT_TYPES[0];

  async function generate() {
    setGenerating(true);
    setResult(null);
    setError('');
    try {
      const resp = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_type: selectedType, inputs }),
      });
      const data = await resp.json() as {
        ok: boolean; result: string; model: string; generation_ms: number; word_count: number; error?: string; _mock?: boolean;
      };
      if (!data.ok || data.error || data._mock) {
        setError(data.result || data.error || 'Generation failed');
      } else {
        setResult({ content: data.result, model: data.model, gen_ms: data.generation_ms, word_count: data.word_count });
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setGenerating(false);
    }
  }

  function copyToClipboard() {
    if (result?.content) {
      navigator.clipboard.writeText(result.content).catch(() => {});
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs text-amber-500/70 uppercase tracking-wider mb-1">AI / Generative</div>
        <h1 className="text-2xl font-bold text-white">Generative AI</h1>
        <p className="text-gray-400 text-sm mt-1">
          AI-powered content generation for O&G operations · Ollama LLM · Saved to ogo_generated_content
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: content type selector */}
        <div className="space-y-1">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Content Type</div>
          {CONTENT_TYPES.map(ct => (
            <button
              key={ct.id}
              onClick={() => { setSelectedType(ct.id); setResult(null); setError(''); setInputs({}); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedType === ct.id
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-gray-400 hover:bg-[#1e2a45] hover:text-gray-200'
              }`}>
              <span className="mr-2">{ct.icon}</span>
              {ct.label}
            </button>
          ))}
        </div>

        {/* Right: form + result */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{contentType.icon}</span>
              <div>
                <div className="font-semibold text-white">{contentType.label}</div>
                <div className="text-xs text-gray-500">Fill in the fields below, then click Generate</div>
              </div>
            </div>

            <div className="space-y-3">
              {contentType.fields.map(field => (
                <div key={field.key}>
                  <label className="block text-xs text-gray-500 mb-1">{field.label}</label>
                  {field.key === 'notes' ? (
                    <textarea
                      value={inputs[field.key] ?? ''}
                      onChange={e => setInputs(prev => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      rows={3}
                      className="w-full bg-[#0a0e1a] border border-[#1e2a45] text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50 placeholder-gray-600 resize-none"
                    />
                  ) : (
                    <input
                      type="text"
                      value={inputs[field.key] ?? ''}
                      onChange={e => setInputs(prev => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full bg-[#0a0e1a] border border-[#1e2a45] text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50 placeholder-gray-600"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={generate}
                disabled={generating}
                className="px-5 py-2 bg-amber-500 text-black font-semibold rounded-lg text-sm hover:bg-amber-400 disabled:opacity-50 transition-colors">
                {generating ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⟳</span> Generating…
                  </span>
                ) : '✨ Generate with Ollama'}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-amber-400 text-sm">
              {error}
            </div>
          )}

          {result && (
            <div className="bg-[#0f1629] border border-green-500/20 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2a45] bg-green-500/5">
                <div className="flex items-center gap-3">
                  <span className="text-green-400 text-sm font-semibold">Generated {contentType.label}</span>
                  <span className="text-xs text-gray-600">
                    {result.word_count} words · {result.gen_ms}ms · {result.model}
                  </span>
                </div>
                <button onClick={copyToClipboard}
                  className="text-xs text-gray-400 hover:text-gray-200 px-2 py-1 bg-[#1e2a45] rounded">
                  📋 Copy
                </button>
              </div>
              <div className="p-4">
                <pre className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed font-sans max-h-96 overflow-y-auto">
                  {result.content}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
