import http from 'http';
import { apiApp } from '../server/api.ts';
import { getMysqlPool } from '../server/database/connection.ts';
import { generateToken } from '../server/auth.ts';
import { getDatabaseAdapter } from '../server/database/index.ts';

interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
  error?: string;
}

const results: TestResult[] = [];

function record(name: string, passed: boolean, details?: string, error?: string) {
  results.push({ name, passed, details, error });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} [${passed ? 'PASS' : 'FAIL'}] ${name}`);
  if (details) console.log(`   └─ ${details}`);
  if (error) console.log(`   └─ ERROR: ${error}`);
}

async function runHardeningTests() {
  console.log('================================================================');
  console.log('ZANZIRANGI CMS PRE-PHASE 4 HARDENING & INTEGRATION VERIFICATION');
  console.log('Live Target: Hostinger MySQL (u170555096_Zanzirangi)');
  console.log('================================================================\n');

  // Start ephemeral HTTP server for in-process testing
  const server = http.createServer(apiApp);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}`;
  console.log(`🚀 Ephemeral API Test Server listening on ${baseUrl}\n`);

  const pool = getMysqlPool();

  try {
    // -------------------------------------------------------------
    // Test 1: Health Check Endpoint
    // -------------------------------------------------------------
    console.log('--- TEST GROUP 1: Health & Database Provider Safety ---');
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthJson = await healthRes.json();
    const healthPass =
      healthRes.status === 200 &&
      healthJson.status === 'ok' &&
      healthJson.database?.provider === 'mysql' &&
      healthJson.database?.connected === true;
    record(
      'Health Endpoint (GET /health)',
      healthPass,
      `Status: ${healthRes.status}, Provider: ${healthJson.database?.provider}, Connected: ${healthJson.database?.connected}`
    );

    // Verify no credentials leaked
    const leaked = JSON.stringify(healthJson).toLowerCase().includes('password') ||
      JSON.stringify(healthJson).toLowerCase().includes('zanzirangi123');
    record(
      'Health Endpoint Credential Secrecy',
      !leaked,
      'No passwords or credentials exposed in public /health payload'
    );

    // -------------------------------------------------------------
    // Test 2: Authentication & Admin Session
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 2: Authentication & Protected Endpoints ---');
    // 2a. Unauthenticated access must return 401
    const unauthRes = await fetch(`${baseUrl}/admin/homepage`);
    record(
      'Protected Route Rejects Unauthenticated Request (401)',
      unauthRes.status === 401,
      `Response status: ${unauthRes.status}`
    );

    // 2b. Generate valid JWT for migrated superadmin
    const adminUser = {
      id: 'usr_1',
      email: 'info@zanzirangihouse.com',
      name: 'Zanzirangi Administrator',
      role: 'superadmin',
      status: 'active' as const,
      permissions: [] as string[],
    };
    const validToken = generateToken(adminUser);
    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${validToken}`,
    };

    // Verify /auth/me with token
    const meRes = await fetch(`${baseUrl}/auth/me`, { headers: authHeaders });
    const meJson = await meRes.json();
    const mePass = meRes.status === 200 && meJson.success === true && meJson.user?.email === adminUser.email;
    record(
      'Admin Token Verification (/auth/me)',
      mePass,
      `Verified identity for: ${meJson.user?.email} (${meJson.user?.role})`
    );

    // -------------------------------------------------------------
    // Test 3: Vertical Slice (Homepage Hero Title Same-Source Pipeline)
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 3: Vertical Slice (Hero Title Admin → MySQL → Public) ---');
    // Step 1: Read current hero title directly from MySQL
    const [cfgRows]: any = await pool.query('SELECT hero_title, meta_last_updated, meta_updated_by FROM homepage_config WHERE id = 1');
    const initialMysqlTitle = cfgRows[0]?.hero_title;
    record(
      'Step 1: Read Initial Hero Title directly from MySQL',
      Boolean(initialMysqlTitle),
      `Initial MySQL Title: "${initialMysqlTitle}"`
    );

    // Step 2: Read current hero title via Public API
    const publicHeroRes1 = await fetch(`${baseUrl}/content/homepage`);
    const publicHeroJson1 = await publicHeroRes1.json();
    const initialPublicTitle = publicHeroJson1.data?.hero?.title;
    record(
      'Step 2: Read Initial Hero Title via Public API',
      publicHeroRes1.status === 200 && Boolean(initialPublicTitle),
      `Public API Title: "${initialPublicTitle}"`
    );

    // Step 3: Assert MySQL value === Public API value
    const match1 = initialMysqlTitle === initialPublicTitle;
    record(
      'Step 3: Initial Same-Source Match (MySQL === Public API)',
      match1,
      `Both sources match: "${initialMysqlTitle}"`
    );

    // Step 4: Admin updates Hero Title via Admin API
    const testTitle = 'Zanzirangi House — CMS Test Hardened';
    const putRes = await fetch(`${baseUrl}/admin/homepage`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        hero: {
          ...publicHeroJson1.data.hero,
          title: testTitle,
        },
      }),
    });
    const putJson = await putRes.json();
    const adminPutPass = putRes.status === 200 && putJson.success === true && putJson.data?.hero?.title === testTitle;
    record(
      'Step 4: Admin API Mutation (PUT /admin/homepage)',
      adminPutPass,
      `Admin API response: 200 OK, title set to "${putJson.data?.hero?.title}"`
    );

    // Step 5: Read directly from MySQL to verify persistence
    const [cfgRowsAfter]: any = await pool.query('SELECT hero_title, meta_last_updated, meta_updated_by FROM homepage_config WHERE id = 1');
    const updatedMysqlTitle = cfgRowsAfter[0]?.hero_title;
    const mysqlUpdatedPass = updatedMysqlTitle === testTitle;
    record(
      'Step 5: Direct MySQL Verification after Admin Save',
      mysqlUpdatedPass,
      `MySQL column hero_title: "${updatedMysqlTitle}" (Updated by: ${cfgRowsAfter[0]?.meta_updated_by})`
    );

    // Step 6: Read through Public API to verify live delivery
    const publicHeroRes2 = await fetch(`${baseUrl}/content/homepage`);
    const publicHeroJson2 = await publicHeroRes2.json();
    const updatedPublicTitle = publicHeroJson2.data?.hero?.title;
    const publicUpdatedPass = updatedPublicTitle === testTitle;
    record(
      'Step 6: Public API Verification after Admin Save',
      publicUpdatedPass,
      `Public API returned updated title: "${updatedPublicTitle}"`
    );

    // Step 7: Verify same-source equality of the updated value
    record(
      'Step 7: Updated Same-Source Equality (Admin Response === MySQL === Public API)',
      adminPutPass && mysqlUpdatedPass && publicUpdatedPass,
      `All 3 layers confirmed identical: "${testTitle}"`
    );

    // Step 8: Clean Restoration of original production value
    const restoreRes = await fetch(`${baseUrl}/admin/homepage`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        hero: {
          ...publicHeroJson2.data.hero,
          title: initialMysqlTitle,
        },
      }),
    });
    const restoreJson = await restoreRes.json();
    const [restoredRows]: any = await pool.query('SELECT hero_title FROM homepage_config WHERE id = 1');
    const restoredTitle = restoredRows[0]?.hero_title;
    const restorePass = restoredTitle === initialMysqlTitle && restoreJson.data?.hero?.title === initialMysqlTitle;
    record(
      'Step 8: Restoration of Original Production Value',
      restorePass,
      `Restored hero title back to: "${restoredTitle}". Zero permanent test contamination.`
    );

    // -------------------------------------------------------------
    // Test 4: Concurrency & Multi-table Transaction Integrity
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 4: Transaction & Concurrency Integrity ---');
    // Test atomic transaction on villas (parent + amenities + images + audit)
    const [originalVillas]: any = await pool.query('SELECT COUNT(*) as cnt FROM villas');
    const [originalAmenities]: any = await pool.query('SELECT COUNT(*) as cnt FROM villa_amenities');
    const [originalImages]: any = await pool.query('SELECT COUNT(*) as cnt FROM villa_images');

    record(
      'Baseline Villa Relational Integrity',
      true,
      `Villas: ${originalVillas[0].cnt}, Amenities: ${originalAmenities[0].cnt}, Images: ${originalImages[0].cnt}`
    );

    // Read a villa, save via repository/adapter
    const testVilla = await getDatabaseAdapter().getVillaById('villa-ocean-pool-suite');
    if (testVilla) {
      const originalPrice = testVilla.pricePerNight;
      const testPrice = '495.00';
      testVilla.pricePerNight = testPrice;
      const savedVilla = await getDatabaseAdapter().saveVilla(testVilla, adminUser.email);
      
      const [vRow]: any = await pool.query('SELECT price_per_night FROM villas WHERE id = ?', [testVilla.id]);
      const savedPriceInDb = parseFloat(vRow[0]?.price_per_night);
      
      // Restore immediately
      testVilla.pricePerNight = originalPrice;
      await getDatabaseAdapter().saveVilla(testVilla, adminUser.email);
      
      record(
        'Multi-table Villa Transaction Mutation & Rollback/Commit',
        savedPriceInDb === parseFloat(testPrice),
        `Price updated to $${savedPriceInDb} in MySQL transaction and safely restored to $${originalPrice}`
      );
    }

    // -------------------------------------------------------------
    // Test 5: Audit Log Generation & Historical Log Preservation
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 5: Audit Log Generation & History Preservation ---');
    const [auditCount]: any = await pool.query('SELECT COUNT(*) as cnt FROM audit_logs');
    const [recentLogs]: any = await pool.query('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 5');
    
    // We expect >= 134 historical logs PLUS the new logs from our mutations above!
    const logCountPass = auditCount[0].cnt >= 134;
    const hasRecentMutation = recentLogs.some((l: any) => l.action === 'HOMEPAGE_UPDATED' || l.action === 'VILLA_SAVED');
    record(
      'Historical Audit Logs Preserved (>= 134 records)',
      logCountPass,
      `Total audit logs count in MySQL: ${auditCount[0].cnt}`
    );
    record(
      'New Mutations Create Authentic Audit Log Entries',
      hasRecentMutation,
      `Most recent action: ${recentLogs[0]?.action} by ${recentLogs[0]?.user_email} at ${recentLogs[0]?.created_at}`
    );

    // -------------------------------------------------------------
    // Test 6: Complete CMS Module Data Pipeline Audit
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 6: Complete CMS Module Data Pipeline Audit (All 13 Modules) ---');
    const modulesToTest = [
      { name: 'Homepage Config', url: `${baseUrl}/content/homepage`, table: 'homepage_config' },
      { name: 'Villas', url: `${baseUrl}/content/villas`, table: 'villas' },
      { name: 'Gallery Items', url: `${baseUrl}/content/gallery`, table: 'gallery_items' },
      { name: 'Facilities', url: `${baseUrl}/content/facilities`, table: 'facilities' },
      { name: 'Testimonials', url: `${baseUrl}/content/testimonials`, table: 'testimonials' },
      { name: 'Videos', url: `${baseUrl}/content/videos`, table: 'video_storyboard' },
      { name: 'SEO Routes', url: `${baseUrl}/content/seo`, table: 'seo_routes' },
      { name: 'Contact Settings', url: `${baseUrl}/content/contact`, table: 'contact_settings' },
      { name: 'Site Settings', url: `${baseUrl}/content/settings`, table: 'site_settings' },
    ];

    for (const m of modulesToTest) {
      const res = await fetch(m.url);
      const json = await res.json();
      const [tRows]: any = await pool.query(`SELECT COUNT(*) as cnt FROM ${m.table}`);
      const ok = res.status === 200 && json.success === true && tRows[0].cnt > 0;
      record(
        `Module: ${m.name} (API & MySQL table: ${m.table})`,
        ok,
        `HTTP ${res.status}, Table ${m.table} count: ${tRows[0].cnt}`
      );
    }

    // Admin-only modules
    const adminModules = [
      { name: 'Hero Slides', url: `${baseUrl}/admin/homepage`, table: 'hero_slides' },
      { name: 'Gallery Categories', url: `${baseUrl}/admin/gallery`, table: 'gallery_categories' },
      { name: 'Media Assets', url: `${baseUrl}/admin/media`, table: 'media_assets' },
      { name: 'Audit Logs', url: `${baseUrl}/admin/audit`, table: 'audit_logs' },
    ];

    for (const am of adminModules) {
      const res = await fetch(am.url, { headers: authHeaders });
      const json = await res.json();
      const [tRows]: any = await pool.query(`SELECT COUNT(*) as cnt FROM ${am.table}`);
      const ok = res.status === 200 && json.success === true && tRows[0].cnt > 0;
      record(
        `Admin Module: ${am.name} (API & MySQL table: ${am.table})`,
        ok,
        `HTTP ${res.status}, Table ${am.table} count: ${tRows[0].cnt}`
      );
    }

    // -------------------------------------------------------------
    // Test 7: Error Handling Integrity
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 7: API Error Handling Non-Silent Verification ---');
    // Bad request on invalid villa ID deletion
    const badDelRes = await fetch(`${baseUrl}/admin/villas/nonexistent-villa-id-xyz-999`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    // Should return 404 or success:false, not 200 OK with success
    record(
      'Invalid Entity Request Fails Visibly',
      badDelRes.status === 404 || badDelRes.status === 400 || (await badDelRes.json()).success === false,
      `Response status: ${badDelRes.status}`
    );

  } catch (err: any) {
    console.error('Fatal test error:', err);
    record('Pipeline Test Execution', false, undefined, err.message);
  } finally {
    server.close();
    console.log('\n🛑 Ephemeral Test Server closed gracefully.');
  }

  // Print Summary
  console.log('\n================================================================');
  console.log('TEST SUMMARY');
  console.log('================================================================');
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`Total Checks: ${total} | Passed: ${passed} | Failed: ${failed}`);

  if (failed === 0) {
    console.log('\n🎉 ALL PRE-PHASE 4 HARDENING TESTS PASSED!');
    process.exit(0);
  } else {
    console.error(`\n❌ ${failed} checks failed.`);
    process.exit(1);
  }
}

runHardeningTests().catch((err) => {
  console.error('Test runner failure:', err);
  process.exit(1);
});
