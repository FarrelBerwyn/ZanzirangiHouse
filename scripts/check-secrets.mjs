#!/usr/bin/env node
/**
 * Secret & sensitive-file scan of every file tracked by Git (read-only). Used by CI.
 *
 *   BLOCK (exit 1): committed .env files, private keys, database dumps, deploy archives,
 *                   recognisable API tokens, real-looking secret assignments.
 *   WARN  (exit 0): infrastructure identifiers (hosting account IDs, remote DB hosts, IPv4
 *                   addresses) — must be redacted from a public repository but are not credentials.
 *
 *   node scripts/check-secrets.mjs            → scan tracked files
 *   node scripts/check-secrets.mjs --staged   → also scan files staged for the next commit
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ROOT = process.cwd();
const list = (cmd) => execSync(cmd, { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 }).toString().split('\n').map((s) => s.trim()).filter(Boolean);
const files = new Set(list('git ls-files'));
if (process.argv.includes('--staged')) list('git diff --cached --name-only --diff-filter=ACM').forEach((f) => files.add(f));

const SELF = 'scripts/check-secrets.mjs';
const blocks = [];
const warns = [];

// 1. Files that must never be committed.
const FORBIDDEN_FILE = [
  [/(^|\/)\.env(\.(?!example$)[^/]+)?$/, 'environment file'],
  [/(^|\/)server\/data\/db\.json(\.backup)?$/, 'local JSON database (contains password hashes)'],
  [/(^|\/)backups\//, 'backup / database snapshot'],
  [/\.(pem|key|p12|pfx|keystore)$/i, 'private key / certificate store'],
  [/(^|\/)id_(rsa|ed25519|ecdsa)(\.pub)?$/, 'SSH key'],
  [/\.(sql\.gz|dump)$/i, 'database dump'],
  [/\.zip$/i, 'deployment archive'],
  [/(^|\/)release\.json$/, 'deployment stamp (only created on deploy/* branches by the pipeline)'],
];
for (const f of files) {
  for (const [re, what] of FORBIDDEN_FILE) if (re.test(f)) blocks.push(`${f}: ${what} must not be committed`);
}

// 2. Content patterns.
const BLOCK_PATTERNS = [
  [/-----BEGIN (RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/, 'private key'],
  [/\bAKIA[0-9A-Z]{16}\b/, 'AWS access key'],
  [/\bgh[pousr]_[A-Za-z0-9]{36,}\b/, 'GitHub token'],
  [/\bgithub_pat_[A-Za-z0-9_]{60,}\b/, 'GitHub fine-grained token'],
  [/\bAIza[0-9A-Za-z_-]{35}\b/, 'Google API key'],
  [/\bxox[baprs]-[A-Za-z0-9-]{10,}\b/, 'Slack token'],
  [/\b(sk|rk)_live_[A-Za-z0-9]{20,}\b/, 'Stripe live key'],
  [/\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{20,}\b/, 'JSON Web Token'],
  // KEY=value where value is not a placeholder/reference (e.g. DB_PASSWORD=hunter2)
  [/^\s*(export\s+)?(DB_PASSWORD|MYSQL_PASSWORD|JWT_SECRET|ADMIN_INITIAL_PASSWORD|TEST_ADMIN_PASSWORD|HOSTINGER_API_TOKEN|API_KEY|SECRET_KEY)\s*=\s*(?!\s*$)(?![<[{])(?!\$)(?!\*{3,})(?!your[-_])(?!changeme)(?!example)[^\s#'"]{6,}/im, 'secret assigned in a tracked file'],
];
const WARN_PATTERNS = [
  [/\bsrv\d{2,}\.hstgr\.io\b/i, 'remote MySQL host name'],
  [/\bu\d{9}(_[A-Za-z0-9]+)?\b/, 'Hostinger account / database user identifier'],
  [/\b(?!0\.0\.0\.0\b)(?!127\.)(?!10\.)(?!192\.168\.)(?!255\.)(?:25[0-5]|2[0-4]\d|1?\d?\d)(?:\.(?:25[0-5]|2[0-4]\d|1?\d?\d)){3}\b/, 'public IPv4 address'],
];
const TEXT_EXT = /\.(md|txt|ts|tsx|js|mjs|cjs|json|ya?ml|html|css|sql|env|example|sh|ps1|py|xml|toml|ini)$|(^|\/)\.[a-z]+rc$|(^|\/)\.env\.example$/i;
const SKIP = /(^|\/)(package-lock\.json|node_modules\/)/;

let scanned = 0;
for (const f of files) {
  if (f === SELF || SKIP.test(f) || !TEXT_EXT.test(f)) continue;
  const abs = path.join(ROOT, f);
  if (!fs.existsSync(abs) || fs.statSync(abs).size > 2 * 1024 * 1024) continue;
  scanned++;
  const lines = fs.readFileSync(abs, 'utf8').split(/\r?\n/);
  lines.forEach((line, i) => {
    for (const [re, what] of BLOCK_PATTERNS) if (re.test(line)) blocks.push(`${f}:${i + 1}: ${what}`);
    if (f === 'server.js') return; // generated bundle — identifiers there come from source files already scanned
    for (const [re, what] of WARN_PATTERNS) if (re.test(line)) warns.push(`${f}:${i + 1}: ${what}`);
  });
}

console.log(`Secret scan: ${files.size} tracked files, ${scanned} text files scanned.`);
if (warns.length) {
  const byFile = {};
  for (const w of warns) byFile[w.split(':')[0]] = (byFile[w.split(':')[0]] || 0) + 1;
  console.log(`  ⚠ ${warns.length} infrastructure identifier(s) found (WARN — redact from the public repository):`);
  for (const [file, n] of Object.entries(byFile)) console.log(`    - ${file} (${n})`);
}
if (blocks.length) {
  console.error(`  ✗ ${blocks.length} blocking finding(s):`);
  blocks.forEach((b) => console.error(`    - ${b}`));
  console.error('Remove the secret, rotate it if it was ever pushed, and re-run.');
  process.exit(1);
}
console.log('  ✓ No committed secrets or forbidden files.');
