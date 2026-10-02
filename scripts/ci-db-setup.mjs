#!/usr/bin/env node
/**
 * CI ONLY — applies every SQL migration, in order, to a throw-away database so CI proves the schema
 * builds from scratch on the target engine. Refuses to run against anything that is not a local CI
 * database (host must be 127.0.0.1/localhost and the database name must start with "ci_").
 *
 *   DB_HOST=127.0.0.1 DB_PORT=3306 DB_NAME=ci_zanzirangi DB_USER=root DB_PASSWORD=… node scripts/ci-db-setup.mjs
 */
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

const { DB_HOST = '127.0.0.1', DB_PORT = '3306', DB_NAME = '', DB_USER = '', DB_PASSWORD = '' } = process.env;
if (!['127.0.0.1', 'localhost'].includes(DB_HOST) || !DB_NAME.startsWith('ci_')) {
  console.error('Refusing to run: ci-db-setup only targets a local CI database (DB_HOST=127.0.0.1, DB_NAME=ci_*).');
  process.exit(2);
}

const dir = path.resolve('server/database/migrations');
const files = fs.readdirSync(dir).filter((f) => /^\d{3}_.+\.sql$/.test(f)).sort();

let conn;
for (let attempt = 1; ; attempt++) {
  try {
    conn = await mysql.createConnection({ host: DB_HOST, port: Number(DB_PORT), user: DB_USER, password: DB_PASSWORD, database: DB_NAME, multipleStatements: true });
    break;
  } catch (e) {
    if (attempt >= 30) throw e;
    await new Promise((r) => setTimeout(r, 2000)); // database container still starting
  }
}
const [[{ v }]] = await conn.query('SELECT VERSION() AS v');
console.log(`Connected to ${v}`);

for (const file of files) {
  const started = Date.now();
  await conn.query(fs.readFileSync(path.join(dir, file), 'utf8'));
  console.log(`  ✓ ${file} (${Date.now() - started} ms)`);
}
const [tables] = await conn.query('SHOW TABLES');
console.log(`Schema ready: ${tables.length} tables.`);
await conn.end();
