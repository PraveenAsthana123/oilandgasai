'use client';
export default function CustomerNotificationsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Notifications</h1>
      <a href="/notifications" className="text-purple-400 text-sm">→ Manage notification preferences</a>
      <div className="space-y-2">
        {[
          { msg: 'New RFQ invitation: RFQ-2026-008 — Waste Management Services', time: '2 hours ago', type: 'rfq' },
          { msg: 'Invoice INV-2026-003 approved for payment', time: '1 day ago', type: 'invoice' },
          { msg: 'ISO 45001 certificate expiring in 45 days', time: '3 days ago', type: 'alert' },
        ].map((n, i) => (
          <div key={i} className={`bg-[#0f1629] border rounded-lg p-3 flex gap-3 ${n.type === 'alert' ? 'border-yellow-700' : 'border-[#1e2a45]'}`}>
            <span className="text-xl">{n.type === 'rfq' ? '📋' : n.type === 'invoice' ? '💰' : '⚠️'}</span>
            <div><div className="text-white text-sm">{n.msg}</div><div className="text-gray-500 text-xs">{n.time}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}
