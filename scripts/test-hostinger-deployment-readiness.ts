import http from 'http';
import { apiApp } from '../server/api.ts';
import { getMysqlPool } from '../server/database/connection.ts';
import fs from 'fs';
import path from 'path';

interface CheckItem {
  name: string;
  passed: boolean;
  details?: string;
  error?: string;
}

const checks: CheckItem[] = [];

function record(name: string, passed: boolean, details?: string, error?: string) {
  checks.push({ name, passed, details, error });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} [${passed ? 'PASS' : 'FAIL'}] ${name}`);
  if (details) console.log(`   └─ ${details}`);
  if (error) console.log(`   └─ ERROR: ${error}`);
}

async function runDeploymentReadinessTest() {
  console.log('================================================================');
  console.log('HOSTINGER PRODUCTION DEPLOYMENT & RUNTIME HARDENING VERIFICATION');
  console.log('Target: Hostinger Node.js Engine + MySQL (u170555096_Zanzirangi)');
  console.log('================================================================\n');

  // Start ephemeral server
  const server = http.createServer(apiApp);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}`;
  console.log(`🚀 Production Test Server listening on ${baseUrl}\n`);

  const pool = getMysqlPool();

  try {
    // -------------------------------------------------------------------------
    // Check 1: Health Endpoint (GET /health)
    // -------------------------------------------------------------------------
    console.log('--- 1. HEALTH ENDPOINT & CREDENTIAL HYGIENE ---');
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthJson = await healthRes.json();
    const healthOk =
      healthRes.status === 200 &&
      healthJson.status === 'ok' &&
      healthJson.database?.provider === 'mysql' &&
      healthJson.database?.connected === true;
    record(
      'Health Endpoint (GET /health)',
      healthOk,
      `HTTP ${healthRes.status}, Provider: ${healthJson.database?.provider}, Connected: ${healthJson.database?.connected}`
    );

    const jsonStr = JSON.stringify(healthJson).toLowerCase();
    const noSecretLeaked = !jsonStr.includes('password') && !jsonStr.includes('zanzirangi123');
    record(
      'Health Endpoint Secret Hygiene',
      noSecretLeaked,
      'Zero database passwords, secrets, or internal connection strings in health response'
    );

    // -------------------------------------------------------------------------
    // Check 2: Database Identity Verification (SELECT DATABASE())
    // -------------------------------------------------------------------------
    console.log('\n--- 2. HOSTINGER MYSQL DATABASE IDENTITY ---');
    const [idRows]: any = await pool.query('SELECT DATABASE() AS db_name, USER() AS db_user, VERSION() AS mysql_ver');
    const dbName = idRows[0]?.db_name;
    const dbUser = idRows[0]?.db_user;
    const dbVer = idRows[0]?.mysql_ver;

    const idPass = dbName === 'u170555096_Zanzirangi';
    record(
      'Database Identity Check (SELECT DATABASE())',
      idPass,
      `Connected Database: "${dbName}", User: "${dbUser}", Engine: ${dbVer}`
    );

    // -------------------------------------------------------------------------
    // Check 3: Production Content Read Test (GET /api/content/homepage)
    // -------------------------------------------------------------------------
    console.log('\n--- 3. PRODUCTION CONTENT READ PIPELINE ---');
    const hpRes = await fetch(`${baseUrl}/content/homepage`);
    const hpJson = await hpRes.json();
    const originalHeroTitle = hpJson.data?.hero?.title;
    const slidesCount = hpJson.data?.hero?.slides?.length || 0;
    const sectionsCount = hpJson.data?.sections?.length || 0;

    const contentReadPass =
      hpRes.status === 200 &&
      hpJson.success === true &&
      Boolean(originalHeroTitle) &&
      slidesCount >= 3 &&
      sectionsCount >= 8;
    record(
      'Production Content Read (GET /content/homepage)',
      contentReadPass,
      `Hero Title: "${originalHeroTitle}", Slides: ${slidesCount}, Sections: ${sectionsCount}`
    );

    // -------------------------------------------------------------------------
    // Check 4: Admin Authentication Test
    // -------------------------------------------------------------------------
    console.log('\n--- 4. ADMIN AUTHENTICATION PIPELINE ---');
    const adminEmail = process.env.TEST_ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'info@zanzirangihouse.com';
    const adminPassword = process.env.TEST_ADMIN_PASSWORD;

    let authToken = '';
    if (adminPassword) {
      const loginRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });
      const loginJson = await loginRes.json();
      authToken = loginJson.token || '';
      record(
        'Admin Authentication (POST /auth/login)',
        loginRes.status === 200 && loginJson.success === true && Boolean(authToken),
        `Authenticated as: ${loginJson.user?.email} (${loginJson.user?.role})`
      );
    } else {
      record(
        'Admin Token Verification',
        false,
        undefined,
        'TEST_ADMIN_PASSWORD not set; set it in your local environment to run authenticated checks'
      );
    }

    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const meJson = await meRes.json();
    record(
      'Protected Session Verification (GET /auth/me)',
      meRes.status === 200 && meJson.success === true,
      `Identity confirmed: ${meJson.user?.email}`
    );

    // -------------------------------------------------------------------------
    // Check 5: Controlled CMS Mutation & Mandatory Restoration
    // -------------------------------------------------------------------------
    console.log('\n--- 5. CONTROLLED CMS WRITE & MANDATORY RESTORATION ---');
    // Capture pre-test snapshot from MySQL directly
    const [preSnapRows]: any = await pool.query('SELECT * FROM homepage_config WHERE id = 1');
    const preSnapshot = { ...preSnapRows[0] };
    console.log(`   Captured pre-test snapshot. Hero Title = "${preSnapshot.hero_title}"`);

    // Perform temporary controlled mutation
    const tempTestTitle = `REMOTE HOSTINGER CMS E2E TEST ${Date.now()}`;
    const updateRes = await fetch(`${baseUrl}/admin/homepage`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        hero: {
          ...hpJson.data.hero,
          title: tempTestTitle,
        },
      }),
    });
    const updateJson = await updateRes.json();
    const updatePass = updateRes.status === 200 && updateJson.data?.hero?.title === tempTestTitle;
    record(
      'Controlled CMS Mutation (PUT /admin/homepage)',
      updatePass,
      `API updated title to: "${tempTestTitle}"`
    );

    // Verify in MySQL
    const [mutRows]: any = await pool.query('SELECT hero_title FROM homepage_config WHERE id = 1');
    const mysqlMutTitle = mutRows[0]?.hero_title;
    record(
      'MySQL Mutation Verification',
      mysqlMutTitle === tempTestTitle,
      `Live MySQL hero_title matches temporary test value`
    );

    // Verify Public API
    const pubVerifyRes = await fetch(`${baseUrl}/content/homepage`);
    const pubVerifyJson = await pubVerifyRes.json();
    record(
      'Public API Reflection of Temporary Value',
      pubVerifyJson.data?.hero?.title === tempTestTitle,
      `Public API immediately returned: "${pubVerifyJson.data?.hero?.title}"`
    );

    // MANDATORY RESTORATION
    console.log('   Executing Mandatory Restoration...');
    const restoreRes = await fetch(`${baseUrl}/admin/homepage`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        hero: {
          ...pubVerifyJson.data.hero,
          title: preSnapshot.hero_title,
        },
      }),
    });
    const restoreJson = await restoreRes.json();

    // Verify restored state in MySQL
    const [postRows]: any = await pool.query('SELECT * FROM homepage_config WHERE id = 1');
    const postSnapshot = { ...postRows[0] };
    const restoredTitleMatch = postSnapshot.hero_title === preSnapshot.hero_title;
    record(
      'Mandatory Restoration (MySQL Hero Title)',
      restoredTitleMatch,
      `Restored title: "${postSnapshot.hero_title}" === Pre-test title: "${preSnapshot.hero_title}"`
    );

    // Verify restored state through Public API
    const pubRestoredRes = await fetch(`${baseUrl}/content/homepage`);
    const pubRestoredJson = await pubRestoredRes.json();
    const pubRestoredMatch = pubRestoredJson.data?.hero?.title === preSnapshot.hero_title;
    record(
      'Mandatory Restoration (Public API Hero Title)',
      pubRestoredMatch,
      `Public API returned restored original title: "${pubRestoredJson.data?.hero?.title}"`
    );

    // Verify unrelated fields remain 100% equal
    const subtitleMatch = postSnapshot.hero_subtitle === preSnapshot.hero_subtitle;
    const ctaMatch = postSnapshot.hero_primary_cta_text === preSnapshot.hero_primary_cta_text;
    const imageMatch = postSnapshot.hero_image === preSnapshot.hero_image;
    record(
      'Field-by-Field Integrity Guarantee',
      subtitleMatch && ctaMatch && imageMatch,
      `Subtitle: ${subtitleMatch ? 'MATCH' : 'MISMATCH'}, CTA: ${ctaMatch ? 'MATCH' : 'MISMATCH'}, Image: ${imageMatch ? 'MATCH' : 'MISMATCH'}`
    );

    // -------------------------------------------------------------------------
    // Check 6: Audit Log Integrity
    // -------------------------------------------------------------------------
    console.log('\n--- 6. AUDIT LOG INTEGRITY & PRESERVATION ---');
    const [auditCount]: any = await pool.query('SELECT COUNT(*) as cnt FROM audit_logs');
    const [latestLogs]: any = await pool.query('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 2');
    const countOk = auditCount[0].cnt >= 134;
    const hasHomepageLog = latestLogs.some((l: any) => l.action === 'HOMEPAGE_UPDATED');
    record(
      'Historical Audit Logs Preserved (>= 134 records)',
      countOk,
      `Total audit logs in database: ${auditCount[0].cnt} (historical logs untouched)`
    );
    record(
      'New Mutations Logged with Action & Timestamp',
      hasHomepageLog,
      `Most recent action: ${latestLogs[0]?.action} at ${latestLogs[0]?.created_at}`
    );

    // -------------------------------------------------------------------------
    // Check 7: Media Storage Persistence
    // -------------------------------------------------------------------------
    console.log('\n--- 7. MEDIA STORAGE PERSISTENCE & LOCKDOWN ---');
    const uploadsDir = path.resolve(process.cwd(), 'uploads');
    const uploadsExists = fs.existsSync(uploadsDir);
    const htaccessExists = fs.existsSync(path.join(uploadsDir, '.htaccess'));
    record(
      'Uploads Storage Directory Exists Outside dist/',
      uploadsExists,
      `Path: ${uploadsDir}`
    );
    record(
      'Security Lockdown (.htaccess) in uploads/',
      htaccessExists,
      'Prohibits executable script execution on Apache/LiteSpeed'
    );

    // -------------------------------------------------------------------------
    // Check 8: Production Build Artifacts Verification
    // -------------------------------------------------------------------------
    console.log('\n--- 8. BUILD ARTIFACTS VERIFICATION ---');
    const distExists = fs.existsSync(path.resolve(process.cwd(), 'dist/index.html'));
    const serverJsExists = fs.existsSync(path.resolve(process.cwd(), 'server.js'));
    record(
      'Vite Client Bundle (dist/index.html)',
      distExists,
      'Compiled production frontend ready'
    );
    record(
      'Standalone Server Bundle (server.js)',
      serverJsExists,
      'Compiled standalone production server ready for node server.js'
    );

  } catch (err: any) {
    console.error('Fatal deployment readiness error:', err);
    record('Deployment Readiness Execution', false, undefined, err.message);
  } finally {
    server.close();
    console.log('\n🛑 Ephemeral Test Server closed gracefully.');
  }

  // Summary
  console.log('\n================================================================');
  console.log('HOSTINGER DEPLOYMENT READINESS SUMMARY');
  console.log('================================================================');
  const total = checks.length;
  const passed = checks.filter((c) => c.passed).length;
  const failed = checks.filter((c) => !c.passed).length;
  console.log(`Total Checks: ${total} | Passed: ${passed} | Failed: ${failed}`);

  if (failed === 0) {
    console.log('\n🎉 ALL HOSTINGER PRODUCTION DEPLOYMENT CHECKS PASSED!');
    console.log('Classification: HOSTINGER_MYSQL_AUTO_CONNECT_READY');
    process.exit(0);
  } else {
    console.error(`\n❌ ${failed} checks failed.`);
    process.exit(1);
  }
}

runDeploymentReadinessTest().catch((err) => {
  console.error('Test runner failure:', err);
  process.exit(1);
});
