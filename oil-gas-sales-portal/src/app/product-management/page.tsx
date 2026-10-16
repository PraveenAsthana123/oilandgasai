'use client';

const ROADMAP = [
  { quarter: 'Q4 2026', features: ['Core sales pipeline', 'Lead management', 'Pricing engine', 'AI proposals', 'ROI calculator'], status: 'in_progress' },
  { quarter: 'Q1 2027', features: ['Mobile responsive', 'Email notifications', 'DocuSign integration', 'Advanced forecasting'], status: 'planned' },
  { quarter: 'Q2 2027', features: ['ERP integration', 'Multi-currency', 'Territory management', 'Partner portal'], status: 'planned' },
];

const STORIES = [
  { id: 'US-001', title: 'As a sales rep, I can track all leads in one place', priority: 'high', status: 'done', points: 8 },
  { id: 'US-002', title: 'As a sales rep, I can generate AI proposals', priority: 'high', status: 'done', points: 13 },
  { id: 'US-003', title: 'As a manager, I can view revenue forecasts', priority: 'medium', status: 'done', points: 5 },
  { id: 'US-004', title: 'As a customer, I can view my invoices', priority: 'medium', status: 'done', points: 3 },
  { id: 'US-005', title: 'As an admin, I can toggle features on/off', priority: 'low', status: 'done', points: 2 },
];

export default function ProductManagementPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">Product Management</h1>
      <div className="space-y-3">
        {ROADMAP.map(r => (
          <div key={r.quarter} className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-white">{r.quarter}</div>
              <span className={`text-xs px-2 py-0.5 rounded ${r.status === 'in_progress' ? 'bg-yellow-800 text-yellow-300' : 'bg-blue-800 text-blue-300'}`}>{r.status}</span>
            </div>
            <div className="flex flex-wrap gap-2">{r.features.map(f => <span key={f} className="text-xs bg-[#1e2a45] text-slate-300 px-2 py-0.5 rounded">{f}</span>)}</div>
          </div>
        ))}
      </div>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1e2a45]"><h2 className="text-sm font-semibold text-white">User Stories</h2></div>
        <table className="w-full text-sm">
          <thead><tr className="text-xs text-slate-500 border-b border-[#1e2a45] bg-[#0a0e1a]"><th className="text-left px-4 py-2">ID</th><th className="text-left px-4 py-2">Story</th><th className="text-left px-4 py-2">Priority</th><th className="text-left px-4 py-2">Status</th><th className="text-left px-4 py-2">Points</th></tr></thead>
          <tbody>
            {STORIES.map(s => (
              <tr key={s.id} className="border-b border-[#1e2a45]/40">
                <td className="px-4 py-2 text-blue-400">{s.id}</td>
                <td className="px-4 py-2 text-slate-300 text-xs">{s.title}</td>
                <td className="px-4 py-2"><span className={`text-xs px-1.5 rounded ${s.priority === 'high' ? 'bg-red-900 text-red-300' : s.priority === 'medium' ? 'bg-yellow-900 text-yellow-300' : 'bg-slate-700 text-slate-300'}`}>{s.priority}</span></td>
                <td className="px-4 py-2"><span className="text-xs bg-emerald-800 text-emerald-300 px-1.5 rounded">{s.status}</span></td>
                <td className="px-4 py-2 text-slate-400">{s.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
