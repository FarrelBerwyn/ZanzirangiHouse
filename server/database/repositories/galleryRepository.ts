import { getDatabaseAdapter } from '../index.ts';
import { GalleryItem } from '../../../src/services/contentApi.ts';

export class GalleryRepository {
  async getAll(): Promise<GalleryItem[]> {
    return getDatabaseAdapter().getGallery();
  }

  async save(item: GalleryItem, userEmail: string): Promise<GalleryItem> {
    return getDatabaseAdapter().saveGalleryItem(item, userEmail);
  }

  async delete(id: string, userEmail: string): Promise<boolean> {
    return getDatabaseAdapter().deleteGalleryItem(id, userEmail);
  }
}

export const galleryRepository = new GalleryRepository();
