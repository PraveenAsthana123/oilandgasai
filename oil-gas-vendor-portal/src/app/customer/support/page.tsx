'use client';
export default function CustomerSupportPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Customer Support</h1>
      <div className="grid grid-cols-3 gap-4">
        {[{ icon: '🤖', label: 'AI Q&A', href: '/ai-assistant', desc: 'Get instant answers' }, { icon: '🎫', label: 'Submit Ticket', href: '/support', desc: 'Contact procurement team' }, { icon: '📚', label: 'Documentation', href: '/documents', desc: 'Browse help docs' }].map((item) => (
          <a key={item.href} href={item.href} className="bg-[#0f1629] border border-[#1e2a45] hover:border-purple-500 rounded-lg p-4 transition-colors text-center">
            <div className="text-3xl mb-2">{item.icon}</div>
            <div className="text-white font-medium">{item.label}</div>
            <div className="text-gray-500 text-xs mt-1">{item.desc}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
