export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

const DDL = `CREATE TABLE IF NOT EXISTS ogo_blog_post (
  id SERIAL PRIMARY KEY,
  title TEXT,
  category TEXT,
  content TEXT,
  author TEXT DEFAULT 'System',
  tags TEXT,
  read_time_mins INT DEFAULT 3,
  featured BOOLEAN DEFAULT FALSE,
  ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
)`;

const SEEDS = [
  {
    title: 'AI in Upstream Operations: From Seismic to Production Optimization',
    category: 'AI/ML',
    author: 'Dr. M. Patel',
    tags: 'AI,Machine Learning,Upstream,Seismic,Production',
    read_time_mins: 7,
    featured: true,
    content: `Artificial intelligence is reshaping every phase of upstream oil and gas operations, from seismic interpretation and prospect evaluation through to real-time production optimization. This article examines how leading Canadian E&P companies are deploying ML models to reduce exploration risk and lift production efficiency.

In seismic interpretation, convolutional neural networks (CNNs) trained on labelled fault and horizon data are reducing interpretation cycle times from weeks to hours. Companies like Suncor and Canadian Natural Resources have piloted automated fault detection workflows that cut manual QC effort by over 60%.

Production optimization using gradient boosting and reinforcement learning models continuously adjusts choke sizes, compression settings, and injection rates in response to real-time sensor data. Early deployments across Pembina and Montney plays have demonstrated 3-8% incremental production gains with no additional capital investment.

The key enablers are clean, well-labelled historical data, robust MLOps pipelines that handle model drift, and close collaboration between petroleum engineers and data scientists. The greatest obstacle remains data silos between subsurface, reservoir, and production teams.`,
  },
  {
    title: 'Pipeline Integrity Best Practices: ILI, ECDA, and Risk-Based Inspection',
    category: 'Operations',
    author: 'R. Tanner, P.Eng.',
    tags: 'Pipeline,Integrity,ILI,Inspection,Risk',
    read_time_mins: 6,
    featured: false,
    content: `Pipeline integrity management in Canada is governed by CSA Z662 and NEB OPR-99, which mandate a lifecycle approach covering design, construction, operations, and abandonment. This article summarizes best practices for operators managing aging infrastructure across the WCSB.

In-Line Inspection (ILI) using Magnetic Flux Leakage (MFL) tools remains the gold standard for detecting metal loss, dents, and girth weld anomalies. Modern smart pig runs generate gigabytes of data per kilometre, requiring sophisticated anomaly classification and prioritization workflows.

External Corrosion Direct Assessment (ECDA) is used where pigging is not practical. A four-step process — pre-assessment, indirect inspection, direct examination, and post-assessment — systematically identifies high-consequence areas requiring excavation.

Risk-based inspection scheduling, incorporating consequence-of-failure modelling, allows operators to prioritize resources on the highest-risk segments. This approach is increasingly required by regulators and reduces overall inspection cost by 15-30% compared to time-based schedules.`,
  },
  {
    title: 'ECCC Methane Reporting 2026: What Operators Need to Know',
    category: 'Regulatory',
    author: 'S. Okafor',
    tags: 'Methane,ECCC,Regulatory,Emissions,Compliance',
    read_time_mins: 5,
    featured: false,
    content: `Environment and Climate Change Canada's updated methane regulations came into force in 2024, requiring upstream oil and gas operators to achieve a 75% reduction in methane emissions from 2012 baseline levels by 2030. Understanding reporting obligations is critical for compliance and avoiding penalties.

Key reporting requirements include quarterly production data submissions, annual greenhouse gas reports under GHGRP, and continuous emissions monitoring at facilities exceeding threshold volumes. Detection methods — OGI cameras, fixed sensors, and aerial surveys — must meet ECCC-approved protocols.

Venting and flaring restrictions have tightened significantly. Routine solution gas flaring is restricted to 0.5 mcf/d per event, with electronic submission required within 24 hours of reportable events exceeding thresholds.

Operators should implement a centralized emissions management system that integrates SCADA data, manual measurement records, and third-party audit results. Companies with verified measurement and management programs receive preferential treatment in regulatory discretion decisions.`,
  },
  {
    title: 'Digital Twins for Refinery Process Optimization',
    category: 'Technology',
    author: 'K. Zhang',
    tags: 'Digital Twin,Refinery,Downstream,Process,Optimization',
    read_time_mins: 5,
    featured: false,
    content: `Digital twin technology is enabling downstream operators to simulate, monitor, and optimize complex refinery processes with unprecedented fidelity. By combining first-principles process models with real-time sensor data, digital twins create a continuously updated virtual replica of physical assets.

Key use cases include crude blend optimization, heat exchanger fouling prediction, and distillation column control. A digital twin of a crude distillation unit can evaluate hundreds of operational scenarios in minutes, identifying cut-point adjustments that maximize diesel yield given the incoming crude slate.

Implementation requires high-quality process data historians, tight integration between DCS/SCADA systems and the twin platform, and systematic model validation against operational data. Leading platforms include AspenTech AspenOne, Honeywell Forge, and Yokogawa OpreX.

ROI typically materializes through improved energy efficiency (1-3% reduction in fuel consumption), reduced unplanned downtime (predictive maintenance alerts 48-72 hours ahead), and improved product quality consistency. A 100,000 bbl/d refinery can expect $5-15M in annual value capture from a fully deployed digital twin program.`,
  },
  {
    title: 'Safety Culture in O&G: Moving Beyond Compliance',
    category: 'Safety',
    author: 'L. Gagnon',
    tags: 'Safety,HSE,Culture,Leadership,Incidents',
    read_time_mins: 4,
    featured: false,
    content: `Total recordable incident rates in Canadian upstream oil and gas have improved significantly over the past decade, but high-consequence, low-frequency events — well blowouts, pipeline ruptures, and facility fires — continue to cause fatalities and environmental damage. The industry's challenge is moving safety culture from compliance to genuine commitment.

Research consistently shows that safety culture strength predicts incident rates better than procedural compliance alone. Key markers of a strong safety culture include visible leadership commitment (not just safety walks), psychological safety to report near-misses without blame, and systematic learning from incidents across the industry.

The bow-tie risk model, widely adopted in O&G, visualizes threat-to-consequence pathways and the barriers designed to prevent escalation. Effective barrier management requires regular testing, clear ownership, and prompt remediation when barriers degrade.

Contractor management remains a persistent challenge. Nearly 40% of serious injuries in Canadian upstream involve contractors. Effective programs integrate contractor workers into the same safety culture, pre-qualify on safety performance, and measure contractor leading indicators alongside lagging rates.`,
  },
  {
    title: 'Hydrogen Blending in Natural Gas Infrastructure: Opportunities and Challenges',
    category: 'Industry News',
    author: 'System',
    tags: 'Hydrogen,Energy Transition,Infrastructure,Natural Gas,Decarbonization',
    read_time_mins: 6,
    featured: false,
    content: `Hydrogen blending into existing natural gas distribution networks is emerging as a near-term decarbonization pathway that leverages existing infrastructure investment. Several Canadian utilities and pipeline operators are piloting blending programs at 1-5% hydrogen by volume.

The primary technical challenges involve material compatibility (hydrogen embrittlement in high-strength steel pipelines), changes to combustion characteristics, end-use appliance compatibility, and metering accuracy at variable blend ratios. Existing cast iron and some older steel pipelines are considered incompatible without remediation.

Regulatory frameworks are evolving rapidly. Natural Resources Canada published a hydrogen blending roadmap in 2025 calling for a national standard for blend limits and testing protocols. The Canadian Gas Association is coordinating appliance testing across the residential, commercial, and industrial sectors.

Economic viability depends heavily on green hydrogen production costs. Current electrolysis costs of $5-8/kg H2 make blending uncompetitive on a pure economics basis, but policy mechanisms, carbon credits, and scale effects are projected to close the gap by the early 2030s.`,
  },
];

async function generateWithOllama(title: string, category: string): Promise<string> {
  const prompt = `Write a professional 300-400 word technical article for an oil and gas company knowledge hub.
Title: "${title}"
Category: ${category}
Write in a professional, informative tone suitable for petroleum engineers and operations professionals. Include specific technical details relevant to the Canadian upstream/midstream/downstream oil and gas industry.`;

  const resp = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'llama3.2', prompt, stream: false }),
    signal: AbortSignal.timeout(60000),
  });
  if (!resp.ok) throw new Error(`Ollama HTTP ${resp.status}`);
  const data = await resp.json() as { response?: string };
  return (data.response || '').trim();
}

export async function GET() {
  try {
    const client = await pool.connect();
    try {
      await client.query(DDL);
      const countRes = await client.query('SELECT COUNT(*) FROM ogo_blog_post');
      if (parseInt(countRes.rows[0].count) === 0) {
        for (const s of SEEDS) {
          await client.query(
            `INSERT INTO ogo_blog_post (title, category, content, author, tags, read_time_mins, featured)
             VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [s.title, s.category, s.content, s.author, s.tags, s.read_time_mins, s.featured]
          );
        }
      }
      const { rows } = await client.query('SELECT * FROM ogo_blog_post ORDER BY featured DESC, created_at DESC');
      const featured = rows.find((r: { featured: boolean }) => r.featured) || rows[0] || null;
      return NextResponse.json({ data: rows, featured });
    } finally {
      client.release();
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('ECONNREFUSED') || msg.includes('connect')) {
      return NextResponse.json({ data: [], featured: null, _mock: true, _reason: 'DB unavailable' });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, category, content, author, tags, ai_assist } = body;

    let finalContent = content || '';
    let ai_generated = false;

    if (ai_assist && title) {
      try {
        finalContent = await generateWithOllama(title, category || 'Operations');
        ai_generated = true;
      } catch {
        finalContent = content || `⚠️ Mocked — Ollama not available. AI content generation requires Ollama running at ${OLLAMA_URL}.`;
        ai_generated = false;
      }
    }

    const words = finalContent.split(/\s+/).length;
    const read_time_mins = Math.max(1, Math.ceil(words / 200));

    const client = await pool.connect();
    try {
      await client.query(DDL);
      const { rows } = await client.query(
        `INSERT INTO ogo_blog_post (title, category, content, author, tags, read_time_mins, ai_generated)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [title, category || 'Operations', finalContent, author || 'System', tags || '', read_time_mins, ai_generated]
      );
      return NextResponse.json({ data: rows[0] }, { status: 201 });
    } finally {
      client.release();
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('ECONNREFUSED') || msg.includes('connect')) {
      return NextResponse.json({ data: null, _mock: true, _reason: 'DB unavailable' });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
