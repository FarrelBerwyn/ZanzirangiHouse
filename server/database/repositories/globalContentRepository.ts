import { getDatabaseAdapter } from '../index.ts';
import { GlobalContentRecord } from '../adapter.ts';

export class GlobalContentRepository {
  async get(): Promise<GlobalContentRecord> {
    return getDatabaseAdapter().getGlobalContent();
  }

  async update(data: Partial<GlobalContentRecord>, userEmail: string): Promise<GlobalContentRecord> {
    return getDatabaseAdapter().updateGlobalContent(data, userEmail);
  }
}

export const globalContentRepository = new GlobalContentRepository();
