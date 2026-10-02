/**
 * API integration tests: the real Express API (server/api.ts) against the JSON dev database in a
 * throw-away temp directory. No MySQL, no network, no developer or production data.
 */
import { importRepo, TEST_ADMIN } from '../helpers/isolate.ts';
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'net';

const { apiApp } = await importRepo('server/api.ts');
const { getDatabaseAdapter } = await importRepo('server/database/index.ts');

let base = '';
let server: any;
let token = '';

const call = async (method: string, path: string, body?: unknown, auth = false) => {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(auth ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  });
  const text = await res.text();
  let json: any = null;
  try { json = JSON.parse(text); } catch { /* not JSON */ }
  return { status: res.status, json, headers: res.headers };
};

before(async () => {
  await getDatabaseAdapter().connect();
  await new Promise<void>((resolve) => {
    server = apiApp.listen(0, '127.0.0.1', () => resolve());
  });
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
after(() => server?.close());

describe('health', () => {
  it('reports ok with version and release metadata', async () => {
    const r = await call('GET', '/health');
    assert.equal(r.status, 200);
    assert.equal(r.json.status, 'ok');
    assert.equal(r.json.database.connected, true);
    assert.equal(typeof r.json.version, 'string');
    assert.ok('release' in r.json, 'health exposes the release block');
  });
  it('sends security headers', async () => {
    const r = await call('GET', '/health');
    assert.equal(r.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(r.headers.get('x-frame-options'), 'SAMEORIGIN');
  });
});

describe('public content', () => {
  for (const path of ['/content/homepage', '/content/villas', '/content/settings', '/content/seo']) {
    it(`GET ${path} → 200`, async () => {
      const r = await call('GET', path);
      assert.equal(r.status, 200);
      assert.equal(r.json.success, true);
    });
  }
  it('public settings do not leak admin-only fields', async () => {
    const r = await call('GET', '/content/settings');
    assert.equal(r.json.data.passwordHash, undefined);
    assert.equal(r.json.data.users, undefined);
  });
});

describe('API error handling', () => {
  it('unknown API routes return JSON 404 (never the SPA)', async () => {
    const r = await call('GET', '/does-not-exist');
    assert.equal(r.status, 404);
    assert.equal(r.json.success, false);
  });
  it('malformed JSON returns 400', async () => {
    const r = await call('POST', '/auth/login', '{"email":');
    assert.equal(r.status, 400);
  });
});

describe('authentication & authorisation', () => {
  it('admin endpoints require authentication', async () => {
    for (const path of ['/admin/settings', '/admin/users', '/admin/media', '/auth/me']) {
      assert.equal((await call('GET', path)).status, 401, path);
    }
  });
  it('rejects a forged bearer token', async () => {
    const r = await fetch(`${base}/admin/settings`, { headers: { Authorization: 'Bearer abc.def.ghi' } });
    assert.equal(r.status, 401);
  });
  it('rejects a wrong password with a generic message', async () => {
    const r = await call('POST', '/auth/login', { email: TEST_ADMIN.email, password: 'wrong-password' });
    assert.equal(r.status, 401);
    assert.equal(r.json.error, 'Invalid email or password.');
    const unknown = await call('POST', '/auth/login', { email: 'nobody@example.com', password: 'wrong-password' });
    assert.equal(unknown.json.error, r.json.error, 'no user enumeration');
  });
  it('logs in the seeded superadmin and returns its profile', async () => {
    const r = await call('POST', '/auth/login', TEST_ADMIN);
    assert.equal(r.status, 200);
    assert.equal(r.json.user.role, 'superadmin');
    assert.equal(r.json.user.passwordHash, undefined);
    token = r.json.token;
    const me = await call('GET', '/auth/me', undefined, true);
    assert.equal(me.status, 200);
    assert.equal(me.json.user.email, TEST_ADMIN.email);
  });
  it('superadmin can list admins without password hashes', async () => {
    const r = await call('GET', '/admin/users', undefined, true);
    assert.equal(r.status, 200);
    assert.ok(r.json.data.length > 0);
    for (const u of r.json.data) assert.equal(u.passwordHash, undefined);
  });
  it('logout revokes the session server-side', async () => {
    assert.equal((await call('POST', '/auth/logout', undefined, true)).status, 200);
    assert.equal((await call('GET', '/auth/me', undefined, true)).status, 401);
  });
});
