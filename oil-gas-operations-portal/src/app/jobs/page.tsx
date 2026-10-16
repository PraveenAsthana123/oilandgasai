'use client';

import { useState, useEffect } from 'react';

type JobRun = {
  id?: number; job_name?: string; dataset?: string; status?: string;
  started_at?: string; completed_at?: string; result?: Record<string, unknown>; error?: string; created_at?: string;
  // Fields from logs API UNION query
  source?: string; ts?: string; level?: string; msg?: string; detail?: string; stream?: string;
};

const JOBS = [
  { id: 'J01', name: 'Pipeline Corrosion Analysis', dataset: 'pipeline-maintenance/market_pipe_thickness_loss_dataset.csv', icon: '🔩', description: 'Corrosion % by material, condition distribution, thickness loss histogram' },
  { id: 'J02', name: 'Equipment Failure Classification', dataset: 'machine-maintenance/predictive_maintenance.csv', icon: '⚙️', description: 'Failure type frequency, avg tool wear at failure, temperature-failure correlation' },
  { id: 'J03', name: 'Environmental Sensor Replay', dataset: 'environmental-telemetry/iot_telemetry_data.csv', icon: '📡', description: 'Last 100 IoT readings: avg CO/LPG/temp per device, threshold exceedances' },
  { id: 'J04', name: 'Pipeline Incident Analysis', dataset: 'pipeline-accidents/database.csv', icon: '⚠️', description: 'Incidents by cause (top 5), avg barrels released, incidents by state (top 10)' },
  { id: 'J05', name: 'Production Trend Analysis', dataset: 'production-trends/OGORBcsv_cleaned.csv', icon: '📈', description: 'Volume by commodity type, top 5 states by production (first 1000 rows)' },
  { id: 'J06', name: 'Ollama Maintenance Report', dataset: 'J02 results + Ollama', icon: '🤖', description: 'AI-generated 3-paragraph predictive maintenance report from J02 analysis' },
  { id: 'J07', name: 'Daily Safety Briefing', dataset: 'ogo_incident table + Ollama', icon: '⛑️', description: 'AI-generated safety briefing from last 7 days incidents' },
];

const STATUS_COLORS: Record<string, string> = {
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  running: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  failed: 'bg-red-500/20 text-red-400 border-red-500/30',
  pending: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

function MiniBarChart({ data }: { data: Record<string, number | string> }) {
  const entries = Object.entries(data).slice(0, 6);
  const max = Math.max(...entries.map(([, v]) => typeof v === 'number' ? v : parseFloat(String(v)) || 0));
  if (max === 0) return null;
  return (
    <svg width="100%" height="60" viewBox={`0 0 ${entries.length * 60} 60`}>
      {entries.map(([label, val], i) => {
        const h = max > 0 ? ((typeof val === 'number' ? val : parseFloat(String(val)) || 0) / max) * 50 : 0;
        return (
          <g key={i}>
            <rect x={i * 60 + 4} y={55 - h} width={50} height={h} fill="#f59e0b" opacity="0.7" rx="2" />
            <text x={i * 60 + 29} y="59" fill="#9ca3af" fontSize="7" textAnchor="middle">{String(label).slice(0, 8)}</text>
          </g>
        );
      })}
    </svg>
  );
}

export default function JobsPage() {
  const [runningJobs, setRunningJobs] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<Record<string, Record<string, unknown>>>({});
  const [history, setHistory] = useState<JobRun[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    setLoadingHistory(true);
    try {
      const resp = await fetch('/api/logs?source=job&limit=50');
      const data = await resp.json() as { logs: JobRun[] };
      setHistory(data.logs ?? []);
    } catch { /* ignore */ }
    setLoadingHistory(false);
  }

  async function runJob(jobId: string) {
    setRunningJobs(prev => new Set([...prev, jobId]));
    setErrors(prev => { const n = { ...prev }; delete n[jobId]; return n; });

    try {
      const resp = await fetch(`/api/jobs/${jobId}/run`, { method: 'POST' });
      const data = await resp.json() as { ok: boolean; result: Record<string, unknown>; error?: string };
      if (data.ok && data.result) {
        setResults(prev => ({ ...prev, [jobId]: data.result }));
      } else if (data.error) {
        setErrors(prev => ({ ...prev, [jobId]: data.error ?? 'Unknown error' }));
      }
      await loadHistory();
    } catch (e) {
      setErrors(prev => ({ ...prev, [jobId]: String(e) }));
    } finally {
      setRunningJobs(prev => { const n = new Set(prev); n.delete(jobId); return n; });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs text-amber-500/70 uppercase tracking-wider mb-1">Operations</div>
        <h1 className="text-2xl font-bold text-white">Jobs / Demo Runner</h1>
        <p className="text-gray-400 text-sm mt-1">
          Real Kaggle data analysis jobs · Click Run to execute · Results persisted in ogo_job_run
        </p>
      </div>

      {/* Job Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {JOBS.map(job => {
          const isRunning = runningJobs.has(job.id);
          const result = results[job.id];
          const err = errors[job.id];

          return (
            <div key={job.id} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{job.icon}</span>
                  <div>
                    <div className="font-semibold text-white text-sm">{job.id}: {job.name}</div>
                    <div className="text-xs text-gray-500 font-mono">{job.dataset}</div>
                  </div>
                </div>
                <button
                  onClick={() => runJob(job.id)}
                  disabled={isRunning}
                  className="px-3 py-1.5 bg-amber-500 text-black rounded-lg text-xs font-semibold hover:bg-amber-400 disabled:opacity-50 flex-shrink-0 transition-colors">
                  {isRunning ? (
                    <span className="flex items-center gap-1">
                      <span className="animate-spin">⟳</span> Running
                    </span>
                  ) : '▶ Run'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-3">{job.description}</p>

              {err && (
                <div className="bg-red-500/10 border border-red-500/30 rounded p-2 text-xs text-red-400 mb-2">
                  {err}
                </div>
              )}

              {result && (
                <div className="bg-[#0a0e1a] rounded-lg p-3 space-y-2">
                  {result['summary'] != null && (
                    <div className="text-xs text-green-400 font-medium">{String(result['summary'])}</div>
                  )}
                  {typeof result['report'] === 'string' && result['report'] && (
                    <div className="text-xs text-gray-300 whitespace-pre-wrap max-h-32 overflow-y-auto">{result['report']}</div>
                  )}
                  {typeof result['briefing'] === 'string' && result['briefing'] && (
                    <div className="text-xs text-gray-300 whitespace-pre-wrap max-h-32 overflow-y-auto">{result['briefing']}</div>
                  )}
                  {result['avg_corrosion_by_material'] != null && typeof result['avg_corrosion_by_material'] === 'object' && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Avg Corrosion % by Material:</div>
                      <MiniBarChart data={result['avg_corrosion_by_material'] as Record<string, number>} />
                    </div>
                  )}
                  {result['failure_type_frequency'] != null && typeof result['failure_type_frequency'] === 'object' && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Failure Type Frequency:</div>
                      <MiniBarChart data={result['failure_type_frequency'] as Record<string, number>} />
                    </div>
                  )}
                  {result['total_records'] != null && (
                    <div className="text-xs text-gray-500">Records: <span className="text-white">{String(result['total_records']).toLocaleString()}</span></div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* History */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-300">Run History</h2>
          <button onClick={loadHistory} className="text-xs text-amber-400 hover:text-amber-300">↻ Refresh</button>
        </div>
        {loadingHistory ? (
          <div className="text-gray-500 text-xs text-center py-4">Loading history…</div>
        ) : history.length === 0 ? (
          <div className="text-gray-600 text-xs text-center py-4">No job runs yet. Click Run on any job above.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 text-left border-b border-[#1e2a45]">
                  <th className="py-2 pr-4">Job</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Started</th>
                  <th className="py-2">Details</th>
                </tr>
              </thead>
              <tbody>
                {history.map((run, i) => {
                  const displayName = run.msg ?? run.job_name ?? '—';
                  const displayStatus = run.level ?? run.status ?? 'unknown';
                  const displayTs = run.ts ?? run.started_at;
                  const displayDetail = run.detail ?? run.dataset ?? '';
                  const statusKey = run.level ?? run.status ?? '';
                  const statusClass = STATUS_COLORS[statusKey] ?? STATUS_COLORS.pending;
                  return (
                    <tr key={i} className="border-b border-[#0a0e1a] hover:bg-[#1e2a45]/30">
                      <td className="py-2 pr-4 text-gray-300">{displayName}</td>
                      <td className="py-2 pr-4">
                        <span className={`px-2 py-0.5 rounded border text-xs ${statusClass}`}>
                          {displayStatus}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-gray-500">
                        {displayTs ? new Date(displayTs).toLocaleString() : '—'}
                      </td>
                      <td className="py-2 text-gray-600 truncate max-w-xs">{displayDetail}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
