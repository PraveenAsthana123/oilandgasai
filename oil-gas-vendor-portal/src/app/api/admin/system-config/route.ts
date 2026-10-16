export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    config: {
      portal_name: 'Oil & Gas Vendor Portal',
      version: '1.0.0',
      port: 8386,
      database_url: process.env.DATABASE_URL ? '***configured***' : 'not set',
      ollama_url: process.env.OLLAMA_URL || 'http://localhost:11434',
      chroma_url: process.env.CHROMA_URL || 'http://localhost:8000',
      env: process.env.NODE_ENV || 'development',
      table_prefix: 'ogv_',
      currency: 'CAD',
      timezone: 'America/Edmonton',
    },
  });
}
