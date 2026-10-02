import { getDatabaseAdapter } from '../index.ts';
import { SafariDestinationRecord } from '../adapter.ts';

export class SafariRepository {
  async getAll(): Promise<SafariDestinationRecord[]> {
    return getDatabaseAdapter().getSafariDestinations();
  }

  async save(item: SafariDestinationRecord, userEmail: string): Promise<SafariDestinationRecord> {
    return getDatabaseAdapter().saveSafariDestination(item, userEmail);
  }

  async delete(id: string, userEmail: string): Promise<boolean> {
    return getDatabaseAdapter().deleteSafariDestination(id, userEmail);
  }
}

export const safariRepository = new SafariRepository();
