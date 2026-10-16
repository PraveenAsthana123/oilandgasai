export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';
import fs from 'fs';
import path from 'path';

const DOCS_PATH = process.env.OGO_DOCS_PATH ?? '/mnt/deepa/sohamyoga/oil-gas-monitoring-portal/docs';

const DOCS = [
  { file: 'use-cases-and-scenarios.md', dept_tag: 'general' },
  { file: 'kaggle-demo-scenarios.md', dept_tag: 'data' },
  { file: 'model-modules.md', dept_tag: 'data-science-ai' },
  { file: 'department-iot-twin-rag-report.md', dept_tag: 'general' },
  { file: path.join('journal-papers', 'oil-gas-ai-monitoring-brd.md'), dept_tag: 'general' },
];

function chunkText(text: string, maxChars = 500): string[] {
  const chunks: string[] = [];
  // Split on paragraph breaks first, then re-join small ones
  const paragraphs = text.split(/\n\n+/);
  let current = '';
  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;
    if ((current + '\n\n' + trimmed).length <= maxChars) {
      current = current ? current + '\n\n' + trimmed : trimmed;
    } else {
      if (current) chunks.push(current);
      if (trimmed.length > maxChars) {
        // Hard-split long paragraphs
        let i = 0;
        while (i < trimmed.length) {
          chunks.push(trimmed.slice(i, i + maxChars));
          i += maxChars;
        }
        current = '';
      } else {
        current = trimmed;
      }
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

export async function POST() {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS ogo_rag_chunk (
      id SERIAL PRIMARY KEY,
      source TEXT,
      chunk_text TEXT,
      chunk_index INT,
      dept_tag TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);

    let totalInserted = 0;
    const results: { file: string; chunks: number; status: string }[] = [];

    for (const doc of DOCS) {
      const fullPath = path.join(DOCS_PATH, doc.file);
      if (!fs.existsSync(fullPath)) {
        results.push({ file: doc.file, chunks: 0, status: `skipped — not found at ${fullPath}` });
        continue;
      }

      const content = fs.readFileSync(fullPath, 'utf-8');
      const chunks = chunkText(content, 500);

      // Check if already seeded
      const existing = await pool.query(
        'SELECT COUNT(*) FROM ogo_rag_chunk WHERE source = $1',
        [doc.file]
      );
      if (parseInt(existing.rows[0].count) > 0) {
        results.push({ file: doc.file, chunks: chunks.length, status: 'already seeded — skipped' });
        continue;
      }

      for (let i = 0; i < chunks.length; i++) {
        await pool.query(
          'INSERT INTO ogo_rag_chunk (source, chunk_text, chunk_index, dept_tag) VALUES ($1, $2, $3, $4)',
          [doc.file, chunks[i], i, doc.dept_tag]
        );
      }
      totalInserted += chunks.length;
      results.push({ file: doc.file, chunks: chunks.length, status: 'seeded' });
    }

    return Response.json({ ok: true, total_inserted: totalInserted, docs: results });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: msg }, { status: 500 });
  }
}
