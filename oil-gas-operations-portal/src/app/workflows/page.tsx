'use client';

import { useState, useEffect } from 'react';

interface WorkflowStep {
  step: number;
  name: string;
  description: string;
}

interface Template {
  id: number;
  name: string;
  dept: string;
  steps: WorkflowStep[];
}

interface Instance {
  id: number;
  template_id: number;
  template_name: string;
  title: string;
  current_step: number;
  status: string;
  template_steps: WorkflowStep[];
  created_at: string;
  updated_at: string;
}

interface Stats {
  active: number;
  completed_month: number;
  overdue: number;
  templates_count: number;
}

const STATUS_COLORS: Record<string, string> = {
  active: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  completed: 'text-green-400 bg-green-500/10 border-green-500/30',
  overdue: 'text-red-400 bg-red-500/10 border-red-500/30',
  paused: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
};

export default function WorkflowsPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [instances, setInstances] = useState<Instance[]>([]);
  const [stats, setStats] = useState<Stats>({ active: 0, completed_month: 0, overdue: 0, templates_count: 0 });
  const [mock, setMock] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [instanceTitle, setInstanceTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [advancingId, setAdvancingId] = useState<number | null>(null);

  function loadData() {
    fetch('/api/workflows')
      .then(r => r.json())
      .then(d => {
        setTemplates(d.templates || []);
        setInstances(d.instances || []);
        setStats(d.stats || { active: 0, completed_month: 0, overdue: 0, templates_count: 0 });
        if (d._mock) setMock(true);
      })
      .catch(() => setMock(true));
  }

  useEffect(() => { loadData(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTemplate || !instanceTitle) return;
    setCreating(true);
    try {
      const res = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_id: selectedTemplate, title: instanceTitle }),
      });
      const data = await res.json();
      if (data.instance) { loadData(); setShowCreate(false); setInstanceTitle(''); setSelectedTemplate(null); }
    } catch {}
    setCreating(false);
  }

  async function advanceStep(inst: Instance) {
    const tpl = templates.find(t => t.id === inst.template_id);
    if (!tpl) return;
    const totalSteps = tpl.steps.length;
    const nextStep = inst.current_step + 1;
    const newStatus = nextStep >= totalSteps ? 'completed' : 'active';
    setAdvancingId(inst.id);
    try {
      await fetch('/api/workflows', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: inst.id, current_step: nextStep, status: newStatus }),
      });
      loadData();
    } catch {}
    setAdvancingId(null);
  }

  return (
    <main className="min-h-screen bg-[#0a0e1a] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center text-2xl">🔄</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-100">Workflow Engine</h1>
              <p className="text-gray-500 text-sm">Well approval, permit to work, MOC, incident workflows</p>
            </div>
            {mock && <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-1 rounded">⚠️ DB offline</span>}
          </div>
          <button onClick={() => setShowCreate(s => !s)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-sm">
            + Launch Workflow
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Active Instances', value: stats.active, icon: '▶️', color: 'text-blue-400' },
            { label: 'Completed (month)', value: stats.completed_month, icon: '✅', color: 'text-green-400' },
            { label: 'Overdue', value: stats.overdue, icon: '⚠️', color: 'text-red-400' },
            { label: 'Templates', value: stats.templates_count, icon: '📋', color: 'text-amber-400' },
          ].map(k => (
            <div key={k.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">{k.icon}</div>
              <div className={`text-2xl font-bold ${k.color}`}>{k.value}</div>
              <div className="text-gray-500 text-xs">{k.label}</div>
            </div>
          ))}
        </div>

        {/* Launch form */}
        {showCreate && (
          <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-100 mb-4">Launch Workflow Instance</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-xs mb-1">Workflow Template *</label>
                <select required value={selectedTemplate || ''} onChange={e => setSelectedTemplate(Number(e.target.value))}
                  className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-amber-500/50">
                  <option value="">Select template…</option>
                  {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">Instance Title *</label>
                <input required value={instanceTitle} onChange={e => setInstanceTitle(e.target.value)}
                  placeholder="e.g. Well #14 Drilling Approval"
                  className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-amber-500/50" />
              </div>
              {selectedTemplate && (() => {
                const tpl = templates.find(t => t.id === selectedTemplate);
                return tpl ? (
                  <div className="sm:col-span-2 bg-[#0a0e1a] rounded-lg p-3 border border-[#1e2a45]">
                    <div className="text-gray-500 text-xs mb-2 uppercase tracking-wider">Steps preview</div>
                    <div className="flex flex-wrap gap-2">
                      {tpl.steps.map((s, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold">{s.step}</span>
                          <span className="text-gray-400 text-xs">{s.name}</span>
                          {i < tpl.steps.length - 1 && <span className="text-gray-700 mx-1">→</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}
              <div className="sm:col-span-2 flex gap-3">
                <button type="submit" disabled={creating}
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-sm disabled:opacity-50">
                  {creating ? 'Launching…' : 'Launch Workflow'}
                </button>
                <button type="button" onClick={() => setShowCreate(false)}
                  className="px-6 py-2 bg-[#1e2a45] text-gray-300 hover:text-white rounded-lg text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Active Instances */}
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl mb-6">
          <div className="px-5 py-4 border-b border-[#1e2a45] flex items-center justify-between">
            <h2 className="text-gray-200 font-semibold">Active Workflow Instances</h2>
            <span className="text-gray-500 text-sm">{instances.length} total</span>
          </div>
          {instances.length === 0 ? (
            <div className="p-10 text-center text-gray-600">No workflow instances yet. Launch one above.</div>
          ) : (
            <div className="divide-y divide-[#1e2a45]/50">
              {instances.map(inst => {
                const steps = inst.template_steps as WorkflowStep[] || [];
                const total = steps.length;
                const current = Math.min(inst.current_step, total);
                const pct = total > 0 ? Math.round((current / total) * 100) : 0;
                const currentStepName = current < total ? steps[current]?.name : 'Complete';
                return (
                  <div key={inst.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-gray-100 font-medium text-sm">{inst.title}</span>
                          <span className={`px-2 py-0.5 rounded border text-xs font-medium ${STATUS_COLORS[inst.status] || 'text-gray-400'}`}>
                            {inst.status}
                          </span>
                        </div>
                        <div className="text-gray-500 text-xs mb-2">{inst.template_name} · Step {current}/{total} · {currentStepName}</div>
                        {/* Progress bar */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-[#1e2a45] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-gray-500 text-xs w-8 text-right">{pct}%</span>
                        </div>
                        {/* Step dots */}
                        <div className="flex gap-1 mt-2">
                          {steps.map((s, i) => (
                            <div key={i} title={s.name}
                              className={`h-1.5 flex-1 rounded-full ${i < current ? 'bg-amber-500' : i === current ? 'bg-amber-500/40' : 'bg-[#1e2a45]'}`} />
                          ))}
                        </div>
                      </div>
                      {inst.status === 'active' && current < total && (
                        <button
                          onClick={() => advanceStep(inst)}
                          disabled={advancingId === inst.id}
                          className="flex-shrink-0 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 text-xs rounded-lg transition-colors disabled:opacity-50"
                        >
                          {advancingId === inst.id ? '…' : 'Advance →'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Templates */}
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl">
          <div className="px-5 py-4 border-b border-[#1e2a45]">
            <h2 className="text-gray-200 font-semibold">Workflow Templates</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
            {templates.map(t => (
              <div key={t.id} className="bg-[#0a0e1a] border border-[#1e2a45] rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-gray-100 font-semibold text-sm">{t.name}</div>
                    <div className="text-gray-500 text-xs mt-0.5">{t.dept} · {t.steps?.length || 0} steps</div>
                  </div>
                  <button
                    onClick={() => { setSelectedTemplate(t.id); setShowCreate(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="text-xs px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 rounded-lg"
                  >
                    Use
                  </button>
                </div>
                <div className="space-y-1">
                  {(t.steps || []).map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="w-4 h-4 rounded-full bg-[#1e2a45] text-gray-400 flex items-center justify-center text-xs font-bold flex-shrink-0">{s.step}</span>
                      <span>{s.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
