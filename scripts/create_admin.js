import readline from 'readline';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const args = process.argv.slice(2);
  let email = '';
  let password = '';
  let role = 'superadmin';
  let name = 'Zanzirangi Administrator';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--email' && args[i + 1]) {
      email = args[i + 1];
      i++;
    } else if (args[i] === '--password' && args[i + 1]) {
      password = args[i + 1];
      i++;
    } else if (args[i] === '--name' && args[i + 1]) {
      name = args[i + 1];
      i++;
    } else if (args[i] === '--role' && args[i + 1]) {
      role = args[i + 1];
      i++;
    }
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (query) => new Promise((resolve) => rl.question(query, resolve));

  if (!email) {
    email = await question('Enter Admin Email [info@zanzirangihouse.com]: ');
    if (!email) email = 'info@zanzirangihouse.com';
  }

  if (!password) {
    password = await question('Enter New Secure Admin Password: ');
    if (!password || password.length < 8) {
      console.error('❌ Password must be at least 8 characters long.');
      rl.close();
      process.exit(1);
    }
  }

  rl.close();

  console.log(`🔐 Hashing credentials for ${email}...`);
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const dbPath = path.resolve(__dirname, '../server/data/db.json');
  if (fs.existsSync(dbPath)) {
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    if (!data.users) data.users = [];

    const existingIdx = data.users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
    const userObj = {
      id: existingIdx >= 0 ? data.users[existingIdx].id : `admin-${Date.now()}`,
      email: email.trim().toLowerCase(),
      name,
      role,
      passwordHash,
      createdAt: existingIdx >= 0 ? data.users[existingIdx].createdAt : new Date().toISOString(),
      lastLogin: null,
    };

    if (existingIdx >= 0) {
      data.users[existingIdx] = userObj;
      console.log(`✅ Updated existing user record for: ${email}`);
    } else {
      data.users.push(userObj);
      console.log(`✅ Created new user record for: ${email}`);
    }

    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log('🛡️ Password hash saved securely to database.');
    console.log('⚠️ IMPORTANT: Plaintext passwords are NEVER stored.');
  } else {
    console.error('❌ Database file not found at:', dbPath);
  }
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
