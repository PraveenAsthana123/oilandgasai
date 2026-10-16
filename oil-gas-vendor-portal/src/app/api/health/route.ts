export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  let dbStatus = 'disconnected';
  try {
    await pool.query('SELECT 1');
    dbStatus = 'connected';
  } catch {
    dbStatus = 'disconnected';
  }
  return NextResponse.json({
    status: 'ok',
    portal: 'oil-gas-vendor-portal',
    version: '1.0.0',
    db: dbStatus,
    timestamp: new Date().toISOString(),
  });
}
