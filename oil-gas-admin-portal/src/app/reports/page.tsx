'use client';
import { useEffect, useState } from 'react';

interface ReportData {
  users_by_role: { role: string; count: string }[];
  top_actions: { action: string; count: string }[];
  incidents_by_type: { incident_type: string; count: string }[];
  compliance_by_status: { status: string; count: string }[];
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports').then(r => r.json()).then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>;

  const maxCount = (arr: { count: string }[]) => Math.max(...arr.map(r => parseInt(r.count, 10)), 1);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Admin Analytics</h1>
        <p className="text-gray-400 text-sm mt-1">Active users by role, audit actions, incidents, compliance — all from real DB aggregations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Role */}
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Active Users by Role</h2>
          <div className="space-y-3">
            {(data?.users_by_role ?? []).map(r => (
              <div key={r.role}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300 capitalize">{r.role}</span>
                  <span className="text-gray-400">{r.count}</span>
                </div>
                <div className="h-2 bg-[#1e2a45] rounded-full">
                  <div className="h-2 bg-red-500 rounded-full transition-all" style={{ width: `${(parseInt(r.count, 10) / maxCount(data?.users_by_role ?? [])) * 100}%` }} />
                </div>
              </div>
            ))}
            {!data?.users_by_role?.length && <div className="text-gray-500 text-sm">No data — initialize DB</div>}
          </div>
        </div>

        {/* Top Actions */}
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Top Audit Actions</h2>
          <div className="space-y-3">
            {(data?.top_actions ?? []).map(r => (
              <div key={r.action}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">{r.action}</span>
                  <span className="text-gray-400">{r.count}</span>
                </div>
                <div className="h-2 bg-[#1e2a45] rounded-full">
                  <div className="h-2 bg-blue-500 rounded-full transition-all" style={{ width: `${(parseInt(r.count, 10) / maxCount(data?.top_actions ?? [])) * 100}%` }} />
                </div>
              </div>
            ))}
            {!data?.top_actions?.length && <div className="text-gray-500 text-sm">No data — initialize DB</div>}
          </div>
        </div>

        {/* Incidents by Type */}
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Incidents by Type</h2>
          <div className="space-y-3">
            {(data?.incidents_by_type ?? []).map(r => (
              <div key={r.incident_type}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300 capitalize">{r.incident_type.replace(/_/g, ' ')}</span>
                  <span className="text-gray-400">{r.count}</span>
                </div>
                <div className="h-2 bg-[#1e2a45] rounded-full">
                  <div className="h-2 bg-yellow-500 rounded-full transition-all" style={{ width: `${(parseInt(r.count, 10) / maxCount(data?.incidents_by_type ?? [])) * 100}%` }} />
                </div>
              </div>
            ))}
            {!data?.incidents_by_type?.length && <div className="text-gray-500 text-sm">No data — initialize DB</div>}
          </div>
        </div>

        {/* Compliance Status */}
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Compliance by Status</h2>
          <div className="space-y-3">
            {(data?.compliance_by_status ?? []).map(r => {
              const colorMap: Record<string, string> = { compliant: 'bg-green-500', attention_required: 'bg-yellow-500', non_compliant: 'bg-red-500' };
              return (
                <div key={r.status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300 capitalize">{r.status.replace(/_/g, ' ')}</span>
                    <span className="text-gray-400">{r.count}</span>
                  </div>
                  <div className="h-2 bg-[#1e2a45] rounded-full">
                    <div className={`h-2 rounded-full transition-all ${colorMap[r.status] ?? 'bg-gray-500'}`} style={{ width: `${(parseInt(r.count, 10) / maxCount(data?.compliance_by_status ?? [])) * 100}%` }} />
                  </div>
                </div>
              );
            })}
            {!data?.compliance_by_status?.length && <div className="text-gray-500 text-sm">No data — initialize DB</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
