import { getDatabaseAdapter } from '../index.ts';
import { ExperienceRecord } from '../adapter.ts';

export class ExperiencesRepository {
  async getAll(): Promise<ExperienceRecord[]> {
    return getDatabaseAdapter().getExperiences();
  }

  async save(item: ExperienceRecord, userEmail: string): Promise<ExperienceRecord> {
    return getDatabaseAdapter().saveExperience(item, userEmail);
  }

  async delete(id: string, userEmail: string): Promise<boolean> {
    return getDatabaseAdapter().deleteExperience(id, userEmail);
  }
}

export const experiencesRepository = new ExperiencesRepository();
