import { getMysqlPool } from '../server/database/connection.ts';
import fs from 'fs';
import path from 'path';

async function main() {
  const pool = getMysqlPool();
  const [rows]: any = await pool.query('SELECT * FROM media_assets ORDER BY created_at ASC');
  
  console.log(`Found ${rows.length} media records in MySQL:\n`);
  
  const results = [];
  for (const row of rows) {
    let localPhysicalPath = null;
    let localExists = false;
    
    // Check possible local locations
    const possiblePaths = [
      path.resolve(process.cwd(), row.storage_path || ''),
      path.resolve(process.cwd(), 'uploads', row.filename || ''),
      path.resolve(process.cwd(), 'public', row.filename || ''),
      path.resolve(process.cwd(), 'public', (row.url || '').replace(/^\//, '')),
      path.resolve(process.cwd(), (row.url || '').replace(/^\//, '')),
    ];
    
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        localPhysicalPath = p;
        localExists = true;
        break;
      }
    }
    
    const isRemoteUrl = (row.url || '').startsWith('http://') || (row.url || '').startsWith('https://');
    
    results.push({
      id: row.id,
      filename: row.filename,
      mime_type: row.mime_type,
      size: row.size || row.size_bytes,
      url: row.url,
      public_url: row.public_url,
      storage_path: row.storage_path,
      isRemoteUrl,
      localPhysicalPath,
      localExists,
    });
  }
  
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
}

main().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
