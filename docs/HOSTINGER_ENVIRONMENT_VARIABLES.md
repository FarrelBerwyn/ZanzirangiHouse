# Zanzirangi House — Hostinger Environment Variables Reference

This document provides a comprehensive specification of all environment variables supported by the Zanzirangi House Production CMS engine on Hostinger.

---

## 1. Environment Variable Matrix

| Variable Name | Alias | Required in Prod | Development Default | Production Recommended Value | Purpose & Security Note |
|---|---|---|---|---|---|
| `NODE_ENV` | - | **Yes** | `development` | `production` | Enables strict security headers (HSTS), production cookie flags, and suppresses stack traces in HTTP responses. |
| `PORT` | `API_PORT` | Optional | `3000` | `3000` (or assigned by Hostinger) | Port on which the Express/Node engine listens. |
| `DATABASE_PROVIDER` | - | **Yes** | `json` | `mysql` | Selects the active database adapter (`json` for local atomic file store; `mysql` for Hostinger production). |
| `DB_HOST` | `MYSQL_HOST` | **Yes (in prod)** | - | `127.0.0.1` | Hostinger MySQL IP. Use `127.0.0.1` to ensure TCP port connectivity. |
| `DB_PORT` | `MYSQL_PORT` | Optional | `3306` | `3306` | MySQL port. |
| `DB_NAME` | `MYSQL_DATABASE` | **Yes (in prod)** | - | `u123456789_zanzirangi` | Hostinger provisioned MySQL database name. |
| `DB_USER` | `MYSQL_USER` | **Yes (in prod)** | - | `u123456789_admin` | Hostinger provisioned MySQL user. |
| `DB_PASSWORD` | `MYSQL_PASSWORD` | **Yes (in prod)** | - | `[Strong_Random_Password]` | High-entropy MySQL password. Never commit to Git or display in logs. |
| `JWT_SECRET` | - | **Yes (in prod)** | Dev fallback | `[64_Char_Hex_Secret]` | Cryptographic key used to sign and verify administrative session tokens. Must be minimum 32 characters in production. |
| `JWT_EXPIRES_IN` | - | Optional | `7d` | `7d` | Administrative token lifetime. |
| `ADMIN_EMAIL` | - | Optional | `info@zanzirangihouse.com` | `info@zanzirangihouse.com` | Official primary administrative notification email. |
| `APP_URL` | - | **Yes (in prod)** | `http://localhost:3000` | `https://zanzirangihouse.com` | Primary canonical URL of the sanctuary web application. |
| `PUBLIC_URL` | - | Optional | `http://localhost:3000` | `https://zanzirangihouse.com` | Public origin URL. |
| `API_URL` | - | Optional | `/api` | `https://zanzirangihouse.com/api` | Full URL to the API endpoint root. |
| `MEDIA_STORAGE_PATH` | - | Optional | `./uploads` | `./uploads` | Absolute or relative path to persistent disk storage for uploaded media assets. |
| `MAX_UPLOAD_SIZE` | `MAX_UPLOAD_SIZE_MB` | Optional | `25` | `25` | Maximum upload size in megabytes. |
| `CORS_ORIGIN` | - | Optional | `http://localhost:3000` | `https://zanzirangihouse.com` | Allowed CORS origins. Comma-separated list supported. |
| `LOG_LEVEL` | - | Optional | `debug` | `info` | Logging verbosity (`debug`, `info`, `warn`, `error`). In production, sensitive parameters are never printed. |

---

## 2. Generating Secure Cryptographic Secrets

### Generating `JWT_SECRET`:
Execute on any terminal with OpenSSL:
```bash
openssl rand -hex 32
```
Or with Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 3. Hostinger hPanel Configuration Procedure

1. Open **hPanel** → **Websites** → **Manage** (`zanzirangihouse.com`).
2. Go to **Advanced** → **Node.js**.
3. Under **Environment Variables**, click **Add Variable** for each key-value pair listed above.
4. If your Hostinger plan restricts direct GUI environment variable entry:
   * **Status:** `REQUIRES MANUAL HOSTINGER CONFIGURATION`
   * *Alternative:* Create a `.env` file via File Manager in the project root directory (`/home/uXXXXX/domains/zanzirangihouse.com/public_html/.env`) with `chmod 600`.
