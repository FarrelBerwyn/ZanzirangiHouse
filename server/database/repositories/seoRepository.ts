import { getDatabaseAdapter } from '../index.ts';
import { SeoData } from '../../../src/services/contentApi.ts';

export class SeoRepository {
  async getSeo(): Promise<SeoData> {
    return getDatabaseAdapter().getSeo();
  }

  async updateSeo(data: Partial<SeoData>, userEmail: string): Promise<SeoData> {
    return getDatabaseAdapter().updateSeo(data, userEmail);
  }
}

export const seoRepository = new SeoRepository();
