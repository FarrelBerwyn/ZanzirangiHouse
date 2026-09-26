import { getDatabaseAdapter } from '../index.ts';
import { SettingsModel } from '../../../src/services/contentApi.ts';

export class SettingsRepository {
  async getSettings(): Promise<SettingsModel> {
    return getDatabaseAdapter().getSettings();
  }

  async updateSettings(data: Partial<SettingsModel>, userEmail: string): Promise<SettingsModel> {
    return getDatabaseAdapter().updateSettings(data, userEmail);
  }
}

export const settingsRepository = new SettingsRepository();
