export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { company, stream, pain_points, assets, budget } = body;

    const prompt = `Generate a professional oil and gas AI monitoring proposal for ${company} operating in ${stream}. Their main challenges are ${pain_points}. They have ${assets}. Budget: ${budget} CAD. Include: executive summary, proposed AI solutions for their specific pain points, implementation phases, ROI projection, commercial terms. Oil & Gas industry focus. Format with clear sections.`;

    const ollamaUrl = process.env.OLLAMA_URL ?? 'http://localhost:11434';

    try {
      const controller = new AbortController();
      const timeout = AbortSignal.timeout(30000);
      const res = await fetch(`${ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'llama3.2', prompt, stream: false }),
        signal: timeout,
      });

      if (!res.ok) throw new Error(`Ollama returned ${res.status}`);
      const data = await res.json();
      return Response.json({ status: 'ok', proposal: data.response });
    } catch (ollamaErr: any) {
      // Fallback template
      const template = `# AI Monitoring Proposal for ${company}

## Executive Summary
[FILL IN] — This proposal outlines a comprehensive AI-powered monitoring solution tailored for ${company}'s ${stream} operations.

## Proposed AI Solutions for ${pain_points}
[FILL IN] — Based on your specific challenges, we recommend the following AI solutions:
1. Real-time monitoring and anomaly detection
2. Predictive maintenance algorithms
3. Production optimization AI

## Implementation Phases
### Phase 1 (Months 1-3): Baseline & Integration
[FILL IN] — Data infrastructure setup, sensor integration, baseline model training

### Phase 2 (Months 4-6): Pilot Deployment
[FILL IN] — Controlled pilot on selected assets, performance validation

### Phase 3 (Months 7-12): Full Deployment & Optimization
[FILL IN] — Enterprise rollout, continuous model improvement

## ROI Projection
[FILL IN] — Based on ${budget} CAD budget:
- Estimated 25% maintenance cost reduction
- 30% reduction in unplanned downtime
- Projected 5-year NPV positive at 8% discount rate

## Commercial Terms
[FILL IN] — Implementation fee + annual SaaS license. Payment terms: Net 30.

---
⚠️ AI generation unavailable — Ollama not running. Fill in [FILL IN] sections before sending.`;

      return Response.json({ status: 'needs_review', proposal: template, _mock: true, _reason: 'Ollama unavailable: ' + ollamaErr.message });
    }
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
