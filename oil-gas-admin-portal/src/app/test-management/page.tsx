'use client';
const tests = [
  { id: 'TC-001', name: 'API Health Check', module: 'health', type: 'integration', status: 'pass' },
  { id: 'TC-002', name: 'DB Connection Pool', module: 'db', type: 'integration', status: 'pass' },
  { id: 'TC-003', name: 'Ollama Generate Response', module: 'ollama', type: 'integration', status: 'needs_run' },
  { id: 'TC-004', name: 'Incident TRIF Calculation', module: 'incidents', type: 'unit', status: 'pass' },
  { id: 'TC-005', name: 'Compliance Status Aggregation', module: 'compliance', type: 'unit', status: 'pass' },
  { id: 'TC-006', name: 'Feature Flag Toggle', module: 'feature-flags', type: 'e2e', status: 'needs_run' },
  { id: 'TC-007', name: 'Approval Workflow State Change', module: 'approvals', type: 'integration', status: 'pass' },
  { id: 'TC-008', name: 'User Role Update', module: 'users', type: 'integration', status: 'pass' },
];
export default function TestMgmtPage() {
  const pass = tests.filter(t=>t.status==='pass').length;
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-2">Test Management</h1>
      <p className="text-gray-400 text-sm mb-4">Test plans · Test cases · Test runs · {pass}/{tests.length} passing</p>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[{l:'Passing',v:pass,c:'text-green-400'},{l:'Needs Run',v:tests.filter(t=>t.status==='needs_run').length,c:'text-yellow-400'},{l:'Failed',v:tests.filter(t=>t.status==='fail').length,c:'text-red-400'}].map(s=>(
          <div key={s.l} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold ${s.c}`}>{s.v}</div>
            <div className="text-gray-400 text-xs mt-1">{s.l}</div>
          </div>
        ))}
      </div>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-[#1e2a45]">{['ID','Test Name','Module','Type','Status'].map(h=><th key={h} className="text-left text-gray-400 text-xs font-medium px-4 py-3 uppercase">{h}</th>)}</tr></thead>
          <tbody>{tests.map(t=><tr key={t.id} className="border-b border-[#1e2a45] hover:bg-[#0a0e1a]">
            <td className="px-4 py-3 font-mono text-xs text-gray-400">{t.id}</td>
            <td className="px-4 py-3 text-white text-sm">{t.name}</td>
            <td className="px-4 py-3 text-gray-400 text-sm">{t.module}</td>
            <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded">{t.type}</span></td>
            <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded ${t.status==='pass'?'bg-green-500/20 text-green-400':'bg-yellow-500/20 text-yellow-400'}`}>{t.status}</span></td>
          </tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
