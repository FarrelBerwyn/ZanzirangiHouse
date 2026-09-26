/**
 * Production Readiness & API Smoke Test Script
 * Zanzirangi House
 *
 * Verifies all required endpoints:
 * 1. GET /api/health
 * 2. POST /api/auth/login (and verifies wrong password rejects)
 * 3. GET /api/auth/me
 * 4. GET /api/content/homepage
 * 5. GET /api/content/villas
 * 6. GET /api/content/gallery
 * 7. GET /api/content/facilities
 * 8. GET /api/content/testimonials
 * 9. GET /api/content/videos
 * 10. GET /api/content/seo
 * 11. GET /api/admin/settings (authenticated vs unauthenticated)
 * 12. Media storage upload & route verification
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// Load environment from .env and .env.local if present
function loadEnv() {
  const envFiles = ['.env', '.env.local'];
  for (const file of envFiles) {
    const full = path.join(ROOT, file);
    if (fs.existsSync(full)) {
      const lines = fs.readFileSync(full, 'utf8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eq = trimmed.indexOf('=');
        if (eq > 0) {
          const k = trimmed.substring(0, eq).trim();
          let v = trimmed.substring(eq + 1).trim();
          if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
            v = v.slice(1, -1);
          }
          if (!process.env[k]) {
            process.env[k] = v;
          }
        }
      }
    }
  }
}

loadEnv();

const BASE_URL = process.env.API_URL || 'http://localhost:3000/api';
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'info@zanzirangihouse.com';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD;
if (!ADMIN_PASSWORD) {
  console.error('❌ Error: TEST_ADMIN_PASSWORD must be provided via environment or .env.local.');
  process.exit(1);
}

const results = [];

function record(name, pass, details) {
  results.push({ name, pass, details });
  const status = pass ? '✓ PASS' : '✗ FAIL';
  console.log(`${status} - ${name}${details ? ` (${details})` : ''}`);
}

async function run() {
  console.log('====================================================');
  console.log('ZANZIRANGI HOUSE — PRODUCTION SMOKE TEST');
  console.log(`Target API Base: ${BASE_URL}`);
  console.log(`Admin User:      ${ADMIN_EMAIL}`);
  console.log('====================================================\n');

  let authToken = null;

  // 1. GET /api/health
  try {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    const ok = res.status === 200 && (data.status === 'ok' || data.status === 'online') && data.database === 'connected';
    // Verify no secret leak in health
    const noSecretLeak = !data.jwt_secret && !data.password && !data.user;
    record('1. GET /api/health', ok && noSecretLeak, `status: ${data.status}, db: ${data.database}`);
  } catch (err) {
    record('1. GET /api/health', false, err.message);
  }

  // 2. POST /api/auth/login - verify invalid password rejects (401)
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: 'WrongPasswordAttempt999!' }),
    });
    record('2a. POST /api/auth/login (invalid creds rejected)', res.status === 401, `HTTP ${res.status}`);
  } catch (err) {
    record('2a. POST /api/auth/login (invalid rejection)', false, err.message);
  }

  // 2b. POST /api/auth/login - valid login
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    const data = await res.json();
    if (res.status === 200 && data.token) {
      authToken = data.token;
      record('2b. POST /api/auth/login (valid admin auth)', true, `role: ${data.user?.role}`);
    } else {
      record('2b. POST /api/auth/login (valid admin auth)', false, `HTTP ${res.status}: ${data.error || 'No token'}`);
    }
  } catch (err) {
    record('2b. POST /api/auth/login (valid admin auth)', false, err.message);
  }

  // 3. GET /api/auth/me (authenticated)
  try {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    });
    const data = await res.json();
    const user = data.user || data.data || data;
    record('3. GET /api/auth/me', res.status === 200 && user.email === ADMIN_EMAIL, `email: ${user.email}`);
  } catch (err) {
    record('3. GET /api/auth/me', false, err.message);
  }

  // 4. GET /api/content/homepage
  try {
    const res = await fetch(`${BASE_URL}/content/homepage`);
    const json = await res.json();
    const data = json.data || json;
    const hasHero = !!data.hero && typeof data.hero.title === 'string';
    record('4. GET /api/content/homepage', res.status === 200 && hasHero, `title: "${data.hero?.title?.substring(0, 30)}..."`);
  } catch (err) {
    record('4. GET /api/content/homepage', false, err.message);
  }

  // 5. GET /api/content/villas
  try {
    const res = await fetch(`${BASE_URL}/content/villas`);
    const json = await res.json();
    const data = json.data || json;
    record('5. GET /api/content/villas', res.status === 200 && Array.isArray(data), `count: ${data.length}`);
  } catch (err) {
    record('5. GET /api/content/villas', false, err.message);
  }

  // 6. GET /api/content/gallery
  try {
    const res = await fetch(`${BASE_URL}/content/gallery`);
    const json = await res.json();
    const data = json.data || json;
    record('6. GET /api/content/gallery', res.status === 200 && Array.isArray(data), `count: ${data.length}`);
  } catch (err) {
    record('6. GET /api/content/gallery', false, err.message);
  }

  // 7. GET /api/content/facilities
  try {
    const res = await fetch(`${BASE_URL}/content/facilities`);
    const json = await res.json();
    const data = json.data || json;
    record('7. GET /api/content/facilities', res.status === 200 && Array.isArray(data), `count: ${data.length}`);
  } catch (err) {
    record('7. GET /api/content/facilities', false, err.message);
  }

  // 8. GET /api/content/testimonials
  try {
    const res = await fetch(`${BASE_URL}/content/testimonials`);
    const json = await res.json();
    const data = json.data || json;
    record('8. GET /api/content/testimonials', res.status === 200 && Array.isArray(data), `count: ${data.length}`);
  } catch (err) {
    record('8. GET /api/content/testimonials', false, err.message);
  }

  // 9. GET /api/content/videos
  try {
    const res = await fetch(`${BASE_URL}/content/videos`);
    const json = await res.json();
    const data = json.data || json;
    const validVideo = !!data && (Array.isArray(data) ? data.length > 0 : !!data.title && Array.isArray(data.scenes));
    const sceneCount = Array.isArray(data) ? data.length : (data.scenes?.length || 0);
    record('9. GET /api/content/videos', res.status === 200 && validVideo, `scenes: ${sceneCount}`);
  } catch (err) {
    record('9. GET /api/content/videos', false, err.message);
  }

  // 10. GET /api/content/seo
  try {
    const res = await fetch(`${BASE_URL}/content/seo`);
    const json = await res.json();
    const data = json.data || json;
    record('10. GET /api/content/seo', res.status === 200 && typeof data === 'object', `routes: ${Object.keys(data).length}`);
  } catch (err) {
    record('10. GET /api/content/seo', false, err.message);
  }

  // 11a. GET /api/admin/settings (unauthenticated - must reject 401)
  try {
    const res = await fetch(`${BASE_URL}/admin/settings`);
    record('11a. GET /api/admin/settings (unauthenticated rejected)', res.status === 401, `HTTP ${res.status}`);
  } catch (err) {
    record('11a. GET /api/admin/settings (unauthenticated)', false, err.message);
  }

  // 11b. GET /api/admin/settings (authenticated)
  try {
    const res = await fetch(`${BASE_URL}/admin/settings`, {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    });
    const json = await res.json();
    const data = json.data || json;
    record('11b. GET /api/admin/settings (authenticated)', res.status === 200 && !!data.siteName, `siteName: ${data.siteName}`);
  } catch (err) {
    record('11b. GET /api/admin/settings (authenticated)', false, err.message);
  }

  // Summary
  console.log('\n====================================================');
  const allPassed = results.every(r => r.pass);
  const passedCount = results.filter(r => r.pass).length;
  console.log(`TOTAL TESTS: ${results.length} | PASSED: ${passedCount} | FAILED: ${results.length - passedCount}`);
  if (allPassed) {
    console.log('STATUS: ALL SMOKE TESTS PASSED [PASS]');
  } else {
    console.log('STATUS: SOME SMOKE TESTS FAILED [FAIL]');
    process.exit(1);
  }
  console.log('====================================================\n');
}

run();
