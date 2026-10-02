import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { MediaStorageAdapter, UploadResult } from './MediaStorageAdapter.ts';
import { env } from '../config/env.ts';

// Allow-list: extension → MIME type. Anything else (svg, html, scripts, archives…) is rejected,
// because uploads are served from the site's own origin.
const ALLOWED_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.pdf': 'application/pdf',
};

/** Checks the file's leading bytes so a renamed file can't masquerade as an image/video/pdf. */
function matchesSignature(buffer: Buffer, mimeType: string): boolean {
  const hex = buffer.subarray(0, 16).toString('hex');
  const ascii = buffer.subarray(0, 16).toString('latin1');
  switch (mimeType) {
    case 'image/jpeg':
      return hex.startsWith('ffd8ff');
    case 'image/png':
      return hex.startsWith('89504e470d0a1a0a');
    case 'image/gif':
      return ascii.startsWith('GIF87a') || ascii.startsWith('GIF89a');
    case 'image/webp':
      return ascii.startsWith('RIFF') && ascii.substring(8, 12) === 'WEBP';
    case 'image/avif':
      return ascii.substring(4, 8) === 'ftyp' && /avi[fs]/.test(ascii.substring(8, 12));
    case 'video/mp4':
      return ascii.substring(4, 8) === 'ftyp';
    case 'video/webm':
      return hex.startsWith('1a45dfa3');
    case 'application/pdf':
      return ascii.startsWith('%PDF-');
    default:
      return false;
  }
}

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
    const expectedMime = ALLOWED_TYPES[ext];

    // Security: extension must be allow-listed and agree with the declared MIME type and file content.
    if (!expectedMime) {
      throw new Error(
        `File type '${ext || 'unknown'}' is not allowed. Allowed: ${Object.keys(ALLOWED_TYPES).join(', ')}.`
      );
    }
    if (mimeType && mimeType !== expectedMime) {
      throw new Error(`File extension '${ext}' does not match its type '${mimeType}'.`);
    }
    if (!matchesSignature(buffer, expectedMime)) {
      throw new Error(`The file content is not a valid ${expectedMime} file.`);
    }
    mimeType = expectedMime;

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
