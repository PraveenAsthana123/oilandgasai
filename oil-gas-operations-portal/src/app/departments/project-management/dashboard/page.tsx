'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface JobRow { job_name: string; status: string; completed_at: string | null; rows_processed: number }

export default function ProjectManagementDashboard() {
  const [kpis, setKpis] = useState({ total_jobs: 0, running: 0, success_rate: '—', rag_chunks: 0 });
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/departments/overview').then((r) => r.json()).catch(() => null),
      fetch('/api/jobs').then((r) => r.json()).catch(() => null),
    ]).then(([overview, jobsData]) => {
      const deptSelf = overview?.departments?.find((d: { slug: string }) => d.slug === 'project-management');
      const allJobs: JobRow[] = jobsData?.jobs ?? [];
      const completed = allJobs.filter((j) => j.status === 'completed').length;
      const total = allJobs.length;
      setKpis({
        total_jobs: total,
        running: overview?.kpis?.jobs_running ?? 0,
        success_rate: total > 0 ? `${Math.round((completed / total) * 100)}%` : '—',
        rag_chunks: deptSelf?.rag_chunks ?? 0,
      });
      setJobs(allJobs.slice(0, 10));
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-gray-100 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-amber-400">📋 Project Management</h1>
          <p className="text-gray-400 text-sm mt-1">Cross-cutting — job orchestration, milestones, delivery tracking</p>
        </div>
        <div className="flex gap-2">
          <Link href="/departments/project-management/bot" className="px-3 py-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-sm hover:bg-amber-500/30 transition-colors">
            🤖 Bot
          </Link>
          <Link href="/jobs" className="px-3 py-1.5 bg-[#1e2a45] text-gray-300 rounded-lg text-sm hover:bg-[#253456] transition-colors">
            All Jobs →
          </Link>
          <Link href="/departments/dashboard" className="px-3 py-1.5 bg-[#1e2a45] text-gray-300 rounded-lg text-sm hover:bg-[#253456] transition-colors">
            ← All Depts
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4 animate-pulse h-24" />
            ))
          : [
              { label: 'Total Jobs (ogo_job_run)', value: kpis.total_jobs,   color: 'text-amber-400' },
              { label: 'Currently Running',         value: kpis.running,     color: 'text-blue-400' },
              { label: 'Success Rate',              value: kpis.success_rate, color: 'text-green-400' },
              { label: 'RAG Chunks (this dept)',    value: kpis.rag_chunks,  color: 'text-purple-400' },
            ].map((s) => (
              <div key={s.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-400 mt-1">{s.label}</div>
              </div>
            ))}
      </div>

      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-amber-400 mb-3">Recent Jobs (ogo_job_run)</h2>
        {jobs.length === 0 ? (
          <p className="text-gray-500 text-sm">No job records found. Run demo jobs to populate ogo_job_run.</p>
        ) : (
          <div className="space-y-2">
            {jobs.map((j, i) => (
              <div key={i} className="flex items-center justify-between bg-[#0a0e1a] rounded-lg p-3 text-xs">
                <span className="text-gray-300 font-mono">{j.job_name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500">{j.rows_processed ?? 0} rows</span>
                  <span className={`px-2 py-0.5 rounded border text-xs ${
                    j.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                    j.status === 'running'   ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                    'bg-red-500/20 text-red-400 border-red-500/30'
                  }`}>
                    {j.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
