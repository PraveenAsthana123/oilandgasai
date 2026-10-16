'use client';
import { useEffect, useState } from 'react';

export default function AdminReportsPage() {
  const [data, setData] = useState({ totalRevenue: 0, paidInvoices: 0, outstandingCount: 0, deliveredCount: 0 });

  useEffect(() => {
    Promise.all([
      fetch('/api/invoices').then(r => r.json()),
      fetch('/api/deliveries').then(r => r.json()),
    ]).then(([inv, del]) => {
      const invoices = inv.invoices || [];
      const deliveries = del.deliveries || [];
      setData({
        totalRevenue: invoices.filter((i: { computed_status: string }) => i.computed_status === 'paid').reduce((s: number, i: { total_cad: number }) => s + Number(i.total_cad), 0),
        paidInvoices: invoices.filter((i: { computed_status: string }) => i.computed_status === 'paid').length,
        outstandingCount: invoices.filter((i: { computed_status: string }) => i.computed_status !== 'paid').length,
        deliveredCount: deliveries.filter((d: { status: string }) => d.status === 'delivered').length,
      });
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Reports</h1>
        <p className="text-gray-400 mt-1">Aggregate business metrics</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue (CAD)', value: '$' + (data.totalRevenue / 1000).toFixed(0) + 'K', color: 'text-green-400' },
          { label: 'Paid Invoices', value: data.paidInvoices, color: 'text-white' },
          { label: 'Outstanding Invoices', value: data.outstandingCount, color: 'text-amber-400' },
          { label: 'Completed Deliveries', value: data.deliveredCount, color: 'text-blue-400' },
        ].map(s => (
          <div key={s.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-gray-500 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
