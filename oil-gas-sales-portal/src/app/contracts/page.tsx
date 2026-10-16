'use client';
import { useEffect, useState } from 'react';

const statusColors: Record<string, string> = { draft: 'bg-slate-700 text-slate-300', legal_review: 'bg-blue-800 text-blue-300', signed: 'bg-purple-800 text-purple-300', active: 'bg-emerald-800 text-emerald-300', expired: 'bg-red-900 text-red-300' };

export default function ContractsPage() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ company: '', contract_type: 'MSA', value_cad: '', start_date: '', end_date: '', status: 'draft' });

  useEffect(() => {
    fetch('/api/contracts').then(r => r.json()).then(d => { setContracts(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  const submit = async () => {
    await fetch('/api/contracts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setShowForm(false);
    fetch('/api/contracts').then(r => r.json()).then(d => setContracts(Array.isArray(d) ? d : []));
  };

  const totalValue = contracts.filter((c: any) => c.status === 'active').reduce((s: number, c: any) => s + parseFloat(c.value_cad || 0), 0);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Contract Management</h1>
          <p className="text-slate-400 text-sm mt-1">MSA, PSA, supply agreements, service contracts</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + New Contract
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Active Contracts', value: contracts.filter((c: any) => c.status === 'active').length, color: 'text-emerald-400' },
          { label: 'Active Value (CAD)', value: `$${(totalValue / 1000000).toFixed(1)}M`, color: 'text-emerald-400' },
          { label: 'Draft / Review', value: contracts.filter((c: any) => ['draft', 'legal_review'].includes(c.status)).length, color: 'text-yellow-400' },
          { label: 'Expired', value: contracts.filter((c: any) => c.status === 'expired').length, color: 'text-red-400' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-3">
            <div className="text-xs text-slate-400">{kpi.label}</div>
            <div className={`text-xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4 space-y-3">
          <h2 className="text-sm font-semibold text-white">New Contract</h2>
          <div className="grid grid-cols-2 gap-3">
            {[['company', 'Company'], ['value_cad', 'Value (CAD)'], ['start_date', 'Start Date'], ['end_date', 'End Date']].map(([k, label]) => (
              <div key={k}>
                <label className="block text-xs text-slate-400 mb-1">{label}</label>
                <input type={k.includes('date') ? 'date' : 'text'} value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} className="w-full bg-[#0a0e1a] border border-[#1e2a45] text-white text-sm rounded px-3 py-1.5" />
              </div>
            ))}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Contract Type</label>
              <select value={form.contract_type} onChange={e => setForm(f => ({ ...f, contract_type: e.target.value }))} className="w-full bg-[#0a0e1a] border border-[#1e2a45] text-white text-sm rounded px-3 py-1.5">
                <option value="MSA">MSA — Master Service Agreement</option>
                <option value="PSA">PSA — Professional Services Agreement</option>
                <option value="Supply Agreement">Supply Agreement</option>
                <option value="Service Agreement">Service Agreement</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full bg-[#0a0e1a] border border-[#1e2a45] text-white text-sm rounded px-3 py-1.5">
                <option value="draft">Draft</option>
                <option value="legal_review">Legal Review</option>
                <option value="signed">Signed</option>
                <option value="active">Active</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={submit} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded text-sm">Save</button>
            <button onClick={() => setShowForm(false)} className="border border-[#1e2a45] text-slate-300 px-4 py-1.5 rounded text-sm">Cancel</button>
          </div>
        </div>
      )}

      {loading ? <div className="text-slate-400">Loading contracts...</div> : (
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 border-b border-[#1e2a45] bg-[#0a0e1a]">
                <th className="text-left px-4 py-3">Company</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Value (CAD)</th>
                <th className="text-left px-4 py-3">Start</th>
                <th className="text-left px-4 py-3">End</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c: any) => (
                <tr key={c.id} className="border-b border-[#1e2a45]/40 hover:bg-[#1e2a45]/20">
                  <td className="px-4 py-3 font-medium text-white">{c.company}</td>
                  <td className="px-4 py-3 text-slate-400">{c.contract_type}</td>
                  <td className="px-4 py-3 text-emerald-400 font-bold">${parseFloat(c.value_cad || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-400">{c.start_date ? new Date(c.start_date).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 text-slate-400">{c.end_date ? new Date(c.end_date).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${statusColors[c.status] || 'bg-slate-700 text-slate-300'}`}>{c.status?.replace('_', ' ')}</span></td>
                </tr>
              ))}
              {contracts.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-slate-500">No contracts found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
