'use client';
const activities = [
  { type: 'Call', desc: 'Discovery call with Sarah Chen — WestCoast Drilling', date: '2026-10-14', user: 'JS' },
  { type: 'Email', desc: 'Sent proposal follow-up to Enbridge procurement', date: '2026-10-13', user: 'JS' },
  { type: 'Meeting', desc: 'Site visit at Syncrude facility — needs assessment', date: '2026-10-11', user: 'JS' },
  { type: 'Task', desc: 'Prepare ROI analysis for CNRL maintenance proposal', date: '2026-10-16', user: 'JS' },
];
export default function SalesActivitiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Activities</h1>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm">+ Log Activity</button>
      </div>
      <div className="space-y-3">
        {activities.map((a, i) => (
          <div key={i} className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-3 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${a.type === 'Call' ? 'bg-blue-900 text-blue-400' : a.type === 'Email' ? 'bg-green-900 text-green-400' : a.type === 'Meeting' ? 'bg-purple-900 text-purple-400' : 'bg-yellow-900 text-yellow-400'}`}>{a.type[0]}</div>
            <div className="flex-1">
              <div className="text-white text-sm">{a.desc}</div>
              <div className="text-gray-500 text-xs">{a.date} · {a.user}</div>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded border ${a.type === 'Call' ? 'border-blue-700 text-blue-400' : a.type === 'Email' ? 'border-green-700 text-green-400' : a.type === 'Meeting' ? 'border-purple-700 text-purple-400' : 'border-yellow-700 text-yellow-400'}`}>{a.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
