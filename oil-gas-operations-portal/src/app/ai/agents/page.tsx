'use client';
import { useEffect, useState } from 'react';

interface Task {
  id: number;
  agent_name: string;
  goal: string;
  stream: string;
  status: string;
  confidence: number;
  action_log: Array<{ ts: string; response: string }> | string;
  created_at: string;
}

const STATUS_COLOR: Record<string, string> = {
  completed: 'text-green-400 bg-green-500/10 border-green-500/30',
  needs_review: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  running: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  pending: 'text-gray-400 bg-gray-500/10 border-gray-500/30',
};

export default function AgentsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [form, setForm] = useState({ agent_name: 'inspection-agent', goal: '', stream: 'cross-cutting' });
  const [result, setResult] = useState<{ response: string; confidence: number; status: string } | null>(null);

  useEffect(() => {
    fetch('/api/ai/agents').then(r => r.json()).then(d => {
      setTasks(d.tasks || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const runAgent = async () => {
    setRunning(true);
    setResult(null);
    try {
      const r = await fetch('/api/ai/agents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const d = await r.json();
      setResult({ response: d.response, confidence: d.confidence, status: d.status });
      // Refresh tasks
      const tasks = await fetch('/api/ai/agents').then(r => r.json());
      setTasks(tasks.tasks || []);
    } catch (e) {
      setResult({ response: `Error: ${e}`, confidence: 0, status: 'needs_review' });
    } finally {
      setRunning(false);
    }
  };

  const agents = [
    { name: 'autonomous-inspection-agent', desc: 'Analyzes sensor + CV data to schedule inspection priorities', stream: 'cross-cutting', icon: '🔍' },
    { name: 'predictive-maintenance-agent', desc: 'Monitors asset health scores and dispatches maintenance orders', stream: 'cross-cutting', icon: '🔧' },
    { name: 'optimization-agent', desc: 'Continuously optimizes production, compression, and refinery parameters', stream: 'upstream', icon: '⚡' },
    { name: 'compliance-agent', desc: 'Monitors permit limits, emission targets, and regulatory deadlines', stream: 'downstream', icon: '📋' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Agentic AI</h1>
        <p className="text-gray-400 text-sm mt-1">Autonomous agents powered by Ollama llama3.2 — real fetch to localhost:11434</p>
      </div>

      {/* Available agents */}
      <div className="grid grid-cols-2 gap-4">
        {agents.map((a) => (
          <div key={a.name} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4 cursor-pointer hover:border-amber-500/40 transition-colors"
            onClick={() => setForm({ ...form, agent_name: a.name })}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{a.icon}</span>
              <div>
                <div className={`font-medium text-sm ${form.agent_name === a.name ? 'text-amber-400' : 'text-white'}`}>{a.name}</div>
                <div className="text-xs text-gray-400 mt-1">{a.desc}</div>
                <div className="text-xs text-blue-400/70 mt-1">Stream: {a.stream}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Run agent */}
      <div className="bg-[#0f1629] border border-amber-500/20 rounded-xl p-4">
        <h2 className="font-semibold text-white mb-3">🤖 Dispatch Agent Task (Ollama llama3.2)</h2>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <select value={form.agent_name} onChange={e => setForm({ ...form, agent_name: e.target.value })}
            className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50">
            {agents.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
          </select>
          <select value={form.stream} onChange={e => setForm({ ...form, stream: e.target.value })}
            className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50">
            {['upstream', 'midstream', 'downstream', 'cross-cutting'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={runAgent} disabled={running}
            className="px-4 py-2 bg-amber-500 text-black text-sm font-semibold rounded-lg hover:bg-amber-400 disabled:opacity-50 transition-colors">
            {running ? '⏳ Running...' : '▶ Dispatch Agent'}
          </button>
        </div>
        <textarea value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })}
          placeholder="Agent goal / task description (or leave blank for default diagnostic)"
          className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 h-16 resize-none" />

        {result && (
          <div className={`mt-3 p-3 rounded-lg border text-sm ${STATUS_COLOR[result.status] || ''}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium">Agent Response</span>
              <span className="ml-auto text-xs font-mono">Confidence: {result.confidence}%</span>
              <span className={`text-xs px-2 py-0.5 rounded border ${STATUS_COLOR[result.status]}`}>{result.status}</span>
            </div>
            <div className="text-gray-300 text-xs whitespace-pre-wrap">{result.response}</div>
          </div>
        )}
      </div>

      {/* Task history */}
      {!loading && tasks.length > 0 && (
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          <h2 className="font-semibold text-white mb-3">Task History</h2>
          <div className="space-y-2">
            {tasks.map((task) => {
              const log = Array.isArray(task.action_log) ? task.action_log : (typeof task.action_log === 'string' ? JSON.parse(task.action_log || '[]') : []);
              return (
                <div key={task.id} className="border border-[#1e2a45] rounded-lg p-3 text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gray-300 font-medium">{task.agent_name}</span>
                    <span className="text-gray-500">{task.stream}</span>
                    <span className={`ml-auto px-2 py-0.5 rounded border ${STATUS_COLOR[task.status]}`}>{task.status}</span>
                  </div>
                  {task.goal && <div className="text-gray-400 mb-1">{task.goal}</div>}
                  {log[0]?.response && <div className="text-gray-500 truncate">{log[0].response.substring(0, 120)}...</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
