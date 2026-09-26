# Zanzirangi House — Pre-Deployment Environment Matrix

This document defines the configuration parameters across environments. Sensitive credentials are never stored directly in documentation or source control.

---

## 1. Environment Comparison Matrix

| Configuration Key | Local Development | Hostinger Production | Validation / Security Requirement |
|:---|:---|:---|:---|
| **NODE_ENV** | `development` | `production` | Enforces production security headers, HSTS, secure cookies |
| **PORT** | `3000` | `3000` (or Hostinger `$PORT`) | Server HTTP listening port |
| **APP_URL** | `http://localhost:3000` | `https://zanzirangihouse.com` | Base public canonical URL |
| **PUBLIC_URL** | `http://localhost:3000` | `https://zanzirangihouse.com` | Client-facing URL for absolute links |
| **API_URL** | `http://localhost:3000/api` | `https://zanzirangihouse.com/api` | REST API base route |
| **DATABASE_PROVIDER** | `json` | `mysql` | Dev uses local `db.json`; Prod uses Hostinger Cloud MySQL |
| **MYSQL_HOST** | `localhost` (optional) | `127.0.0.1` / Hostinger DB Host | Cloud MySQL hostname |
| **MYSQL_PORT** | `3306` | `3306` | Standard MySQL port |
| **MYSQL_DATABASE** | `zanzirangi_dev` (optional) | `u123456789_zanzirangi` | Production database instance |
| **MYSQL_USER** | `root` (optional) | `u123456789_admin` | Restricted DB user |
| **MYSQL_PASSWORD** | (empty in dev) | `[Configured in Hostinger Panel]` | Strong production DB secret |
| **JWT_SECRET** | `dev_secret_key_...` | `[Min 32-char secure secret]` | Cryptographic token signing key |
| **JWT_EXPIRES_IN** | `7d` | `7d` | Session lifetime |
| **ADMIN_EMAIL** | `info@zanzirangihouse.com` | `info@zanzirangihouse.com` | Official Zanzirangi Concierge mailbox |
| **CORS_ORIGIN** | `http://localhost:3000` | `https://zanzirangihouse.com` | Strict origin policy (no wildcard `*` in prod) |
| **MEDIA_STORAGE_PATH** | `./uploads` | `/home/.../persistent/uploads` | Path outside `dist/` to preserve uploads across builds |
| **MAX_UPLOAD_SIZE** | `10485760` (10 MB) | `10485760` (10 MB) | Maximum upload payload limit |
| **MAX_VIDEO_SIZE** | `52428800` (50 MB) | `52428800` (50 MB) | Video reel upload ceiling |
| **LOG_LEVEL** | `debug` | `info` | Verbose debug in dev; sanitized info in production |
| **STACK_TRACES** | Exposed in API response | Hidden (logged server-side only) | Prevents code disclosure to public consumers |

---

## 2. Startup Fail-Fast Rules (Production)

The server entry validator (`server/config/env.ts`) evaluates the environment before starting. If any of the following occur when `NODE_ENV=production`:
- `JWT_SECRET` is unset, default, or fewer than 32 characters.
- `DATABASE_PROVIDER=mysql` and `MYSQL_HOST`, `MYSQL_DATABASE`, `MYSQL_USER`, or `MYSQL_PASSWORD` are missing.
- `APP_URL` or `CORS_ORIGIN` contains `localhost`.

The server terminates immediately with code 1, preventing the deployment of a misconfigured or insecure application.
