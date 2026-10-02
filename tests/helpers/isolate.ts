/**
 * Test isolation — import this BEFORE any server module (use dynamic `await import()` afterwards).
 *
 * The server reads `.env`, `package.json` and the JSON dev database relative to process.cwd().
 * Switching cwd to an empty temp directory guarantees tests never load a developer's `.env`
 * (which may point at a remote/production MySQL) and never touch `server/data/db.json`.
 * `node --test` runs every test file in its own process, so chdir here is safe.
 */
import fs from 'fs';
import os from 'os';
import path from 'path';

export const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..', '..');
export const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'zanzirangi-test-'));

fs.mkdirSync(path.join(tmpRoot, 'server', 'data'), { recursive: true }); // JSON dev DB lives here
fs.mkdirSync(path.join(tmpRoot, 'uploads'), { recursive: true });
process.chdir(tmpRoot);

Object.assign(process.env, {
  NODE_ENV: 'test',
  FORCE_JSON_DB: 'true',
  DATABASE_PROVIDER: 'json',
  ZANZIRANGI_NO_LISTEN: '1',
  JWT_SECRET: 'test-only-jwt-secret-not-used-anywhere-else-0123456789',
  ADMIN_INITIAL_PASSWORD: 'Test-Only-Password-123',
  MEDIA_STORAGE_PATH: path.join(tmpRoot, 'uploads'),
  CORS_ORIGIN: 'http://localhost:3000',
});
// Never inherit real database credentials into a test process.
for (const key of ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'MYSQL_HOST', 'MYSQL_USER', 'MYSQL_PASSWORD', 'MYSQL_DATABASE']) {
  delete process.env[key];
}

export const TEST_ADMIN = { email: 'info@zanzirangihouse.com', password: 'Test-Only-Password-123' };

/** Imports a module from the repository by its repo-relative path. */
export const importRepo = (rel: string) => import(new URL(`file:///${path.join(repoRoot, rel).replace(/\\/g, '/')}`).href);
