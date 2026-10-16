'use client';
import Link from 'next/link';
const pages = [
  {href:'/admin/users',label:'User Management',desc:'CRUD users, roles, MFA status'},
  {href:'/admin/roles',label:'Role & Permission Matrix',desc:'DB-backed permissions per module'},
  {href:'/admin/audit-log',label:'Audit Trail',desc:'Every user action logged'},
  {href:'/admin/feature-flags',label:'Feature Flags',desc:'Enable/disable modules'},
  {href:'/admin/system-config',label:'System Config',desc:'Env var presence, integration health'},
  {href:'/admin/reports',label:'Analytics Reports',desc:'Users, actions, incidents, compliance'},
];
export default function AdminPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-2">Admin Overview</h1>
      <p className="text-gray-400 text-sm mb-6">Admin section — users, roles, audit, config, reports</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pages.map(p=><Link key={p.href} href={p.href} className="bg-[#0f1629] border border-[#1e2a45] hover:border-red-500/40 rounded-xl p-5 transition-colors"><div className="text-white font-medium mb-1">{p.label}</div><div className="text-gray-400 text-sm">{p.desc}</div></Link>)}
      </div>
    </div>
  );
}
