'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface KPI { label: string; value: number | string; color: string; unit?: string }

export default function DataScienceAIDashboard() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentJobs, setRecentJobs] = useState<{ job_name: string; completed_at: string; status: string }[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/departments/overview').then((r) => r.json()).catch(() => null),
      fetch('/api/departments/bot-log').then((r) => r.json()).catch(() => null),
    ]).then(([overview, botLog]) => {
      const deptData = overview?.departments?.find((d: { slug: string }) => d.slug === 'data-science-ai');
      const totalBotCalls = botLog?.entries?.length ?? 0;
      const ragChunks = deptData?.rag_chunks ?? 0;
      const jobRuns = overview?.kpis?.jobs_running ?? 0;

      setKpis([
        { label: 'Model Count (Ollama)',  value: '—',         color: 'text-amber-400',  unit: 'models' },
        { label: 'Job Runs (All Depts)',  value: jobRuns,     color: 'text-blue-400',   unit: 'running' },
        { label: 'RAG Queries (this dept)', value: ragChunks, color: 'text-purple-400', unit: 'chunks' },
        { label: 'Ollama Bot Calls',      value: totalBotCalls, color: 'text-green-400', unit: 'calls' },
      ]);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-gray-100 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-amber-400">🧠 Data Science & AI</h1>
          <p className="text-gray-400 text-sm mt-1">Cross-cutting — AI models, RAG pipelines, Ollama integrations</p>
        </div>
        <div className="flex gap-2">
          <Link href="/departments/data-science-ai/bot" className="px-3 py-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-sm hover:bg-amber-500/30 transition-colors">
            🤖 Bot
          </Link>
          <Link href="/departments/dashboard" className="px-3 py-1.5 bg-[#1e2a45] text-gray-300 rounded-lg text-sm hover:bg-[#253456] transition-colors">
            ← All Depts
          </Link>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4 animate-pulse h-24" />
            ))
          : kpis.map((k) => (
              <div key={k.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
                <div className={`text-2xl font-bold ${k.color}`}>{k.value}</div>
                <div className="text-xs text-gray-400 mt-1">{k.label}</div>
                {k.unit && <div className="text-xs text-gray-600">{k.unit}</div>}
              </div>
            ))}
      </div>

      {/* Info panel */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-amber-400 mb-3">AI Infrastructure Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {[
            { label: 'Ollama Endpoint', value: process.env.NEXT_PUBLIC_OLLAMA_URL ?? 'localhost:11434', status: 'configured' },
            { label: 'ChromaDB (RAG)',  value: process.env.NEXT_PUBLIC_CHROMA_URL ?? 'localhost:8000',  status: 'configured' },
            { label: 'Vector Store',    value: 'ogo_rag_chunk table',                                   status: 'active' },
          ].map((item) => (
            <div key={item.label} className="bg-[#0a0e1a] rounded-lg p-3">
              <div className="text-gray-400 text-xs mb-1">{item.label}</div>
              <div className="text-gray-200 font-mono text-xs">{item.value}</div>
              <span className="inline-block mt-1 px-2 py-0.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded text-xs">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Bot Logs */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-amber-400 mb-3">Recent Ollama Bot Calls</h2>
        {recentJobs.length === 0 ? (
          <p className="text-gray-500 text-sm">No bot log entries yet. Start using department bots to populate this.</p>
        ) : (
          <div className="space-y-2">
            {recentJobs.map((j, i) => (
              <div key={i} className="flex items-center justify-between bg-[#0a0e1a] rounded-lg p-3 text-xs">
                <span className="text-gray-300">{j.job_name}</span>
                <span className="text-gray-500">{new Date(j.completed_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
