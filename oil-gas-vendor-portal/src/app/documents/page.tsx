'use client';

const DOCS = [
  { title: 'Vendor Manual v2.3', category: 'General', type: 'PDF', size: '2.4 MB', updated: '2026-09-15' },
  { title: 'Pipeline Inspection Standard OGC-PL-2024', category: 'Technical Standards', type: 'PDF', size: '8.1 MB', updated: '2026-08-01' },
  { title: 'HSE Requirements for Contractors', category: 'Safety', type: 'PDF', size: '3.7 MB', updated: '2026-07-20' },
  { title: 'Invoice Submission Guidelines', category: 'Procurement', type: 'PDF', size: '1.2 MB', updated: '2026-10-01' },
  { title: 'Wellsite Safety Orientation', category: 'Safety', type: 'PDF', size: '5.5 MB', updated: '2026-06-15' },
  { title: 'Corrosion Inhibitor SOP', category: 'Technical Standards', type: 'PDF', size: '2.9 MB', updated: '2026-05-10' },
  { title: 'Environmental Compliance Checklist', category: 'Environmental', type: 'XLSX', size: '0.4 MB', updated: '2026-09-28' },
  { title: 'Inspection Acceptance Criteria', category: 'Technical Standards', type: 'PDF', size: '4.3 MB', updated: '2026-08-22' },
];

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Document Library</h1>
        <p className="text-gray-400 text-sm mt-1">Technical specs, standards, SOPs, and compliance documents for your scope</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        {['All', 'General', 'Technical Standards', 'Safety', 'Procurement', 'Environmental'].map((cat) => (
          <button key={cat} className="px-3 py-1 text-sm rounded-full border border-[#1e2a45] text-gray-400 hover:border-purple-500 hover:text-purple-300">{cat}</button>
        ))}
      </div>

      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#1e2a45]">
            <tr>
              {['Document', 'Category', 'Type', 'Size', 'Updated', ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-gray-400 text-xs uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DOCS.map((doc) => (
              <tr key={doc.title} className="border-t border-[#1e2a45] hover:bg-[#1e2a45]/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{doc.type === 'PDF' ? '📕' : '📊'}</span>
                    <span className="text-white text-sm">{doc.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-400">{doc.category}</td>
                <td className="px-4 py-3 text-purple-400">{doc.type}</td>
                <td className="px-4 py-3 text-gray-500">{doc.size}</td>
                <td className="px-4 py-3 text-gray-500">{doc.updated}</td>
                <td className="px-4 py-3">
                  <button className="text-xs bg-[#1e2a45] hover:bg-[#2a3a55] text-gray-300 px-3 py-1 rounded">📥 Download</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
