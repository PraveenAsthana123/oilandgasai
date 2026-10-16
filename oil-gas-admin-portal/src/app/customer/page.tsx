'use client';
import Link from 'next/link';
const pages = [
  {href:'/customer/profile',label:'My Profile',desc:'Name, role, MFA status, preferences'},
  {href:'/customer/requests',label:'My Requests',desc:'Submitted support requests and status'},
  {href:'/customer/invoices',label:'Invoices',desc:'Billing history and invoice download'},
  {href:'/customer/documents',label:'Documents',desc:'Uploaded documents and shared files'},
  {href:'/customer/notifications',label:'Notifications',desc:'Alerts, compliance reminders, system notices'},
  {href:'/customer/support',label:'Support',desc:'Create and track support tickets'},
];
export default function CustomerPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-2">My Account</h1>
      <p className="text-gray-400 text-sm mb-6">Self-service portal — profile, requests, invoices, documents, notifications, support</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pages.map(p=><Link key={p.href} href={p.href} className="bg-[#0f1629] border border-[#1e2a45] hover:border-red-500/40 rounded-xl p-5 transition-colors"><div className="text-white font-medium mb-1">{p.label}</div><div className="text-gray-400 text-sm">{p.desc}</div></Link>)}
      </div>
    </div>
  );
}
