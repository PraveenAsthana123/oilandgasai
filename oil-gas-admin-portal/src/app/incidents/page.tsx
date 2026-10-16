'use client';
import { useEffect, useState } from 'react';

interface Incident {
  id: number;
  incident_type: string;
  stream: string;
  location: string;
  severity: string;
  status: string;
  hours_worked: number;
  reported_at: string;
}

interface IncidentData {
  incidents: Incident[];
  trif: string;
  total_hours: number;
  recordable_count: number;
}

const TYPE_COLORS: Record<string, string> = {
  near_miss: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  recordable: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  lti: 'bg-red-500/20 text-red-400 border-red-500/30',
  fatality: 'bg-red-900/40 text-red-300 border-red-700',
};

const SEV_COLORS: Record<string, string> = {
  low: 'bg-green-500/20 text-green-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  high: 'bg-red-500/20 text-red-400',
  critical: 'bg-red-900/40 text-red-300',
};

export default function IncidentsPage() {
  const [data, setData] = useState<IncidentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ incident_type: 'near_miss', stream: 'upstream', location: '', severity: 'low', hours_worked: '' });
  const [msg, setMsg] = useState('');

  const load = () => {
    fetch('/api/incidents').then(r => r.json()).then(d => { setData(d); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const addIncident = async () => {
    const res = await fetch('/api/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, hours_worked: parseFloat(form.hours_worked) || 0 }),
    });
    const d = await res.json();
    if (d.id) { setMsg('Incident recorded'); setShowAdd(false); load(); }
    else setMsg(d.error ?? 'Error');
  };

  const INDUSTRY_TRIF = 1.2;
  const trifVal = parseFloat(data?.trif ?? '0');
  const trifColor = trifVal <= INDUSTRY_TRIF ? 'text-green-400' : trifVal <= 2.0 ? 'text-yellow-400' : 'text-red-400';

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>;

  const incidents = data?.incidents ?? [];
  const byType = ['near_miss', 'recordable', 'lti', 'fatality'].map(t => ({
    type: t, count: incidents.filter(i => i.incident_type === t).length
  }));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Safety Incident Register</h1>
          <p className="text-gray-400 text-sm mt-1">OSHA/CAPP recordable incidents, near misses, LTI tracking</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm">+ Report Incident</button>
      </div>

      {/* TRIF Banner */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-gray-400 text-sm mb-1">TRIF (Total Recordable Incident Frequency)</div>
            <div className="text-xs text-gray-500 mb-2">Formula: (Recordable Incidents × 200,000) / Total Hours Worked</div>
            <div className={`text-4xl font-bold ${trifColor}`}>{data?.trif ?? '0.00'}</div>
          </div>
          <div className="text-right">
            <div className="text-gray-400 text-sm mb-1">Industry Benchmark (CAPP)</div>
            <div className="text-2xl font-bold text-gray-300">{INDUSTRY_TRIF}</div>
            <div className={`text-sm mt-1 ${trifVal <= INDUSTRY_TRIF ? 'text-green-400' : 'text-red-400'}`}>
              {trifVal <= INDUSTRY_TRIF ? '✅ Below Industry Average' : '❌ Above Industry Average'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-400 text-sm">Total Hours Worked</div>
            <div className="text-xl font-bold text-white">{(data?.total_hours ?? 0).toLocaleString()}</div>
            <div className="text-gray-400 text-sm mt-1">Recordable Incidents</div>
            <div className="text-xl font-bold text-orange-400">{data?.recordable_count ?? 0}</div>
          </div>
        </div>
      </div>

      {/* Type breakdown */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {byType.map(t => (
          <div key={t.type} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold ${t.count > 0 ? 'text-red-400' : 'text-gray-400'}`}>{t.count}</div>
            <div className="text-gray-400 text-xs mt-1 capitalize">{t.type.replace(/_/g, ' ')}</div>
          </div>
        ))}
      </div>

      {msg && <div className="mb-4 text-green-400 text-sm">{msg}</div>}

      {showAdd && (
        <div className="mb-4 bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          <h3 className="text-white font-medium mb-3">Report New Incident</h3>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <select className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-white text-sm" value={form.incident_type} onChange={e => setForm({ ...form, incident_type: e.target.value })}>
              {['near_miss','recordable','lti','fatality'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-white text-sm" value={form.stream} onChange={e => setForm({ ...form, stream: e.target.value })}>
              {['upstream','midstream','downstream'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-white text-sm" placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
            <select className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-white text-sm" value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })}>
              {['low','medium','high','critical'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-white text-sm" placeholder="Hours Worked" type="number" value={form.hours_worked} onChange={e => setForm({ ...form, hours_worked: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <button onClick={addIncident} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm">Submit</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 bg-[#1e2a45] text-gray-300 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1e2a45]">
              {['Type', 'Stream', 'Location', 'Severity', 'Status', 'Hours Worked', 'Reported'].map(h => (
                <th key={h} className="text-left text-gray-400 text-xs font-medium px-4 py-3 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {incidents.map(i => (
              <tr key={i.id} className="border-b border-[#1e2a45] hover:bg-[#0a0e1a]">
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded border capitalize ${TYPE_COLORS[i.incident_type] ?? ''}`}>
                    {i.incident_type.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-sm capitalize">{i.stream}</td>
                <td className="px-4 py-3 text-white text-sm">{i.location}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded capitalize ${SEV_COLORS[i.severity] ?? ''}`}>{i.severity}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${i.status === 'open' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>{i.status}</span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-sm">{Number(i.hours_worked).toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{new Date(i.reported_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {incidents.length === 0 && <div className="text-center py-8 text-gray-500">No incidents recorded — initialize DB first</div>}
      </div>
    </div>
  );
}
