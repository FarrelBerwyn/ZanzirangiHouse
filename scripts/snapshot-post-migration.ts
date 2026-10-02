import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });

async function createPostMigrationBaseline() {
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

  const [tablesResult]: any = await conn.query('SHOW TABLES');
  const tableNames: string[] = tablesResult.map((t: any) => Object.values(t)[0]);

  const snapshot: Record<string, any> = {
    metadata: {
      createdAt: new Date().toISOString(),
      database,
      host,
      tableCount: tableNames.length,
    },
    tables: {},
  };

  for (const table of tableNames) {
    const [rows]: any = await conn.query(`SELECT * FROM \`${table}\``);
    snapshot.tables[table] = rows;
  }

  await conn.end();

  const backupDir = path.resolve(process.cwd(), 'backups');
  const snapshotPath = path.join(backupDir, 'baseline_snapshot_post_migration.json');
  const rawJson = JSON.stringify(snapshot, null, 2);
  const hash = crypto.createHash('sha256').update(rawJson).digest('hex');
  snapshot.metadata.sha256 = hash;

  fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2));

  console.log(`✅ Post-Migration Baseline Snapshot created:`);
  console.log(`- Path: ${snapshotPath}`);
  console.log(`- Tables recorded: ${tableNames.length}`);
  console.log(`- Checksum (SHA-256): ${hash}`);
}

createPostMigrationBaseline().catch(console.error);
