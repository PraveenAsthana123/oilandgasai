'use client';
import { useEffect, useState } from 'react';

interface ComplianceRow {
  id: number;
  regulator: string;
  requirement: string;
  status: string;
  last_checked: string;
  next_due: string;
  notes: string;
}

const STATUS_INFO: Record<string, { label: string; color: string; bg: string }> = {
  compliant:          { label: 'Compliant',         color: 'text-green-400',  bg: 'bg-green-500/20 border-green-500/30' },
  attention_required: { label: 'Attention Required', color: 'text-yellow-400', bg: 'bg-yellow-500/20 border-yellow-500/30' },
  non_compliant:      { label: 'Non-Compliant',      color: 'text-red-400',    bg: 'bg-red-500/20 border-red-500/30' },
  pending:            { label: 'Pending',            color: 'text-gray-400',   bg: 'bg-gray-500/20 border-gray-500/30' },
};

const REGULATOR_INFO: Record<string, { full: string; desc: string }> = {
  CER:  { full: 'Canada Energy Regulator', desc: 'Pipeline safety regulations, NEB Act compliance, inspection frequency' },
  AER:  { full: 'Alberta Energy Regulator', desc: 'Directive 060 production accounting, Directive 083 climate change, well licenses' },
  ECCC: { full: 'Environment & Climate Change Canada', desc: 'GHGRP emissions reporting, carbon price compliance, clean fuel standard' },
  CAPP: { full: 'Canadian Association of Petroleum Producers', desc: 'Voluntary standards, responsible development metrics' },
  OSHA: { full: 'Occupational Safety & Health Administration', desc: 'Safety statistics, hazard communication standards' },
  OGC:  { full: 'Oil & Gas Commission (BC)', desc: 'BC Oil and Gas Activities Act compliance' },
};

export default function RegulatoryPage() {
  const [rows, setRows] = useState<ComplianceRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/compliance').then(r => r.json()).then(d => { setRows(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  const grouped = rows.reduce((acc: Record<string, ComplianceRow[]>, r) => {
    if (!acc[r.regulator]) acc[r.regulator] = [];
    acc[r.regulator].push(r);
    return acc;
  }, {});

  const overallStatus = (reqs: ComplianceRow[]) => {
    if (reqs.some(r => r.status === 'non_compliant')) return 'non_compliant';
    if (reqs.some(r => r.status === 'attention_required')) return 'attention_required';
    return 'compliant';
  };

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Regulatory Compliance Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Compliance status for CER, AER, ECCC, CAPP, OSHA, OGC</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {Object.entries(grouped).map(([reg, reqs]) => {
          const status = overallStatus(reqs);
          const si = STATUS_INFO[status] ?? STATUS_INFO.pending;
          const info = REGULATOR_INFO[reg];
          return (
            <div key={reg} className={`bg-[#0f1629] border rounded-xl p-4 ${si.bg}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-semibold text-lg">{reg}</span>
                <span className={`text-xs px-2 py-1 rounded border font-medium ${si.bg} ${si.color}`}>{si.label}</span>
              </div>
              {info && <div className="text-gray-400 text-xs mb-2">{info.full}</div>}
              {info && <div className="text-gray-500 text-xs">{info.desc}</div>}
              <div className="mt-2 text-xs text-gray-400">{reqs.length} requirements tracked</div>
            </div>
          );
        })}
      </div>

      {/* Detailed table per regulator */}
      {Object.entries(grouped).map(([reg, reqs]) => (
        <div key={reg} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl mb-4 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1e2a45] flex items-center gap-3">
            <span className="text-white font-semibold">{reg}</span>
            <span className="text-gray-400 text-sm">{REGULATOR_INFO[reg]?.full}</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e2a45]">
                {['Requirement', 'Status', 'Last Checked', 'Next Due'].map(h => (
                  <th key={h} className="text-left text-gray-400 text-xs font-medium px-4 py-2 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reqs.map(r => {
                const si = STATUS_INFO[r.status] ?? STATUS_INFO.pending;
                return (
                  <tr key={r.id} className="border-b border-[#1e2a45] hover:bg-[#0a0e1a] transition-colors">
                    <td className="px-4 py-3 text-white text-sm">{r.requirement}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded border ${si.bg} ${si.color}`}>{si.label}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{r.last_checked ? new Date(r.last_checked).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{r.next_due ? new Date(r.next_due).toLocaleDateString() : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}

      {rows.length === 0 && (
        <div className="text-center py-12 text-gray-500">No compliance records — initialize the database first from the Command Center.</div>
      )}
    </div>
  );
}
