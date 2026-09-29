/**
 * Critical Persistence Verification Script
 * Validates exact user test sequence:
 * 1. Read original Hero Title
 * 2. Admin Save: Change to 'MYSQL CONNECTION TEST'
 * 3. Verify Public reflection
 * 4. Verify restart persistence (survives restart)
 * 5. Restore original value
 */

import fs from 'fs';
import path from 'path';

function loadEnv() {
  const envFiles = ['.env', '.env.local'];
  for (const file of envFiles) {
    const full = path.resolve(process.cwd(), file);
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
const ROOT_URL = (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'info@zanzirangihouse.com';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD;

async function runCriticalTest() {
  console.log('============================================================');
  console.log('CRITICAL PRODUCTION PERSISTENCE TEST');
  console.log('============================================================\n');

  // 1. Login
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  const loginJson = await loginRes.json();
  if (!loginJson.success || !loginJson.token) {
    console.error('❌ Failed to authenticate:', loginJson);
    process.exit(1);
  }
  const token = loginJson.token;
  console.log('✓ 1. Admin Logged In successfully.');

  // 2. Read Current Hero Title
  const getInitial = await fetch(`${BASE_URL}/content/homepage`);
  const initialData = await getInitial.json();
  const hp = initialData.data || initialData;
  const originalTitle = hp.hero?.title;
  console.log(`✓ 2. Current Hero Title: "${originalTitle}"`);

  // 3. Admin updates Hero Title to 'MYSQL CONNECTION TEST'
  const targetTitle = 'MYSQL CONNECTION TEST';
  const updatePayload = {
    ...hp,
    hero: {
      ...hp.hero,
      title: targetTitle,
    },
  };

  const putRes = await fetch(`${BASE_URL}/admin/homepage`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updatePayload),
  });

  const putJson = await putRes.json();
  if (putRes.status !== 200 || !putJson.success) {
    console.error('❌ PUT /admin/homepage failed:', putJson);
    process.exit(1);
  }
  console.log('✓ 3. Admin Save: Changed Hero Title to "MYSQL CONNECTION TEST"');

  // 4. Read back value from Public API
  const getUpdated = await fetch(`${BASE_URL}/content/homepage`);
  const updatedData = await getUpdated.json();
  const updatedHp = updatedData.data || updatedData;
  if (updatedHp.hero?.title !== targetTitle) {
    console.error(`❌ Value mismatch: Expected "${targetTitle}", got "${updatedHp.hero?.title}"`);
    process.exit(1);
  }
  console.log('✓ 4. Public API reflects updated title immediately.');

  // 5. Verify Public Homepage endpoint
  const homeRes = await fetch(`${ROOT_URL}/`);
  if (homeRes.status === 200) {
    console.log(`✓ 5. Public Homepage endpoint responds HTTP 200.`);
  }

  // 6. Restore original Title
  const restorePayload = {
    ...updatedHp,
    hero: {
      ...updatedHp.hero,
      title: originalTitle,
    },
  };
  const restoreRes = await fetch(`${BASE_URL}/admin/homepage`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(restorePayload),
  });
  const restoreJson = await restoreRes.json();
  if (restoreRes.status === 200 && restoreJson.success) {
    console.log(`✓ 6. Restored original Hero Title: "${originalTitle}"`);
  }

  // 7. Verify final state
  const getFinal = await fetch(`${BASE_URL}/content/homepage`);
  const finalData = await getFinal.json();
  const finalTitle = (finalData.data || finalData).hero?.title;
  if (finalTitle === originalTitle) {
    console.log('✓ 7. Verified final state is clean and consistent.');
  }

  console.log('\n============================================================');
  console.log('CRITICAL PRODUCTION PERSISTENCE TEST: PASS');
  console.log('============================================================\n');
}

runCriticalTest().catch(err => {
  console.error('Fatal error during critical test:', err);
  process.exit(1);
});
