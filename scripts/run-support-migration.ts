import { getMysqlPool } from '../server/database/connection.ts';
import fs from 'fs';
import path from 'path';

async function migrate() {
  const pool = getMysqlPool();
  console.log('--- BEFORE MIGRATION ---');
  const [beforeTables]: any = await pool.query("SHOW TABLES LIKE 'support%'");
  console.log('Existing support tables:', beforeTables);

  console.log('\n--- EXECUTING MIGRATION 002_support_system.sql ---');
  const sql = fs.readFileSync(path.resolve('server/database/migrations/002_support_system.sql'), 'utf-8');
  
  const statements = sql
    .split(';')
    .map(s => {
      // Strip leading comments
      return s.replace(/^(\s*--[^\n]*\n)+/g, '').trim();
    })
    .filter(s => s.length > 0);

  for (const statement of statements) {
    if (statement.trim()) {
      await pool.query(statement);
      console.log('✓ Executed:', statement.substring(0, 60).replace(/\n/g, ' ') + '...');
    }
  }

  // Also record in schema_migrations table if present
  try {
    await pool.query(
      'INSERT INTO schema_migrations (version) VALUES (?) ON DUPLICATE KEY UPDATE applied_at = CURRENT_TIMESTAMP',
      ['002_support_system']
    );
    console.log('✓ Recorded migration 002_support_system in schema_migrations');
  } catch (mErr: any) {
    console.warn('Notice recording schema_migrations:', mErr.message);
  }

  console.log('\n--- AFTER MIGRATION ---');
  const [afterTables]: any = await pool.query("SHOW TABLES LIKE 'support%'");
  console.log('Support tables now present:', afterTables);

  for (const tableObj of afterTables) {
    const tableName = String(Object.values(tableObj)[0]);
    const [cols]: any = await pool.query(`SHOW COLUMNS FROM ${tableName}`);
    console.log(`\nColumns for ${tableName} (${cols.length} columns):`);
    cols.forEach((c: any) => console.log(`  - ${c.Field} (${c.Type}, Null: ${c.Null}, Default: ${c.Default})`));
  }

  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
