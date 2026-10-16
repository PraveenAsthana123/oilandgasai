'use client';
export default function CustomerPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">My Account</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { href: '/customer/profile', label: 'Profile', icon: '👤', desc: 'View and edit your account details' },
          { href: '/customer/requests', label: 'Requests', icon: '📝', desc: 'Track service requests and inquiries' },
          { href: '/customer/invoices', label: 'Invoices', icon: '🧾', desc: 'View your invoice history' },
          { href: '/customer/documents', label: 'Documents', icon: '📄', desc: 'Access your documents' },
          { href: '/customer/notifications', label: 'Notifications', icon: '🔔', desc: 'Manage notification preferences' },
          { href: '/customer/support', label: 'Support', icon: '💬', desc: 'Get help and contact support' },
        ].map((item) => (
          <a key={item.href} href={item.href} className="bg-[#0f1629] border border-[#1e2a45] hover:border-purple-500 rounded-lg p-4 transition-colors">
            <div className="text-3xl mb-2">{item.icon}</div>
            <div className="text-white font-medium">{item.label}</div>
            <div className="text-gray-500 text-sm mt-1">{item.desc}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
