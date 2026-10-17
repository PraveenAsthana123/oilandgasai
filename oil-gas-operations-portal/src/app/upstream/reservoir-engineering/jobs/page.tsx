'use client';
import { useState } from 'react';

interface JobRun { id: number; job_name: string; status: string; rows_processed: number; started_at: string; completed_at: string; }

export default function ReservoirJobsPage() {
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState<JobRun[]>([]);

  const runJob = async () => {
    setRunning(true);
    try {
      const r = await fetch('/api/upstream/reservoir-engineering/jobs/run', { method: 'POST' });
      const result: JobRun = await r.json();
      setHistory(prev => [result, ...prev.slice(0, 9)]);
    } catch { /* skip */ }
    setRunning(false);
  };

  const jobs = [
    { name: 'upstream_reservoir_import', schedule: '0 2 * * *', description: 'Import global reservoir inventory CSV into ogo_rsv_metric', status: history[0]?.status ?? 'pending' },
    { name: 'upstream_reservoir_aggregate', schedule: '0 3 * * *', description: 'Aggregate reserves by basin region and status', status: 'pending' },
    { name: 'upstream_reservoir_rank', schedule: '0 4 * * *', description: 'Rank top 20 reservoirs by proven reserves and capacity', status: 'pending' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-gray-300 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-amber-400 mb-2">Reservoir Engineering — Jobs</h1>
        <p className="text-gray-500 mb-6 text-sm">Scheduled data processing jobs for reservoir inventory pipeline</p>
        <div className="grid gap-4 mb-8">
          {jobs.map(job => (
            <div key={job.name} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">{job.name}</h3>
                  <p className="text-sm text-gray-400 mb-2">{job.description}</p>
                  <span className="text-xs text-gray-500">Schedule: <span className="font-mono text-amber-300">{job.schedule}</span></span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${job.status === 'success' ? 'bg-green-900/40 text-green-400' : 'bg-yellow-900/40 text-yellow-400'}`}>{job.status}</span>
                  {job.name === 'upstream_reservoir_import' && (
                    <button onClick={runJob} disabled={running} className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold rounded-lg text-xs">{running ? 'Running...' : 'Run Now'}</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
          <h2 className="text-base font-semibold text-white mb-4">Execution History</h2>
          {history.length === 0 ? (
            <div className="text-center py-8"><p className="text-gray-500 text-sm mb-3">No job runs yet.</p>
              <button onClick={runJob} disabled={running} className="px-4 py-2 bg-amber-500 text-black font-semibold rounded-lg text-sm">{running ? 'Running...' : 'Run Import Job'}</button>
            </div>
          ) : (
            <div className="overflow-x-auto"><table className="w-full text-xs">
              <thead><tr className="border-b border-[#1e2a45]">{['Job Name','Status','Rows','Started','Completed'].map(h => <th key={h} className="py-2 px-3 text-amber-400 text-left">{h}</th>)}</tr></thead>
              <tbody>{history.map((r, i) => (<tr key={i} className="border-b border-[#1e2a45]/50">
                <td className="py-2 px-3 font-mono text-gray-300">{r.job_name}</td>
                <td className="py-2 px-3"><span className={`px-2 py-0.5 rounded text-xs ${r.status === 'success' ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>{r.status}</span></td>
                <td className="py-2 px-3 text-amber-300">{r.rows_processed}</td>
                <td className="py-2 px-3 text-gray-400">{r.started_at ? new Date(r.started_at).toLocaleString() : '-'}</td>
                <td className="py-2 px-3 text-gray-400">{r.completed_at ? new Date(r.completed_at).toLocaleString() : '-'}</td>
              </tr>))}</tbody>
            </table></div>
          )}
        </div>
      </div>
    </div>
  );
}
