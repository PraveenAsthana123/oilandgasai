import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { ollamaStatus } from '@/lib/ollama';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  let dbStatus = 'disconnected';
  let userCount = 0;
  try {
    const pool = getPool();
    const res = await pool.query('SELECT COUNT(*) FROM oga_user');
    userCount = parseInt(res.rows[0].count, 10);
    dbStatus = 'connected';
  } catch {
    dbStatus = 'disconnected';
  }

  const ollama = await ollamaStatus();

  return NextResponse.json({
    status: 'ok',
    portal: 'oil-gas-admin-portal',
    version: '1.0.0',
    db: dbStatus,
    user_count: userCount,
    ollama: ollama.ok ? 'connected' : 'disconnected',
    ollama_models: ollama.models,
    timestamp: new Date().toISOString(),
  });
}
