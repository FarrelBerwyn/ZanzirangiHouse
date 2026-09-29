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
      if (env.NODE_ENV === 'production') {
        throw new Error('💥 CRITICAL: JsonDatabaseAdapter cannot be instantiated in production mode. Set DATABASE_PROVIDER=mysql.');
      }
      adapterInstance = new JsonDatabaseAdapter();
    }
  }
  return adapterInstance;
}

export * from './adapter.ts';
export * from './connection.ts';
export * from './repositories/index.ts';
