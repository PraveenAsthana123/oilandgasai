'use client';
import { useEffect, useState } from 'react';

export default function AdminPage() {
  const [data, setData] = useState<{ roles?: unknown[]; audit_log?: unknown[]; feature_flags?: unknown[] } | null>(null);
  useEffect(() => { fetch('/api/admin').then(r => r.json()).then(setData).catch(() => {}); }, []);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Admin Hub</h1>
        <p className="text-gray-400 text-sm mt-1">Users · Roles · Audit Log · Feature Flags · System Config · Reports</p></div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Roles Defined', value: data?.roles?.length ?? '—', icon: '🔑', href: '/admin/roles' },
          { label: 'Audit Events', value: data?.audit_log?.length ?? '—', icon: '📝', href: '/admin/audit-log' },
          { label: 'Feature Flags', value: data?.feature_flags?.length ?? '—', icon: '🚩', href: '/admin/feature-flags' },
        ].map((k) => (
          <a key={k.label} href={k.href} className="bg-[#0f1629] border border-[#1e2a45] hover:border-amber-500/40 rounded-xl p-4 transition-colors group">
            <div className="text-2xl mb-2">{k.icon}</div>
            <div className="text-2xl font-bold text-amber-400 group-hover:text-amber-300">{k.value}</div>
            <div className="text-xs text-gray-500 mt-1">{k.label}</div>
          </a>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {['/admin/users', '/admin/roles', '/admin/audit-log', '/admin/feature-flags', '/admin/system-config', '/admin/reports'].map(href => (
          <a key={href} href={href} className="bg-[#0f1629] border border-[#1e2a45] hover:border-amber-500/30 rounded-lg p-3 text-sm text-gray-300 hover:text-white transition-colors font-mono">
            {href}
          </a>
        ))}
      </div>
    </div>
  );
}
