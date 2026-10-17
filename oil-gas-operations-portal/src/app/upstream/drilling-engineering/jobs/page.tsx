'use client';
import { useEffect, useState } from 'react';

interface JobRun { id: number; job_name: string; status: string; rows_processed: number; started_at: string; completed_at: string; }

export default function DrillingJobsPage() {
  const [history, setHistory] = useState<JobRun[]>([]);
  const [running, setRunning] = useState(false);
  const [lastRun, setLastRun] = useState<JobRun | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    // Use dashboard endpoint to check state — history from job_run table
    try {
      const r = await fetch('/api/upstream/drilling-engineering/dashboard');
      const d = await r.json();
      if (d.kpis) setHistory(prev => prev.length > 0 ? prev : []);
    } catch { /* skip */ }
    setLoading(false);
  };

  useEffect(() => { fetchHistory(); }, []);

  const runJob = async () => {
    setRunning(true);
    try {
      const r = await fetch('/api/upstream/drilling-engineering/jobs/run', { method: 'POST' });
      const result: JobRun = await r.json();
      setLastRun(result);
      setHistory(prev => [result, ...prev.slice(0, 9)]);
    } catch { /* skip */ }
    setRunning(false);
  };

  const jobs = [
    { name: 'upstream_drilling_import', schedule: '0 2 * * *', description: 'Import drilling gas peaks CSV into ogo_drill_metric', lastRun: lastRun?.completed_at ?? 'Never run', status: lastRun?.status ?? 'pending' },
    { name: 'upstream_drilling_aggregate', schedule: '0 3 * * *', description: 'Aggregate gas peak statistics by depth bucket', lastRun: 'Not yet automated', status: 'pending' },
    { name: 'upstream_drilling_anomaly', schedule: '0 4 * * *', description: 'Flag high-gas readings (>10000 ppm) as anomalies', lastRun: 'Not yet automated', status: 'pending' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-gray-300 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-amber-400 mb-2">Drilling Engineering — Jobs</h1>
        <p className="text-gray-500 mb-6 text-sm">Scheduled data processing jobs for drilling gas peak data pipeline</p>

        {/* Job Cards */}
        <div className="grid gap-4 mb-8">
          {jobs.map(job => (
            <div key={job.name} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">{job.name}</h3>
                  <p className="text-sm text-gray-400 mb-2">{job.description}</p>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>Schedule: <span className="font-mono text-amber-300">{job.schedule}</span></span>
                    <span>Last run: <span className="text-gray-300">{typeof job.lastRun === 'string' && job.lastRun.includes('T') ? new Date(job.lastRun).toLocaleString() : job.lastRun}</span></span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${job.status === 'success' ? 'bg-green-900/40 text-green-400' : job.status === 'error' ? 'bg-red-900/40 text-red-400' : 'bg-yellow-900/40 text-yellow-400'}`}>
                    {job.status}
                  </span>
                  {job.name === 'upstream_drilling_import' && (
                    <button onClick={runJob} disabled={running} className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold rounded-lg text-xs transition-colors">
                      {running ? 'Running...' : 'Run Now'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Execution History */}
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
          <h2 className="text-base font-semibold text-white mb-4">Execution History</h2>
          {loading ? (
            <p className="text-gray-500 text-sm">Loading...</p>
          ) : history.length === 0 && !lastRun ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm mb-3">No job runs recorded yet.</p>
              <button onClick={runJob} disabled={running} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold rounded-lg text-sm">
                {running ? 'Running...' : 'Run Import Job'}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-[#1e2a45]">
                  {['Job Name','Status','Rows Processed','Started At','Completed At'].map(h => (
                    <th key={h} className="py-2 px-3 text-amber-400 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {history.map((run, i) => (
                    <tr key={i} className="border-b border-[#1e2a45]/50">
                      <td className="py-2 px-3 font-mono text-gray-300">{run.job_name}</td>
                      <td className="py-2 px-3"><span className={`px-2 py-0.5 rounded text-xs ${run.status === 'success' ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>{run.status}</span></td>
                      <td className="py-2 px-3 text-amber-300">{run.rows_processed?.toLocaleString()}</td>
                      <td className="py-2 px-3 text-gray-400">{run.started_at ? new Date(run.started_at).toLocaleString() : '-'}</td>
                      <td className="py-2 px-3 text-gray-400">{run.completed_at ? new Date(run.completed_at).toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
