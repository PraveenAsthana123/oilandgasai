'use client';

const TEST_CASES = [
  { id: 'TC-001', module: 'Dashboard', description: 'Load customer dashboard with seeded data', type: 'e2e', status: 'pass' },
  { id: 'TC-002', module: 'Contracts', description: 'Display active contracts with renewal alert', type: 'unit', status: 'pass' },
  { id: 'TC-003', module: 'Deliveries', description: 'Filter deliveries by status', type: 'integration', status: 'pass' },
  { id: 'TC-004', module: 'Invoices', description: 'Pay invoice via PATCH /api/invoices/[id]/pay', type: 'api', status: 'pass' },
  { id: 'TC-005', module: 'Quality Certs', description: 'Display spec badges: within_spec/marginal/out_of_spec', type: 'unit', status: 'pass' },
  { id: 'TC-006', module: 'AI FAQ', description: 'Ollama 30s timeout with graceful fallback', type: 'integration', status: 'pending' },
  { id: 'TC-007', module: 'Monitoring', description: 'Show mocked banner when OPERATIONS_API_URL not set', type: 'unit', status: 'pass' },
  { id: 'TC-008', module: 'Support', description: 'Submit support ticket and verify DB insert', type: 'api', status: 'pass' },
  { id: 'TC-009', module: 'DB Init', description: 'GET /api/init creates all 14 tables + seed data', type: 'api', status: 'pass' },
  { id: 'TC-010', module: 'Health', description: 'GET /api/health returns connected/disconnected', type: 'api', status: 'pass' },
];

export default function TestManagementPage() {
  const passed = TEST_CASES.filter(t => t.status === 'pass').length;
  const total = TEST_CASES.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Test Management</h1>
        <p className="text-gray-400 mt-1">Test plans, cases, and coverage</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Tests', value: total, color: 'text-white' },
          { label: 'Passing', value: passed, color: 'text-green-400' },
          { label: 'Pending', value: total - passed, color: 'text-amber-400' },
          { label: 'Coverage', value: Math.round(passed / total * 100) + '%', color: 'text-blue-400' },
        ].map(s => (
          <div key={s.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-gray-500 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e2a45] text-gray-500 text-xs uppercase">
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Module</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {TEST_CASES.map(tc => (
              <tr key={tc.id} className="border-b border-[#1e2a45]/50">
                <td className="px-4 py-3 text-blue-400 font-mono text-xs">{tc.id}</td>
                <td className="px-4 py-3 text-gray-300">{tc.module}</td>
                <td className="px-4 py-3 text-gray-400">{tc.description}</td>
                <td className="px-4 py-3"><span className="bg-[#1e2a45] text-gray-400 text-xs px-2 py-0.5 rounded">{tc.type}</span></td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium ${tc.status === 'pass' ? 'text-green-400' : tc.status === 'fail' ? 'text-red-400' : 'text-amber-400'}`}>
                    {tc.status === 'pass' ? '✓ Pass' : tc.status === 'fail' ? '✗ Fail' : '⋯ Pending'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
