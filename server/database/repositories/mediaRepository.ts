import { getDatabaseAdapter } from '../index.ts';
import { MediaAsset } from '../../../src/services/contentApi.ts';

export class MediaRepository {
  async getAll(): Promise<MediaAsset[]> {
    return getDatabaseAdapter().getMedia();
  }

  async save(asset: MediaAsset, userEmail: string): Promise<MediaAsset> {
    return getDatabaseAdapter().saveMedia(asset, userEmail);
  }

  async delete(id: string, userEmail: string): Promise<boolean> {
    return getDatabaseAdapter().deleteMedia(id, userEmail);
  }
}

export const mediaRepository = new MediaRepository();
