'use client';
import { useEffect, useState } from 'react';

export default function AdminReportsPage() {
  const [data, setData] = useState<Record<string, Record<string, string>> | null>(null);

  useEffect(() => {
    fetch('/api/admin/reports').then((r) => r.json()).then((d) => setData(d.summary));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Admin Reports</h1>
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'Vendor Summary', data: data.vendors, keys: ['count', 'approved'] },
            { title: 'RFQ Summary', data: data.rfqs, keys: ['count', 'open'] },
            { title: 'Bid Summary', data: data.bids, keys: ['count', 'total_value'] },
            { title: 'Purchase Orders', data: data.purchase_orders, keys: ['count', 'complete', 'total_value'] },
            { title: 'Invoice Summary', data: data.invoices, keys: ['count', 'paid', 'total_value'] },
            { title: 'Dispute Summary', data: data.disputes, keys: ['count', 'open'] },
          ].map((section) => (
            <div key={section.title} className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3">{section.title}</h3>
              {section.keys.map((k) => (
                <div key={k} className="flex justify-between py-1 text-sm">
                  <span className="text-gray-400 capitalize">{k.replace('_', ' ')}</span>
                  <span className="text-white font-medium">{k === 'total_value' ? `$${Number(section.data[k] || 0).toLocaleString()} CAD` : section.data[k] || '0'}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
