'use client';

import { useState, useEffect, useRef } from 'react';

type LogEntry = { source: string; ts: string; level: string; msg: string; detail: string; stream: string };

const SOURCES = ['all', 'agent', 'job', 'incident'];
const SEVERITIES = ['', 'info', 'warning', 'error', 'completed', 'failed', 'running', 'critical', 'high'];
const STREAMS = ['', 'upstream', 'midstream', 'downstream'];

const LEVEL_COLORS: Record<string, string> = {
  info: 'bg-blue-500/20 text-blue-400',
  warning: 'bg-amber-500/20 text-amber-400',
  error: 'bg-red-500/20 text-red-400',
  critical: 'bg-red-600/30 text-red-300',
  completed: 'bg-green-500/20 text-green-400',
  failed: 'bg-red-500/20 text-red-400',
  running: 'bg-blue-500/20 text-blue-300',
  high: 'bg-orange-500/20 text-orange-400',
  pending: 'bg-gray-500/20 text-gray-400',
};

const SOURCE_ICONS: Record<string, string> = {
  agent: '🤖', job: '⚙️', incident: '⚠️', default: '📝',
};

function exportCSV(logs: LogEntry[]) {
  const header = 'timestamp,source,level,message,detail,stream';
  const rows = logs.map(l =>
    [l.ts, l.source, l.level, `"${(l.msg ?? '').replace(/"/g, '""')}"`, `"${(l.detail ?? '').replace(/"/g, '""')}"`, l.stream].join(',')
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ogo_logs_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function formatTs(ts: string) {
  try { return new Date(ts).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }); } catch { return ts; }
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState('all');
  const [severity, setSeverity] = useState('');
  const [stream, setStream] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [total, setTotal] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function loadLogs() {
    const params = new URLSearchParams({ source, limit: '500' });
    if (severity) params.set('severity', severity);
    if (stream) params.set('stream', stream);
    try {
      const resp = await fetch(`/api/logs?${params}`);
      const data = await resp.json() as { logs: LogEntry[]; total: number };
      setLogs(data.logs ?? []);
      setTotal(data.total ?? 0);
    } catch { /* ignore */ }
    setLoading(false);
  }

  useEffect(() => {
    setLoading(true);
    loadLogs();
  }, [source, severity, stream]);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(loadLogs, 10000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoRefresh, source, severity, stream]);

  function toggleExpand(i: number) {
    setExpanded(prev => {
      const n = new Set(prev);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs text-amber-500/70 uppercase tracking-wider mb-1">Operations</div>
          <h1 className="text-2xl font-bold text-white">Logs & Tracking</h1>
          <p className="text-gray-400 text-sm mt-1">
            Unified log viewer · Agent runs · Jobs · Incidents · {total} entries
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setAutoRefresh(r => !r)}
            className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
              autoRefresh
                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                : 'bg-[#1e2a45] text-gray-400 border-[#1e2a45] hover:text-gray-200'
            }`}>
            {autoRefresh ? '⏸ Auto-refresh ON' : '▶ Auto-refresh (10s)'}
          </button>
          <button onClick={() => exportCSV(logs)}
            className="px-3 py-1.5 rounded-lg text-xs border bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30 transition-colors">
            ↓ Export CSV
          </button>
          <button onClick={() => { setLoading(true); loadLogs(); }}
            className="px-3 py-1.5 rounded-lg text-xs border bg-[#1e2a45] text-gray-400 border-[#1e2a45] hover:text-gray-200 transition-colors">
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap items-center">
        <div className="flex gap-1">
          {SOURCES.map(s => (
            <button key={s} onClick={() => setSource(s)}
              className={`px-3 py-1 rounded text-xs capitalize transition-colors ${
                source === s ? 'bg-amber-500 text-black font-bold' : 'bg-[#1e2a45] text-gray-400 hover:text-gray-200'
              }`}>
              {SOURCE_ICONS[s] ?? '📝'} {s}
            </button>
          ))}
        </div>
        <select value={severity} onChange={e => setSeverity(e.target.value)}
          className="bg-[#0a0e1a] border border-[#1e2a45] text-gray-300 text-xs rounded px-2 py-1.5">
          <option value="">All Severities</option>
          {SEVERITIES.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={stream} onChange={e => setStream(e.target.value)}
          className="bg-[#0a0e1a] border border-[#1e2a45] text-gray-300 text-xs rounded px-2 py-1.5">
          <option value="">All Streams</option>
          {STREAMS.filter(Boolean).map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      {/* Log table */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
        {loading ? (
          <div className="text-amber-400 text-center py-12 animate-pulse">Loading logs…</div>
        ) : logs.length === 0 ? (
          <div className="text-gray-600 text-center py-12">
            No logs found. Run some jobs or create incidents to see entries here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-[#0a0e1a] border-b border-[#1e2a45]">
                <tr>
                  <th className="py-2 px-3 text-left text-gray-500 font-medium w-36">Timestamp</th>
                  <th className="py-2 px-3 text-left text-gray-500 font-medium w-14">Source</th>
                  <th className="py-2 px-3 text-left text-gray-500 font-medium w-24">Level</th>
                  <th className="py-2 px-3 text-left text-gray-500 font-medium">Message</th>
                  <th className="py-2 px-3 text-left text-gray-500 font-medium w-20">Stream</th>
                  <th className="py-2 px-3 text-left text-gray-500 font-medium w-8"></th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <>
                    <tr key={i}
                      onClick={() => toggleExpand(i)}
                      className={`border-b border-[#1e2a45]/50 cursor-pointer transition-colors ${
                        expanded.has(i) ? 'bg-[#1e2a45]/50' : i % 2 === 0 ? 'bg-[#0f1629]' : 'bg-[#0a0e1a]'
                      } hover:bg-[#1e2a45]/30`}>
                      <td className="py-2 px-3 text-gray-500 whitespace-nowrap">{formatTs(log.ts)}</td>
                      <td className="py-2 px-3">
                        <span className="text-xs">{SOURCE_ICONS[log.source] ?? '📝'}</span>
                        <span className="text-gray-500 ml-1">{log.source}</span>
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-1.5 py-0.5 rounded text-xs ${LEVEL_COLORS[log.level] ?? 'bg-gray-500/20 text-gray-400'}`}>
                          {log.level}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-gray-300 max-w-xs truncate">{log.msg}</td>
                      <td className="py-2 px-3 text-gray-600 capitalize">{log.stream}</td>
                      <td className="py-2 px-3 text-gray-600">{expanded.has(i) ? '▲' : '▼'}</td>
                    </tr>
                    {expanded.has(i) && log.detail && (
                      <tr key={`${i}-detail`} className="bg-[#1e2a45]/30">
                        <td colSpan={6} className="py-2 px-6 text-xs text-gray-400 border-b border-[#1e2a45]/50">
                          <span className="text-gray-600 mr-2">Detail:</span>{log.detail}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {logs.length === 500 && (
        <div className="text-xs text-gray-600 text-center">Showing max 500 entries. Use filters to narrow down.</div>
      )}
    </div>
  );
}
