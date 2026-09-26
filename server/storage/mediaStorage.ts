import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { env } from '../config/env.ts';

export interface UploadResult {
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  storagePath: string;
}

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
  '.php',
  '.phtml',
  '.php3',
  '.php4',
  '.php5',
  '.phps',
  '.js',
  '.cjs',
  '.mjs',
  '.ts',
  '.sh',
  '.bash',
  '.exe',
  '.bat',
  '.cmd',
  '.py',
  '.pl',
  '.cgi',
  '.htaccess',
  '.env',
]);

export class MediaStorageService {
  private storageDir: string;

  constructor(customStorageDir?: string) {
    this.storageDir = customStorageDir || env.MEDIA_STORAGE_PATH;
    this.ensureDirectoryExists();
  }

  private ensureDirectoryExists(): void {
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  public getStorageDirectory(): string {
    return this.storageDir;
  }

  /**
   * Validates and saves an uploaded buffer to persistent storage.
   */
  public async saveFile(
    buffer: Buffer,
    originalName: string,
    mimeType: string
  ): Promise<UploadResult> {
    this.ensureDirectoryExists();

    // 1. Sanitize original filename and extract extension
    const ext = path.extname(originalName).toLowerCase();

    // 2. Security Check: Reject forbidden extensions
    if (FORBIDDEN_EXTENSIONS.has(ext)) {
      throw new Error(`Security Exception: Uploading files with extension '${ext}' is strictly prohibited.`);
    }

    // 3. Security Check: Reject unapproved MIME types
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      throw new Error(`Security Exception: MIME type '${mimeType}' is not permitted.`);
    }

    // 4. File Size Check
    const maxBytes = env.MAX_UPLOAD_SIZE_MB * 1024 * 1024;
    if (buffer.length > maxBytes) {
      throw new Error(`File size (${(buffer.length / (1024 * 1024)).toFixed(1)}MB) exceeds maximum allowed limit of ${env.MAX_UPLOAD_SIZE_MB}MB.`);
    }

    // 5. Generate secure, collision-free filename
    const hash = crypto.randomBytes(16).toString('hex');
    const safeBaseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 32);
    const uniqueFilename = `${safeBaseName}_${Date.now()}_${hash.substring(0, 8)}${ext}`;

    // 6. Prevent path traversal attack
    const destinationPath = path.resolve(this.storageDir, uniqueFilename);
    if (!destinationPath.startsWith(path.resolve(this.storageDir))) {
      throw new Error('Security Exception: Invalid destination path traversal detected.');
    }

    // 7. Write to persistent filesystem
    await fs.promises.writeFile(destinationPath, buffer);

    const publicUrl = `/uploads/${uniqueFilename}`;

    return {
      filename: uniqueFilename,
      url: publicUrl,
      size: buffer.length,
      mimeType,
      storagePath: destinationPath,
    };
  }

  /**
   * Deletes a file from persistent storage.
   */
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

  /**
   * Checks if a file exists in storage.
   */
  public exists(filename: string): boolean {
    const safeFilename = path.basename(filename);
    const filePath = path.resolve(this.storageDir, safeFilename);
    return fs.existsSync(filePath);
  }

  /**
   * Returns the persistent storage directory path on disk.
   */
  public getStoragePath(): string {
    return this.storageDir;
  }

  /**
   * Returns the public URL for a stored filename.
   */
  public getUrl(filename: string): string {
    const safeFilename = path.basename(filename);
    return `/uploads/${safeFilename}`;
  }
}

export const mediaStorage = new MediaStorageService();
export const getMediaStorage = (): MediaStorageService => mediaStorage;

