export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { readdirSync, statSync, readFileSync } from 'fs';
import { join } from 'path';

function walkDir(dir: string, ext: string[]): string[] {
  const files: string[] = [];
  try {
    const items = readdirSync(dir);
    for (const item of items) {
      if (item.startsWith('.') || item === 'node_modules') continue;
      const full = join(dir, item);
      const stat = statSync(full);
      if (stat.isDirectory()) {
        files.push(...walkDir(full, ext));
      } else if (ext.some(e => full.endsWith(e))) {
        files.push(full);
      }
    }
  } catch {}
  return files;
}

export async function GET() {
  const srcDir = join(process.cwd(), 'src');
  const files = walkDir(srcDir, ['.ts', '.tsx']);

  let line_count = 0;
  let size_bytes = 0;
  let todos = 0;
  let console_logs = 0;

  const fileSizes: { path: string; lines: number }[] = [];

  for (const f of files) {
    try {
      const content = readFileSync(f, 'utf-8');
      const lines = content.split('\n').length;
      line_count += lines;
      size_bytes += Buffer.byteLength(content, 'utf-8');
      const todoMatches = (content.match(/TODO/g) || []).length;
      const consoleMatches = (content.match(/console\.log/g) || []).length;
      todos += todoMatches;
      console_logs += consoleMatches;
      fileSizes.push({ path: f.replace(process.cwd(), ''), lines });
    } catch {}
  }

  fileSizes.sort((a, b) => b.lines - a.lines);

  // Read package.json from disk at runtime
  let deps: string[] = [];
  let devDeps: string[] = [];
  try {
    const pkgPath = join(process.cwd(), 'package.json');
    const pkgContent = readFileSync(pkgPath, 'utf-8');
    const pkg = JSON.parse(pkgContent) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
    deps = Object.keys(pkg.dependencies || {});
    devDeps = Object.keys(pkg.devDependencies || {});
  } catch {}

  return Response.json({
    file_count: files.length,
    line_count,
    size_kb: Math.round(size_bytes / 1024),
    largest_files: fileSizes.slice(0, 10).map(f => `${f.path} (${f.lines} lines)`),
    folder_tree: ['src/app/', 'src/components/', 'src/lib/'],
    dependencies: deps,
    dev_dependencies: devDeps,
    tech_debt: { todos, console_logs },
    scanned_at: new Date().toISOString(),
  });
}
