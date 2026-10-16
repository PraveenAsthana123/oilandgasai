'use client';
import { useEffect, useState } from 'react';

const ACTIVITY_ICONS: Record<string, string> = { call: '📞', site_visit: '🏭', demo: '💻', email: '📧', presentation: '📊', follow_up: '🔁' };

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'call', subject: '', notes: '', related_id: '', related_type: 'lead', user_id: 'current.user' });

  useEffect(() => {
    fetch('/api/activities').then(r => r.json()).then(d => { setActivities(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  const submit = async () => {
    await fetch('/api/activities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setShowForm(false);
    fetch('/api/activities').then(r => r.json()).then(d => setActivities(Array.isArray(d) ? d : []));
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Activity Log</h1>
          <p className="text-slate-400 text-sm mt-1">Calls, visits, demos, presentations, and follow-ups</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + Log Activity
        </button>
      </div>

      {showForm && (
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4 space-y-3">
          <h2 className="text-sm font-semibold text-white">Log New Activity</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Activity Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full bg-[#0a0e1a] border border-[#1e2a45] text-white text-sm rounded px-3 py-1.5">
                <option value="call">Call</option>
                <option value="site_visit">Site Visit</option>
                <option value="demo">Demo</option>
                <option value="email">Email</option>
                <option value="presentation">Presentation</option>
                <option value="follow_up">Follow-up</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Subject</label>
              <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="w-full bg-[#0a0e1a] border border-[#1e2a45] text-white text-sm rounded px-3 py-1.5" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Related To</label>
              <select value={form.related_type} onChange={e => setForm(f => ({ ...f, related_type: e.target.value }))} className="w-full bg-[#0a0e1a] border border-[#1e2a45] text-white text-sm rounded px-3 py-1.5">
                <option value="lead">Lead</option>
                <option value="opportunity">Opportunity</option>
                <option value="account">Account</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Related ID</label>
              <input type="number" value={form.related_id} onChange={e => setForm(f => ({ ...f, related_id: e.target.value }))} className="w-full bg-[#0a0e1a] border border-[#1e2a45] text-white text-sm rounded px-3 py-1.5" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1">Notes</label>
              <textarea rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="w-full bg-[#0a0e1a] border border-[#1e2a45] text-white text-sm rounded px-3 py-1.5" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={submit} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded text-sm">Log Activity</button>
            <button onClick={() => setShowForm(false)} className="border border-[#1e2a45] text-slate-300 px-4 py-1.5 rounded text-sm">Cancel</button>
          </div>
        </div>
      )}

      {loading ? <div className="text-slate-400">Loading activities...</div> : (
        <div className="space-y-2">
          {activities.map((a: any) => (
            <div key={a.id} className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-3 flex gap-3 items-start hover:border-emerald-500/30 transition-colors">
              <div className="text-xl mt-0.5">{ACTIVITY_ICONS[a.type] || '📋'}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-white text-sm">{a.subject}</div>
                  <div className="text-xs text-slate-500">{new Date(a.ts).toLocaleString()}</div>
                </div>
                <div className="text-xs text-slate-400 mt-1">{a.notes}</div>
                <div className="flex gap-3 mt-1.5 text-xs text-slate-500">
                  <span className="capitalize">{a.type?.replace('_', ' ')}</span>
                  <span>·</span>
                  <span className="capitalize">{a.related_type} #{a.related_id}</span>
                  <span>·</span>
                  <span>{a.user_id}</span>
                </div>
              </div>
            </div>
          ))}
          {activities.length === 0 && (
            <div className="text-center py-12 text-slate-500">No activities logged yet.</div>
          )}
        </div>
      )}
    </div>
  );
}
