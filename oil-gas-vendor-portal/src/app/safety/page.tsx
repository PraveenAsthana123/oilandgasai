'use client';

export default function SafetyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Safety Pre-qualification</h1>
        <p className="text-gray-400 text-sm mt-1">Safety management system status, audits, and corrective actions</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ label: 'TRIF 2026', value: '0.8', good: true }, { label: 'LTI Rate', value: '0.2', good: true }, { label: 'Recordable Incidents', value: '2', good: false }, { label: 'Near Misses', value: '5', good: false }].map((k) => (
          <div key={k.label} className={`bg-[#0f1629] border ${k.good ? 'border-green-700' : 'border-yellow-700'} rounded-lg p-4`}>
            <div className={`text-3xl font-bold ${k.good ? 'text-green-400' : 'text-yellow-400'}`}>{k.value}</div>
            <div className="text-gray-400 text-xs mt-1">{k.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-5 space-y-4">
        <h2 className="text-white font-semibold">Safety Management System (SMS)</h2>
        {[
          { item: 'Hazard Identification & Risk Assessment', status: 'Compliant', pct: 100 },
          { item: 'Emergency Response Plan', status: 'Compliant', pct: 100 },
          { item: 'Worker Health & Safety Program', status: 'Compliant', pct: 95 },
          { item: 'Contractor Management Program', status: 'Requires Action', pct: 70 },
          { item: 'Incident Investigation Procedure', status: 'Compliant', pct: 100 },
        ].map((item) => (
          <div key={item.item} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">{item.item}</span>
              <span className={item.status === 'Compliant' ? 'text-green-400' : 'text-yellow-400'}>{item.status}</span>
            </div>
            <div className="h-1.5 bg-[#1e2a45] rounded-full">
              <div className={`h-full rounded-full ${item.pct === 100 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${item.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-5">
        <h2 className="text-white font-semibold mb-3">Last Safety Audit</h2>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div><div className="text-gray-400 text-xs">Audit Date</div><div className="text-white">June 15, 2026</div></div>
          <div><div className="text-gray-400 text-xs">Auditor</div><div className="text-white">WorkSafe AB</div></div>
          <div><div className="text-gray-400 text-xs">Result</div><div className="text-green-400">Pass — Score 87/100</div></div>
        </div>
      </div>
      <div className="bg-[#0f1629] border border-yellow-700 rounded-lg p-5">
        <h2 className="text-white font-semibold mb-3">Open Corrective Actions</h2>
        {[{ item: 'Update Contractor Management Program', due: '2026-11-01', priority: 'Medium' }, { item: 'Refresh H2S Alive Training Records', due: '2026-10-31', priority: 'High' }].map((ca) => (
          <div key={ca.item} className="flex justify-between items-center py-2 border-b border-[#1e2a45] last:border-0">
            <div>
              <div className="text-white text-sm">{ca.item}</div>
              <div className="text-gray-500 text-xs">Due: {ca.due}</div>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${ca.priority === 'High' ? 'bg-red-900/30 text-red-400 border-red-700' : 'bg-yellow-900/30 text-yellow-400 border-yellow-700'}`}>{ca.priority}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
