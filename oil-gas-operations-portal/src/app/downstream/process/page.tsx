'use client';
import { useEffect, useState } from 'react';

export default function ProcessPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  useEffect(() => { fetch('/api/downstream/process').then(r => r.json()).then(d => setData(d.metrics)); }, []);
  const d = data as Record<string, unknown> | null;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Process Optimization</h1>
        <p className="text-gray-400 text-sm mt-1">Crude blending optimization · Distillation optimization · Catalyst management</p></div>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Blend Efficiency', value: d ? `${d.crude_blend_efficiency_pct}%` : '—', unit: 'blend quality', icon: '🔀' },
          { label: 'Distillation Energy', value: d ? `${d.distillation_energy_pct_improvement}% saved` : '—', unit: 'vs baseline', icon: '⚡' },
          { label: 'Catalyst Activity', value: d ? `${d.catalyst_activity_index}` : '—', unit: 'activity index', icon: '⚗️' },
          { label: 'Process Loss', value: d ? `${d.process_loss_pct}%` : '—', unit: 'loss ratio', icon: '📉' },
          { label: 'Margin', value: d ? `$${d.margin_usd_bbl}/bbl` : '—', unit: 'crack spread', icon: '💰' },
          { label: 'Optimization Runs', value: d ? String(d.optimization_runs_today) : '—', unit: 'today', icon: '🔄' },
          { label: 'Constraint Violations', value: d ? String(d.constraint_violations) : '—', unit: 'active', icon: '⚠️' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <div className="text-xl mb-2">{kpi.icon}</div>
            <div className="text-xl font-bold text-white">{kpi.value}</div>
            <div className="text-xs text-gray-400">{kpi.unit}</div>
            <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <h2 className="font-semibold text-white mb-3">Crude Blending Optimization — LP + ML</h2>
        <div className="text-sm text-gray-300">
          <p className="mb-3">The optimization engine combines Linear Programming (CPLEX/Gurobi) for constraint handling with XGBoost ML models for crude property prediction. The LP minimizes crude cost subject to product yield/quality constraints.</p>
          <div className="font-mono text-xs bg-[#0a0e1a] p-3 rounded text-green-400">
            minimize: Σ(price_i × volume_i)<br/>
            subject to: yield_constraints, spec_constraints, tank_constraints<br/>
            where: product_specs = ML_model(crude_blend_properties)
          </div>
        </div>
      </div>
    </div>
  );
}
