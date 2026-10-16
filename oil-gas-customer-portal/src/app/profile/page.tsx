'use client';
import { useEffect, useState } from 'react';

interface Customer {
  id: number;
  company: string;
  contact_name: string;
  email: string;
  phone: string;
  billing_address: string;
  payment_method: string;
  created_at: string;
}

export default function ProfilePage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/contracts').then(r => r.json()).then(async () => {
      const r = await fetch('/api/health');
      const h = await r.json();
      if (h.db === 'connected') {
        const res = await fetch('/api/init');
        const d = await res.json();
        // Fetch customers from init response or dummy
        setCustomers([
          { id: 1, company: 'Suncor Energy Inc.', contact_name: 'James Whitfield', email: 'j.whitfield@suncor-demo.ca', phone: '+1-403-555-0100', billing_address: '150 6th Ave SW, Calgary, AB T2P 3Y7', payment_method: 'wire', created_at: new Date().toISOString() },
          { id: 2, company: 'Imperial Oil Ltd.', contact_name: 'Sandra Kowalski', email: 's.kowalski@imperialoil-demo.ca', phone: '+1-780-555-0200', billing_address: '505 Quarry Park Blvd SE, Calgary, AB T2C 5N1', payment_method: 'ach', created_at: new Date().toISOString() },
          { id: 3, company: 'Canadian Natural Resources', contact_name: 'Raj Mehta', email: 'r.mehta@cnr-demo.ca', phone: '+1-403-555-0300', billing_address: '2100 855 2nd St SW, Calgary, AB T2P 4J8', payment_method: 'bank_transfer', created_at: new Date().toISOString() },
        ]);
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-blue-400">Loading profile...</div>;
  const c = customers[selected];
  if (!c) return <div className="text-gray-400">No profile found</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Account Profile</h1>
        <p className="text-gray-400 mt-1">Company info, billing address, and communication preferences</p>
      </div>

      {/* Customer selector */}
      <div className="flex gap-2">
        {customers.map((cu, i) => (
          <button key={cu.id} onClick={() => setSelected(i)}
            className={`px-3 py-1.5 rounded-lg text-sm ${i === selected ? 'bg-blue-600 text-white' : 'bg-[#0f1629] border border-[#1e2a45] text-gray-400'}`}>
            {cu.company}
          </button>
        ))}
      </div>

      {msg && <div className="bg-green-900/20 border border-green-600/40 rounded-xl p-3 text-green-400 text-sm">{msg}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Company Information</h2>
          <div className="space-y-3">
            {[
              { label: 'Company Name', value: c.company },
              { label: 'Primary Contact', value: c.contact_name },
              { label: 'Email', value: c.email },
              { label: 'Phone', value: c.phone },
            ].map(f => (
              <div key={f.label}>
                <div className="text-gray-500 text-xs mb-0.5">{f.label}</div>
                <div className="text-gray-200 text-sm">{f.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Billing & Payment</h2>
          <div className="space-y-3">
            <div>
              <div className="text-gray-500 text-xs mb-0.5">Billing Address</div>
              <div className="text-gray-200 text-sm">{c.billing_address}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs mb-0.5">Payment Method</div>
              <div className="flex items-center gap-2">
                <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-xs">{c.payment_method.replace('_', ' ').toUpperCase()}</span>
              </div>
            </div>
            <div>
              <div className="text-gray-500 text-xs mb-0.5">Account Since</div>
              <div className="text-gray-200 text-sm">{new Date(c.created_at).toLocaleDateString('en-CA')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
        <h2 className="text-white font-semibold mb-4">Communication Preferences</h2>
        <div className="text-gray-400 text-sm">Manage your notification preferences on the <a href="/notifications" className="text-blue-400 hover:underline">Notification Preferences</a> page.</div>
      </div>
    </div>
  );
}
