'use client';

import { useState, useEffect } from 'react';

const PORTAL_SECTIONS = [
  'Upstream', 'Midstream', 'Downstream', 'AI/ML', 'Sales', 'Admin', 'Customer', 'Engineering',
];

const DEPARTMENTS = [
  'All', 'Upstream', 'Midstream', 'Downstream', 'AI/ML', 'Sales', 'Admin',
  'Customer', 'Engineering', 'Data Science', 'HSE', 'Procurement',
  'Petroleum Economics', 'Regulatory Affairs', 'Project Management',
  'Mechanical Maintenance', 'SCADA', 'Pipeline Integrity', 'Trading',
];

interface FlagRow { id?: number; feature: string; enabled: boolean }

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'admin' | 'prefs'>('admin');
  const [flags, setFlags] = useState<FlagRow[]>(PORTAL_SECTIONS.map(f => ({ feature: f, enabled: true })));
  const [mock, setMock] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);

  // Preferences state
  const [notifEmail, setNotifEmail] = useState('');
  const [defaultDept, setDefaultDept] = useState('All');
  const [defaultStream, setDefaultStream] = useState('All');
  const [prefSaving, setPrefSaving] = useState(false);
  const [prefSaved, setPrefSaved] = useState(false);

  useEffect(() => {
    fetch('/api/settings?type=feature-flags')
      .then(r => r.json())
      .then(d => {
        if (d.flags) setFlags(d.flags);
        if (d._mock) setMock(true);
      })
      .catch(() => setMock(true));

    fetch('/api/settings?type=preferences&user_id=demo_user')
      .then(r => r.json())
      .then(d => {
        if (d.preferences) {
          setNotifEmail(d.preferences['notif_email'] || '');
          setDefaultDept(d.preferences['default_dept'] || 'All');
          setDefaultStream(d.preferences['default_stream'] || 'All');
        }
      })
      .catch(() => {});
  }, []);

  async function toggleFlag(feature: string, current: boolean) {
    setSaving(feature);
    setFlags(prev => prev.map(f => f.feature === feature ? { ...f, enabled: !current } : f));
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'feature-flags', key: feature, value: !current }),
      });
    } catch {}
    setSaving(null);
  }

  async function savePreferences() {
    setPrefSaving(true);
    const prefs = [
      { key: 'notif_email', value: notifEmail },
      { key: 'default_dept', value: defaultDept },
      { key: 'default_stream', value: defaultStream },
    ];
    await Promise.all(prefs.map(p =>
      fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'preferences', user_id: 'demo_user', key: p.key, value: p.value }),
      }).catch(() => {})
    ));
    setPrefSaving(false);
    setPrefSaved(true);
    setTimeout(() => setPrefSaved(false), 2500);
  }

  return (
    <main className="min-h-screen bg-[#0a0e1a] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center text-2xl">⚙️</div>
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Portal Settings</h1>
            <p className="text-gray-500 text-sm">Feature flags and user preferences</p>
          </div>
          {mock && (
            <span className="ml-auto text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-1 rounded">
              ⚠️ DB offline — mock mode
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-[#0f1629] rounded-xl p-1 border border-[#1e2a45] w-fit">
          {(['admin', 'prefs'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-amber-500 text-black'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab === 'admin' ? 'Admin Settings' : 'My Preferences'}
            </button>
          ))}
        </div>

        {/* Admin tab */}
        {activeTab === 'admin' && (
          <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-100 mb-1">Feature Flag Controls</h2>
            <p className="text-gray-500 text-sm mb-6">Toggle portal sections on or off. Disabling hides nav items and blocks API access for that section.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {flags.map(flag => (
                <div
                  key={flag.feature}
                  className="flex items-center justify-between bg-[#0a0e1a] rounded-lg px-4 py-3 border border-[#1e2a45]"
                >
                  <div>
                    <div className="text-gray-200 font-medium text-sm">{flag.feature}</div>
                    <div className="text-gray-600 text-xs mt-0.5">{flag.enabled ? 'Active' : 'Disabled'}</div>
                  </div>
                  <button
                    onClick={() => toggleFlag(flag.feature, flag.enabled)}
                    disabled={saving === flag.feature}
                    className={`relative w-12 h-6 rounded-full transition-colors focus:outline-none ${
                      flag.enabled ? 'bg-amber-500' : 'bg-gray-700'
                    } ${saving === flag.feature ? 'opacity-50' : ''}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      flag.enabled ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-gray-600 text-xs mt-4">Changes take effect immediately. Toggles persist to DB.</p>
          </div>
        )}

        {/* My Preferences tab */}
        {activeTab === 'prefs' && (
          <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-100 mb-2">My Preferences</h2>

            {/* Theme */}
            <div className="flex items-center justify-between bg-[#0a0e1a] rounded-lg px-4 py-3 border border-[#1e2a45]">
              <div>
                <div className="text-gray-200 font-medium text-sm">Theme</div>
                <div className="text-gray-500 text-xs mt-0.5">Dark mode only — light mode coming soon</div>
              </div>
              <button
                disabled
                className="relative w-12 h-6 rounded-full bg-amber-500 opacity-60 cursor-not-allowed"
              >
                <span className="absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full shadow" />
              </button>
            </div>

            {/* Notification email */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Notification Email</label>
              <input
                type="email"
                value={notifEmail}
                onChange={e => setNotifEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/50 placeholder-gray-600"
              />
            </div>

            {/* Default dept */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Default Department</label>
              <select
                value={defaultDept}
                onChange={e => setDefaultDept(e.target.value)}
                className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/50"
              >
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Default stream */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Default Stream View</label>
              <select
                value={defaultStream}
                onChange={e => setDefaultStream(e.target.value)}
                className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-amber-500/50"
              >
                {['All', 'Upstream', 'Midstream', 'Downstream'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <button
              onClick={savePreferences}
              disabled={prefSaving}
              className="w-full sm:w-auto px-8 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg transition-colors disabled:opacity-50 text-sm"
            >
              {prefSaving ? 'Saving…' : prefSaved ? '✓ Saved' : 'Save Preferences'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
