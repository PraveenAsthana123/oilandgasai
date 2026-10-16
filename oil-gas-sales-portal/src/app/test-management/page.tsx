'use client';

const TEST_CASES = [
  { id: 'TC-001', name: 'Seed DB via POST /api/init', type: 'API', status: 'pass', priority: 'critical' },
  { id: 'TC-002', name: 'GET /api/leads returns seeded leads', type: 'API', status: 'pass', priority: 'critical' },
  { id: 'TC-003', name: 'POST /api/leads creates new lead', type: 'API', status: 'pass', priority: 'high' },
  { id: 'TC-004', name: 'GET /api/health returns status:ok', type: 'API', status: 'pass', priority: 'critical' },
  { id: 'TC-005', name: 'ROI calculator returns correct NPV', type: 'Unit', status: 'pass', priority: 'high' },
  { id: 'TC-006', name: 'Pricing engine floor price = cost × (1 + margin%)', type: 'Unit', status: 'pass', priority: 'high' },
  { id: 'TC-007', name: 'Ollama proposal falls back to template when down', type: 'Integration', status: 'pass', priority: 'high' },
  { id: 'TC-008', name: 'Feature flags toggle via PATCH /api/admin/feature-flags/:id', type: 'API', status: 'pass', priority: 'medium' },
  { id: 'TC-009', name: 'Pipeline kanban renders all 7 stages', type: 'E2E', status: 'pass', priority: 'medium' },
  { id: 'TC-010', name: 'Customer support ticket creation', type: 'E2E', status: 'pass', priority: 'medium' },
];

export default function TestManagementPage() {
  const passed = TEST_CASES.filter(t => t.status === 'pass').length;
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-white">Test Management</h1>
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded p-3"><div className="text-xs text-slate-400">Total Tests</div><div className="text-xl font-bold text-white">{TEST_CASES.length}</div></div>
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded p-3"><div className="text-xs text-slate-400">Passed</div><div className="text-xl font-bold text-emerald-400">{passed}</div></div>
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded p-3"><div className="text-xs text-slate-400">Failed</div><div className="text-xl font-bold text-red-400">0</div></div>
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded p-3"><div className="text-xs text-slate-400">Coverage</div><div className="text-xl font-bold text-blue-400">{((passed / TEST_CASES.length) * 100).toFixed(0)}%</div></div>
      </div>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-xs text-slate-500 border-b border-[#1e2a45] bg-[#0a0e1a]"><th className="text-left px-4 py-2">ID</th><th className="text-left px-4 py-2">Test Name</th><th className="text-left px-4 py-2">Type</th><th className="text-left px-4 py-2">Priority</th><th className="text-left px-4 py-2">Status</th></tr></thead>
          <tbody>
            {TEST_CASES.map(t => (
              <tr key={t.id} className="border-b border-[#1e2a45]/40 hover:bg-[#1e2a45]/20">
                <td className="px-4 py-2 text-blue-400 text-xs">{t.id}</td>
                <td className="px-4 py-2 text-slate-300 text-xs">{t.name}</td>
                <td className="px-4 py-2 text-xs text-slate-400">{t.type}</td>
                <td className="px-4 py-2"><span className={`text-xs px-1.5 rounded ${t.priority === 'critical' ? 'bg-red-900 text-red-300' : t.priority === 'high' ? 'bg-orange-900 text-orange-300' : 'bg-slate-700 text-slate-300'}`}>{t.priority}</span></td>
                <td className="px-4 py-2"><span className="text-xs bg-emerald-800 text-emerald-300 px-1.5 rounded">✓ {t.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
