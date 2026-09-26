import { DatabaseAdapter } from './adapter.ts';
import { JsonDatabaseAdapter } from './jsonAdapter.ts';
import { MysqlDatabaseAdapter } from './mysqlAdapter.ts';
import { env } from '../config/env.ts';

let adapterInstance: DatabaseAdapter | null = null;

/**
 * Returns the singleton database adapter instance based on the DATABASE_PROVIDER environment variable.
 * Supported providers: 'json' (default local store) | 'mysql' (Hostinger production)
 */
export function getDatabaseAdapter(): DatabaseAdapter {
  if (!adapterInstance) {
    if (env.DATABASE_PROVIDER === 'mysql') {
      adapterInstance = new MysqlDatabaseAdapter();
    } else {
      adapterInstance = new JsonDatabaseAdapter();
    }
  }
  return adapterInstance;
}

export * from './adapter.ts';
