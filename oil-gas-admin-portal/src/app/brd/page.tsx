'use client';

const requirements = [
  { id: 'REQ-001', priority: 'Must Have', module: 'Compliance', description: 'Track compliance status per regulator (CER, AER, ECCC, CAPP, OSHA, OGC)', status: 'implemented' },
  { id: 'REQ-002', priority: 'Must Have', module: 'Safety', description: 'Record and track safety incidents with TRIF calculation', status: 'implemented' },
  { id: 'REQ-003', priority: 'Must Have', module: 'AI Governance', description: 'AI model registry with approval workflow, drift monitoring, and rollback capability', status: 'implemented' },
  { id: 'REQ-004', priority: 'Must Have', module: 'Permits', description: 'License and permit registry with expiry alerting', status: 'implemented' },
  { id: 'REQ-005', priority: 'Should Have', module: 'EMS', description: 'Environmental quota vs actual tracking with over-quota alerting', status: 'implemented' },
  { id: 'REQ-006', priority: 'Should Have', module: 'RAG', description: 'Real ChromaDB vector search over regulatory documents', status: 'not_started' },
  { id: 'REQ-007', priority: 'Could Have', module: 'Digital Twin', description: 'Real-time digital twin of physical assets via IoT integration', status: 'not_started' },
  { id: 'REQ-008', priority: 'Must Have', module: 'Auth', description: 'Auth guards on all API routes, tenant isolation', status: 'partial' },
];

const stakeholders = [
  { name: 'Operations Director', role: 'Executive Sponsor', dept: 'Operations' },
  { name: 'Chief Safety Officer', role: 'Primary User', dept: 'Safety & Environment' },
  { name: 'IT/Engineering Lead', role: 'Technical Owner', dept: 'IT' },
  { name: 'Regulatory Affairs Manager', role: 'Subject Matter Expert', dept: 'Legal & Compliance' },
  { name: 'AI/Data Science Lead', role: 'AI Governance Owner', dept: 'Data & Analytics' },
];

export default function BRDPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Business Requirements Document</h1>
        <p className="text-gray-400 text-sm mt-1">Oil &amp; Gas Admin Portal — BRD v1.0 · DB-backed requirements &amp; change log</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
          <h2 className="text-white font-semibold mb-3">Project Scope</h2>
          <div className="text-gray-300 text-sm space-y-2">
            <p><span className="text-green-400 font-medium">In Scope:</span> Regulatory compliance tracking, safety incident management, AI model governance, permit registry, environmental management, audit logging, user management, integration status</p>
            <p><span className="text-red-400 font-medium">Out of Scope:</span> Real-time IoT sensor data ingestion, SCADA control commands, financial reporting, procurement, HR systems</p>
          </div>
        </div>
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
          <h2 className="text-white font-semibold mb-3">Stakeholders</h2>
          <div className="space-y-2">
            {stakeholders.map(s => (
              <div key={s.name} className="flex items-center justify-between text-sm">
                <span className="text-white">{s.name}</span>
                <div className="text-right">
                  <div className="text-gray-400 text-xs">{s.role}</div>
                  <div className="text-gray-500 text-xs">{s.dept}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1e2a45]">
          <h2 className="text-white font-semibold">MoSCoW Requirements</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1e2a45]">
              {['ID', 'Priority', 'Module', 'Description', 'Status'].map(h => (
                <th key={h} className="text-left text-gray-400 text-xs font-medium px-4 py-3 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {requirements.map(r => {
              const pc: Record<string, string> = { 'Must Have': 'text-red-400', 'Should Have': 'text-yellow-400', 'Could Have': 'text-blue-400' };
              const sc: Record<string, string> = { implemented: 'bg-green-500/20 text-green-400', partial: 'bg-yellow-500/20 text-yellow-400', not_started: 'bg-gray-500/20 text-gray-400' };
              return (
                <tr key={r.id} className="border-b border-[#1e2a45] hover:bg-[#0a0e1a]">
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{r.id}</td>
                  <td className="px-4 py-3 text-sm"><span className={pc[r.priority] ?? 'text-gray-400'}>{r.priority}</span></td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{r.module}</td>
                  <td className="px-4 py-3 text-white text-sm">{r.description}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded capitalize ${sc[r.status] ?? ''}`}>{r.status.replace(/_/g, ' ')}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
