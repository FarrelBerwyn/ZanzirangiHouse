import { getMysqlPool } from '../server/database/connection.ts';
import { generateToken } from '../server/auth.ts';

async function main() {
  const pool = getMysqlPool();
  const [rows]: any = await pool.query("SELECT * FROM users WHERE id = 'usr_1'");
  const user = rows[0];
  const token = generateToken(user);
  console.log('SUPERADMIN_TOKEN=' + token);
  console.log('SUPERADMIN_USER=' + JSON.stringify({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status || 'active',
    permissions: user.permissions,
  }));
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
