/**
 * Full HTTP server (server/index.ts) tests: the same Express app Hostinger runs, embedded without
 * listening on a fixed port. Staging mode (SITE_NOINDEX) must keep search engines out.
 */
import { importRepo } from '../helpers/isolate.ts';
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'net';

process.env.SITE_NOINDEX = 'true';
const { app } = await importRepo('server/index.ts');

let base = '';
let server: any;
before(async () => {
  await new Promise<void>((resolve) => { server = app.listen(0, '127.0.0.1', () => resolve()); });
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
after(() => server?.close());

describe('staging mode (SITE_NOINDEX=true)', () => {
  it('serves a disallow-all robots.txt', async () => {
    const r = await fetch(`${base}/robots.txt`);
    assert.equal(r.status, 200);
    assert.match(await r.text(), /Disallow: \//);
  });
  it('adds X-Robots-Tag: noindex to API and page responses', async () => {
    for (const p of ['/api/health', '/villas']) {
      const r = await fetch(`${base}${p}`);
      assert.equal(r.headers.get('x-robots-tag'), 'noindex, nofollow', p);
    }
  });
  it('routes /api/* to the API (JSON 404, never the SPA)', async () => {
    const r = await fetch(`${base}/api/nope`);
    assert.equal(r.status, 404);
    assert.equal((await r.json()).success, false);
  });
  it('does not expose the X-Powered-By header', async () => {
    const r = await fetch(`${base}/api/health`);
    assert.equal(r.headers.get('x-powered-by'), null);
  });
});
