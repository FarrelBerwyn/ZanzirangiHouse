import { getDatabaseAdapter } from '../index.ts';
import { AuditLogRecord } from '../adapter.ts';

export class AuditRepository {
  async getLogs(limit: number = 50): Promise<AuditLogRecord[]> {
    return getDatabaseAdapter().getAuditLogs(limit);
  }

  async log(entry: Omit<AuditLogRecord, 'timestamp'>): Promise<void> {
    return getDatabaseAdapter().addAuditLog(entry);
  }
}

export const auditRepository = new AuditRepository();
