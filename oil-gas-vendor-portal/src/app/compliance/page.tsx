'use client';
import { useEffect, useState } from 'react';

interface CompDoc { id: number; doc_type: string; valid_from: string; valid_to: string; status: string; vendor_name: string; }

const statusConfig: Record<string, { color: string; label: string }> = {
  current: { color: 'bg-green-900/30 text-green-400 border-green-700', label: '✓ Current' },
  expired: { color: 'bg-red-900/30 text-red-400 border-red-700', label: '✗ Expired' },
  expiring_soon: { color: 'bg-yellow-900/30 text-yellow-400 border-yellow-700', label: '⚠ Expiring Soon' },
};

export default function CompliancePage() {
  const [docs, setDocs] = useState<CompDoc[]>([]);

  useEffect(() => {
    fetch('/api/compliance-docs').then((r) => r.json()).then((d) => setDocs(d.compliance_docs || []));
  }, []);

  const expired = docs.filter((d) => d.status === 'expired').length;
  const expiringSoon = docs.filter((d) => d.status === 'expiring_soon').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Compliance Documents</h1>
        <p className="text-gray-400 text-sm mt-1">Upload and manage required compliance certificates with expiry tracking</p>
      </div>

      {(expired > 0 || expiringSoon > 0) && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 text-red-300 text-sm">
          ⚠️ {expired} expired document(s) and {expiringSoon} expiring soon — renewal required to maintain approved status
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Current', value: docs.filter((d) => d.status === 'current').length, color: 'border-green-500' },
          { label: 'Expiring Soon', value: expiringSoon, color: 'border-yellow-500' },
          { label: 'Expired', value: expired, color: 'border-red-500' },
        ].map((k) => (
          <div key={k.label} className={`bg-[#0f1629] border ${k.color} rounded-lg p-4`}>
            <div className="text-2xl font-bold text-white">{k.value}</div>
            <div className="text-xs text-gray-400 mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-white font-semibold">Required Documents</h2>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded text-sm">+ Upload Document</button>
        </div>
        {docs.map((doc) => {
          const cfg = statusConfig[doc.status] || { color: 'bg-gray-800 text-gray-400 border-gray-700', label: doc.status };
          const daysLeft = Math.ceil((new Date(doc.valid_to).getTime() - Date.now()) / 86400000);
          return (
            <div key={doc.id} className="flex items-center justify-between p-3 bg-[#1e2a45] rounded-lg">
              <div className="flex items-center gap-3">
                <div className="text-2xl">📄</div>
                <div>
                  <div className="text-white text-sm font-medium">{doc.doc_type}</div>
                  <div className="text-gray-500 text-xs">Valid: {doc.valid_from} → {doc.valid_to} {daysLeft > 0 ? `(${daysLeft} days)` : '(past)'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${cfg.color}`}>{cfg.label}</span>
                <button className="text-gray-400 hover:text-white text-xs">Renew</button>
              </div>
            </div>
          );
        })}

        <div className="border-t border-[#1e2a45] pt-3">
          <p className="text-gray-500 text-xs">Required documents: Liability Insurance (min $5M CAD), WSIB Clearance, COR/SECOR Certificate, ISO 9001/14001/45001, Safety Stats</p>
        </div>
      </div>
    </div>
  );
}
