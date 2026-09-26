import { getDatabaseAdapter } from '../index.ts';
import { Facility } from '../../../src/services/contentApi.ts';

export class FacilitiesRepository {
  async getAll(): Promise<Facility[]> {
    return getDatabaseAdapter().getFacilities();
  }

  async save(facility: Facility, userEmail: string): Promise<Facility> {
    return getDatabaseAdapter().saveFacility(facility, userEmail);
  }
}

export const facilitiesRepository = new FacilitiesRepository();
