export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';

export async function GET() {
  let dbStatus = 'disconnected';
  try {
    await pool.query('SELECT 1');
    dbStatus = 'connected';
  } catch {}
  return Response.json({ status: 'ok', portal: 'oil-gas-customer-portal', version: '1.0.0', port: 8385, db: dbStatus, prefix: 'ogcu_' });
}
