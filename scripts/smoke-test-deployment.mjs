#!/usr/bin/env node
/**
 * Post-deployment health check + smoke test (read-only: GET requests only, no logins, no form
 * submissions, no client data). Used by .github/workflows/deploy.yml and runnable by TKS by hand.
 *
 *   node scripts/smoke-test-deployment.mjs --url https://zanzirangihouse.com
 *        [--expect-commit <sha>] [--expect-version 1.2.0] [--wait 600]
 *
 * --wait N   keep polling /api/health for up to N seconds until it is healthy AND reports the expected
 *            commit/version (Hostinger builds take ~1–2 minutes), then run the smoke checks once.
 * Exit code 0 = healthy, 1 = failed (the workflow stops and TKS follows docs/ROLLBACK.md).
 */
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith('--') ? [...acc, [a.slice(2), all[i + 1]?.startsWith('--') ? 'true' : all[i + 1]]] : acc), [])
);
const base = String(args.url || process.env.SMOKE_URL || '').replace(/\/+$/, '');
const expectCommit = args['expect-commit'] ? String(args['expect-commit']).slice(0, 7) : null;
const expectVersion = args['expect-version'] || null;
const waitSeconds = Number(args.wait || 0);
if (!/^https?:\/\//.test(base)) {
  console.error('Usage: smoke-test-deployment.mjs --url https://host [--expect-commit sha] [--expect-version x.y.z] [--wait seconds]');
  process.exit(2);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function get(path, opts = {}) {
  const started = Date.now();
  const res = await fetch(base + path, { redirect: 'manual', headers: { 'User-Agent': 'TKS-deploy-smoke-test', 'Cache-Control': 'no-cache' }, signal: AbortSignal.timeout(20_000), ...opts });
  const body = await res.text();
  return { status: res.status, body, headers: res.headers, ms: Date.now() - started };
}
const json = (s) => { try { return JSON.parse(s); } catch { return null; } };

// 1. Wait for the new release to be live and healthy.
const deadline = Date.now() + waitSeconds * 1000;
let health = null;
let lastProblem = '';
for (;;) {
  try {
    const r = await get('/api/health');
    health = json(r.body);
    const commit = health?.release?.commit?.slice(0, 7) ?? null;
    if (r.status !== 200 || health?.status !== 'ok') lastProblem = `health HTTP ${r.status} status=${health?.status ?? 'n/a'} db=${health?.database?.connected}`;
    else if (expectCommit && commit !== expectCommit) lastProblem = `live commit ${commit ?? 'unknown'} ≠ expected ${expectCommit} (build not live yet)`;
    else if (expectVersion && health.version !== expectVersion) lastProblem = `live version ${health.version} ≠ expected ${expectVersion}`;
    else { lastProblem = ''; break; }
  } catch (e) {
    lastProblem = `health request failed: ${e.message}`;
  }
  if (Date.now() >= deadline) break;
  console.log(`  … waiting: ${lastProblem}`);
  await sleep(15_000);
}
if (lastProblem) {
  console.error(`✗ Health check FAILED: ${lastProblem}`);
  process.exitCode = 1; // let open sockets close naturally (process.exit() here can abort Node on Windows)
} else {
  await runSmokeChecks();
}

async function runSmokeChecks() {
console.log(`✓ /api/health ok — version ${health.version}, db ${health.database.provider} connected, release ${health.release ? `${health.release.tag ?? '-'} @ ${health.release.commit} (build ${health.release.build}, ${health.release.environment})` : 'not stamped'}`);

// 2. Smoke checks (GET only).
const checks = [];
const check = async (name, fn) => {
  try { const detail = await fn(); checks.push([true, name, detail]); } catch (e) { checks.push([false, name, e.message]); }
};
const expect = (cond, msg) => { if (!cond) throw new Error(msg); };

let homeHtml = '';
await check('Homepage renders', async () => {
  const r = await get('/');
  expect(r.status === 200, `HTTP ${r.status}`);
  expect(/<div id="root">/.test(r.body), 'SPA root element missing');
  homeHtml = r.body;
  return `${r.ms} ms`;
});
await check('Static assets served', async () => {
  const assets = [...homeHtml.matchAll(/(?:src|href)="(\/assets\/[^"]+\.(?:js|css))"/g)].map((m) => m[1]);
  expect(assets.length > 0, 'no /assets references in homepage');
  for (const a of assets) {
    const r = await get(a, { method: 'HEAD' });
    expect(r.status === 200, `${a} → HTTP ${r.status}`);
  }
  return `${assets.length} bundles`;
});
for (const route of ['/villas', '/dining', '/contact']) {
  await check(`Route ${route}`, async () => {
    const r = await get(route);
    expect(r.status === 200, `HTTP ${r.status}`);
    expect(/<link rel="canonical"/.test(r.body), 'canonical tag missing');
    return `${r.ms} ms`;
  });
}
for (const f of ['/robots.txt', '/sitemap.xml']) {
  await check(f, async () => {
    const r = await get(f);
    expect(r.status === 200, `HTTP ${r.status}`);
    return 'ok';
  });
}
for (const p of ['/api/content/homepage', '/api/content/villas', '/api/content/settings']) {
  await check(`Public API ${p}`, async () => {
    const r = await get(p);
    expect(r.status === 200 && json(r.body)?.success === true, `HTTP ${r.status}`);
    return `${r.ms} ms`;
  });
}
await check('Admin API requires authentication', async () => {
  for (const p of ['/api/admin/settings', '/api/admin/users', '/api/auth/me']) {
    const r = await get(p);
    expect(r.status === 401, `${p} → HTTP ${r.status} (expected 401)`);
  }
  return '401 as expected';
});
await check('Unknown API route returns JSON 404', async () => {
  const r = await get('/api/__smoke_not_found__');
  expect(r.status === 404 && json(r.body)?.success === false, `HTTP ${r.status}`);
  return 'ok';
});
await check('Admin dashboard page loads', async () => {
  const r = await get('/admin');
  expect(r.status === 200, `HTTP ${r.status}`);
  return 'ok';
});

for (const [pass, name, detail] of checks) console.log(`${pass ? '✓' : '✗'} ${name} — ${detail}`);
const failed = checks.filter(([p]) => !p).length;
if (failed) {
  console.error(`Smoke test FAILED (${failed}/${checks.length}).`);
  process.exitCode = 1;
  return;
}
console.log(`Smoke test passed (${checks.length}/${checks.length}).`);
}
