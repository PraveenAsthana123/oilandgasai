'use client';
import { useEffect, useState } from 'react';

interface Inspection {
  id: number;
  inspection_type: string;
  location: string;
  scheduled_date: string;
  completed_date: string;
  inspector: string;
  status: string;
  findings: string;
  corrective_actions: string;
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-green-500/20 text-green-400',
  overdue: 'bg-red-500/20 text-red-400',
  in_progress: 'bg-yellow-500/20 text-yellow-400',
};

export default function InspectionsPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ inspection_type: 'pipeline_integrity', location: '', scheduled_date: '', inspector: '' });
  const [msg, setMsg] = useState('');

  const load = () => {
    fetch('/api/inspections').then(r => r.json()).then(d => { setInspections(Array.isArray(d) ? d : []); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const addInspection = async () => {
    const res = await fetch('/api/inspections', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json();
    if (data.id) { setMsg('Inspection scheduled'); setShowAdd(false); load(); }
    else setMsg(data.error ?? 'Error');
  };

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>;

  const overdue = inspections.filter(i => i.status === 'overdue').length;
  const scheduled = inspections.filter(i => i.status === 'scheduled').length;
  const completed = inspections.filter(i => i.status === 'completed').length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Inspection Management</h1>
          <p className="text-gray-400 text-sm mt-1">Scheduled, completed, and overdue inspections</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm">+ Schedule Inspection</button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: inspections.length, color: 'text-white' },
          { label: 'Scheduled', value: scheduled, color: 'text-blue-400' },
          { label: 'Completed', value: completed, color: 'text-green-400' },
          { label: 'Overdue', value: overdue, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-gray-400 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {msg && <div className="mb-4 text-green-400 text-sm">{msg}</div>}

      {showAdd && (
        <div className="mb-4 bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          <h3 className="text-white font-medium mb-3">Schedule Inspection</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <select className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-white text-sm" value={form.inspection_type} onChange={e => setForm({ ...form, inspection_type: e.target.value })}>
              {['pipeline_integrity','safety_audit','environmental','electrical','mechanical','process_safety'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-white text-sm" placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
            <input type="date" className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-white text-sm" value={form.scheduled_date} onChange={e => setForm({ ...form, scheduled_date: e.target.value })} />
            <input className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-white text-sm" placeholder="Inspector Name" value={form.inspector} onChange={e => setForm({ ...form, inspector: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <button onClick={addInspection} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm">Schedule</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 bg-[#1e2a45] text-gray-300 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1e2a45]">
              {['Type', 'Location', 'Scheduled', 'Inspector', 'Status', 'Findings'].map(h => (
                <th key={h} className="text-left text-gray-400 text-xs font-medium px-4 py-3 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {inspections.map(i => (
              <tr key={i.id} className="border-b border-[#1e2a45] hover:bg-[#0a0e1a]">
                <td className="px-4 py-3 text-gray-300 text-sm capitalize">{i.inspection_type.replace(/_/g, ' ')}</td>
                <td className="px-4 py-3 text-white text-sm">{i.location}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{i.scheduled_date ? new Date(i.scheduled_date).toLocaleDateString() : '—'}</td>
                <td className="px-4 py-3 text-gray-400 text-sm">{i.inspector}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded capitalize ${STATUS_COLORS[i.status] ?? 'bg-gray-500/20 text-gray-400'}`}>{i.status}</span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs max-w-xs truncate" title={i.findings ?? ''}>{i.findings ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {inspections.length === 0 && <div className="text-center py-8 text-gray-500">No inspections — initialize DB first</div>}
      </div>
    </div>
  );
}
