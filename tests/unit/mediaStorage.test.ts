import { importRepo, tmpRoot } from '../helpers/isolate.ts';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

process.env.MAX_UPLOAD_SIZE = '1'; // MB — read by env.ts at import time
const { LocalMediaStorage } = await importRepo('server/storage/LocalMediaStorage.ts');

const dir = path.join(tmpRoot, 'media-test');
const storage = new LocalMediaStorage(dir);
const PNG = Buffer.concat([Buffer.from('89504e470d0a1a0a', 'hex'), Buffer.alloc(32)]);
const JPEG = Buffer.concat([Buffer.from('ffd8ffe0', 'hex'), Buffer.alloc(32)]);

describe('LocalMediaStorage uploads', () => {
  it('stores an allowed image under a sanitised, unique name', async () => {
    const result = await storage.saveFile(PNG, '../../evil name<script>.png', 'image/png');
    assert.match(result.filename, /^[A-Za-z0-9_-]+_\d+_[0-9a-f]{8}\.png$/);
    assert.equal(path.dirname(result.storagePath), path.resolve(dir));
    assert.ok(fs.existsSync(result.storagePath));
    assert.equal(result.url, `/uploads/${result.filename}`);
  });

  it('rejects SVG (script-capable) files', async () => {
    await assert.rejects(storage.saveFile(Buffer.from('<svg onload="alert(1)"/>'), 'x.svg', 'image/svg+xml'), /not allowed/);
  });

  it('rejects executable / unknown extensions', async () => {
    await assert.rejects(storage.saveFile(PNG, 'shell.php', 'image/png'), /not allowed/);
    await assert.rejects(storage.saveFile(PNG, 'page.html', 'text/html'), /not allowed/);
  });

  it('rejects a MIME type that does not match the extension', async () => {
    await assert.rejects(storage.saveFile(PNG, 'photo.png', 'image/jpeg'), /does not match/);
  });

  it('rejects content that does not match the file signature', async () => {
    await assert.rejects(storage.saveFile(JPEG, 'photo.png', 'image/png'), /not a valid/);
    await assert.rejects(storage.saveFile(Buffer.from('<?php echo 1; ?>'), 'photo.jpg', 'image/jpeg'), /not a valid/);
  });

  it('enforces the configured size limit', async () => {
    const big = Buffer.concat([PNG, Buffer.alloc(1024 * 1024 + 1)]);
    await assert.rejects(storage.saveFile(big, 'big.png', 'image/png'), /exceeds maximum/);
  });

  it('deletes only inside the storage directory (path traversal is neutralised)', async () => {
    const outside = path.join(tmpRoot, 'outside.txt');
    fs.writeFileSync(outside, 'keep me');
    assert.equal(await storage.deleteFile('../outside.txt'), false);
    assert.ok(fs.existsSync(outside));
  });
});
