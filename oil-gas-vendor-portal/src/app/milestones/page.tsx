'use client';
import { useEffect, useState } from 'react';

interface Milestone { id: number; milestone_name: string; due_date: string; completion_pct: number; status: string; payment_amount_cad: number; vendor_name: string; }

const statusColor: Record<string, string> = {
  complete: 'text-green-400',
  'in-progress': 'text-yellow-400',
  pending: 'text-gray-400',
  overdue: 'text-red-400',
};

export default function MilestonesPage() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    fetch('/api/milestones').then((r) => r.json()).then((d) => setMilestones(d.milestones || []));
  }, []);

  const totalPayment = milestones.filter((m) => m.status === 'complete').reduce((s, m) => s + parseFloat(String(m.payment_amount_cad || 0)), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Milestone Tracking</h1>
        <p className="text-gray-400 text-sm mt-1">Project milestones, completion %, and payment triggers</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Milestones', value: milestones.length },
          { label: 'Complete', value: milestones.filter((m) => m.status === 'complete').length },
          { label: 'In Progress', value: milestones.filter((m) => m.status === 'in-progress').length },
          { label: 'Payments Triggered CAD', value: `$${(totalPayment / 1000).toFixed(0)}K` },
        ].map((k) => (
          <div key={k.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
            <div className="text-2xl font-bold text-white">{k.value}</div>
            <div className="text-xs text-gray-400 mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {milestones.map((m) => (
          <div key={m.id} className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-white font-medium">{m.milestone_name}</div>
                <div className="text-gray-500 text-xs">Due: {m.due_date} · Payment: ${Number(m.payment_amount_cad).toLocaleString()} CAD</div>
              </div>
              <span className={`text-sm font-medium capitalize ${statusColor[m.status] || 'text-gray-400'}`}>{m.status}</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Completion</span>
                <span>{m.completion_pct}%</span>
              </div>
              <div className="h-2 bg-[#1e2a45] rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${m.status === 'complete' ? 'bg-green-500' : m.status === 'in-progress' ? 'bg-yellow-500' : 'bg-gray-600'}`}
                  style={{ width: `${m.completion_pct}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
