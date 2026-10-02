import { getDatabaseAdapter } from '../index.ts';
import { PageContentRecord } from '../adapter.ts';

export class PageContentsRepository {
  async getById(id: string): Promise<PageContentRecord | null> {
    return getDatabaseAdapter().getPageContent(id);
  }

  async getAll(): Promise<PageContentRecord[]> {
    return getDatabaseAdapter().getAllPages();
  }

  async update(id: string, data: Partial<PageContentRecord>, userEmail: string): Promise<PageContentRecord> {
    return getDatabaseAdapter().updatePageContent(id, data, userEmail);
  }
}

export const pageContentsRepository = new PageContentsRepository();
