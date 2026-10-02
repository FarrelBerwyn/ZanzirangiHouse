import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || '',
  });

  const [users]: any = await conn.query('SELECT id, email, name, role, status, token_version FROM users');
  console.log('USERS_IN_DB:', JSON.stringify(users, null, 2));

  const [tables]: any = await conn.query('SHOW TABLES');
  console.log('TABLES COUNT:', tables.length);

  await conn.end();
}

main().catch(console.error);
