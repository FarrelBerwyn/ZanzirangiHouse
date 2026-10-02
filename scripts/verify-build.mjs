#!/usr/bin/env node
/**
 * Verifies the output of `npm run build` (read-only). Used by CI after the build step.
 *   - dist/index.html exists and every /assets/* file it references exists
 *   - pre-rendered route pages exist (scripts/generate_routes.js)
 *   - server.js (esbuild bundle of server/index.ts) exists and parses
 *   - no secrets / local data were copied into the build output
 */
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const ROUTES = ['villas', 'dining', 'experiences', 'safari', 'about', 'contact', 'privacy', 'terms'];
const errors = [];
const ok = (msg) => console.log(`  ✓ ${msg}`);

const indexPath = path.join(DIST, 'index.html');
if (!fs.existsSync(indexPath)) {
  errors.push('dist/index.html is missing — did `npm run build` run?');
} else {
  const html = fs.readFileSync(indexPath, 'utf8');
  const assets = [...html.matchAll(/(?:src|href)="\/(assets\/[^"]+)"/g)].map((m) => m[1]);
  if (!assets.some((a) => a.endsWith('.js'))) errors.push('dist/index.html references no /assets/*.js bundle.');
  if (!assets.some((a) => a.endsWith('.css'))) errors.push('dist/index.html references no /assets/*.css bundle.');
  for (const a of assets) if (!fs.existsSync(path.join(DIST, a))) errors.push(`dist/index.html references missing file ${a}`);
  if (!errors.length) ok(`dist/index.html and ${assets.length} referenced assets`);
}

const missingRoutes = ROUTES.filter((r) => !fs.existsSync(path.join(DIST, r, 'index.html')));
if (missingRoutes.length) errors.push(`pre-rendered routes missing: ${missingRoutes.join(', ')}`);
else ok(`${ROUTES.length} pre-rendered routes`);

for (const f of ['robots.txt', 'sitemap.xml', 'llms.txt']) {
  if (!fs.existsSync(path.join(DIST, f))) errors.push(`dist/${f} is missing`);
}

const serverBundle = path.join(ROOT, 'server.js');
if (!fs.existsSync(serverBundle)) {
  errors.push('server.js (server bundle) is missing.');
} else {
  try {
    execFileSync(process.execPath, ['--check', serverBundle], { stdio: 'pipe' });
    ok(`server.js bundle parses (${Math.round(fs.statSync(serverBundle).size / 1024)} kB)`);
  } catch (e) {
    errors.push(`server.js does not parse: ${String(e.stderr || e.message).split('\n')[0]}`);
  }
}

// Nothing secret or local may end up in the publicly served build output.
const forbidden = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (/^\.env(\..*)?$|^db\.json|\.(pem|key|sql|zip)$/i.test(entry.name)) forbidden.push(path.relative(ROOT, p));
  }
};
if (fs.existsSync(DIST)) walk(DIST);
if (forbidden.length) errors.push(`forbidden files in dist/: ${forbidden.join(', ')}`);
else ok('no .env / database / key / archive files in dist/');

if (errors.length) {
  console.error('Build verification FAILED:');
  errors.forEach((e) => console.error(`  ✗ ${e}`));
  process.exit(1);
}
console.log('Build verification passed.');
