import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });

async function createBaselineSnapshot() {
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
    // Avoid large binary or audit logs if unnecessary, but audit logs are fine to keep snapshot of
    const [rows]: any = await conn.query(`SELECT * FROM \`${table}\``);
    snapshot.tables[table] = rows;
  }

  await conn.end();

  const backupDir = path.resolve(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const rawJson = JSON.stringify(snapshot, null, 2);
  const hash = crypto.createHash('sha256').update(rawJson).digest('hex');
  snapshot.metadata.sha256 = hash;

  const snapshotPath = path.join(backupDir, 'baseline_snapshot_pre_implementation.json');
  fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2));

  console.log(`✅ Baseline Snapshot created successfully:`);
  console.log(`- Path: ${snapshotPath}`);
  console.log(`- Tables recorded: ${tableNames.length}`);
  console.log(`- Checksum (SHA-256): ${hash}`);
}

createBaselineSnapshot().catch((err) => {
  console.error('❌ Failed to create baseline snapshot:', err);
  process.exit(1);
});
