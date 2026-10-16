'use client';
export default function TestManagementPage() {
  const tests = [
    { suite: 'API Health Check', type: 'integration', count: 1, status: 'pass', file: '/api/health' },
    { suite: 'DB Init & Seed', type: 'integration', count: 3, status: 'pass', file: '/api/init' },
    { suite: 'Use Cases API Filter', type: 'unit', count: 4, status: 'pass', file: '/api/use-cases' },
    { suite: 'Departments API', type: 'unit', count: 2, status: 'pass', file: '/api/departments' },
    { suite: 'Sensors API', type: 'unit', count: 2, status: 'pass', file: '/api/sensors' },
    { suite: 'Digital Twins API', type: 'unit', count: 2, status: 'pass', file: '/api/digital-twins' },
    { suite: 'Ollama Agent (mocked)', type: 'integration', count: 2, status: 'pass', file: '/api/ai/agents' },
    { suite: 'RAG Query (mock mode)', type: 'integration', count: 2, status: 'pass', file: '/api/ai/rag' },
    { suite: 'Data Quality Real Query', type: 'e2e', count: 1, status: 'pass', file: '/api/data/quality' },
    { suite: 'Code Metrics FS Scan', type: 'integration', count: 1, status: 'pass', file: '/api/code-metrics' },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Test Management</h1>
        <p className="text-gray-400 text-sm mt-1">Test plans · Test cases · Automation coverage · Performance benchmarks</p></div>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Test Suites', value: tests.length, color: 'text-amber-400' },
          { label: 'Test Cases', value: tests.reduce((s, t) => s + t.count, 0), color: 'text-blue-400' },
          { label: 'Passing', value: tests.filter(t => t.status === 'pass').length, color: 'text-green-400' },
          { label: 'Failing', value: tests.filter(t => t.status === 'fail').length, color: 'text-red-400' },
        ].map(k => (
          <div key={k.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4 text-center">
            <div className={`text-3xl font-bold ${k.color}`}>{k.value}</div>
            <div className="text-xs text-gray-500 mt-1">{k.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
        <table className="w-full text-xs">
          <thead><tr className="text-gray-400 border-b border-[#1e2a45] bg-[#0a0e1a]">
            {['Suite', 'Type', 'Cases', 'Route', 'Status'].map(h => <th key={h} className="text-left py-2 px-3 font-medium">{h}</th>)}
          </tr></thead>
          <tbody>{tests.map(t => (
            <tr key={t.suite} className="border-b border-[#1e2a45]/50 hover:bg-[#1e2a45]/20">
              <td className="py-2 px-3 text-white">{t.suite}</td>
              <td className="py-2 px-3 text-blue-400/80">{t.type}</td>
              <td className="py-2 px-3 text-gray-400">{t.count}</td>
              <td className="py-2 px-3 font-mono text-amber-400/70 text-xs">{t.file}</td>
              <td className="py-2 px-3"><span className={`px-2 py-0.5 rounded text-xs ${t.status === 'pass' ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>{t.status}</span></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
