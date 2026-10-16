'use client';

export default function BRDPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">Business Requirements Document (BRD)</h1>
      <p className="text-slate-400 text-sm">Oil & Gas Sales Portal — Requirements, Stakeholders, Scope</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
          <h2 className="text-sm font-semibold text-white mb-3">Project Overview</h2>
          <div className="space-y-2 text-sm">
            <div><span className="text-slate-400">Portal:</span> <span className="text-white">Oil & Gas Sales Portal</span></div>
            <div><span className="text-slate-400">Version:</span> <span className="text-white">1.0.0</span></div>
            <div><span className="text-slate-400">Port:</span> <span className="text-emerald-400">8382</span></div>
            <div><span className="text-slate-400">DB Prefix:</span> <span className="text-white">ogs_</span></div>
            <div><span className="text-slate-400">Stack:</span> <span className="text-white">Next.js 14, TypeScript, PostgreSQL, Ollama</span></div>
          </div>
        </div>
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
          <h2 className="text-sm font-semibold text-white mb-3">Stakeholders</h2>
          <div className="space-y-2 text-sm">
            {[['Sales Reps', 'Lead management, pipeline tracking, proposals'], ['Sales Managers', 'Forecasting, reports, team oversight'], ['Account Managers', 'Customer 360, contracts'], ['Customers', 'Self-service portal, invoices, support'], ['IT Admin', 'System config, audit log, feature flags']].map(([role, desc]) => (
              <div key={role as string} className="flex gap-2">
                <span className="text-emerald-400 w-32 flex-shrink-0 text-xs">{role as string}</span>
                <span className="text-slate-400 text-xs">{desc as string}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
        <h2 className="text-sm font-semibold text-white mb-3">MoSCoW Priorities</h2>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Must Have', color: 'border-red-600', items: ['Lead Management', 'Pipeline/Kanban', 'Quote Builder', 'Pricing Engine', 'Account Management', 'API Health Check'] },
            { label: 'Should Have', color: 'border-yellow-600', items: ['AI Proposal Generator', 'ROI Calculator', 'Revenue Forecasting', 'Contract Management', 'Customer 360'] },
            { label: 'Could Have', color: 'border-blue-600', items: ['Competitive Intelligence', 'Activity Log', 'Admin Reports', 'Feature Flags'] },
            { label: "Won't Have v1", color: 'border-slate-600', items: ['Mobile App', 'DocuSign Integration', 'ERP Integration', 'Multi-tenant SSO'] },
          ].map(cat => (
            <div key={cat.label} className={`border rounded p-3 ${cat.color}`}>
              <div className="text-xs font-semibold text-white mb-2">{cat.label}</div>
              {cat.items.map(i => <div key={i} className="text-xs text-slate-400 py-0.5">• {i}</div>)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
