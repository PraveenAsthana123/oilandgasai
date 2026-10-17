'use client';

import { useState, useEffect } from 'react';

interface Appointment {
  id: number;
  title: string;
  type: string;
  appt_date: string;
  appt_time: string;
  location: string;
  attendees: string;
  notes: string;
  status: string;
  created_at: string;
}

const APPT_TYPES = ['Site Visit', 'Inspection', 'Meeting', 'Audit', 'Emergency'];
const TIME_SLOTS = Array.from({ length: 21 }, (_, i) => {
  const h = Math.floor(i / 2) + 8;
  const m = i % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2, '0')}:${m}`;
}).filter((_, i) => i < 20);

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'text-green-400 bg-green-500/10 border-green-500/30',
  pending: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  cancelled: 'text-red-400 bg-red-500/10 border-red-500/30',
};

function getWeekDates() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [mock, setMock] = useState(false);
  const [view, setView] = useState<'list' | 'week'>('list');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const weekDates = getWeekDates();

  const [form, setForm] = useState({
    title: '', type: 'Site Visit', appt_date: new Date().toISOString().split('T')[0],
    appt_time: '09:00', location: '', attendees: '', notes: '', status: 'confirmed',
  });

  useEffect(() => {
    fetch('/api/appointments')
      .then(r => r.json())
      .then(d => {
        if (d.appointments) setAppointments(d.appointments);
        if (d._mock) setMock(true);
      })
      .catch(() => setMock(true));
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const weekStr = weekDates.map(d => d.toISOString().split('T')[0]);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const kpis = {
    today: appointments.filter(a => a.appt_date === today).length,
    thisWeek: appointments.filter(a => weekStr.includes(a.appt_date)).length,
    pending: appointments.filter(a => a.status === 'pending').length,
    thisMonth: appointments.filter(a => a.appt_date >= monthStart).length,
  };

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.appointment) {
        setAppointments(prev => [data.appointment, ...prev]);
        setShowForm(false);
        setForm({ title: '', type: 'Site Visit', appt_date: today, appt_time: '09:00', location: '', attendees: '', notes: '', status: 'confirmed' });
      }
    } catch {}
    setSaving(false);
  }

  function getApptForSlot(date: Date, time: string) {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(a => a.appt_date === dateStr && a.appt_time?.startsWith(time.slice(0, 2)));
  }

  const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <main className="min-h-screen bg-[#0a0e1a] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center text-2xl">📅</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-100">Appointments</h1>
              <p className="text-gray-500 text-sm">Well site visits, inspections, vendor meetings, regulatory audits</p>
            </div>
            {mock && <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-1 rounded">⚠️ DB offline</span>}
          </div>
          <div className="flex gap-2">
            <div className="flex gap-1 bg-[#0f1629] rounded-lg p-1 border border-[#1e2a45]">
              {(['list', 'week'] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${view === v ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-gray-200'}`}>
                  {v === 'list' ? '☰ List' : '📆 Week'}
                </button>
              ))}
            </div>
            <button onClick={() => setShowForm(s => !s)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-sm transition-colors">
              + New Appointment
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Today's", value: kpis.today, icon: '🌅' },
            { label: 'This Week', value: kpis.thisWeek, icon: '📆' },
            { label: 'Pending', value: kpis.pending, icon: '⏳' },
            { label: 'This Month', value: kpis.thisMonth, icon: '📊' },
          ].map(k => (
            <div key={k.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">{k.icon}</div>
              <div className="text-2xl font-bold text-amber-400">{k.value}</div>
              <div className="text-gray-500 text-xs">{k.label}</div>
            </div>
          ))}
        </div>

        {/* Create form */}
        {showForm && (
          <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-100 mb-4">New Appointment</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-gray-400 text-xs mb-1">Title *</label>
                <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-amber-500/50" placeholder="Well Site Visit – Block 7A" />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-amber-500/50">
                  {APPT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-amber-500/50">
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">Date *</label>
                <input required type="date" value={form.appt_date} onChange={e => setForm(f => ({ ...f, appt_date: e.target.value }))}
                  className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">Time *</label>
                <select required value={form.appt_time} onChange={e => setForm(f => ({ ...f, appt_time: e.target.value }))}
                  className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-amber-500/50">
                  {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">Location</label>
                <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-amber-500/50" placeholder="Block 7A, North Field" />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">Attendees (comma-sep)</label>
                <input value={form.attendees} onChange={e => setForm(f => ({ ...f, attendees: e.target.value }))}
                  className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-amber-500/50" placeholder="John Smith, Mary Lee" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-gray-400 text-xs mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
                  className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-amber-500/50 resize-none" />
              </div>
              <div className="sm:col-span-2 flex gap-3">
                <button type="submit" disabled={saving}
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-sm disabled:opacity-50">
                  {saving ? 'Saving…' : 'Create Appointment'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-6 py-2 bg-[#1e2a45] text-gray-300 hover:text-white rounded-lg text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Week view */}
        {view === 'week' && (
          <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden mb-6">
            <div className="grid grid-cols-8 border-b border-[#1e2a45]">
              <div className="p-3 text-gray-600 text-xs">Time</div>
              {weekDates.map((d, i) => {
                const isToday = d.toISOString().split('T')[0] === today;
                return (
                  <div key={i} className={`p-3 text-center text-xs font-medium border-l border-[#1e2a45] ${isToday ? 'text-amber-400' : 'text-gray-400'}`}>
                    <div>{DAY_LABELS[i]}</div>
                    <div className={`text-lg font-bold ${isToday ? 'text-amber-400' : 'text-gray-200'}`}>{d.getDate()}</div>
                  </div>
                );
              })}
            </div>
            <div className="overflow-y-auto max-h-96">
              {['08', '09', '10', '11', '12', '13', '14', '15', '16', '17'].map(hour => (
                <div key={hour} className="grid grid-cols-8 border-b border-[#1e2a45]/50 min-h-[3rem]">
                  <div className="p-2 text-gray-600 text-xs border-r border-[#1e2a45]">{hour}:00</div>
                  {weekDates.map((d, i) => {
                    const slots = getApptForSlot(d, `${hour}:`);
                    return (
                      <div key={i} className="border-l border-[#1e2a45]/50 p-1 min-h-[3rem]">
                        {slots.map(a => (
                          <div key={a.id} className="bg-amber-500/20 border border-amber-500/30 rounded px-1 py-0.5 text-amber-400 text-xs truncate mb-0.5">
                            {a.title}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* List view */}
        {view === 'list' && (
          <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[#1e2a45]">
              <span className="text-gray-300 font-semibold">All Appointments</span>
              <span className="ml-2 text-gray-600 text-sm">({appointments.length})</span>
            </div>
            {appointments.length === 0 ? (
              <div className="p-12 text-center text-gray-600">No appointments found. Create one above.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1e2a45] text-gray-500 text-xs uppercase">
                      <th className="px-4 py-3 text-left">Title</th>
                      <th className="px-4 py-3 text-left">Type</th>
                      <th className="px-4 py-3 text-left">Date / Time</th>
                      <th className="px-4 py-3 text-left">Location</th>
                      <th className="px-4 py-3 text-left">Attendees</th>
                      <th className="px-4 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map(a => (
                      <tr key={a.id} className="border-b border-[#1e2a45]/50 hover:bg-[#1e2a45]/30 transition-colors">
                        <td className="px-4 py-3 text-gray-200 font-medium">{a.title}</td>
                        <td className="px-4 py-3 text-gray-400">{a.type}</td>
                        <td className="px-4 py-3 text-gray-400">{a.appt_date} {a.appt_time?.slice(0, 5)}</td>
                        <td className="px-4 py-3 text-gray-400">{a.location || '—'}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs max-w-[160px] truncate">{a.attendees || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded border text-xs font-medium capitalize ${STATUS_COLORS[a.status] || 'text-gray-400'}`}>
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
