'use client';

const ROADMAP = [
  { quarter: 'Q4 2024', title: 'MVP Launch', items: ['Customer dashboard', 'Contract management', 'Delivery tracking', 'Invoice management', 'Quality certificates'], status: 'completed' },
  { quarter: 'Q1 2025', title: 'AI Enhancement', items: ['Ollama FAQ integration', 'Asset monitoring read-only', 'Service request workflow', 'Notification preferences'], status: 'in_progress' },
  { quarter: 'Q2 2025', title: 'Payments & Integration', items: ['Live payment gateway', 'Operations API live integration', 'Document upload capability', 'Mobile-responsive optimization'], status: 'planned' },
];

const USER_STORIES = [
  { id: 'US-001', persona: 'Customer', story: 'As a customer, I want to see all my active contracts so I can plan renewals ahead of time', acceptance: 'Show renewal alert 90 days before expiry', priority: 'high' },
  { id: 'US-002', persona: 'Customer', story: 'As a customer, I want to track my deliveries in real-time so I know when product will arrive', acceptance: 'Show scheduled/in-transit/delivered with volume', priority: 'high' },
  { id: 'US-003', persona: 'Customer', story: 'As a customer, I want to pay invoices online to reduce manual wire transfers', acceptance: 'Pay Now button records intent to DB', priority: 'medium' },
  { id: 'US-004', persona: 'Customer', story: 'As a customer, I want AI answers to common questions so I don\'t have to call support', acceptance: 'Ollama response in < 30s or clear error', priority: 'medium' },
];

export default function ProductManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Product Management</h1>
        <p className="text-gray-400 mt-1">Roadmap, user stories, and feature backlog</p>
      </div>

      <div className="space-y-4">
        {ROADMAP.map(r => (
          <div key={r.quarter} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-blue-400 font-semibold">{r.quarter}</span>
                <span className="text-white">{r.title}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs ${
                r.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                r.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>{r.status.replace('_', ' ')}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {r.items.map(i => (
                <span key={i} className="bg-[#1e2a45] text-gray-300 text-xs px-2 py-1 rounded">{i}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
        <h2 className="text-white font-semibold mb-4">User Stories</h2>
        <div className="space-y-3">
          {USER_STORIES.map(us => (
            <div key={us.id} className="border border-[#1e2a45] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-blue-400 text-xs font-mono">{us.id}</span>
                <span className="bg-[#1e2a45] text-gray-400 text-xs px-2 py-0.5 rounded">{us.persona}</span>
                <span className={`text-xs ${us.priority === 'high' ? 'text-red-400' : 'text-amber-400'}`}>● {us.priority}</span>
              </div>
              <div className="text-gray-200 text-sm">{us.story}</div>
              <div className="text-gray-500 text-xs mt-1">✓ {us.acceptance}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
