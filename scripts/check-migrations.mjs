#!/usr/bin/env node
/**
 * Static review of SQL migrations (read-only, no database connection).
 *
 *   node scripts/check-migrations.mjs                 → review all migrations
 *   node scripts/check-migrations.mjs --since v1.1.0  → only migrations added/changed since a Git ref
 *   [--json]                                          → machine-readable output (used by deploy.yml)
 *
 * Flags statements that can destroy or rewrite data so they get an explicit human review before a
 * production deployment. Destructive migrations are NEVER applied automatically by the pipeline.
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ROOT = process.cwd();
const DIR = 'server/database/migrations';
const argv = process.argv.slice(2);
const sinceIdx = argv.indexOf('--since');
const since = sinceIdx >= 0 ? argv[sinceIdx + 1] : null;
const asJson = argv.includes('--json');

let files = fs.readdirSync(path.join(ROOT, DIR)).filter((f) => /^\d{3}_.+\.sql$/.test(f)).sort();
let sinceResolved = true;
if (since) {
  try {
    const changed = execSync(`git diff --name-only ${since} HEAD -- ${DIR}`, { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] })
      .toString().split('\n').map((s) => path.basename(s.trim())).filter(Boolean);
    files = files.filter((f) => changed.includes(f));
  } catch {
    sinceResolved = false; // unknown baseline (e.g. first release): treat every migration as pending review
  }
}

const DESTRUCTIVE = [
  [/\bDROP\s+(TABLE|DATABASE|SCHEMA|INDEX|VIEW)\b/i, 'DROP'],
  [/\bALTER\s+TABLE\b[^;]*\bDROP\b/i, 'ALTER TABLE … DROP (column/key)'],
  [/\bALTER\s+TABLE\b[^;]*\b(MODIFY|CHANGE)\b/i, 'ALTER TABLE … MODIFY/CHANGE (type rewrite)'],
  [/\bALTER\s+TABLE\b[^;]*\bRENAME\b|\bRENAME\s+TABLE\b/i, 'RENAME'],
  [/\bTRUNCATE\b/i, 'TRUNCATE'],
  [/\bDELETE\s+FROM\b/i, 'DELETE FROM'],
  [/\bUPDATE\s+`?\w+`?\s+SET\b/i, 'UPDATE (data rewrite)'],
];
const NON_PORTABLE = [[/\bADD\s+COLUMN\s+IF\s+NOT\s+EXISTS\b/i, 'ADD COLUMN IF NOT EXISTS (MariaDB only — fails on MySQL 8)']];

const report = files.map((file) => {
  const sql = fs.readFileSync(path.join(ROOT, DIR, file), 'utf8').replace(/--[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
  const statements = sql.split(';').map((s) => s.trim()).filter(Boolean);
  const destructive = [];
  const portability = [];
  for (const st of statements) {
    for (const [re, what] of DESTRUCTIVE) if (re.test(st)) destructive.push(`${what}: ${st.replace(/\s+/g, ' ').slice(0, 100)}`);
    for (const [re, what] of NON_PORTABLE) if (re.test(st)) portability.push(what);
  }
  return { file, statements: statements.length, destructive, portability: [...new Set(portability)] };
});

const summary = {
  since,
  sinceResolved,
  migrations: report.map((r) => r.file),
  migrationRequired: report.length > 0,
  destructive: report.some((r) => r.destructive.length > 0),
  report,
};

if (asJson) {
  console.log(JSON.stringify(summary));
} else {
  console.log(`Migration review${since ? ` since ${since}${sinceResolved ? '' : ' (ref not found — reviewing all)'}` : ''}: ${report.length} file(s)`);
  for (const r of report) {
    console.log(`  ${r.destructive.length ? '⚠' : '✓'} ${r.file} — ${r.statements} statements`);
    r.destructive.forEach((d) => console.log(`      DESTRUCTIVE ${d}`));
    r.portability.forEach((p) => console.log(`      PORTABILITY ${p}`));
  }
  if (summary.destructive) console.log('Destructive statements found: explicit TKS review + fresh backup required before production.');
}
