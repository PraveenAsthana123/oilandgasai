export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import fs from 'fs';
import path from 'path';

function scanDir(dir: string, ext: string[]): { file: string; lines: number }[] {
  const results: { file: string; lines: number }[] = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory() && !['node_modules', '.next', '.git'].includes(entry.name)) {
        results.push(...scanDir(full, ext));
      } else if (entry.isFile() && ext.some(e => entry.name.endsWith(e))) {
        try {
          const content = fs.readFileSync(full, 'utf8');
          results.push({ file: full, lines: content.split('\n').length });
        } catch {}
      }
    }
  } catch {}
  return results;
}

export async function GET() {
  const srcDir = path.join(process.cwd(), 'src');
  const files = scanDir(srcDir, ['.ts', '.tsx']);
  const totalLines = files.reduce((s, f) => s + f.lines, 0);
  const sorted = [...files].sort((a, b) => b.lines - a.lines).slice(0, 10).map(f => ({
    file: f.file.replace(srcDir, 'src'),
    lines: f.lines,
  }));

  // Count TODOs
  let todoCount = 0;
  for (const f of files) {
    try {
      const content = fs.readFileSync(f.file, 'utf8');
      todoCount += (content.match(/TODO/g) || []).length;
    } catch {}
  }

  // Read deps from package.json
  let deps: string[] = [];
  let depCount = 0;
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
    deps = Object.keys(pkg.dependencies || {});
    depCount = deps.length + Object.keys(pkg.devDependencies || {}).length;
  } catch {}

  return Response.json({
    fileCount: files.length,
    lineCount: totalLines,
    depCount,
    todoCount,
    deps,
    largestFiles: sorted,
  });
}
