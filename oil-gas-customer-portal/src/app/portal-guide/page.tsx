'use client';

const SECTIONS = [
  { title: 'Getting Started', icon: '🚀', content: 'Welcome to the Oil & Gas Customer Self-Service Portal. This portal provides you with real-time access to your contracts, deliveries, invoices, quality certificates, and AI-powered asset monitoring.' },
  { title: 'Contracts', icon: '📄', content: 'View all active MSA agreements, supply contracts, and service agreements. Receive automatic renewal alerts 90 days before expiry. Download PDF copies of any contract.' },
  { title: 'Delivery Tracking', icon: '🚛', content: 'Track the status of all your crude oil, natural gas, and refined product deliveries. Statuses include: Scheduled, In Transit, and Delivered. Download delivery certificates for completed deliveries.' },
  { title: 'Invoices & Billing', icon: '🧾', content: 'View all invoices with line items including volume, price per unit, quality adjustments, transportation costs, and HST (13% Ontario). Use "Pay Now" to initiate bank transfer, wire, or ACH payments.' },
  { title: 'Quality Certificates', icon: '🏆', content: 'Access assay reports for each delivery batch. Key specs include API gravity, sulphur %, BTU content, H₂S levels, and water content. Colored badges indicate: Within Spec (green), Marginal (amber), Out of Spec (red).' },
  { title: 'Asset Monitoring', icon: '📡', content: 'Read-only view of AI monitoring status for your wells, pipelines, and equipment. Health scores (0-100) and alert counts are updated by the operations platform. Live integration requires OPERATIONS_API_URL configuration.' },
  { title: 'Service Requests', icon: '🔧', content: 'Submit operational change requests, emergency contacts, maintenance requests, data access requests, and reporting requests. Track status from Open → In Progress → Closed.' },
  { title: 'Help Center', icon: '💬', content: 'Get instant answers from the AI assistant (powered by Ollama llama3.2). Submit support tickets for complex issues. Browse the FAQ library for common questions.' },
];

export default function PortalGuidePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Portal User Guide</h1>
        <p className="text-gray-400 mt-1">How to use this portal effectively</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SECTIONS.map(s => (
          <div key={s.title} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{s.icon}</span>
              <h3 className="text-white font-semibold">{s.title}</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">{s.content}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
        <h2 className="text-white font-semibold mb-3">Contact Support</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-blue-400 text-2xl mb-2">📧</div>
            <div className="text-gray-300 text-sm font-medium">Email</div>
            <div className="text-gray-500 text-xs">support@oilgasportal.ca</div>
          </div>
          <div className="text-center">
            <div className="text-blue-400 text-2xl mb-2">📞</div>
            <div className="text-gray-300 text-sm font-medium">Phone</div>
            <div className="text-gray-500 text-xs">+1-403-555-0001 (24/7)</div>
          </div>
          <div className="text-center">
            <div className="text-blue-400 text-2xl mb-2">💬</div>
            <div className="text-gray-300 text-sm font-medium">AI Chat</div>
            <div className="text-gray-500 text-xs">Available in Help Center</div>
          </div>
        </div>
      </div>
    </div>
  );
}
