import { getDatabaseAdapter } from '../index.ts';
import { Villa } from '../../../src/services/contentApi.ts';

export class VillasRepository {
  async getAll(): Promise<Villa[]> {
    return getDatabaseAdapter().getVillas();
  }

  async getById(id: string): Promise<Villa | null> {
    return getDatabaseAdapter().getVillaById(id);
  }

  async save(villa: Villa, userEmail: string): Promise<Villa> {
    return getDatabaseAdapter().saveVilla(villa, userEmail);
  }

  async delete(id: string, userEmail: string): Promise<boolean> {
    return getDatabaseAdapter().deleteVilla(id, userEmail);
  }
}

export const villasRepository = new VillasRepository();
