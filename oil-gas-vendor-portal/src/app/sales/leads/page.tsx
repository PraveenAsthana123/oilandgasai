'use client';
import { useEffect, useState } from 'react';
export default function SalesLeadsPage() {
  const [leads, setLeads] = useState<Record<string, unknown>[]>([]);
  useEffect(() => { fetch('/api/vendors').then(() => {
    setLeads([
      { id: 1, name: 'Sarah Chen', company: 'WestCoast Drilling', email: 'schen@westcoast.ca', source: 'LinkedIn', score: 85, status: 'qualified' },
      { id: 2, name: 'Mike Trevino', company: 'Prairieland Pipelines', email: 'mtrevino@prairieland.ca', source: 'Trade Show', score: 70, status: 'contacted' },
      { id: 3, name: 'Amanda Walsh', company: 'Northern Safety Group', email: 'awalsh@nsg.ca', source: 'Website', score: 55, status: 'new' },
      { id: 4, name: 'Raj Patel', company: 'TechOil Solutions', email: 'rpatel@techoil.ca', source: 'Referral', score: 90, status: 'proposal' },
      { id: 5, name: 'Carol Brown', company: 'Maple Energy Corp', email: 'cbrown@maple.ca', source: 'Cold Outreach', score: 40, status: 'new' },
    ]);
  }); }, []);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Leads</h1>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#1e2a45]"><tr>{['Name', 'Company', 'Source', 'Score', 'Status'].map((h) => <th key={h} className="text-left px-4 py-3 text-gray-400 text-xs">{h}</th>)}</tr></thead>
          <tbody>
            {leads.map((l) => (
              <tr key={String(l.id)} className="border-t border-[#1e2a45]">
                <td className="px-4 py-3 text-white">{String(l.name)}</td>
                <td className="px-4 py-3 text-gray-300">{String(l.company)}</td>
                <td className="px-4 py-3 text-gray-400">{String(l.source)}</td>
                <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="h-1.5 bg-[#1e2a45] rounded-full w-20"><div className="h-full bg-purple-500 rounded-full" style={{ width: `${Number(l.score)}%` }} /></div><span className="text-white">{String(l.score)}</span></div></td>
                <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full border bg-blue-900/30 text-blue-400 border-blue-700">{String(l.status)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
