import { importRepo } from '../helpers/isolate.ts';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const auth = await importRepo('server/auth.ts');

/** Minimal Express-like response double. */
function mockRes() {
  const res: any = { statusCode: 200, body: undefined };
  res.status = (code: number) => ((res.statusCode = code), res);
  res.json = (body: unknown) => ((res.body = body), res);
  return res;
}
function run(mw: any, user?: any) {
  const res = mockRes();
  let nextCalled = false;
  mw({ user }, res, () => (nextCalled = true));
  return { res, nextCalled };
}

const admin = (permissions: string[], role = 'admin') => ({
  id: 'usr_9', email: 'a@example.com', name: 'A', role, status: 'active', permissions,
});

describe('sanitizePermissions', () => {
  it('keeps only known module keys and removes duplicates', () => {
    assert.deepEqual(auth.sanitizePermissions(['villas', 'villas', 'seo']), ['villas', 'seo']);
  });
  it('drops wildcards, unknown keys and non-strings', () => {
    assert.deepEqual(auth.sanitizePermissions(['all', '*', 'admin_access', 42, null, 'media']), ['media']);
  });
  it('returns an empty list for non-arrays', () => {
    assert.deepEqual(auth.sanitizePermissions('villas'), []);
    assert.deepEqual(auth.sanitizePermissions(undefined), []);
  });
});

describe('JWT', () => {
  it('round-trips the user claims', () => {
    const token = auth.generateToken({ ...admin(['villas']), tokenVersion: 3 });
    const decoded = auth.verifyToken(token);
    assert.equal(decoded.email, 'a@example.com');
    assert.equal(decoded.tokenVersion, 3);
    assert.deepEqual(decoded.permissions, ['villas']);
  });
  it('rejects a tampered token', () => {
    const token = auth.generateToken(admin(['villas']));
    const [h, p, s] = token.split('.');
    const forged = Buffer.from(JSON.stringify({ ...JSON.parse(Buffer.from(p, 'base64url').toString()), role: 'superadmin' })).toString('base64url');
    assert.equal(auth.verifyToken(`${h}.${forged}.${s}`), null);
  });
  it('rejects garbage', () => {
    assert.equal(auth.verifyToken('not-a-token'), null);
  });
});

describe('requirePermission', () => {
  it('returns 401 without a user', () => {
    const { res, nextCalled } = run(auth.requirePermission('villas'));
    assert.equal(res.statusCode, 401);
    assert.equal(nextCalled, false);
  });
  it('returns 403 when the module permission is missing', () => {
    const { res, nextCalled } = run(auth.requirePermission('villas'), admin(['seo']));
    assert.equal(res.statusCode, 403);
    assert.equal(nextCalled, false);
  });
  it('allows a user holding the permission', () => {
    assert.equal(run(auth.requirePermission('villas'), admin(['villas'])).nextCalled, true);
  });
  it('allows a superadmin without explicit permissions', () => {
    assert.equal(run(auth.requirePermission('villas'), admin([], 'superadmin')).nextCalled, true);
  });
});

describe('requireAnyPermission', () => {
  it('allows when one of the permissions matches', () => {
    assert.equal(run(auth.requireAnyPermission(['homepage', 'pages']), admin(['pages'])).nextCalled, true);
  });
  it('denies when none match', () => {
    assert.equal(run(auth.requireAnyPermission(['homepage', 'pages']), admin(['seo'])).res.statusCode, 403);
  });
});

describe('requireSuperadmin', () => {
  it('denies a regular admin with every permission', () => {
    const { res, nextCalled } = run(auth.requireSuperadmin, admin([...auth.ADMIN_PERMISSIONS]));
    assert.equal(res.statusCode, 403);
    assert.equal(nextCalled, false);
  });
  it('allows a superadmin', () => {
    assert.equal(run(auth.requireSuperadmin, admin([], 'superadmin')).nextCalled, true);
  });
});
