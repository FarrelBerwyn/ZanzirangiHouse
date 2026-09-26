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
    const hostingerDir =
      customStorageDir ||
      env.MEDIA_STORAGE_PATH ||
      path.resolve(process.cwd(), 'uploads');
    super(hostingerDir);
    this.enforceDirectorySecurity();
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
