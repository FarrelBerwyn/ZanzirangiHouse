import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Environment precedence: variables provided by the platform (Hostinger hPanel, shell) are
// authoritative and are NEVER overridden by files.
//  - production: only `.env` may fill in variables that are missing; `.env.local` is ignored.
//  - development: `.env.local` (personal overrides) is loaded before `.env`, so it wins over `.env`.
const isProductionRuntime = process.env.NODE_ENV === 'production';
if (!isProductionRuntime) {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), quiet: true } as any);
}
dotenv.config({ path: path.resolve(process.cwd(), '.env'), quiet: true } as any);

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
  /** ISO date (YYYY-MM-DD) of the production release; null while the version is unreleased. */
  APP_RELEASE_DATE: string | null;
  /** Set when the running build was deployed by the CI/CD pipeline (release.json); null otherwise. */
  APP_DEPLOYMENT: DeploymentStamp | null;
  /** Staging/preview sites: send `X-Robots-Tag: noindex` everywhere and a disallow-all robots.txt. */
  SITE_NOINDEX: boolean;
}

function parseCorsOrigin(val?: string): string | string[] {
  if (!val || val === '*') return '*';
  if (val.includes(',')) {
    return val.split(',').map((s) => s.trim());
  }
  return val.trim();
}

const nodeEnv = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test';

/** Deployment stamp written by the CI/CD deploy workflow into `release.json` (never committed to main). */
export interface DeploymentStamp {
  tag: string | null;
  commit: string;
  build: string;
  environment: string;
  deployedAt: string;
}

/**
 * Release metadata comes from package.json (shipped with the app), so the running server reports the
 * same version as the Git tag / CHANGELOG — even when started with `node server.js` instead of
 * `npm start` (where npm_package_version is not set). Deployments made by the pipeline also carry
 * `release.json`, which pins the exact commit and CI build. See docs/RELEASE_PROCESS.md, docs/CICD.md.
 */
function readJson(file: string): any {
  try {
    return JSON.parse(fs.readFileSync(path.resolve(process.cwd(), file), 'utf8'));
  } catch {
    return null;
  }
}
function readReleaseInfo(): { version: string; releaseDate: string | null; deployment: DeploymentStamp | null } {
  const pkg = readJson('package.json');
  const stamp = readJson('release.json');
  const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, 64) : null);
  const deployment =
    stamp && str(stamp.commit)
      ? {
          tag: str(stamp.tag),
          commit: str(stamp.commit)!.slice(0, 12),
          build: str(String(stamp.build ?? '')) || 'unknown',
          environment: str(stamp.environment) || 'unknown',
          deployedAt: str(stamp.deployedAt) || 'unknown',
        }
      : null;
  return {
    version: str(pkg?.version) || process.env.npm_package_version || 'unknown',
    releaseDate: str(pkg?.releaseDate),
    deployment,
  };
}
const releaseInfo = readReleaseInfo();

/**
 * Hostinger runs each deployment from its own folder: <domain>/hbuilds/versions/<build-id>/…
 * Uploads must live in a folder that every version shares, so anchor them at <domain>/zanzirangi-media.
 */
function defaultProductionMediaPath(): string {
  const cwd = process.cwd().replace(/\\/g, '/');
  const versioned = cwd.match(/^(.*?)\/hbuilds\/versions\/[^/]+/);
  return versioned ? `${versioned[1]}/zanzirangi-media` : path.resolve(process.cwd(), '..', 'zanzirangi-media');
}

export const env: ServerEnv = {
  NODE_ENV: nodeEnv,
  PORT: parseInt(process.env.PORT || process.env.API_PORT || '3000', 10),
  APP_URL: process.env.APP_URL || (nodeEnv === 'production' ? 'https://zanzirangihouse.com' : 'http://localhost:3000'),
  PUBLIC_URL: process.env.PUBLIC_URL || (nodeEnv === 'production' ? 'https://zanzirangihouse.com' : 'http://localhost:3000'),
  API_URL: process.env.API_URL || (nodeEnv === 'production' ? 'https://zanzirangihouse.com/api' : '/api'),
  DATABASE_PROVIDER: (nodeEnv === 'production'
    ? 'mysql'
    : (process.env.FORCE_JSON_DB === 'true' ? 'json' : (process.env.DATABASE_PROVIDER || 'mysql'))) as 'json' | 'mysql',
  MYSQL_HOST: process.env.DB_HOST || process.env.MYSQL_HOST,
  MYSQL_PORT: parseInt(process.env.DB_PORT || process.env.MYSQL_PORT || '3306', 10),
  MYSQL_DATABASE: process.env.DB_NAME || process.env.MYSQL_DATABASE,
  MYSQL_USER: process.env.DB_USER || process.env.MYSQL_USER,
  MYSQL_PASSWORD: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD,
  MYSQL_CONNECTION_LIMIT: parseInt(process.env.MYSQL_CONNECTION_LIMIT || '10', 10),
  JWT_SECRET: process.env.JWT_SECRET || (nodeEnv === 'production' ? '' : 'zanzirangi_dev_jwt_secret_2026'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'info@zanzirangihouse.com',
  // Production default lives OUTSIDE the deployed app directory so uploads survive redeploys
  // (each Hostinger build replaces the app directory). Override with MEDIA_STORAGE_PATH.
  MEDIA_STORAGE_PATH:
    process.env.MEDIA_STORAGE_PATH ||
    (nodeEnv === 'production' ? defaultProductionMediaPath() : path.resolve(process.cwd(), 'uploads')),
  MAX_UPLOAD_SIZE_MB: parseInt(process.env.MAX_UPLOAD_SIZE || process.env.MAX_UPLOAD_SIZE_MB || '25', 10),
  CORS_ORIGIN: parseCorsOrigin(process.env.CORS_ORIGIN || (nodeEnv === 'production' ? 'https://zanzirangihouse.com' : 'http://localhost:3000')),
  LOG_LEVEL: (process.env.LOG_LEVEL || (nodeEnv === 'production' ? 'info' : 'debug')) as 'debug' | 'info' | 'warn' | 'error',
  APP_VERSION: releaseInfo.version,
  APP_RELEASE_DATE: releaseInfo.releaseDate,
  APP_DEPLOYMENT: releaseInfo.deployment,
  SITE_NOINDEX: process.env.SITE_NOINDEX === 'true',
};

/**
 * Validates critical environment configuration at application boot.
 * In production mode, missing secrets or invalid configurations fail fast.
 */
export function validateEnvironment(): void {
  if (env.NODE_ENV === 'production') {
    if (env.DATABASE_PROVIDER !== 'mysql') {
      console.error('💥 [Hostinger DB Critical Error] Production environment strictly requires DATABASE_PROVIDER=mysql. Silent fallback to JSON is strictly prohibited.');
      throw new Error('Production environment strictly requires DATABASE_PROVIDER=mysql. Silent fallback to JSON is strictly prohibited.');
    }

    if (!env.JWT_SECRET || env.JWT_SECRET === 'zanzirangi_dev_jwt_secret_2026' || env.JWT_SECRET.length < 32) {
      console.error('💥 [Hostinger Auth Critical Error] JWT_SECRET must be set to a random value of at least 32 characters in Hostinger Environment Variables.');
      throw new Error('Missing or weak JWT_SECRET in production');
    }

    const missingDbVars: string[] = [];
    if (!env.MYSQL_HOST) missingDbVars.push('DB_HOST / MYSQL_HOST');
    if (!env.MYSQL_DATABASE) missingDbVars.push('DB_NAME / MYSQL_DATABASE');
    if (!env.MYSQL_USER) missingDbVars.push('DB_USER / MYSQL_USER');
    if (!env.MYSQL_PASSWORD) missingDbVars.push('DB_PASSWORD / MYSQL_PASSWORD');

    if (missingDbVars.length > 0) {
      console.error(`💥 [Hostinger DB Critical Error] Missing MySQL variables: ${missingDbVars.join(', ')}. Silent fallback to JSON is strictly prohibited.`);
      throw new Error(`Missing required MySQL environment variables: ${missingDbVars.join(', ')}`);
    }

    console.log(`🛡️ Production environment validated successfully [Provider: ${env.DATABASE_PROVIDER}, URL: ${env.APP_URL}]`);
  } else {
    console.log(`🔧 Environment loaded [Provider: ${env.DATABASE_PROVIDER}, Host: http://localhost:${env.PORT}]`);
  }
}
