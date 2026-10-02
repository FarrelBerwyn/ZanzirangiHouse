import fs from 'fs';
import path from 'path';
import { LocalMediaStorage } from './LocalMediaStorage.ts';
import { env } from '../config/env.ts';

/**
 * HostingerMediaStorage specializes storage management for Hostinger shared/cloud environments.
 * It enforces that uploaded media directories contain protective .htaccess rules preventing
 * script execution (PHP/CGI/Python/Perl) while allowing static assets to be delivered.
 */
export class HostingerMediaStorage extends LocalMediaStorage {
  constructor(customStorageDir?: string) {
    super(HostingerMediaStorage.resolveWritableDirectory(customStorageDir || env.MEDIA_STORAGE_PATH));
    this.enforceDirectorySecurity();
  }

  /**
   * Uses the configured persistent directory (outside the deployed app, so uploads survive
   * redeploys). If it cannot be created, falls back to ./uploads and says so loudly.
   */
  private static resolveWritableDirectory(preferred: string): string {
    try {
      fs.mkdirSync(preferred, { recursive: true });
      fs.accessSync(preferred, fs.constants.W_OK);
      console.log(`[MEDIA] Persistent media storage: ${preferred}`);
      return preferred;
    } catch (e: any) {
      const fallback = path.resolve(process.cwd(), 'uploads');
      console.error(
        `[MEDIA] Cannot use media directory ${preferred} (${e.code || e.message}). ` +
          `Falling back to ${fallback} — files there are replaced on every redeploy. Set MEDIA_STORAGE_PATH.`
      );
      return fallback;
    }
  }

  /**
   * Drops a protective .htaccess file inside the uploads directory to prevent
   * any potential executable file execution on Hostinger Apache/LiteSpeed web servers.
   */
  private enforceDirectorySecurity(): void {
    try {
      const storageDir = this.getStorageDirectory();
      const htaccessPath = path.join(storageDir, '.htaccess');
      const htaccessContent = [
        '# Zanzirangi House: Security Lockdown for Uploads Directory',
        '# Prohibit any script execution on Hostinger Apache / LiteSpeed',
        '<FilesMatch "\\.(php|phtml|php3|php4|php5|phps|pl|py|cgi|sh|bash|exe)$">',
        '  Order Allow,Deny',
        '  Deny from all',
        '</FilesMatch>',
        'Options -ExecCGI -Indexes',
        'RemoveHandler .php .phtml .php3 .php4 .php5 .phps',
        'RemoveType .php .phtml .php3 .php4 .php5 .phps',
        '',
      ].join('\n');

      if (!fs.existsSync(htaccessPath)) {
        fs.writeFileSync(htaccessPath, htaccessContent, 'utf-8');
      }
    } catch (e: any) {
      console.warn('⚠️ Notice: Could not write protective .htaccess to uploads directory:', e.message);
    }
  }
}
