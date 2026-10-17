'use client';
import { useState, useEffect, useCallback } from 'react';
interface JobRun { id: number; job_name: string; status: string; started_at: string; finished_at: string | null; rows_processed: number; }
const SCHEDULES = [
  { name: 'shipment-status-sync', cron: '*/15 * * * *', desc: 'Live shipment status sync from IoT feed', next: 'Every 15 min' },
  { name: 'delivery-kpi-aggregation', cron: '0 5 * * *', desc: 'Daily delivery performance KPI rollup', next: '05:00 UTC' },
  { name: 'route-optimization-scan', cron: '0 8 * * 1', desc: 'Weekly route optimization analysis', next: 'Monday 08:00 UTC' },
];

export default function LogisticsJobsPage() {
  const [jobs, setJobs] = useState<JobRun[]>([]);
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState<string | null>(null);
  const fetchJobs = useCallback(async () => { setJobs((await (await fetch('/api/downstream/distribution-logistics/jobs/run')).json()).jobs || []); }, []);
  useEffect(() => { fetchJobs(); }, [fetchJobs]);
  const handleRun = async () => { setRunning(true); setRunResult(null); const d = await (await fetch('/api/downstream/distribution-logistics/jobs/run', { method: 'POST' })).json(); setRunResult(d.error ? `Error: ${d.error}` : `Job #${d.job_id} completed — ${d.rows_processed} rows`); setRunning(false); fetchJobs(); };
  const statusColor = (s: string) => s === 'completed' ? 'text-green-400 bg-green-900/30' : s === 'running' ? 'text-amber-400 bg-amber-900/30' : 'text-red-400 bg-red-900/30';

  return (
    <div className="min-h-screen bg-gray-950 text-amber-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8"><div className="flex items-center gap-3 mb-2"><div className="w-3 h-3 rounded-full bg-amber-500" /><span className="text-amber-400 text-sm font-mono uppercase tracking-widest">Downstream / Distribution Logistics</span></div><h1 className="text-3xl font-bold text-amber-300">Job Scheduler</h1><p className="text-gray-400 mt-1">Shipment sync, delivery KPI aggregation, and route optimization jobs.</p></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">{SCHEDULES.map(s=>(
          <div key={s.name} className="bg-gray-900 border border-amber-900/40 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3"><span className="text-xs text-amber-400 font-mono bg-amber-900/20 px-2 py-1 rounded">{s.cron}</span><span className="w-2 h-2 rounded-full bg-green-500" /></div>
            <p className="text-amber-200 font-semibold text-sm mb-1">{s.name}</p><p className="text-gray-500 text-xs mb-3">{s.desc}</p><p className="text-gray-600 text-xs">Next: {s.next}</p>
          </div>
        ))}</div>
        <div className="bg-gray-900 border border-amber-900/40 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between"><div><h2 className="text-amber-400 font-semibold">Manual Run</h2><p className="text-gray-500 text-sm mt-1">Execute shipment-status-sync immediately.</p></div><button onClick={handleRun} disabled={running} className="bg-amber-600 hover:bg-amber-500 disabled:bg-gray-700 text-white font-semibold px-6 py-2 rounded-lg">{running ? 'Running…' : 'Run Now'}</button></div>
          {runResult && <div className={`mt-4 rounded-lg p-3 text-sm ${runResult.startsWith('Error') ? 'bg-red-900/30 text-red-300 border border-red-700' : 'bg-green-900/30 text-green-300 border border-green-700'}`}>{runResult}</div>}
        </div>
        <div className="bg-gray-900 border border-amber-900/40 rounded-xl p-6">
          <h2 className="text-amber-400 font-semibold mb-4">Execution History</h2>
          {jobs.length === 0 ? <div className="text-center text-gray-500 py-8 border border-dashed border-gray-800 rounded-lg">No jobs run yet.</div> : (
            <div className="space-y-3">{jobs.map(j=><div key={j.id} className="flex items-center justify-between bg-gray-800/50 rounded-lg px-4 py-3"><div><p className="text-amber-200 text-sm font-medium">{j.job_name}</p><p className="text-gray-500 text-xs">{new Date(j.started_at).toLocaleString()}</p></div><div className="text-right"><span className={`text-xs font-semibold px-2 py-1 rounded ${statusColor(j.status)}`}>{j.status}</span><p className="text-gray-500 text-xs mt-1">{j.rows_processed} rows</p></div></div>)}</div>
          )}
        </div>
      </div>
    </div>
  );
}
