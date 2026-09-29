import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// Load exact environment files
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });

function maskString(str?: string): string {
  if (!str) return 'N/A';
  if (str.length <= 4) return '***';
  return str.slice(0, 3) + '***' + str.slice(-3);
}

async function runForensicVerification() {
  console.log('====================================================');
  console.log('ZANZIRANGI HOUSE: FORENSIC DATABASE VERIFICATION');
  console.log('====================================================\n');

  const host = process.env.DB_HOST || process.env.MYSQL_HOST || 'localhost';
  const port = Number(process.env.DB_PORT || process.env.MYSQL_PORT || 3306);
  const user = process.env.DB_USER || process.env.MYSQL_USER || '';
  const password = process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || '';
  const database = process.env.DB_NAME || process.env.MYSQL_DATABASE || '';
  const provider = process.env.DATABASE_PROVIDER || 'mysql';

  console.log('1. ENVIRONMENT CONFIGURATION:');
  console.log(`- Configured Provider : ${provider}`);
  console.log(`- Configured Host     : ${host}`);
  console.log(`- Configured Port     : ${port}`);
  console.log(`- Configured User     : ${maskString(user)}`);
  console.log(`- Configured Database : ${maskString(database)}`);
  console.log(`- Host Type           : ${host === 'localhost' || host === '127.0.0.1' ? 'LOCAL' : 'REMOTE'}`);
  console.log('----------------------------------------------------\n');

  let conn: mysql.Connection | null = null;
  try {
    console.log('2. OPENING DIRECT DATABASE SOCKET CONNECTION...');
    const startTime = Date.now();
    conn = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
      connectTimeout: 10000,
    });
    const connectDurationMs = Date.now() - startTime;
    console.log(`✓ Direct connection established in ${connectDurationMs}ms\n`);

    console.log('3. EXECUTING FORENSIC SQL PROBES:');

    // Probe 1: SELECT 1
    const [probe1]: any = await conn.query('SELECT 1 as ping');
    const pingPassed = probe1 && probe1[0]?.ping === 1;
    console.log(`- [Probe 1] SELECT 1: ${pingPassed ? 'PASS' : 'FAIL'}`);

    // Probe 2: SELECT DATABASE()
    const [probe2]: any = await conn.query('SELECT DATABASE() as db');
    const currentDb = probe2[0]?.db;
    console.log(`- [Probe 2] SELECT DATABASE(): ${maskString(currentDb)}`);

    // Probe 3: SELECT @@hostname
    const [probe3]: any = await conn.query('SELECT @@hostname as server_host');
    const serverHostname = probe3[0]?.server_host;
    console.log(`- [Probe 3] SELECT @@hostname: ${serverHostname}`);

    // Probe 4: SELECT @@port
    const [probe4]: any = await conn.query('SELECT @@port as server_port');
    const serverPort = probe4[0]?.server_port;
    console.log(`- [Probe 4] SELECT @@port: ${serverPort}`);

    // Probe 5: SELECT VERSION()
    const [probe5]: any = await conn.query('SELECT VERSION() as server_version');
    const serverVersion = probe5[0]?.server_version;
    console.log(`- [Probe 5] SELECT VERSION(): ${serverVersion}`);

    // Probe 6: Query actual villas table
    const [villaRows]: any = await conn.query(
      'SELECT id, name, price_per_night, size_sqm, status, sort_order FROM villas ORDER BY sort_order ASC'
    );
    const villaCount = villaRows.length;
    console.log(`- [Probe 6] SELECT * FROM villas: PASS (${villaCount} rows retrieved)`);
    if (villaCount > 0) {
      console.log('  First Villa Row in Remote DB:');
      console.log(`  - ID: ${villaRows[0].id}`);
      console.log(`  - Name: ${villaRows[0].name}`);
      console.log(`  - Price: ${villaRows[0].price_per_night}`);
      console.log(`  - SizeSqm: ${villaRows[0].size_sqm}`);
      console.log(`  - Status: ${villaRows[0].status}`);
    }

    // Probe 7: Non-destructive Write & Read Test
    console.log('\n4. EXECUTING NON-DESTRUCTIVE WRITE ROUND-TRIP TEST:');
    const testLogId = `forensic_test_${Date.now()}`;
    await conn.query(
      'INSERT INTO audit_logs (action, user_email, details) VALUES (?, ?, ?)',
      ['FORENSIC_DB_CHECK', 'system_audit@zanzirangihouse.com', testLogId]
    );
    console.log(`✓ Inserted audit record with key: ${testLogId}`);

    const [readLog]: any = await conn.query(
      'SELECT id, action, user_email, details, created_at FROM audit_logs WHERE details = ?',
      [testLogId]
    );
    const writeVerified = readLog && readLog.length > 0 && readLog[0].details === testLogId;
    console.log(`✓ Read back audit record from Remote MySQL: ${writeVerified ? 'PASS' : 'FAIL'}`);

    if (writeVerified) {
      const insertedId = readLog[0].id;
      await conn.query('DELETE FROM audit_logs WHERE id = ?', [insertedId]);
      console.log(`✓ Cleaned up test audit record (ID: ${insertedId})`);
    }

    console.log('\n====================================================');
    console.log('FORENSIC SUMMARY RESULTS:');
    console.log('====================================================');
    console.log(`connection      = PASS`);
    console.log(`database        = ${maskString(currentDb)}`);
    console.log(`server hostname = ${serverHostname}`);
    console.log(`server port     = ${serverPort}`);
    console.log(`mysql version   = ${serverVersion}`);
    console.log(`villa query     = PASS (${villaCount} villas found)`);
    console.log(`write test      = ${writeVerified ? 'PASS (Round-trip verified & cleaned up)' : 'FAIL'}`);
    console.log('====================================================\n');

  } catch (err: any) {
    console.error('\n❌ FORENSIC VERIFICATION FAILED:', err.message);
    console.log('connection = FAIL');
  } finally {
    if (conn) {
      await conn.end();
    }
  }
}

runForensicVerification();
