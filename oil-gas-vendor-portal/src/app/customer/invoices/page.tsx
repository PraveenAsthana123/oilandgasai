'use client';
import { useEffect, useState } from 'react';
export default function CustomerInvoicesPage() {
  const [invoices, setInvoices] = useState<Record<string, unknown>[]>([]);
  useEffect(() => { fetch('/api/invoices').then((r) => r.json()).then((d) => setInvoices(d.invoices || [])); }, []);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">My Invoices</h1>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#1e2a45]"><tr>{['Invoice #', 'PO #', 'Total CAD', 'Status'].map((h) => <th key={h} className="text-left px-4 py-3 text-gray-400 text-xs">{h}</th>)}</tr></thead>
          <tbody>
            {invoices.slice(0, 5).map((inv) => (
              <tr key={String(inv.id)} className="border-t border-[#1e2a45]">
                <td className="px-4 py-3 text-purple-400">{String(inv.invoice_number || '')}</td>
                <td className="px-4 py-3 text-gray-400">{String(inv.po_number || '')}</td>
                <td className="px-4 py-3 text-white">${Number(inv.total_cad).toLocaleString()}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full border ${inv.status === 'paid' ? 'bg-green-900/30 text-green-400 border-green-700' : 'bg-yellow-900/30 text-yellow-400 border-yellow-700'}`}>{String(inv.status || '')}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
