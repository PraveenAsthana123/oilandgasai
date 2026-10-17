export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';

const SEED_APPROVALS = [
  { item_type: 'Well Permit', title: 'Drilling Permit – Block 7A Well #12', submitted_by: 'ops@oilandgas.com', priority: 'high', status: 'pending' },
  { item_type: 'MOC', title: 'Compressor Upgrade – Station C', submitted_by: 'ops@oilandgas.com', priority: 'medium', status: 'pending' },
  { item_type: 'Vendor Invoice', title: 'Halliburton Services Invoice #INV-2024-0891', submitted_by: 'sales@oilandgas.com', priority: 'low', status: 'pending' },
  { item_type: 'HSE Permit', title: 'Hot Work Permit – Tank Farm Area 4', submitted_by: 'ops@oilandgas.com', priority: 'high', status: 'pending' },
  { item_type: 'Budget Request', title: 'Emergency Pipeline Repair Budget – $250K', submitted_by: 'sales@oilandgas.com', priority: 'high', status: 'pending' },
];

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ogo_approval (
      id SERIAL PRIMARY KEY,
      item_type TEXT,
      title TEXT,
      submitted_by TEXT,
      priority TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'pending',
      reviewer TEXT,
      review_comment TEXT,
      submitted_at TIMESTAMPTZ DEFAULT NOW(),
      reviewed_at TIMESTAMPTZ
    )
  `);
  const count = await pool.query('SELECT COUNT(*) FROM ogo_approval');
  if (parseInt(count.rows[0].count) === 0) {
    for (const a of SEED_APPROVALS) {
      await pool.query(
        `INSERT INTO ogo_approval (item_type, title, submitted_by, priority, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [a.item_type, a.title, a.submitted_by, a.priority, a.status]
      );
    }
  }
}

export async function GET() {
  try {
    await ensureTable();

    const all = await pool.query('SELECT * FROM ogo_approval ORDER BY submitted_at DESC');

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const approvedToday = await pool.query(
      `SELECT COUNT(*) FROM ogo_approval WHERE status = 'approved' AND reviewed_at >= $1`, [todayStart]
    );
    const rejected = await pool.query(
      `SELECT COUNT(*) FROM ogo_approval WHERE status = 'rejected'`
    );
    const avgTime = await pool.query(
      `SELECT AVG(EXTRACT(EPOCH FROM (reviewed_at - submitted_at))/3600) as avg_hrs
       FROM ogo_approval WHERE reviewed_at IS NOT NULL`
    );

    return Response.json({
      approvals: all.rows,
      stats: {
        pending: all.rows.filter((r: { status: string }) => r.status === 'pending').length,
        approved_today: parseInt(approvedToday.rows[0].count),
        rejected: parseInt(rejected.rows[0].count),
        avg_hours: parseFloat(avgTime.rows[0].avg_hrs || '0').toFixed(1),
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({
      approvals: SEED_APPROVALS.map((a, i) => ({
        id: i + 1, ...a,
        submitted_at: new Date().toISOString(),
        reviewed_at: null,
        reviewer: null,
        review_comment: null,
      })),
      stats: { pending: 5, approved_today: 0, rejected: 0, avg_hours: '0.0' },
      _mock: true,
      _reason: msg,
    });
  }
}
