'use client';
export default function BRDPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Business Requirements Document</h1>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-5 space-y-4">
        <section>
          <h2 className="text-purple-400 font-semibold mb-2">Project Overview</h2>
          <p className="text-gray-300 text-sm">Oil & Gas Vendor Portal (OGV) — A comprehensive self-service platform enabling O&G vendors to manage RFQs, bids, purchase orders, invoices, compliance documents, safety pre-qualification, and performance scorecards. Targeted at the Western Canadian O&G market.</p>
        </section>
        <section>
          <h2 className="text-purple-400 font-semibold mb-2">Stakeholders</h2>
          <div className="space-y-2">
            {[['Vendors / Contractors', 'Self-service portal access, bid management, invoice submission'], ['Procurement Team', 'RFQ management, vendor evaluation, PO issuance'], ['Finance', 'Invoice approval, payment processing, dispute resolution'], ['HSE Team', 'Safety pre-qualification, compliance document review'], ['IT / Admin', 'Platform management, user roles, system configuration']].map(([role, desc]) => (
              <div key={role} className="flex gap-4 text-sm"><span className="text-white font-medium w-40 flex-shrink-0">{role}</span><span className="text-gray-400">{desc}</span></div>
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-purple-400 font-semibold mb-2">MoSCoW Priorities</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Must Have', items: ['Vendor registration & approval', 'RFQ/bid management', 'PO tracking', 'Invoice management', 'Compliance documents'], color: 'border-red-700 bg-red-900/10' },
              { label: 'Should Have', items: ['Performance scorecard', 'Safety pre-qual', 'Contract management', 'Dispute management'], color: 'border-yellow-700 bg-yellow-900/10' },
              { label: 'Could Have', items: ['Market rate benchmarking', 'AI assistant', 'Milestone tracking', 'Advanced analytics'], color: 'border-blue-700 bg-blue-900/10' },
              { label: 'Won\'t Have (v1)', items: ['ERP integration', 'Mobile app', 'Supplier diversity tracking', 'Carbon footprint tracking'], color: 'border-gray-700 bg-gray-800/10' },
            ].map((cat) => (
              <div key={cat.label} className={`border rounded-lg p-3 ${cat.color}`}>
                <div className="text-white font-medium text-sm mb-2">{cat.label}</div>
                <ul className="space-y-1">{cat.items.map((i) => <li key={i} className="text-gray-400 text-xs">• {i}</li>)}</ul>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-purple-400 font-semibold mb-2">Acceptance Criteria</h2>
          <ul className="space-y-1 text-sm text-gray-300">
            {['Vendor can complete registration in under 15 minutes', 'RFQ responses can be submitted with AI assistance', 'Performance scores computed from real DB data (not hardcoded)', 'Compliance expiry alerts auto-generated', 'All API routes return 200 on valid requests', 'Ollama AI assistant responds within 30 seconds'].map((c) => <li key={c} className="flex gap-2"><span className="text-green-400">✓</span>{c}</li>)}
          </ul>
        </section>
      </div>
    </div>
  );
}
