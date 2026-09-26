import { getDatabaseAdapter } from '../index.ts';
import { HomepageContent } from '../../../src/services/contentApi.ts';

export class HomepageRepository {
  async getHomepage(): Promise<HomepageContent> {
    return getDatabaseAdapter().getHomepage();
  }

  async updateHomepage(data: Partial<HomepageContent>, userEmail: string): Promise<HomepageContent> {
    return getDatabaseAdapter().updateHomepage(data, userEmail);
  }
}

export const homepageRepository = new HomepageRepository();
