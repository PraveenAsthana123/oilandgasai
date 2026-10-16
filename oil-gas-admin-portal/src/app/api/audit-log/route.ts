import { NextResponse, NextRequest } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') ?? '';
  const module = searchParams.get('module') ?? '';
  try {
    let sql = `SELECT * FROM oga_audit_log WHERE 1=1`;
    const params: string[] = [];
    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (user_id ILIKE $${params.length} OR action ILIKE $${params.length} OR record_type ILIKE $${params.length})`;
    }
    if (module) {
      params.push(module);
      sql += ` AND module = $${params.length}`;
    }
    sql += ' ORDER BY ts DESC LIMIT 200';
    const res = await query(sql, params);
    return NextResponse.json(res.rows);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, action, module, record_type, record_id, details, ip } = body;
    const res = await query(
      `INSERT INTO oga_audit_log (user_id, action, module, record_type, record_id, details, ip) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [user_id, action, module, record_type, record_id, JSON.stringify(details ?? {}), ip ?? '']
    );
    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
