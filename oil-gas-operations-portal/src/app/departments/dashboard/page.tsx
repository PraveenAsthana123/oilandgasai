'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Stream = 'upstream' | 'midstream' | 'downstream' | 'cross-cutting';

interface DeptData {
  slug: string;
  name: string;
  stream: Stream;
  metric_count: number;
  last_job_run: string | null;
  rag_chunks: number;
  bot_queries: number;
}

interface KPIs {
  total_departments: number;
  data_imported: number;
  jobs_running: number;
  avg_bot_usage: number;
}

interface OverviewResponse {
  kpis: KPIs;
  departments: DeptData[];
}

const STREAM_COLORS: Record<Stream, { badge: string; border: string; text: string }> = {
  upstream:       { badge: 'bg-amber-500/20 text-amber-400 border-amber-500/40',  border: 'border-amber-500/30',  text: 'text-amber-400' },
  midstream:      { badge: 'bg-blue-500/20 text-blue-400 border-blue-500/40',     border: 'border-blue-500/30',   text: 'text-blue-400' },
  downstream:     { badge: 'bg-green-500/20 text-green-400 border-green-500/40',  border: 'border-green-500/30',  text: 'text-green-400' },
  'cross-cutting':{ badge: 'bg-purple-500/20 text-purple-400 border-purple-500/40', border: 'border-purple-500/30', text: 'text-purple-400' },
};

const STREAM_TABS = ['All', 'Upstream', 'Midstream', 'Downstream', 'Cross-cutting'] as const;

function timeAgo(ts: string | null): string {
  if (!ts) return 'Never';
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function streamPath(dept: DeptData): string {
  if (dept.stream === 'cross-cutting') return 'departments';
  return dept.stream;
}

export default function DepartmentsIntelligenceCentre() {
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('All');

  useEffect(() => {
    fetch('/api/departments/overview')
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, []);

  const filtered = data?.departments.filter((d) => {
    if (activeTab === 'All') return true;
    return d.stream.toLowerCase() === activeTab.toLowerCase().replace('-', '-');
  }) ?? [];

  const kpis = data?.kpis;

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-gray-100 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-amber-400">🏭 Departments Intelligence Centre</h1>
        <p className="text-gray-400 text-sm mt-1">24 departments × 3 streams — real-time data status</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Departments', value: kpis?.total_departments ?? 24, color: 'text-amber-400' },
          { label: 'Data Imported',     value: kpis?.data_imported ?? '—',    color: 'text-green-400' },
          { label: 'Jobs Running',      value: kpis?.jobs_running ?? '—',     color: 'text-blue-400' },
          { label: 'Avg Bot Usage',     value: kpis?.avg_bot_usage ?? '—',    color: 'text-purple-400' },
        ].map((k) => (
          <div key={k.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <div className={`text-2xl font-bold ${k.color}`}>{loading ? '…' : k.value}</div>
            <div className="text-xs text-gray-400 mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Stream Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {STREAM_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              activeTab === tab
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'text-gray-400 border-[#1e2a45] hover:bg-[#1e2a45] hover:text-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/40 rounded-xl p-4 mb-6 text-red-400 text-sm">
          Failed to load: {error}
        </div>
      )}

      {/* Dept Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5 animate-pulse h-48" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((dept) => {
            const sc = STREAM_COLORS[dept.stream];
            const basePath = `/${streamPath(dept)}/${dept.slug}`;
            return (
              <div
                key={dept.slug}
                className={`bg-[#0f1629] border ${sc.border} rounded-xl p-5 hover:bg-[#111827] transition-colors`}
              >
                {/* Title row */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-100 text-sm leading-tight">{dept.name}</h3>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs border ${sc.badge}`}>
                      {dept.stream}
                    </span>
                  </div>
                  <div className={`text-xs font-medium ${dept.metric_count > 0 ? 'text-green-400' : 'text-gray-500'}`}>
                    {dept.metric_count > 0 ? `${dept.metric_count.toLocaleString()} rows` : 'No data'}
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                  <div className="bg-[#0a0e1a] rounded-lg p-2">
                    <div className="text-xs text-gray-400">Last Job</div>
                    <div className="text-xs font-medium text-gray-200 mt-0.5">{timeAgo(dept.last_job_run)}</div>
                  </div>
                  <div className="bg-[#0a0e1a] rounded-lg p-2">
                    <div className="text-xs text-gray-400">Bot Queries</div>
                    <div className="text-xs font-medium text-blue-400 mt-0.5">{dept.bot_queries}</div>
                  </div>
                  <div className="bg-[#0a0e1a] rounded-lg p-2">
                    <div className="text-xs text-gray-400">RAG Chunks</div>
                    <div className="text-xs font-medium text-purple-400 mt-0.5">{dept.rag_chunks}</div>
                  </div>
                </div>

                {/* Quick links */}
                <div className="flex gap-1.5 flex-wrap">
                  {[
                    { label: 'Data',      path: `${basePath}/data` },
                    { label: 'Jobs',      path: `${basePath}/jobs` },
                    { label: 'Dashboard', path: `${basePath}/dashboard` },
                    { label: 'Bot',       path: `${basePath}/bot` },
                    { label: 'RAG',       path: `${basePath}/rag` },
                  ].map((link) => (
                    <Link
                      key={link.label}
                      href={link.path}
                      className="px-2 py-1 bg-[#1e2a45] hover:bg-[#253456] text-gray-300 hover:text-gray-100 rounded text-xs transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-500">No departments found for selected stream.</div>
      )}
    </div>
  );
}
