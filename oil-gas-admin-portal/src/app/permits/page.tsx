'use client';
import { useEffect, useState } from 'react';

interface Permit {
  id: number;
  permit_type: string;
  regulator: string;
  permit_number: string;
  asset: string;
  valid_from: string;
  valid_to: string;
  status: string;
  computed_status: string;
}

export default function PermitsPage() {
  const [permits, setPermits] = useState<Permit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ permit_type: 'operating_license', regulator: 'CER', permit_number: '', asset: '', valid_from: '', valid_to: '' });
  const [msg, setMsg] = useState('');

  const load = () => {
    fetch('/api/permits').then(r => r.json()).then(d => { setPermits(Array.isArray(d) ? d : []); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const addPermit = async () => {
    const res = await fetch('/api/permits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json();
    if (data.id) { setMsg('Permit added'); setShowAdd(false); load(); }
    else setMsg(data.error ?? 'Error');
  };

  const statusColor = (s: string) => {
    if (s === 'expired') return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (s === 'expiring_soon') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-green-500/20 text-green-400 border-green-500/30';
  };

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">License &amp; Permit Registry</h1>
          <p className="text-gray-400 text-sm mt-1">{permits.length} permits · {permits.filter(p => p.computed_status === 'expiring_soon').length} expiring soon</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm">+ Add Permit</button>
      </div>
      {msg && <div className="mb-4 text-green-400 text-sm">{msg}</div>}
      {showAdd && (
        <div className="mb-4 bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          <h3 className="text-white font-medium mb-3">New Permit</h3>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <select className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-white text-sm" value={form.permit_type} onChange={e => setForm({ ...form, permit_type: e.target.value })}>
              {['operating_license','drilling_permit','environmental_approval','safety_certification'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-white text-sm" value={form.regulator} onChange={e => setForm({ ...form, regulator: e.target.value })}>
              {['CER','AER','ECCC','OSHA','OGC','CAPP'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <input className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-white text-sm" placeholder="Permit Number" value={form.permit_number} onChange={e => setForm({ ...form, permit_number: e.target.value })} />
            <input className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-white text-sm" placeholder="Asset" value={form.asset} onChange={e => setForm({ ...form, asset: e.target.value })} />
            <input type="date" className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-white text-sm" value={form.valid_from} onChange={e => setForm({ ...form, valid_from: e.target.value })} />
            <input type="date" className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-white text-sm" value={form.valid_to} onChange={e => setForm({ ...form, valid_to: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <button onClick={addPermit} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm">Save</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 bg-[#1e2a45] text-gray-300 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1e2a45]">
              {['Type', 'Regulator', 'Permit Number', 'Asset', 'Valid From', 'Valid To', 'Status'].map(h => (
                <th key={h} className="text-left text-gray-400 text-xs font-medium px-4 py-3 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {permits.map(p => (
              <tr key={p.id} className="border-b border-[#1e2a45] hover:bg-[#0a0e1a]">
                <td className="px-4 py-3 text-gray-300 text-sm capitalize">{p.permit_type.replace(/_/g, ' ')}</td>
                <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">{p.regulator}</span></td>
                <td className="px-4 py-3 text-white text-sm font-mono">{p.permit_number}</td>
                <td className="px-4 py-3 text-gray-400 text-sm">{p.asset}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{p.valid_from ? new Date(p.valid_from).toLocaleDateString() : '—'}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{p.valid_to ? new Date(p.valid_to).toLocaleDateString() : '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded border capitalize ${statusColor(p.computed_status ?? p.status)}`}>
                    {(p.computed_status ?? p.status).replace(/_/g, ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {permits.length === 0 && <div className="text-center py-8 text-gray-500">No permits — initialize DB first</div>}
      </div>
    </div>
  );
}
