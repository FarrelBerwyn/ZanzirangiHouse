import { getDatabaseAdapter } from '../index.ts';
import { WhyStayConfigRecord } from '../adapter.ts';

export class WhyStayRepository {
  async get(): Promise<WhyStayConfigRecord> {
    return getDatabaseAdapter().getWhyStayConfig();
  }

  async update(data: Partial<WhyStayConfigRecord>, userEmail: string): Promise<WhyStayConfigRecord> {
    return getDatabaseAdapter().updateWhyStayConfig(data, userEmail);
  }
}

export const whyStayRepository = new WhyStayRepository();
