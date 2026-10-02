import { getDatabaseAdapter } from '../index.ts';
import { DiningConfigRecord, DiningCategoryRecord } from '../adapter.ts';

export class DiningRepository {
  async getConfig(): Promise<DiningConfigRecord> {
    return getDatabaseAdapter().getDiningConfig();
  }

  async updateConfig(data: Partial<DiningConfigRecord>, userEmail: string): Promise<DiningConfigRecord> {
    return getDatabaseAdapter().updateDiningConfig(data, userEmail);
  }

  async getCategories(): Promise<DiningCategoryRecord[]> {
    return getDatabaseAdapter().getDiningCategories();
  }

  async saveCategory(category: DiningCategoryRecord, userEmail: string): Promise<DiningCategoryRecord> {
    return getDatabaseAdapter().saveDiningCategory(category, userEmail);
  }

  async deleteCategory(id: string, userEmail: string): Promise<boolean> {
    return getDatabaseAdapter().deleteDiningCategory(id, userEmail);
  }
}

export const diningRepository = new DiningRepository();
