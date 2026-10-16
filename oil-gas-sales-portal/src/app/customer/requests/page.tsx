'use client';
import { useEffect, useState } from 'react';

export default function RequestsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: '', body: '' });

  useEffect(() => {
    fetch('/api/support').then(r => r.json()).then(d => { setTickets(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  const submit = async () => {
    await fetch('/api/support', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, user_id: 'j.walsh' }) });
    setShowForm(false);
    fetch('/api/support').then(r => r.json()).then(d => setTickets(Array.isArray(d) ? d : []));
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">My Requests</h1>
        <button onClick={() => setShowForm(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm">+ New Request</button>
      </div>
      {showForm && (
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4 space-y-3">
          <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Subject" className="w-full bg-[#0a0e1a] border border-[#1e2a45] text-white text-sm rounded px-3 py-2" />
          <textarea rows={4} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} placeholder="Describe your request..." className="w-full bg-[#0a0e1a] border border-[#1e2a45] text-white text-sm rounded px-3 py-2" />
          <div className="flex gap-2">
            <button onClick={submit} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded text-sm">Submit</button>
            <button onClick={() => setShowForm(false)} className="border border-[#1e2a45] text-slate-300 px-4 py-1.5 rounded text-sm">Cancel</button>
          </div>
        </div>
      )}
      {loading ? <div className="text-slate-400">Loading...</div> : (
        <div className="space-y-3">
          {tickets.map((t: any) => (
            <div key={t.id} className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="font-medium text-white">{t.subject}</div>
                <span className={`text-xs px-2 py-0.5 rounded ${t.status === 'open' ? 'bg-blue-800 text-blue-300' : 'bg-emerald-800 text-emerald-300'}`}>{t.status}</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">{t.body}</div>
              <div className="text-xs text-slate-500 mt-2">{new Date(t.created_at).toLocaleString()}</div>
            </div>
          ))}
          {tickets.length === 0 && <div className="text-center py-8 text-slate-500">No requests yet.</div>}
        </div>
      )}
    </div>
  );
}
