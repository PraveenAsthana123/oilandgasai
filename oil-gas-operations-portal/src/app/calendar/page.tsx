'use client';

import { useState, useEffect } from 'react';

interface CalEvent {
  date: string;
  type: string;
  title: string;
  color: string;
}

const TYPE_COLORS: Record<string, string> = {
  job: 'bg-green-500',
  appointment: 'bg-blue-500',
  milestone: 'bg-amber-500',
  alert: 'bg-red-500',
};

const TYPE_LABELS: Record<string, string> = {
  job: 'Job Run',
  appointment: 'Appointment',
  milestone: 'Milestone',
  alert: 'Alert',
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-indexed
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [mock, setMock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(now.toISOString().split('T')[0]);

  const todayStr = now.toISOString().split('T')[0];
  const monthKey = `${year}-${String(month).padStart(2, '0')}`;

  useEffect(() => {
    setLoading(true);
    fetch(`/api/calendar?month=${monthKey}`)
      .then(r => r.json())
      .then(d => {
        setEvents(d.events || []);
        if (d._mock) setMock(true);
        setLoading(false);
      })
      .catch(() => { setMock(true); setLoading(false); });
  }, [monthKey]);

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  }

  // Build calendar grid
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete last week
  while (cells.length % 7 !== 0) cells.push(null);

  function dateStr(day: number) {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function eventsForDay(day: number) {
    const ds = dateStr(day);
    return events.filter(e => e.date === ds);
  }

  const selectedEvents = selectedDate
    ? events.filter(e => e.date === selectedDate)
    : [];

  const selectedLabel = selectedDate
    ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  return (
    <main className="min-h-screen bg-[#0a0e1a] p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center text-2xl">🗓️</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-100">Portal Calendar</h1>
              <p className="text-gray-500 text-sm">Job runs, appointments, milestones, inspections</p>
            </div>
            {mock && <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-1 rounded">⚠️ DB offline</span>}
          </div>
          {/* Legend */}
          <div className="hidden sm:flex items-center gap-4 text-xs">
            {Object.entries(TYPE_LABELS).map(([type, label]) => (
              <div key={type} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${TYPE_COLORS[type]}`} />
                <span className="text-gray-400">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
            {/* Month nav */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e2a45]">
              <button onClick={prevMonth} className="text-gray-400 hover:text-amber-400 transition-colors text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#1e2a45]">‹</button>
              <h2 className="text-gray-100 font-semibold text-lg">
                {MONTH_NAMES[month - 1]} {year}
              </h2>
              <button onClick={nextMonth} className="text-gray-400 hover:text-amber-400 transition-colors text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#1e2a45]">›</button>
            </div>

            {/* Day labels */}
            <div className="grid grid-cols-7 border-b border-[#1e2a45]">
              {DAY_LABELS.map(d => (
                <div key={d} className="text-center text-xs text-gray-600 font-medium py-2">{d}</div>
              ))}
            </div>

            {/* Grid */}
            {loading ? (
              <div className="p-12 text-center text-gray-600 text-sm">Loading events…</div>
            ) : (
              <div className="grid grid-cols-7">
                {cells.map((day, idx) => {
                  if (day === null) {
                    return <div key={`empty-${idx}`} className="border-r border-b border-[#1e2a45]/30 min-h-[72px] bg-[#0a0e1a]/30" />;
                  }
                  const ds = dateStr(day);
                  const dayEvents = eventsForDay(day);
                  const isToday = ds === todayStr;
                  const isSelected = ds === selectedDate;
                  return (
                    <div
                      key={day}
                      onClick={() => setSelectedDate(ds)}
                      className={`border-r border-b border-[#1e2a45]/30 min-h-[72px] p-1.5 cursor-pointer transition-colors ${
                        isSelected ? 'bg-amber-500/10' : 'hover:bg-[#1e2a45]/30'
                      }`}
                    >
                      <div className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
                        isToday ? 'bg-amber-500 text-black' : isSelected ? 'text-amber-400' : 'text-gray-400'
                      }`}>
                        {day}
                      </div>
                      <div className="flex flex-wrap gap-0.5">
                        {dayEvents.slice(0, 4).map((e, i) => (
                          <span key={i} className={`w-2 h-2 rounded-full ${TYPE_COLORS[e.type] || 'bg-gray-500'}`} title={e.title} />
                        ))}
                        {dayEvents.length > 4 && <span className="text-gray-600 text-xs">+{dayEvents.length - 4}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Event list for selected day */}
          <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden flex flex-col">
            <div className="px-4 py-4 border-b border-[#1e2a45]">
              <div className="text-gray-300 font-semibold text-sm">{selectedLabel || 'Select a day'}</div>
              <div className="text-gray-600 text-xs mt-0.5">{selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''}</div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[460px]">
              {selectedEvents.length === 0 ? (
                <div className="text-center text-gray-600 text-sm py-10">No events on this day</div>
              ) : (
                selectedEvents.map((e, i) => (
                  <div key={i} className="flex items-start gap-3 bg-[#0a0e1a] rounded-lg p-3 border border-[#1e2a45]">
                    <span className={`mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0 ${TYPE_COLORS[e.type] || 'bg-gray-500'}`} />
                    <div>
                      <div className="text-gray-200 text-sm font-medium">{e.title}</div>
                      <div className="text-gray-500 text-xs mt-0.5 capitalize">{TYPE_LABELS[e.type] || e.type}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Mobile legend */}
        <div className="sm:hidden flex flex-wrap items-center gap-4 mt-4 text-xs">
          {Object.entries(TYPE_LABELS).map(([type, label]) => (
            <div key={type} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${TYPE_COLORS[type]}`} />
              <span className="text-gray-400">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
