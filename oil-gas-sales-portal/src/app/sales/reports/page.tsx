'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function SalesReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/leads').then(r => r.json()).catch(() => []),
      fetch('/api/opportunities').then(r => r.json()).catch(() => []),
      fetch('/api/accounts').then(r => r.json()).catch(() => []),
    ]).then(([leads, opps, accounts]) => {
      setData({
        leads: Array.isArray(leads) ? leads : [],
        opps: Array.isArray(opps) ? opps : [],
        accounts: Array.isArray(accounts) ? accounts : [],
      });
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-emerald-400">Loading reports...</div>;

  const { leads, opps, accounts } = data || { leads: [], opps: [], accounts: [] };

  const pipelineValue = opps.reduce((s: number, o: any) => s + parseFloat(o.value_cad || 0), 0);
  const wonValue = opps.filter((o: any) => o.stage === 'won').reduce((s: number, o: any) => s + parseFloat(o.value_cad || 0), 0);
  const winRate = opps.length > 0 ? ((opps.filter((o: any) => o.stage === 'won').length / opps.length) * 100).toFixed(1) : '0';
  const avgDeal = opps.length > 0 ? (pipelineValue / opps.length / 1_000_000).toFixed(2) : '0';
  const revenueMTD = accounts.reduce((s: number, a: any) => s + parseFloat(a.revenue_cad || 0), 0);

  const byStream: Record<string, number> = {};
  leads.forEach((l: any) => { byStream[l.stream] = (byStream[l.stream] || 0) + 1; });

  const byStage: Record<string, number> = {};
  opps.forEach((o: any) => { byStage[o.stage] = (byStage[o.stage] || 0) + 1; });

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <Link href="/sales" className="hover:text-emerald-400">Sales</Link>
          <span>/</span>
          <span className="text-gray-300">Reports</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Sales Reports</h1>
        <p className="text-gray-400 mt-1">Aggregated from live database — all values in CAD</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1">Total Pipeline</div>
          <div className="text-xl font-bold text-emerald-400">${(pipelineValue / 1_000_000).toFixed(2)}M</div>
        </div>
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1">Won Revenue</div>
          <div className="text-xl font-bold text-blue-400">${(wonValue / 1_000_000).toFixed(2)}M</div>
        </div>
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1">Win Rate</div>
          <div className="text-xl font-bold text-yellow-400">{winRate}%</div>
        </div>
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1">Avg Deal Size</div>
          <div className="text-xl font-bold text-purple-400">${avgDeal}M</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Leads by Stream</h3>
          <div className="space-y-2">
            {Object.entries(byStream).map(([stream, count]) => (
              <div key={stream} className="flex items-center gap-3">
                <div className="w-24 text-xs text-gray-400 capitalize">{stream}</div>
                <div className="flex-1 bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full"
                    style={{ width: `${(count / leads.length) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-gray-300 w-6 text-right">{count}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Opportunities by Stage</h3>
          <div className="space-y-2">
            {Object.entries(byStage).map(([stage, count]) => (
              <div key={stage} className="flex items-center gap-3">
                <div className="w-32 text-xs text-gray-400 capitalize">{stage.replace('_', ' ')}</div>
                <div className="flex-1 bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(count / opps.length) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-gray-300 w-6 text-right">{count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Summary</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div><span className="text-gray-400">Total Leads:</span> <span className="text-white">{leads.length}</span></div>
          <div><span className="text-gray-400">Total Opportunities:</span> <span className="text-white">{opps.length}</span></div>
          <div><span className="text-gray-400">Total Accounts:</span> <span className="text-white">{accounts.length}</span></div>
          <div><span className="text-gray-400">Revenue MTD:</span> <span className="text-emerald-400">${(revenueMTD / 1_000_000).toFixed(2)}M</span></div>
          <div><span className="text-gray-400">Quota (15M):</span> <span className="text-yellow-400">{((revenueMTD / 15_000_000) * 100).toFixed(1)}%</span></div>
        </div>
      </div>
    </div>
  );
}
