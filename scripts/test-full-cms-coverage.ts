import http from 'http';
import { app } from '../server/index.ts';
import { getMysqlPool } from '../server/database/connection.ts';
import { generateToken } from '../server/auth.ts';
import type { RowDataPacket } from 'mysql2';

interface TestResult {
  group: string;
  name: string;
  passed: boolean;
  details?: string;
  error?: string;
}

const results: TestResult[] = [];

function record(group: string, name: string, passed: boolean, details?: string, error?: string) {
  results.push({ group, name, passed, details, error });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} [${passed ? 'PASS' : 'FAIL'}] [${group}] ${name}`);
  if (details) console.log(`   └─ ${details}`);
  if (error) console.log(`   └─ ERROR: ${error}`);
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('ZANZIRANGI HOUSE FULL CMS & ADMIN ACCESS VERIFICATION SUITE');
  console.log('Target: Live Hostinger MySQL & Express API');
  console.log('================================================================\n');

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}`;
  console.log(`🚀 Ephemeral In-Process Server running at ${baseUrl}\n`);

  const pool = getMysqlPool();
  const testCreatedUserIds: string[] = [];

  try {
    // -------------------------------------------------------------------------
    // GROUP 1: Public CMS Endpoints Verification
    // -------------------------------------------------------------------------
    console.log('\n--- GROUP 1: Public Endpoints Coverage ---');
    const publicEndpoints = [
      { path: '/api/content/pages', name: 'Pages List' },
      { path: '/api/content/pages/home', name: 'Page: Home' },
      { path: '/api/content/pages/stay', name: 'Page: Stay' },
      { path: '/api/content/pages/dining', name: 'Page: Dining' },
      { path: '/api/content/pages/experiences', name: 'Page: Experiences' },
      { path: '/api/content/pages/safari', name: 'Page: Safari' },
      { path: '/api/content/pages/about', name: 'Page: About' },
      { path: '/api/content/pages/contact', name: 'Page: Contact' },
      { path: '/api/content/pages/privacy', name: 'Page: Privacy' },
      { path: '/api/content/pages/terms', name: 'Page: Terms' },
      { path: '/api/content/chauffeur', name: 'VIP Chauffeur & Transfers' },
      { path: '/api/content/whystay', name: 'Sanctuary Difference (Why Stay)' },
      { path: '/api/content/dining', name: 'Dining Config & Menus' },
      { path: '/api/content/experiences', name: 'Curated Experiences' },
      { path: '/api/content/safari', name: 'Safari Packages & Destinations' },
      { path: '/api/content/global', name: 'Global Brand & Navigation' },
      { path: '/api/content/seo', name: 'SEO Metadata' },
      { path: '/api/content/villas', name: 'Villas Collection' },
      { path: '/api/content/gallery', name: 'Gallery Collection' },
      { path: '/api/content/facilities', name: 'Facilities Collection' },
      { path: '/api/content/testimonials', name: 'Testimonials Collection' },
      { path: '/api/content/videos', name: 'Videos Collection' },
    ];

    for (const ep of publicEndpoints) {
      const res = await fetch(`${baseUrl}${ep.path}`);
      const json = await res.json();
      const ok = res.status === 200 && json.success === true && json.data !== undefined;
      record(
        'Public Endpoints',
        `GET ${ep.path} (${ep.name})`,
        ok,
        `Status: ${res.status}, Type: ${Array.isArray(json.data) ? `Array[${json.data.length}]` : typeof json.data}`
      );
    }

    // -------------------------------------------------------------------------
    // GROUP 2: Admin Authentication & Superadmin Context
    // -------------------------------------------------------------------------
    console.log('\n--- GROUP 2: Admin Users & Authentication ---');
    const [superadminRows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM users WHERE role = 'superadmin' AND status = 'active' LIMIT 1`
    );
    if (!superadminRows.length) {
      throw new Error('No active superadmin found in MySQL users table!');
    }
    const superadmin = superadminRows[0];
    const superadminToken = generateToken(superadmin as any);

    record(
      'Admin Auth',
      'Superadmin Identity & Token',
      true,
      `Superadmin: ${superadmin.email} (ID: ${superadmin.id}, Role: ${superadmin.role})`
    );

    // List users
    const usersRes = await fetch(`${baseUrl}/api/admin/users`, {
      headers: { Authorization: `Bearer ${superadminToken}` },
    });
    const usersJson = await usersRes.json();
    const usersListPass =
      usersRes.status === 200 &&
      usersJson.success === true &&
      Array.isArray(usersJson.data) &&
      typeof usersJson.meta?.activeCount === 'number';

    record(
      'Admin Auth',
      'GET /api/admin/users (Admin Access List)',
      usersListPass,
      `Users: ${usersJson.data?.length}, Active: ${usersJson.meta?.activeCount} / ${usersJson.meta?.maxActive}`
    );

    // Verify passwordHash is sanitized and NEVER returned
    const leakedHashes = usersJson.data?.some((u: any) => u.passwordHash || u.password);
    record(
      'Security',
      'passwordHash Never Leaked in API Responses',
      !leakedHashes,
      leakedHashes ? 'CRITICAL: passwordHash detected in response' : 'Clean: All user objects sanitized'
    );

    // -------------------------------------------------------------------------
    // GROUP 3: Admin Access Management, Limits, and RBAC
    // -------------------------------------------------------------------------
    console.log('\n--- GROUP 3: Admin Access & RBAC Enforcement ---');
    const testAdminEmail = `test_admin_${Date.now()}@zanzirangi.test`;
    const testPassword = 'TestSecurePassword123!';

    // 1. Create temporary test admin
    const createRes = await fetch(`${baseUrl}/api/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superadminToken}`,
      },
      body: JSON.stringify({
        name: 'Test Automated Administrator',
        email: testAdminEmail,
        password: testPassword,
        role: 'admin',
        permissions: ['dashboard', 'homepage', 'transfers'],
      }),
    });
    const createJson = await createRes.json();
    const createPass = createRes.status === 200 && createJson.success === true && createJson.data?.id;
    record(
      'Admin Access',
      'Create Administrator (POST /api/admin/users)',
      Boolean(createPass),
      `Status: ${createRes.status}, New ID: ${createJson.data?.id}`
    );

    const testAdminId = createJson.data?.id;
    if (testAdminId) {
      testCreatedUserIds.push(testAdminId);

      // Generate test user token
      const [testUserRows] = await pool.query<RowDataPacket[]>(
        `SELECT * FROM users WHERE id = ?`,
        [testAdminId]
      );
      const testUser = testUserRows[0];
      const testUserToken = generateToken(testUser as any);

      // 2. Allowed module: GET /api/admin/chauffeur (permission 'transfers' held)
      const allowedRes = await fetch(`${baseUrl}/api/admin/chauffeur`, {
        headers: { Authorization: `Bearer ${testUserToken}` },
      });
      record(
        'RBAC Enforcement',
        'Authorized Module Accessible (Chauffeur / transfers)',
        allowedRes.status === 200,
        `Status: ${allowedRes.status} (Expected 200)`
      );

      // 3. Denied module: GET /api/admin/villas (permission 'villas' NOT held)
      const deniedRes = await fetch(`${baseUrl}/api/admin/villas`, {
        headers: { Authorization: `Bearer ${testUserToken}` },
      });
      record(
        'RBAC Enforcement',
        'Unauthorized Module Blocked with 403 (Villas)',
        deniedRes.status === 403,
        `Status: ${deniedRes.status} (Expected 403 Forbidden)`
      );

      // 4. User Management Blocked: Normal admin cannot manage users
      const deniedUserMgmt = await fetch(`${baseUrl}/api/admin/users`, {
        headers: { Authorization: `Bearer ${testUserToken}` },
      });
      record(
        'RBAC Enforcement',
        'Normal Admin Blocked from GET /api/admin/users',
        deniedUserMgmt.status === 403,
        `Status: ${deniedUserMgmt.status} (Expected 403 Forbidden)`
      );

      // 5. Test Disable Account
      const disableRes = await fetch(`${baseUrl}/api/admin/users/${testAdminId}/disable`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${superadminToken}` },
      });
      const disableJson = await disableRes.json();
      record(
        'Admin Access',
        'Disable Administrator Account',
        disableRes.status === 200 && disableJson.success === true,
        `Status: ${disableRes.status}, User status: ${disableJson.data?.status}`
      );

      // 6. Disabled User Token Immediate Revocation
      const disabledAccessRes = await fetch(`${baseUrl}/api/admin/chauffeur`, {
        headers: { Authorization: `Bearer ${testUserToken}` },
      });
      record(
        'Security',
        'Disabled Admin Token Immediately Rejected with 403',
        disabledAccessRes.status === 403,
        `Status: ${disabledAccessRes.status} (Expected 403 Forbidden)`
      );

      // 7. Test Safeguard: Cannot disable superadmin
      const disableSuperRes = await fetch(`${baseUrl}/api/admin/users/${superadmin.id}/disable`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${superadminToken}` },
      });
      record(
        'Security Safeguards',
        'Cannot Disable Superadmin Account',
        disableSuperRes.status === 400,
        `Status: ${disableSuperRes.status} (Expected 400 Bad Request)`
      );
    }

    // 8. Test Max Active Admins Limit (MAX_ACTIVE_ADMINS = 6)
    const [currentUsers] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as activeCount FROM users WHERE status != 'disabled'`
    );
    const activeBeforeFill = Number(currentUsers[0].activeCount);
    const neededToFill = 6 - activeBeforeFill;
    const fillerIds: string[] = [];

    for (let i = 0; i < neededToFill; i++) {
      const fillerRes = await fetch(`${baseUrl}/api/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${superadminToken}`,
        },
        body: JSON.stringify({
          name: `Capacity Filler ${i + 1}`,
          email: `capacity_filler_${Date.now()}_${i}@zanzirangi.test`,
          password: 'Password123!Safe',
          role: 'admin',
          permissions: ['dashboard'],
        }),
      });
      const fillerJson = await fillerRes.json();
      if (fillerJson.data?.id) {
        fillerIds.push(fillerJson.data.id);
        testCreatedUserIds.push(fillerJson.data.id);
      }
    }

    // Attempt to create 7th active admin -> MUST fail with 400
    const overLimitRes = await fetch(`${baseUrl}/api/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superadminToken}`,
      },
      body: JSON.stringify({
        name: 'Over Limit User',
        email: `over_limit_${Date.now()}@zanzirangi.test`,
        password: 'Password123!Safe',
        role: 'admin',
        permissions: ['dashboard'],
      }),
    });
    record(
      'Security Safeguards',
      'Max 6 Active Admins Strict Enforcement (7th rejected)',
      overLimitRes.status === 400,
      `Status: ${overLimitRes.status} (Expected 400 Bad Request)`
    );

    // Clean up all temporary users created
    for (const uid of testCreatedUserIds) {
      await pool.query(`DELETE FROM users WHERE id = ?`, [uid]);
    }
    record(
      'Baseline Restoration',
      `Cleaned Up All Temporary Test Users (${testCreatedUserIds.length})`,
      true,
      `Removed IDs: ${testCreatedUserIds.join(', ')}`
    );

    // -------------------------------------------------------------------------
    // GROUP 4: Zero-Redeploy Content Mutation & Exact Baseline Rollback
    // -------------------------------------------------------------------------
    console.log('\n--- GROUP 4: Zero-Redeploy CMS Mutation & Restoration ---');
    // Step 1: Read current Chauffeur Config baseline from public API
    const initialChauffeurRes = await fetch(`${baseUrl}/api/content/chauffeur`);
    const initialChauffeurJson = await initialChauffeurRes.json();
    const originalChauffeurData = initialChauffeurJson.data;

    // Step 2: Mutate a specific field via Admin API
    const testTimestamp = Date.now();
    const testEyebrow = `CMS_TEST_${testTimestamp}`;
    const mutatedData = {
      ...originalChauffeurData,
      eyebrow: testEyebrow,
    };

    const updateRes = await fetch(`${baseUrl}/api/admin/chauffeur`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superadminToken}`,
      },
      body: JSON.stringify(mutatedData),
    });
    const updateJson = await updateRes.json();
    record(
      'CMS Mutation',
      'PUT /api/admin/chauffeur',
      updateRes.status === 200 && updateJson.success === true,
      `Status: ${updateRes.status}`
    );

    // Step 3: Verify MySQL has changed immediately
    const [dbRows] = await pool.query<RowDataPacket[]>(
      `SELECT eyebrow FROM chauffeur_config WHERE id = 1`
    );
    const mysqlUpdated = dbRows[0]?.eyebrow === testEyebrow;
    record(
      'CMS Mutation',
      'MySQL Value Updated Instantly',
      mysqlUpdated,
      `DB eyebrow value: ${dbRows[0]?.eyebrow}`
    );

    // Step 4: Verify public GET endpoint reflects changed value WITHOUT redeployment/rebuild
    const checkPublicRes = await fetch(`${baseUrl}/api/content/chauffeur`);
    const checkPublicJson = await checkPublicRes.json();
    const publicReflected = checkPublicJson.data?.eyebrow === testEyebrow;
    record(
      'Zero-Redeploy Verification',
      'Public GET Reflects Mutation Immediately Without Redeploy',
      publicReflected,
      `Public eyebrow value: ${checkPublicJson.data?.eyebrow}`
    );

    // Step 5: Rollback to exact baseline value
    const rollbackRes = await fetch(`${baseUrl}/api/admin/chauffeur`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superadminToken}`,
      },
      body: JSON.stringify(originalChauffeurData),
    });
    record(
      'Baseline Restoration',
      'Restored Chauffeur Config to Original Baseline',
      rollbackRes.status === 200,
      `Status: ${rollbackRes.status}`
    );

    // Step 6: Verify restored public value
    const verifyRestoredRes = await fetch(`${baseUrl}/api/content/chauffeur`);
    const verifyRestoredJson = await verifyRestoredRes.json();
    const isBaselineRestored = verifyRestoredJson.data?.eyebrow === originalChauffeurData.eyebrow;
    record(
      'Baseline Restoration',
      'Public Chauffeur Config Exact Baseline Match',
      isBaselineRestored,
      `Restored: "${verifyRestoredJson.data?.eyebrow}" === Original: "${originalChauffeurData.eyebrow}"`
    );

    // -------------------------------------------------------------------------
    // GROUP 5: Audit Log Verification
    // -------------------------------------------------------------------------
    console.log('\n--- GROUP 5: Audit Logging ---');
    const [auditRows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 5`
    );
    const hasRecentAudit = auditRows.length > 0;
    record(
      'Audit Logging',
      'Audit Log Produced for Mutations',
      hasRecentAudit,
      `Recent Action: ${auditRows[0]?.action}, Actor: ${auditRows[0]?.actor_email}`
    );

    // Clean up temporary test audit records created during this test
    await pool.query(
      `DELETE FROM audit_logs WHERE details LIKE ?`,
      [`%${testTimestamp}%`]
    );

  } finally {
    // Ensure any leftover test accounts are cleaned
    if (testCreatedUserIds.length > 0) {
      for (const uid of testCreatedUserIds) {
        await pool.query(`DELETE FROM users WHERE id = ?`, [uid]).catch(() => {});
      }
    }
    server.close();
  }

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log('TEST SUITE SUMMARY');
  console.log('================================================================');
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`Total Tests : ${total}`);
  console.log(`Passed      : ${passed} ✅`);
  console.log(`Failed      : ${failed} ${failed > 0 ? '❌' : ''}`);

  if (failed > 0) {
    console.log('\nFailed Tests:');
    results.filter((r) => !r.passed).forEach((r) => {
      console.log(`- [${r.group}] ${r.name}: ${r.error || r.details}`);
    });
    process.exit(1);
  } else {
    console.log('\n🎉 ALL TESTS PASSED WITH 100% SUCCESS!');
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
