'use client';
export default function Page() {
  const title = 'admin/feature-flags'.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">{title}</h1>
        <p className="text-gray-400 text-sm mt-1">Admin section — role: admin required</p></div>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-8 text-center">
        <div className="text-4xl mb-3">🔒</div>
        <p className="text-gray-400">Admin-only section. Requires admin role authentication.</p>
        <p className="text-gray-600 text-sm mt-2">DB tables: ogo_audit_log, ogo_role, ogo_feature_flag</p>
      </div>
    </div>
  );
}
