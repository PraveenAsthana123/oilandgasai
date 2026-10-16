'use client';
import { useState } from 'react';

const EVENT_TYPES = [
  { key: 'delivery_alert', label: 'Delivery Alerts', desc: 'When your delivery status changes' },
  { key: 'invoice_ready', label: 'Invoice Ready', desc: 'When a new invoice is generated' },
  { key: 'quality_cert', label: 'Quality Certificate', desc: 'When an assay report is available' },
  { key: 'contract_renewal', label: 'Contract Renewal', desc: '90 days before contract expiry' },
  { key: 'safety_alert', label: 'Safety Alerts', desc: 'Critical safety and operational alerts' },
  { key: 'system_maintenance', label: 'System Maintenance', desc: 'Planned maintenance windows' },
];

interface Pref { email: boolean; sms: boolean; in_app: boolean }

export default function NotificationsPage() {
  const [prefs, setPrefs] = useState<Record<string, Pref>>(() =>
    Object.fromEntries(EVENT_TYPES.map(e => [e.key, { email: true, sms: false, in_app: true }]))
  );
  const [saved, setSaved] = useState(false);

  function toggle(key: string, channel: keyof Pref) {
    setPrefs(p => ({ ...p, [key]: { ...p[key], [channel]: !p[key][channel] } }));
  }

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Notification Preferences</h1>
        <p className="text-gray-400 mt-1">Control how and when you receive alerts</p>
      </div>

      {saved && <div className="bg-green-900/20 border border-green-600/40 rounded-xl p-3 text-green-400 text-sm">Preferences saved successfully.</div>}

      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 px-5 py-3 border-b border-[#1e2a45] text-gray-500 text-xs uppercase tracking-wider">
          <div className="col-span-6">Notification Type</div>
          <div className="col-span-2 text-center">Email</div>
          <div className="col-span-2 text-center">SMS</div>
          <div className="col-span-2 text-center">In-App</div>
        </div>
        {EVENT_TYPES.map(et => (
          <div key={et.key} className="grid grid-cols-12 px-5 py-4 items-center border-b border-[#1e2a45]/50">
            <div className="col-span-6">
              <div className="text-gray-200 text-sm font-medium">{et.label}</div>
              <div className="text-gray-500 text-xs">{et.desc}</div>
            </div>
            {(['email', 'sms', 'in_app'] as (keyof Pref)[]).map(ch => (
              <div key={ch} className="col-span-2 flex justify-center">
                <button onClick={() => toggle(et.key, ch)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${prefs[et.key][ch] ? 'bg-blue-600' : 'bg-gray-700'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${prefs[et.key][ch] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>

      <button onClick={save} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm">
        Save Preferences
      </button>
    </div>
  );
}
