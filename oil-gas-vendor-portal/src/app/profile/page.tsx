'use client';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const [vendor, setVendor] = useState<Record<string, unknown> | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/vendors').then((r) => r.json()).then((d) => {
      if (d.vendors?.[0]) setVendor(d.vendors[0]);
    });
  }, []);

  const fields = [
    { label: 'Legal Company Name', key: 'company', type: 'text' },
    { label: 'Business Number (CRA)', key: 'business_number', type: 'text' },
    { label: 'HST/GST Registration Number', key: 'hst_number', type: 'text' },
    { label: 'WSIB Status', key: 'wsib_status', type: 'text' },
    { label: 'Approval Status', key: 'approval_status', type: 'text' },
    { label: 'Performance Score', key: 'performance_score', type: 'number' },
  ];

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Vendor Profile</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your company registration, certifications, and banking information</p>
      </div>

      {vendor ? (
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-900/50 rounded-full flex items-center justify-center text-2xl">🏭</div>
            <div>
              <div className="text-white font-semibold text-lg">{String(vendor.company || '')}</div>
              <div className="text-green-400 text-sm">✓ Approved Vendor</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((f) => (
              <div key={f.key}>
                <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1">{f.label}</label>
                <input
                  type={f.type}
                  defaultValue={String(vendor[f.key] ?? '')}
                  className="w-full bg-[#1e2a45] border border-[#2a3a55] text-white rounded px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Service Categories</label>
            <div className="flex flex-wrap gap-2">
              {['Drilling Services', 'Pipeline Services', 'Inspection & NDT', 'Maintenance & Repair', 'Environmental Services', 'Instrumentation & Controls', 'AI/IT Services', 'Engineering Services', 'Safety Services', 'Supply & Materials'].map((cat) => {
                const cats = Array.isArray(vendor.service_categories) ? vendor.service_categories : [];
                const selected = cats.includes(cat);
                return (
                  <button key={cat} className={`text-xs px-3 py-1 rounded-full border ${selected ? 'bg-purple-900/50 border-purple-500 text-purple-300' : 'border-[#1e2a45] text-gray-400'}`}>
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-[#1e2a45] pt-4">
            <h3 className="text-white font-medium mb-3">Banking Information (Confidential)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Bank Transit Number</label>
                <input type="password" placeholder="••••••" className="w-full bg-[#1e2a45] border border-[#2a3a55] text-white rounded px-3 py-2 text-sm focus:border-purple-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Account Number</label>
                <input type="password" placeholder="••••••••••" className="w-full bg-[#1e2a45] border border-[#2a3a55] text-white rounded px-3 py-2 text-sm focus:border-purple-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Institution Number</label>
                <input type="password" placeholder="•••" className="w-full bg-[#1e2a45] border border-[#2a3a55] text-white rounded px-3 py-2 text-sm focus:border-purple-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Payment Terms Preference</label>
                <select className="w-full bg-[#1e2a45] border border-[#2a3a55] text-white rounded px-3 py-2 text-sm focus:border-purple-500 focus:outline-none">
                  <option>Net 30</option><option>Net 45</option><option>Net 60</option>
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={() => setSaved(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Save Profile
          </button>
          {saved && <span className="text-green-400 text-sm ml-3">✓ Profile saved</span>}
        </div>
      ) : (
        <div className="text-gray-400 animate-pulse">Loading profile...</div>
      )}
    </div>
  );
}
