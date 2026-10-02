import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });

export async function restoreBaseline(options: { verbose?: boolean } = {}) {
  const verbose = options.verbose ?? true;
  if (verbose) {
    console.log('================================================================');
    console.log('ZANZIRANGI HOUSE: DETERMINISTIC BASELINE CONTENT RESTORATION');
    console.log('================================================================');
  }

  const snapshotPath = path.resolve(process.cwd(), 'backups/baseline_snapshot_post_migration.json');
  if (!fs.existsSync(snapshotPath)) {
    throw new Error(`Baseline snapshot not found at: ${snapshotPath}`);
  }

  const rawJson = fs.readFileSync(snapshotPath, 'utf-8');
  const snapshot = JSON.parse(rawJson);

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

  await conn.query('SET FOREIGN_KEY_CHECKS = 0');

  // Tables to restore
  const tables = Object.keys(snapshot.tables);

  for (const table of tables) {
    // If it's audit_logs, we remove test mutations (any action or details with CMS_TEST or forensic_test)
    if (table === 'audit_logs') {
      await conn.query(`DELETE FROM audit_logs WHERE action LIKE '%CMS_TEST%' OR details LIKE '%CMS_TEST%' OR action LIKE '%forensic_test%'`);
      continue;
    }

    const rows = snapshot.tables[table];
    await conn.query(`TRUNCATE TABLE \`${table}\``);

    if (rows && rows.length > 0) {
      const keys = Object.keys(rows[0]);
      const columnsEscaped = keys.map((k) => `\`${k}\``).join(', ');
      const placeholders = keys.map(() => '?').join(', ');
      const insertSql = `INSERT INTO \`${table}\` (${columnsEscaped}) VALUES (${placeholders})`;

      for (const row of rows) {
        const values = keys.map((k) => {
          let val = row[k];
          if (val !== null && typeof val === 'object') {
            if (val instanceof Date) {
              return val;
            }
            return JSON.stringify(val);
          }
          return val;
        });
        await conn.query(insertSql, values);
      }
    }
    if (verbose) console.log(`✓ Restored table: \`${table}\` (${rows.length} rows)`);
  }

  await conn.query('SET FOREIGN_KEY_CHECKS = 1');
  await conn.end();

  if (verbose) {
    console.log('\n================================================================');
    console.log('✅ BASELINE RESTORATION COMPLETED: ALL CONTENT MATCHES BASELINE');
    console.log('================================================================');
  }
}

export async function verifyBaselineDiff(): Promise<{ hasDifferences: boolean; diffs: string[] }> {
  const snapshotPath = path.resolve(process.cwd(), 'backups/baseline_snapshot_post_migration.json');
  const rawJson = fs.readFileSync(snapshotPath, 'utf-8');
  const snapshot = JSON.parse(rawJson);

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

  const diffs: string[] = [];
  const tables = Object.keys(snapshot.tables);

  for (const table of tables) {
    if (table === 'audit_logs') continue; // Audit logs grow monotonically with events

    const baselineRows = snapshot.tables[table];
    const [currentRows]: any = await conn.query(`SELECT * FROM \`${table}\``);

    if (baselineRows.length !== currentRows.length) {
      diffs.push(`Table ${table} row count mismatch: baseline has ${baselineRows.length}, current has ${currentRows.length}`);
    } else {
      // Check for any CMS_TEST strings
      const jsonStr = JSON.stringify(currentRows);
      if (jsonStr.includes('CMS_TEST')) {
        diffs.push(`Table ${table} contains leftover test strings (CMS_TEST)`);
      }
    }
  }

  await conn.end();
  return {
    hasDifferences: diffs.length > 0,
    diffs,
  };
}

// Allow CLI run
if (process.argv[1] && process.argv[1].endsWith('restore-exact-baseline.ts')) {
  restoreBaseline().catch(console.error);
}
