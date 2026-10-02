import mysql from 'mysql2/promise';

async function updateDb(name, user, password, dbName) {
  console.log('Updating DB:', name, `(${dbName})`);
  const conn = await mysql.createConnection({
    host: 'srv982.hstgr.io',
    port: 3306,
    user,
    password,
    database: dbName
  });

  const columns = [
    { name: 'support_avatar', def: 'VARCHAR(500) NULL DEFAULT NULL' },
    { name: 'support_name', def: "VARCHAR(100) NOT NULL DEFAULT 'Juma'" },
    { name: 'support_title', def: "VARCHAR(100) NOT NULL DEFAULT 'Customer Support'" },
    { name: 'support_status', def: "VARCHAR(100) NOT NULL DEFAULT 'Active 24/7'" }
  ];

  for (const col of columns) {
    try {
      const [existing] = await conn.query(
        'SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
        [dbName, 'site_settings', col.name]
      );
      if (Array.isArray(existing) && existing.length === 0) {
        await conn.query(`ALTER TABLE site_settings ADD COLUMN ${col.name} ${col.def};`);
        console.log(`  + Added column ${col.name}`);
      } else {
        console.log(`  - Column ${col.name} already exists`);
      }
    } catch (err) {
      console.error(`  ! Error checking/adding ${col.name}:`, err.message);
    }
  }

  // Set default initial avatar if null
  await conn.query(
    "UPDATE site_settings SET support_avatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80' WHERE support_avatar IS NULL OR support_avatar = '';"
  );
  console.log('  ✓ Verified default support_avatar populated');

  await conn.end();
}

async function run() {
  await updateDb('Production', 'u170555096_admindatabase', 'Zanzirangi123#', 'u170555096_Zanzirangi');
  await updateDb('Staging', 'u170555096_stageuser', 'Zanzirangi123#', 'u170555096_staging');
  console.log('\n🎉 All DB updates finished successfully!');
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
