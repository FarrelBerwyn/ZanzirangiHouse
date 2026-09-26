import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file if available
dotenv.config();

export interface ServerEnv {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  APP_URL: string;
  PUBLIC_URL: string;
  API_URL: string;
  DATABASE_PROVIDER: 'json' | 'mysql';
  MYSQL_HOST?: string;
  MYSQL_PORT?: number;
  MYSQL_DATABASE?: string;
  MYSQL_USER?: string;
  MYSQL_PASSWORD?: string;
  MYSQL_CONNECTION_LIMIT?: number;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  ADMIN_EMAIL: string;
  MEDIA_STORAGE_PATH: string;
  MAX_UPLOAD_SIZE_MB: number;
  CORS_ORIGIN: string | string[];
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  APP_VERSION: string;
}

function parseCorsOrigin(val?: string): string | string[] {
  if (!val || val === '*') return '*';
  if (val.includes(',')) {
    return val.split(',').map((s) => s.trim());
  }
  return val.trim();
}

const nodeEnv = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test';

export const env: ServerEnv = {
  NODE_ENV: nodeEnv,
  PORT: parseInt(process.env.PORT || process.env.API_PORT || '3000', 10),
  APP_URL: process.env.APP_URL || (nodeEnv === 'production' ? 'https://zanzirangihouse.com' : 'http://localhost:3000'),
  PUBLIC_URL: process.env.PUBLIC_URL || (nodeEnv === 'production' ? 'https://zanzirangihouse.com' : 'http://localhost:3000'),
  API_URL: process.env.API_URL || (nodeEnv === 'production' ? 'https://zanzirangihouse.com/api' : '/api'),
  DATABASE_PROVIDER: (process.env.DATABASE_PROVIDER || 'json') as 'json' | 'mysql',
  MYSQL_HOST: process.env.MYSQL_HOST,
  MYSQL_PORT: parseInt(process.env.MYSQL_PORT || '3306', 10),
  MYSQL_DATABASE: process.env.MYSQL_DATABASE,
  MYSQL_USER: process.env.MYSQL_USER,
  MYSQL_PASSWORD: process.env.MYSQL_PASSWORD,
  MYSQL_CONNECTION_LIMIT: parseInt(process.env.MYSQL_CONNECTION_LIMIT || '10', 10),
  JWT_SECRET: process.env.JWT_SECRET || (nodeEnv === 'production' ? '' : 'zanzirangi_dev_jwt_secret_2026'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'info@zanzirangihouse.com',
  MEDIA_STORAGE_PATH: process.env.MEDIA_STORAGE_PATH || path.resolve(process.cwd(), 'uploads'),
  MAX_UPLOAD_SIZE_MB: parseInt(process.env.MAX_UPLOAD_SIZE_MB || '25', 10),
  CORS_ORIGIN: parseCorsOrigin(process.env.CORS_ORIGIN || (nodeEnv === 'production' ? 'https://zanzirangihouse.com' : 'http://localhost:3000')),
  LOG_LEVEL: (process.env.LOG_LEVEL || (nodeEnv === 'production' ? 'info' : 'debug')) as 'debug' | 'info' | 'warn' | 'error',
  APP_VERSION: process.env.npm_package_version || '1.0.0',
};

/**
 * Validates critical environment configuration at application boot.
 * In production mode, missing secrets or invalid configurations fail fast.
 */
export function validateEnvironment(): void {
  if (env.NODE_ENV === 'production') {
    const missing: string[] = [];

    if (!env.JWT_SECRET || env.JWT_SECRET === 'zanzirangi_dev_jwt_secret_2026') {
      missing.push('JWT_SECRET (must be a strong, non-default secret)');
    }

    if (env.DATABASE_PROVIDER === 'mysql') {
      if (!env.MYSQL_HOST) missing.push('MYSQL_HOST');
      if (!env.MYSQL_DATABASE) missing.push('MYSQL_DATABASE');
      if (!env.MYSQL_USER) missing.push('MYSQL_USER');
      if (!env.MYSQL_PASSWORD) missing.push('MYSQL_PASSWORD');
    }

    if (missing.length > 0) {
      const errorMsg = `\n❌ FATAL PRODUCTION CONFIGURATION ERROR:\nMissing or insecure required environment variables:\n  - ${missing.join('\n  - ')}\n\nPlease configure these in Hostinger Environment Variables before starting in production mode.\n`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    console.log(`🛡️ Production environment validated successfully [Provider: ${env.DATABASE_PROVIDER}, URL: ${env.APP_URL}]`);
  } else {
    console.log(`🔧 Development environment loaded [Provider: ${env.DATABASE_PROVIDER}, Host: http://localhost:${env.PORT}]`);
  }
}
