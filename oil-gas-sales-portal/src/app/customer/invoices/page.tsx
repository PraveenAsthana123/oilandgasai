'use client';

const INVOICES = [
  { id: 'INV-2026-001', date: '2026-09-01', amount: 125000, status: 'paid', desc: 'AI Reservoir Monitoring — Sept 2026' },
  { id: 'INV-2026-002', date: '2026-10-01', amount: 125000, status: 'outstanding', desc: 'AI Reservoir Monitoring — Oct 2026' },
  { id: 'INV-2026-003', date: '2026-08-15', amount: 50000, status: 'paid', desc: 'Implementation Services — Phase 1' },
];

export default function InvoicesPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-white">Invoices</h1>
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded p-3"><div className="text-xs text-slate-400">Total Paid</div><div className="text-xl font-bold text-emerald-400">$175K</div></div>
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded p-3"><div className="text-xs text-slate-400">Outstanding</div><div className="text-xl font-bold text-yellow-400">$125K</div></div>
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded p-3"><div className="text-xs text-slate-400">Payment Terms</div><div className="text-xl font-bold text-white">Net 30</div></div>
      </div>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 border-b border-[#1e2a45] bg-[#0a0e1a]">
              <th className="text-left px-4 py-3">Invoice #</th>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-left px-4 py-3">Description</th>
              <th className="text-left px-4 py-3">Amount (CAD)</th>
              <th className="text-left px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {INVOICES.map(i => (
              <tr key={i.id} className="border-b border-[#1e2a45]/40 hover:bg-[#1e2a45]/20">
                <td className="px-4 py-3 text-white font-medium">{i.id}</td>
                <td className="px-4 py-3 text-slate-400">{i.date}</td>
                <td className="px-4 py-3 text-slate-300">{i.desc}</td>
                <td className="px-4 py-3 text-emerald-400 font-bold">${i.amount.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${i.status === 'paid' ? 'bg-emerald-800 text-emerald-300' : 'bg-yellow-800 text-yellow-300'}`}>{i.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
