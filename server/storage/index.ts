import { MediaStorageAdapter } from './MediaStorageAdapter.ts';
import { LocalMediaStorage } from './LocalMediaStorage.ts';
import { HostingerMediaStorage } from './HostingerMediaStorage.ts';
import { env } from '../config/env.ts';

export * from './MediaStorageAdapter.ts';
export * from './LocalMediaStorage.ts';
export * from './HostingerMediaStorage.ts';

let storageInstance: MediaStorageAdapter | null = null;

export function getMediaStorage(): MediaStorageAdapter {
  if (!storageInstance) {
    if (env.NODE_ENV === 'production') {
      storageInstance = new HostingerMediaStorage();
    } else {
      storageInstance = new LocalMediaStorage();
    }
  }
  return storageInstance;
}

export const mediaStorage = getMediaStorage();
