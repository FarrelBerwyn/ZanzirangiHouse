import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { MediaStorageAdapter, UploadResult } from './MediaStorageAdapter.ts';
import { env } from '../config/env.ts';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/avif',
  'video/mp4',
  'video/webm',
  'application/pdf',
]);

const FORBIDDEN_EXTENSIONS = new Set([
  '.php', '.phtml', '.php3', '.php4', '.php5', '.phps',
  '.js', '.cjs', '.mjs', '.ts',
  '.sh', '.bash', '.exe', '.bat', '.cmd', '.py', '.pl', '.cgi',
  '.htaccess', '.env',
]);

export class LocalMediaStorage implements MediaStorageAdapter {
  private storageDir: string;

  constructor(customStorageDir?: string) {
    this.storageDir = customStorageDir || env.MEDIA_STORAGE_PATH || path.resolve(process.cwd(), 'uploads');
    this.ensureDirectoryExists();
  }

  protected ensureDirectoryExists(): void {
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  public getStorageDirectory(): string {
    return this.storageDir;
  }

  public getStoragePath(): string {
    return this.storageDir;
  }

  public async saveFile(
    buffer: Buffer,
    originalName: string,
    mimeType: string
  ): Promise<UploadResult> {
    this.ensureDirectoryExists();

    const ext = path.extname(originalName).toLowerCase();

    // Security Check: Forbidden extensions
    if (FORBIDDEN_EXTENSIONS.has(ext)) {
      throw new Error(`Security Exception: Uploading files with extension '${ext}' is strictly prohibited.`);
    }

    // Security Check: MIME type validation
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      throw new Error(`Security Exception: MIME type '${mimeType}' is not permitted.`);
    }

    // File Size Check
    const maxBytes = env.MAX_UPLOAD_SIZE_MB * 1024 * 1024;
    if (buffer.length > maxBytes) {
      throw new Error(`File size (${(buffer.length / (1024 * 1024)).toFixed(1)}MB) exceeds maximum limit of ${env.MAX_UPLOAD_SIZE_MB}MB.`);
    }

    // Generate sanitized, collision-free filename
    const hash = crypto.randomBytes(16).toString('hex');
    const safeBaseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 32);
    const uniqueFilename = `${safeBaseName}_${Date.now()}_${hash.substring(0, 8)}${ext}`;

    // Prevent path traversal attack
    const destinationPath = path.resolve(this.storageDir, uniqueFilename);
    if (!destinationPath.startsWith(path.resolve(this.storageDir))) {
      throw new Error('Security Exception: Invalid destination path traversal detected.');
    }

    await fs.promises.writeFile(destinationPath, buffer);

    return {
      filename: uniqueFilename,
      originalFilename: originalName,
      url: `/uploads/${uniqueFilename}`,
      size: buffer.length,
      mimeType,
      storagePath: destinationPath,
    };
  }

  public async deleteFile(filename: string): Promise<boolean> {
    const safeFilename = path.basename(filename);
    const filePath = path.resolve(this.storageDir, safeFilename);

    if (!filePath.startsWith(path.resolve(this.storageDir))) {
      throw new Error('Security Exception: Path traversal attempt prevented.');
    }

    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      return true;
    }
    return false;
  }

  public exists(filename: string): boolean {
    const safeFilename = path.basename(filename);
    const filePath = path.resolve(this.storageDir, safeFilename);
    return fs.existsSync(filePath);
  }

  public getUrl(filename: string): string {
    const safeFilename = path.basename(filename);
    return `/uploads/${safeFilename}`;
  }
}
