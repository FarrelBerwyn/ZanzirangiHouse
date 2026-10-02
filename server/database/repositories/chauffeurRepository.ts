import { getDatabaseAdapter } from '../index.ts';
import { ChauffeurConfigRecord } from '../adapter.ts';

export class ChauffeurRepository {
  async get(): Promise<ChauffeurConfigRecord> {
    return getDatabaseAdapter().getChauffeurConfig();
  }

  async update(data: Partial<ChauffeurConfigRecord>, userEmail: string): Promise<ChauffeurConfigRecord> {
    return getDatabaseAdapter().updateChauffeurConfig(data, userEmail);
  }
}

export const chauffeurRepository = new ChauffeurRepository();
