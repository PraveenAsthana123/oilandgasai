'use client';
export default function CustomerDocumentsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">My Documents</h1>
      <a href="/documents" className="text-purple-400 text-sm">← View full document library</a>
      <div className="grid grid-cols-2 gap-3">
        {['Vendor Manual v2.3', 'HSE Requirements', 'Invoice Guidelines', 'Safety Orientation'].map((doc) => (
          <div key={doc} className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-3 flex items-center gap-3">
            <span className="text-2xl">📄</span>
            <div><div className="text-white text-sm">{doc}</div><div className="text-gray-500 text-xs">PDF</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}
