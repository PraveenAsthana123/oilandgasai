'use client';
import { useEffect, useState } from 'react';

interface Contract {
  id: number;
  company: string;
  contract_type: string;
  product: string;
  volume_annual: number;
  price_cad: number;
  start_date: string;
  end_date: string;
  status: string;
  renewal_alert: boolean;
  days_to_expiry: number;
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/contracts').then(r => r.json()).then(d => {
      setContracts(d.contracts || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-blue-400">Loading contracts...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Contracts</h1>
        <p className="text-gray-400 mt-1">Active MSA, supply agreements, and service contracts</p>
      </div>

      {contracts.filter(c => c.renewal_alert).length > 0 && (
        <div className="bg-amber-900/20 border border-amber-600/40 rounded-xl p-4">
          <div className="text-amber-400 font-semibold mb-2">⚠ Renewal Alerts</div>
          {contracts.filter(c => c.renewal_alert).map(c => (
            <div key={c.id} className="text-amber-300 text-sm">
              {c.contract_type} — {c.product}: expires in {c.days_to_expiry} days ({new Date(c.end_date).toLocaleDateString('en-CA')})
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-4">
        {contracts.map(c => (
          <div key={c.id} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-white font-semibold">{c.contract_type} — {c.product}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${c.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {c.status}
                  </span>
                  {c.renewal_alert && <span className="px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400">Renewal in {c.days_to_expiry} days</span>}
                </div>
                <div className="text-gray-400 text-sm">{c.company}</div>
              </div>
              <button className="text-blue-400 text-sm border border-blue-600/40 px-3 py-1.5 rounded-lg hover:bg-blue-600/10">
                📄 Download PDF
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-gray-500 text-xs">Annual Volume</div>
                <div className="text-gray-200 text-sm font-medium">{Number(c.volume_annual).toLocaleString()} units</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">Price (CAD)</div>
                <div className="text-gray-200 text-sm font-medium">${Number(c.price_cad).toFixed(2)}/unit</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">Start Date</div>
                <div className="text-gray-200 text-sm">{new Date(c.start_date).toLocaleDateString('en-CA')}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">End Date</div>
                <div className={`text-sm font-medium ${c.renewal_alert ? 'text-amber-400' : 'text-gray-200'}`}>
                  {new Date(c.end_date).toLocaleDateString('en-CA')}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
