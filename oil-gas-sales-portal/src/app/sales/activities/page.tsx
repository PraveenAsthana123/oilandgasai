'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const ACTIVITY_ICONS: Record<string, string> = {
  call: '📞',
  email: '📧',
  meeting: '🤝',
  demo: '💻',
  site_visit: '🏭',
  proposal: '📝',
  follow_up: '🔄',
};

export default function SalesActivitiesPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ type: 'call', account_name: '', notes: '', outcome: '', next_action: '' });
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchActivities = async () => {
    setLoading(true);
    const data = await fetch('/api/activities').then(r => r.json()).catch(() => []);
    setActivities(Array.isArray(data) ? data : data?.activities || []);
    setLoading(false);
  };

  useEffect(() => { fetchActivities(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, activity_date: new Date().toISOString() }),
      });
      setForm({ type: 'call', account_name: '', notes: '', outcome: '', next_action: '' });
      setShowForm(false);
      fetchActivities();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href="/sales" className="hover:text-emerald-400">Sales</Link>
            <span>/</span>
            <span className="text-gray-300">Activities</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Activity Log</h1>
          <p className="text-gray-400 mt-1">Calls, meetings, emails, demos, and follow-ups</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="text-xs bg-emerald-500 hover:bg-emerald-600 text-black font-bold px-4 py-2 rounded transition"
        >
          + Log Activity
        </button>
      </div>

      {showForm && (
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Log New Activity</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Type</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded px-3 py-2 text-gray-300 text-sm"
              >
                {Object.keys(ACTIVITY_ICONS).map(t => (
                  <option key={t} value={t}>{t.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Account</label>
              <input
                value={form.account_name}
                onChange={e => setForm(f => ({ ...f, account_name: e.target.value }))}
                placeholder="Account name"
                className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Outcome</label>
              <input
                value={form.outcome}
                onChange={e => setForm(f => ({ ...f, outcome: e.target.value }))}
                placeholder="Positive — demo scheduled"
                className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Next Action</label>
              <input
                value={form.next_action}
                onChange={e => setForm(f => ({ ...f, next_action: e.target.value }))}
                placeholder="Send proposal by Friday"
                className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Notes</label>
              <textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Meeting notes..."
                rows={3}
                className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none resize-none"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={save} disabled={saving} className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-bold px-5 py-2 rounded text-sm transition">
              {saving ? 'Saving...' : 'Save Activity'}
            </button>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white text-sm px-4 py-2">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-emerald-400">Loading activities...</div>
      ) : activities.length === 0 ? (
        <div className="text-gray-500 text-sm">No activities logged yet.</div>
      ) : (
        <div className="space-y-2">
          {activities.map((a: any) => (
            <div key={a.id} className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-3 flex items-start gap-3">
              <span className="text-xl mt-0.5">{ACTIVITY_ICONS[a.type] || '📌'}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white capitalize">{a.type?.replace('_', ' ')}</span>
                  <span className="text-xs text-gray-500">{a.activity_date ? new Date(a.activity_date).toLocaleDateString() : ''}</span>
                </div>
                {a.account_name && <div className="text-xs text-emerald-400">{a.account_name}</div>}
                {a.notes && <div className="text-xs text-gray-400 mt-1">{a.notes}</div>}
                {a.outcome && <div className="text-xs text-gray-300 mt-1">Outcome: {a.outcome}</div>}
                {a.next_action && <div className="text-xs text-blue-400 mt-1">Next: {a.next_action}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
