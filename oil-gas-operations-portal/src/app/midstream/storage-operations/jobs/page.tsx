'use client';
import { useEffect, useState } from 'react';

interface JobRun { id: number; job_name: string; status: string; started_at: string; finished_at: string; rows_processed: number; }

const JOBS = [
  { id: 'storage-utilization', name: 'Utilization Trend', desc: 'Monthly volume stored by commodity and state', schedule: '0 7 1 * *' },
  { id: 'storage-low-inventory', name: 'Low Inventory Alert', desc: 'Flag states with below-average monthly volumes', schedule: '0 6 * * *' },
  { id: 'storage-seasonal', name: 'Seasonal Patterns', desc: 'Quarter-over-quarter volume analysis', schedule: '0 8 1 */3 *' },
];

export default function StorageOperationsJobsPage() {
  const [history, setHistory] = useState<JobRun[]>([]);
  const [running, setRunning] = useState<string | null>(null);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const loadHistory = () => fetch('/api/midstream/storage-operations/jobs/run').then(r => r.json()).then(d => setHistory(d.history ?? []));
  useEffect(() => { loadHistory(); }, []);

  const runJob = async (jobId: string) => {
    setRunning(jobId); setResult(null);
    try {
      setResult(await (await fetch('/api/midstream/storage-operations/jobs/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ job_id: jobId }) })).json());
      await loadHistory();
    } finally { setRunning(null); }
  };

  return (
    <div className="space-y-6 p-6">
      <div><h1 className="text-2xl font-bold text-white">Storage Operations — Jobs</h1><p className="text-gray-400 text-sm mt-1">Production and storage trend analysis jobs</p></div>
      <div className="grid grid-cols-3 gap-4">
        {JOBS.map((job) => (
          <div key={job.id} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <div className="text-xs text-amber-400 font-mono mb-2">{job.schedule}</div>
            <div className="text-white font-semibold mb-1">{job.name}</div>
            <div className="text-xs text-gray-400 mb-4">{job.desc}</div>
            <button onClick={() => runJob(job.id)} disabled={running === job.id}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold py-1.5 rounded-lg text-sm">
              {running === job.id ? 'Running…' : '▶ Run Now'}
            </button>
          </div>
        ))}
      </div>
      {result && (<div className="bg-[#0f1629] border border-amber-500/30 rounded-xl p-4"><div className="text-amber-400 font-semibold mb-2">Last Run Result</div><pre className="text-xs text-gray-300 overflow-x-auto">{JSON.stringify(result, null, 2)}</pre></div>)}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <h2 className="font-semibold text-white mb-3">Execution History</h2>
        {history.length === 0 ? <div className="text-gray-500 text-sm text-center py-6">No runs yet.</div> : (
          <table className="w-full text-xs text-gray-300">
            <thead><tr className="border-b border-[#1e2a45]">{['Job','Status','Started','Finished','Rows'].map(h => <th key={h} className="text-left py-2 pr-4 text-amber-400 font-semibold">{h}</th>)}</tr></thead>
            <tbody>{history.map((r) => (<tr key={r.id} className="border-b border-[#1e2a45]/30"><td className="py-1.5 pr-4">{r.job_name}</td><td className="py-1.5 pr-4"><span className={r.status==='success'?'text-green-400':r.status==='running'?'text-amber-400':'text-red-400'}>{r.status}</span></td><td className="py-1.5 pr-4 text-gray-500">{r.started_at?new Date(r.started_at).toLocaleString():'—'}</td><td className="py-1.5 pr-4 text-gray-500">{r.finished_at?new Date(r.finished_at).toLocaleString():'—'}</td><td className="py-1.5 pr-4">{r.rows_processed?.toLocaleString()??'—'}</td></tr>))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
