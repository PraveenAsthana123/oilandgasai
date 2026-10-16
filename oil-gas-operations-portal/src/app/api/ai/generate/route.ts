export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';

const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434';

const CONTENT_PROMPTS: Record<string, (inputs: Record<string, string>) => string> = {
  daily_production: (i) => `You are an oil & gas operations engineer. Generate a formal Daily Production Report for ${i.date ?? 'today'} at ${i.facility ?? 'the facility'}. Key inputs: ${i.notes ?? 'standard operations'}. Include: 1) Production summary by stream, 2) Equipment status, 3) Key variances from target, 4) Actions for next shift. Use formal O&G report style.`,
  weekly_safety: (i) => `You are a safety coordinator at an oil & gas facility. Generate a Weekly Safety Report for the week ending ${i.date ?? 'this week'}. Key events: ${i.notes ?? 'no major incidents'}. Include: 1) Safety statistics (incidents, near-misses, observations), 2) Key risks identified, 3) Corrective actions, 4) Next week priorities. Format per ISO 45001 principles.`,
  monthly_maintenance: (i) => `You are a maintenance supervisor. Generate a Monthly Maintenance Summary for ${i.month ?? 'this month'} at ${i.facility ?? 'the facility'}. Key details: ${i.notes ?? 'routine maintenance'}. Include: 1) PM completion rate, 2) Corrective maintenance backlog, 3) Equipment reliability metrics (MTBF, MTTR), 4) Upcoming planned maintenance.`,
  incident_rca: (i) => `You are a root cause analysis expert. Generate a formal Incident RCA for: Incident type: ${i.incident_type ?? 'equipment failure'}. Description: ${i.notes ?? 'see details'}. Date: ${i.date ?? 'recent'}. Provide: 1) Incident timeline, 2) Immediate causes, 3) Root causes using 5-Whys, 4) Fishbone categories (Man/Machine/Method/Material/Measurement/Environment), 5) Corrective and preventive actions (CAPA).`,
  regulatory_compliance: (i) => `You are a regulatory compliance officer for an O&G facility. Generate a Regulatory Compliance Report for ${i.period ?? 'Q1'}. Regulatory bodies: ${i.notes ?? 'EPA, OSHA, API'}. Include: 1) Compliance status by regulation, 2) Incidents reportable to regulatory bodies, 3) Inspection findings, 4) Corrective actions, 5) Next compliance milestones.`,
  safe_work_procedure: (i) => `You are an HSE engineer. Generate a Safe Work Procedure (SWP) in ISO 45001 format for: Task: ${i.task ?? 'maintenance activity'}. Equipment: ${i.equipment ?? 'process equipment'}. Hazards: ${i.notes ?? 'standard O&G hazards'}. Include: 1) Task description and scope, 2) Required PPE, 3) Step-by-step procedure with hazard controls, 4) Emergency response, 5) Sign-off requirements.`,
  anomaly_explanation: (i) => `You are an O&G process engineer. A sensor reading anomaly was detected: ${i.notes ?? 'abnormal reading'}. In plain English, explain: 1) What this reading likely indicates, 2) What could cause this anomaly, 3) Immediate actions the operator should take, 4) When to escalate to engineering. Keep it clear for a field operator.`,
  rca_5whys: (i) => `You are a reliability engineer. A problem was reported: ${i.notes ?? 'equipment failure'}. Generate a complete 5-Whys Root Cause Analysis with Fishbone categories. For each Why: state the observation → ask Why → state the next level cause. End with: root cause, corrective action, and preventive action. Use O&G engineering terminology.`,
  meeting_minutes: (i) => `You are an O&G operations coordinator. Generate formal meeting minutes from these bullet points: ${i.notes ?? 'meeting discussion points'}. Meeting: ${i.meeting_type ?? 'Operations Review'}. Date: ${i.date ?? 'today'}. Format: Meeting title, Date, Attendees (listed as placeholders), Agenda items, Discussion points, Decisions made, Action items with owners and due dates, Next meeting date.`,
};

export async function POST(req: Request) {
  const body = await req.json() as {
    content_type: string;
    inputs: Record<string, string>;
  };
  const { content_type, inputs = {} } = body;

  if (!content_type) return Response.json({ error: 'content_type required' }, { status: 400 });

  const promptFn = CONTENT_PROMPTS[content_type];
  if (!promptFn) {
    return Response.json({
      error: `Unknown content_type: ${content_type}`,
      available: Object.keys(CONTENT_PROMPTS),
    }, { status: 400 });
  }

  const prompt = promptFn(inputs);
  const startMs = Date.now();

  await pool.query(`CREATE TABLE IF NOT EXISTS ogo_generated_content (
    id SERIAL PRIMARY KEY, content_type TEXT, prompt TEXT, result TEXT,
    model TEXT, generation_ms INT, created_at TIMESTAMPTZ DEFAULT NOW()
  )`);

  try {
    const resp = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama3.2', prompt, stream: false }),
      signal: AbortSignal.timeout(120000),
    });

    if (!resp.ok) throw new Error(`Ollama HTTP ${resp.status}`);
    const data = await resp.json() as { response?: string };
    const result = data.response ?? 'No response';
    const genMs = Date.now() - startMs;

    await pool.query(
      'INSERT INTO ogo_generated_content (content_type, prompt, result, model, generation_ms) VALUES ($1, $2, $3, $4, $5)',
      [content_type, prompt.slice(0, 1000), result, 'llama3.2', genMs]
    ).catch(() => {});

    return Response.json({
      ok: true,
      content_type,
      result,
      model: 'llama3.2',
      generation_ms: genMs,
      word_count: result.split(/\s+/).length,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({
      ok: false,
      content_type,
      result: '⚠️ Ollama unavailable — Set OLLAMA_URL and ensure Ollama is running.',
      model: 'unavailable',
      error: msg,
      _mock: true,
    });
  }
}
