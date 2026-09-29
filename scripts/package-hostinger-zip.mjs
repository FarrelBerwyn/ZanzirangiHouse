import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

const ROOT = process.cwd();
const STAGING = path.join(ROOT, 'temp_deploy_staging');
const ZIP_OUTPUT = path.join(ROOT, 'hostinger_deploy.zip');

console.log('================================================================');
console.log('ZANZIRANGI HOUSE: HOSTINGER PRODUCTION ZIP PACKAGING');
console.log('================================================================');

// 1. Clean previous staging & zip
if (fs.existsSync(STAGING)) {
  fs.rmSync(STAGING, { recursive: true, force: true });
}
if (fs.existsSync(ZIP_OUTPUT)) {
  fs.rmSync(ZIP_OUTPUT, { force: true });
}

fs.mkdirSync(STAGING, { recursive: true });
console.log('✓ Staging directory initialized.');

// 2. Verify build artifacts
const distIndex = path.join(ROOT, 'dist', 'index.html');
const serverJs = path.join(ROOT, 'server.js');
if (!fs.existsSync(distIndex)) {
  console.error('❌ Error: dist/index.html not found! Run npm run build first.');
  process.exit(1);
}
if (!fs.existsSync(serverJs)) {
  console.error('❌ Error: server.js not found! Run npm run build first.');
  process.exit(1);
}
console.log('✓ Build artifacts verified (dist/index.html & server.js).');

// 3. Copy production runtime files to staging
console.log('⏳ Copying production runtime files to staging...');

// Copy dist/
fs.cpSync(path.join(ROOT, 'dist'), path.join(STAGING, 'dist'), { recursive: true });

// Copy server.js
fs.copyFileSync(serverJs, path.join(STAGING, 'server.js'));

// Copy package.json
fs.copyFileSync(path.join(ROOT, 'package.json'), path.join(STAGING, 'package.json'));

// Copy package-lock.json
if (fs.existsSync(path.join(ROOT, 'package-lock.json'))) {
  fs.copyFileSync(path.join(ROOT, 'package-lock.json'), path.join(STAGING, 'package-lock.json'));
}

// Copy uploads/
if (fs.existsSync(path.join(ROOT, 'uploads'))) {
  fs.cpSync(path.join(ROOT, 'uploads'), path.join(STAGING, 'uploads'), { recursive: true });
} else {
  fs.mkdirSync(path.join(STAGING, 'uploads'), { recursive: true });
}

// Copy public/
if (fs.existsSync(path.join(ROOT, 'public'))) {
  fs.cpSync(path.join(ROOT, 'public'), path.join(STAGING, 'public'), { recursive: true });
}

// Copy .env.example
if (fs.existsSync(path.join(ROOT, '.env.example'))) {
  fs.copyFileSync(path.join(ROOT, '.env.example'), path.join(STAGING, '.env.example'));
}

// Copy root .htaccess
const htaccessPath = path.join(ROOT, 'public', '.htaccess');
if (fs.existsSync(htaccessPath)) {
  fs.copyFileSync(htaccessPath, path.join(STAGING, '.htaccess'));
}

console.log('✓ Production runtime files staged.');

// 4. Strict Security & Secret Scan on Staging
console.log('⏳ Scanning staging directory for accidental credentials...');

const forbiddenFiles = ['.env', '.env.local', 'db.json'];
// Secret values are read from local env files so they never live in this script.
const localEnv = {};
for (const file of ['.env', '.env.local']) {
  const envPath = path.join(ROOT, file);
  if (fs.existsSync(envPath)) Object.assign(localEnv, dotenv.parse(fs.readFileSync(envPath)));
}
const forbiddenPatterns = ['DB_PASSWORD', 'JWT_SECRET', 'MYSQL_PASSWORD']
  .map((key) => localEnv[key])
  .filter((value) => value && value.length >= 6);

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (forbiddenFiles.includes(entry.name)) {
      console.error(`💥 CRITICAL SECURITY ERROR: Forbidden file staged: ${fullPath}`);
      fs.rmSync(STAGING, { recursive: true, force: true });
      process.exit(1);
    }
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.js', '.json', '.html', '.txt', '.example', '.htaccess', '.md'].includes(ext)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        for (const pattern of forbiddenPatterns) {
          if (content.includes(pattern)) {
            console.error(`💥 CRITICAL SECURITY ERROR: A local secret value was detected in ${fullPath}`);
            fs.rmSync(STAGING, { recursive: true, force: true });
            process.exit(1);
          }
        }
      }
    }
  }
}

scanDir(STAGING);
console.log('✓ Secret scan passed! Zero credentials detected in staging.');

// 5. Compress to ZIP with bsdtar (ships with Windows 10+, macOS and most Linux).
// PowerShell 5.1 Compress-Archive writes backslash paths that Linux extracts as flat filenames.
console.log('⏳ Creating hostinger_deploy.zip...');
const topLevelEntries = fs.readdirSync(STAGING).map((name) => `"${name}"`).join(' ');
// Pin the Windows bsdtar so Git Bash's GNU tar (no zip support) is never picked up.
const tarBin = process.platform === 'win32' ? `"${process.env.SystemRoot}\\System32\\tar.exe"` : 'tar';
execSync(`${tarBin} -a -cf "${ZIP_OUTPUT}" -C "${STAGING}" ${topLevelEntries}`, { stdio: 'inherit' });

// 6. Clean staging directory
fs.rmSync(STAGING, { recursive: true, force: true });

// 7. Verify generated ZIP
const stats = fs.statSync(ZIP_OUTPUT);
const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);

console.log('================================================================');
console.log(`🎉 HOSTINGER PRODUCTION ZIP CREATED SUCCESSFULLY!`);
console.log(`📦 File: hostinger_deploy.zip (${sizeMb} MB)`);
console.log(`📂 Path: ${ZIP_OUTPUT}`);
console.log('================================================================');
