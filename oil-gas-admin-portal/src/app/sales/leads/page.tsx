'use client';
import { useEffect, useState } from 'react';

interface Lead {
  id: number;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  status: string;
  value: number;
  notes: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-400',
  qualified: 'bg-purple-500/20 text-purple-400',
  negotiation: 'bg-yellow-500/20 text-yellow-400',
  proposal: 'bg-orange-500/20 text-orange-400',
  won: 'bg-green-500/20 text-green-400',
  lost: 'bg-red-500/20 text-red-400',
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ company_name: '', contact_name: '', email: '', phone: '', value: '', notes: '' });
  const [msg, setMsg] = useState('');

  const load = () => {
    fetch('/api/leads').then(r => r.json()).then(d => { setLeads(Array.isArray(d) ? d : []); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const addLead = async () => {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, value: parseFloat(form.value) || 0 }),
    });
    const data = await res.json();
    if (data.id) { setMsg('Lead added'); setShowAdd(false); load(); }
    else setMsg(data.error ?? 'Error');
  };

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>;

  const totalValue = leads.reduce((sum, l) => sum + parseFloat(String(l.value || 0)), 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Sales Leads</h1>
          <p className="text-gray-400 text-sm mt-1">{leads.length} leads · Pipeline value: ${totalValue.toLocaleString()}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm">+ Add Lead</button>
      </div>
      {msg && <div className="mb-4 text-green-400 text-sm">{msg}</div>}
      {showAdd && (
        <div className="mb-4 bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          <h3 className="text-white font-medium mb-3">New Lead</h3>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <input className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-white text-sm" placeholder="Company Name" value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} />
            <input className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-white text-sm" placeholder="Contact Name" value={form.contact_name} onChange={e => setForm({ ...form, contact_name: e.target.value })} />
            <input className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-white text-sm" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <input className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-white text-sm" placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <input className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-white text-sm" placeholder="Est. Value ($)" type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} />
            <input className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-white text-sm" placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <button onClick={addLead} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm">Add</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 bg-[#1e2a45] text-gray-300 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1e2a45]">
              {['Company', 'Contact', 'Email', 'Status', 'Value', 'Notes', 'Created'].map(h => (
                <th key={h} className="text-left text-gray-400 text-xs font-medium px-4 py-3 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map(l => (
              <tr key={l.id} className="border-b border-[#1e2a45] hover:bg-[#0a0e1a]">
                <td className="px-4 py-3 text-white text-sm font-medium">{l.company_name}</td>
                <td className="px-4 py-3 text-gray-300 text-sm">{l.contact_name}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{l.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded capitalize ${STATUS_COLORS[l.status] ?? 'bg-gray-500/20 text-gray-400'}`}>{l.status}</span>
                </td>
                <td className="px-4 py-3 text-green-400 text-sm font-medium">${Number(l.value).toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-400 text-xs max-w-xs truncate">{l.notes}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{new Date(l.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {leads.length === 0 && <div className="text-center py-8 text-gray-500">No leads — initialize DB first</div>}
      </div>
    </div>
  );
}
