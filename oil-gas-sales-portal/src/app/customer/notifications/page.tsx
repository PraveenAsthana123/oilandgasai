'use client';
import { useState } from 'react';

const NOTIFICATIONS = [
  { id: 1, title: 'Quote Q-0003 expires in 7 days', type: 'warning', date: '2026-10-16', read: false },
  { id: 2, title: 'Contract renewal reminder — MSA expires Dec 31', type: 'info', date: '2026-10-15', read: false },
  { id: 3, title: 'Invoice INV-2026-002 due in 14 days', type: 'warning', date: '2026-10-14', read: true },
  { id: 4, title: 'Support ticket ST-005 resolved', type: 'success', date: '2026-10-12', read: true },
];

export default function NotificationsPage() {
  const [notes, setNotes] = useState(NOTIFICATIONS);
  const markRead = (id: number) => setNotes(n => n.map(note => note.id === id ? { ...note, read: true } : note));

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        <span className="text-xs bg-emerald-700 text-emerald-300 px-2 py-0.5 rounded">{notes.filter(n => !n.read).length} unread</span>
      </div>
      <div className="space-y-2">
        {notes.map(n => (
          <div key={n.id} className={`bg-[#0f1629] border rounded-lg p-3 flex items-start gap-3 ${!n.read ? 'border-emerald-500/40' : 'border-[#1e2a45]'}`}>
            <span className="text-lg">{n.type === 'warning' ? '⚠️' : n.type === 'success' ? '✅' : 'ℹ️'}</span>
            <div className="flex-1">
              <div className={`text-sm ${!n.read ? 'text-white font-medium' : 'text-slate-300'}`}>{n.title}</div>
              <div className="text-xs text-slate-500 mt-0.5">{n.date}</div>
            </div>
            {!n.read && <button onClick={() => markRead(n.id)} className="text-xs text-emerald-400 hover:text-emerald-300">Mark read</button>}
          </div>
        ))}
      </div>
    </div>
  );
}
