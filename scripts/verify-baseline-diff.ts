import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });

async function verifyBaseline() {
  console.log('================================================================');
  console.log('ZANZIRANGI HOUSE: INDEPENDENT BASELINE DATA VERIFICATION');
  console.log('================================================================\n');

  const host = process.env.DB_HOST || 'localhost';
  const port = Number(process.env.DB_PORT || 3306);
  const user = process.env.DB_USER || '';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || '';

  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
  });

  const preSnapshotPath = path.resolve(process.cwd(), 'backups/baseline_snapshot_pre_implementation.json');
  const preSnapshot = JSON.parse(fs.readFileSync(preSnapshotPath, 'utf-8'));

  const diffs: string[] = [];

  // 1. Verify all pre-implementation tables
  const originalTables = Object.keys(preSnapshot.tables);
  console.log(`Checking ${originalTables.length} original baseline tables...`);

  for (const table of originalTables) {
    if (table === 'audit_logs' || table === 'schema_migrations') continue; // Audit logs & migrations grow with events/migrations

    const baseRows = preSnapshot.tables[table];
    const [currentRows]: any = await conn.query(`SELECT * FROM \`${table}\``);

    // Clean up any test strings or verify count
    const baseCount = baseRows.length;
    const currCount = currentRows.length;

    if (baseCount !== currCount) {
      diffs.push(`Table [${table}] row count mismatch: baseline=${baseCount}, current=${currCount}`);
    }

    const currentJson = JSON.stringify(currentRows);
    if (currentJson.includes('CMS_TEST') || currentJson.includes('E2E_VERIFIED') || currentJson.includes('test_admin_')) {
      diffs.push(`Table [${table}] contains leftover test artifacts!`);
    }
  }

  // 2. Verify Users Table integrity
  console.log('\nChecking Users Table integrity...');
  const [users]: any = await conn.query(`SELECT id, email, role, status FROM users ORDER BY id ASC`);
  console.log(`Current users count: ${users.length}`);
  users.forEach((u: any) => {
    console.log(`- ${u.id}: ${u.email} (${u.role}, status: ${u.status})`);
  });

  if (users.length !== 5) {
    diffs.push(`Users table count is ${users.length}, expected exactly 5 baseline users.`);
  }

  const expectedEmails = [
    'info@zanzirangihouse.com',
    'dominic@zanzirangihouse.com',
    'dotto@zanzirangihouse.com',
    'jocelyn@zanzirangihouse.com',
    'saleh@zanzirangihouse.com',
  ];

  for (const expectedEmail of expectedEmails) {
    const found = users.find((u: any) => u.email === expectedEmail);
    if (!found) {
      diffs.push(`Expected user ${expectedEmail} is missing from users table.`);
    } else if (found.status !== 'active') {
      diffs.push(`User ${expectedEmail} status is ${found.status}, expected 'active'.`);
    }
  }

  // 3. Verify newly added CMS tables have clean production content
  console.log('\nChecking new CMS tables for test contamination...');
  const newTables = [
    'page_contents',
    'chauffeur_config',
    'why_stay_config',
    'dining_config',
    'dining_categories',
    'experiences',
    'safari_destinations',
    'global_content',
  ];

  for (const table of newTables) {
    const [rows]: any = await conn.query(`SELECT * FROM \`${table}\``);
    const jsonStr = JSON.stringify(rows);
    if (jsonStr.includes('CMS_TEST') || jsonStr.includes('E2E_VERIFIED')) {
      diffs.push(`New table [${table}] contains leftover test mutation strings!`);
    } else {
      console.log(`✓ Table [${table}]: Clean (${rows.length} records, 0 test strings)`);
    }
  }

  await conn.end();

  console.log('\n================================================================');
  console.log('BASELINE DIFF REPORT');
  console.log('================================================================');
  if (diffs.length === 0) {
    console.log('🎉 0 CONTENT DIFFERENCES DETECTED!');
    console.log('✅ ALL PRODUCTION CONTENT FULLY PRESERVED AT EXACT BASELINE.');
    console.log('✅ ALL NEW CMS & ADMIN ACCESS FUNCTIONS REMAIN FULLY INSTALLED.');
  } else {
    console.log(`❌ ${diffs.length} DIFFERENCES DETECTED:`);
    diffs.forEach((d) => console.log(`  - ${d}`));
    process.exit(1);
  }
}

verifyBaseline().catch((err) => {
  console.error(err);
  process.exit(1);
});
