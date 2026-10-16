export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';

export async function GET() {
  try {
    const tasks = await pool.query('SELECT * FROM ogo_agent_task ORDER BY created_at DESC LIMIT 20');
    return Response.json({ tasks: tasks.rows, count: tasks.rowCount });
  } catch {
    return Response.json({ tasks: [], count: 0, _mock: true });
  }
}

export async function POST(request: Request) {
  let agent_name = 'inspection-agent', goal = '', stream = 'cross-cutting';
  try {
    const body = await request.json();
    agent_name = body.agent_name || agent_name;
    goal = body.goal || '';
    stream = body.stream || stream;
  } catch {}

  // Insert task
  let taskId = 0;
  try {
    const ins = await pool.query(
      `INSERT INTO ogo_agent_task (agent_name,goal,stream,status,action_log) VALUES ($1,$2,$3,'running',$4) RETURNING id`,
      [agent_name, goal, stream, JSON.stringify([])]
    );
    taskId = ins.rows[0].id;
  } catch {}

  // Real Ollama call
  const ollamaUrl = `${process.env.OLLAMA_URL ?? 'http://localhost:11434'}/api/generate`;
  const prompt = `You are an Oil & Gas AI agent (${agent_name}). Your goal: ${goal || 'Perform a diagnostic analysis of the current operations'}.
Provide a structured analysis with:
1. Current status assessment
2. Key findings (3-5 bullet points)
3. Recommended actions
4. Confidence level (0-100)
Keep response concise and operational.`;

  let agentResponse = '';
  let confidence = 70;
  let finalStatus = 'needs_review';

  try {
    const ctrl = AbortSignal.timeout(30000);
    const ollamaRes = await fetch(ollamaUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama3.2', prompt, stream: false }),
      signal: ctrl,
    });
    if (ollamaRes.ok) {
      const data = await ollamaRes.json();
      agentResponse = data.response || '';
      confidence = 85;
      finalStatus = 'completed';
    }
  } catch {
    agentResponse = '⚠️ Ollama unavailable — agent marked needs_review. Set OLLAMA_URL to enable autonomous analysis.';
    confidence = 0;
    finalStatus = 'needs_review';
  }

  // Update task
  if (taskId) {
    try {
      await pool.query(
        `UPDATE ogo_agent_task SET status=$1, confidence=$2, action_log=$3 WHERE id=$4`,
        [finalStatus, confidence, JSON.stringify([{ ts: new Date().toISOString(), response: agentResponse }]), taskId]
      );
    } catch {}
  }

  return Response.json({ task_id: taskId, agent_name, goal, stream, status: finalStatus, confidence, response: agentResponse });
}
