'use client';
import { useState } from 'react';

const NOTIFICATIONS = [
  { id: 1, key: 'new_rfq', label: 'New RFQ Invitation', desc: 'Notify when a new RFQ is assigned to your company', enabled: true },
  { id: 2, key: 'po_issued', label: 'Purchase Order Issued', desc: 'Notify when a new PO is issued to you', enabled: true },
  { id: 3, key: 'invoice_approved', label: 'Invoice Approved', desc: 'Notify when your invoice is approved for payment', enabled: true },
  { id: 4, key: 'invoice_paid', label: 'Invoice Paid', desc: 'Notify when payment is processed', enabled: true },
  { id: 5, key: 'compliance_expiry', label: 'Compliance Expiry Alert', desc: 'Remind 30/60/90 days before document expiry', enabled: true },
  { id: 6, key: 'performance_review', label: 'Performance Review', desc: 'Notify when quarterly performance review is ready', enabled: false },
  { id: 7, key: 'dispute_update', label: 'Dispute Update', desc: 'Notify on dispute status changes', enabled: true },
  { id: 8, key: 'bid_outcome', label: 'Bid Decision', desc: 'Notify when a bid is awarded or declined', enabled: true },
];

export default function NotificationsPage() {
  const [prefs, setPrefs] = useState(NOTIFICATIONS);
  const [saved, setSaved] = useState(false);
  const [channel, setChannel] = useState('email');

  const toggle = (id: number) => setPrefs((p) => p.map((n) => n.id === id ? { ...n, enabled: !n.enabled } : n));

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Notification Preferences</h1>
        <p className="text-gray-400 text-sm mt-1">Control how and when you receive notifications</p>
      </div>

      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
        <h2 className="text-white font-semibold mb-3">Notification Channel</h2>
        <div className="flex gap-3">
          {['email', 'sms', 'in-app'].map((c) => (
            <button key={c} onClick={() => setChannel(c)} className={`px-4 py-2 rounded-lg text-sm capitalize border ${channel === c ? 'bg-purple-600 border-purple-500 text-white' : 'border-[#1e2a45] text-gray-400 hover:border-purple-500'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4 space-y-3">
        <h2 className="text-white font-semibold">Event Notifications</h2>
        {prefs.map((n) => (
          <div key={n.id} className="flex items-center justify-between py-2 border-b border-[#1e2a45] last:border-0">
            <div>
              <div className="text-white text-sm">{n.label}</div>
              <div className="text-gray-500 text-xs">{n.desc}</div>
            </div>
            <button onClick={() => toggle(n.id)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${n.enabled ? 'bg-purple-600' : 'bg-[#1e2a45]'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${n.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        ))}
      </div>

      <button onClick={() => setSaved(true)} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg text-sm font-medium">
        Save Preferences
      </button>
      {saved && <span className="text-green-400 text-sm ml-3">✓ Preferences saved</span>}
    </div>
  );
}
