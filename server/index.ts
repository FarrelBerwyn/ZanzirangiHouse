import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiApp } from './api.ts';
import { getDatabaseAdapter } from './database/index.ts';
import { mediaStorage } from './storage/mediaStorage.ts';
import { env, validateEnvironment } from './config/env.ts';
import { runtimeState, uptimeSeconds } from './runtime.ts';
import { supportEscalationService } from './services/supportEscalationService.ts';

// Lifecycle:
//   START  → validate env → start HTTP server → connect database (retry with backoff) → remain running
//   SIGNAL → stop accepting requests → close HTTP server → close database pool → exit
// Nothing in startup calls process.exit() except an invalid production configuration.

// 1. Validate environment configuration (fail fast with a clear, secret-free message)
try {
  validateEnvironment();
} catch (err: any) {
  console.error(`[STARTUP] Invalid environment configuration: ${err.message}`);
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
// Hostinger serves the app behind a reverse proxy; trust it so req.ip / rate limits use the client address.
app.set('trust proxy', 1);
app.disable('x-powered-by');

// Staging / preview sites must never be indexed or compete with production in search results.
if (env.SITE_NOINDEX) {
  app.use((req, res, next) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    if (req.path === '/robots.txt') {
      res.type('text/plain').send('User-agent: *\nDisallow: /\n');
      return;
    }
    next();
  });
}

// 2. Media: persistent storage first, then the legacy ./uploads folder shipped with the app.
const uploadHeaders = (res: express.Response) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Uploaded files are never allowed to run scripts in the site's origin.
  // (Note: Hostinger's CDN replaces this CSP with its own; the upload allow-list is the primary control.)
  res.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self'; media-src 'self'; sandbox");
  // The Hostinger CDN sits in front of Node: make it revalidate (ETag/304) so replaced or deleted
  // media disappears immediately instead of being served from the edge for days.
  res.setHeader('Cache-Control', 'public, no-cache');
};
const mediaDirs = Array.from(new Set([mediaStorage.getStorageDirectory(), path.resolve(process.cwd(), 'uploads')]));
mediaDirs.forEach((dir) => {
  if (fs.existsSync(dir)) {
    app.use('/uploads', express.static(dir, { setHeaders: uploadHeaders, index: false }));
  }
});

// 3. API gateway (handles every /api/* request, including JSON 404s — never falls through to the SPA)
app.use('/api', apiApp);

// 4. Compiled frontend. Prefer dist/ next to the running file (root server.js), then ../dist (server/index.ts).
const distCandidates = [path.resolve(__dirname, 'dist'), path.resolve(__dirname, '../dist')];
const distPath = distCandidates.find((p) => fs.existsSync(path.join(p, 'index.html'))) || distCandidates[0];

// Hashed build assets never change → cache for a year. HTML must always be revalidated so CMS
// deploys/content changes are picked up immediately.
app.use(
  '/assets',
  express.static(path.join(distPath, 'assets'), { maxAge: '1y', immutable: true, index: false, fallthrough: false })
);
app.use(
  express.static(distPath, {
    index: false,
    redirect: false,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
    },
  })
);

// 5. SPA fallback for deep links. Pre-rendered routes (dist/<route>/index.html) are served as-is
//    without a trailing-slash redirect so canonical URLs like /villas stay stable.
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/assets')) {
    return next();
  }
  if (path.extname(req.path)) {
    res.status(404).type('text/plain').send('Not found');
    return;
  }
  const routeDir = path.resolve(distPath, '.' + req.path.replace(/\/+$/, ''));
  const prerendered = path.join(routeDir, 'index.html');
  const target =
    routeDir.startsWith(distPath) && req.path !== '/' && fs.existsSync(prerendered)
      ? prerendered
      : path.join(distPath, 'index.html');
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(target, (err) => {
    if (err && !res.headersSent) {
      res.status(503).type('text/plain').send('Zanzirangi House: frontend build is missing on the server.');
    }
  });
});

// 6. Database initialisation with retry. The HTTP server keeps answering meanwhile; /api/health
//    reports 503 until MySQL is ready. There is never a fallback to a JSON file in production.
let dbRetryTimer: NodeJS.Timeout | null = null;
async function connectDatabase(attempt = 1): Promise<void> {
  try {
    await getDatabaseAdapter().connect();
    runtimeState.databaseReady = true;
    runtimeState.databaseError = null;
    console.log(`[DATABASE] Ready [provider: ${env.DATABASE_PROVIDER}, attempt ${attempt}]`);
  } catch (err: any) {
    runtimeState.databaseReady = false;
    runtimeState.databaseError = err?.message || 'Unknown database error';
    const delay = Math.min(60, 5 * attempt);
    console.error(
      `[DATABASE] Connection failed (attempt ${attempt}): ${runtimeState.databaseError}. Retrying in ${delay}s.`
    );
    if (!runtimeState.shuttingDown) {
      dbRetryTimer = setTimeout(() => connectDatabase(attempt + 1), delay * 1000);
    }
  }
}

// 7. HTTP server. Always listens when this module is the entry point (server.js / server/index.ts);
//    Hostinger's Node runtime (Passenger) provides PORT or intercepts listen() itself.
//    Test scripts that only need `app` set ZANZIRANGI_NO_LISTEN=1.
const PORT = env.PORT || 3000;
const HOST = '0.0.0.0';
const embedded = process.env.ZANZIRANGI_NO_LISTEN === '1';

export const server = embedded
  ? null
  : app.listen(PORT, HOST, () => {
      console.log(
        `[STARTUP] Zanzirangi House ready [env: ${env.NODE_ENV}, provider: ${env.DATABASE_PROVIDER}, ` +
          `bind: ${HOST}:${PORT}, pid: ${process.pid}, url: ${env.APP_URL}]`
      );
    });
server?.on('error', (err: any) => {
  console.error(`[STARTUP] HTTP server error: ${err.code || ''} ${err.message}`);
  if (err.code === 'EADDRINUSE' || err.code === 'EACCES') process.exit(1);
});

connectDatabase();
supportEscalationService.startEscalationMonitor();

// 8. Graceful shutdown (idempotent, bounded).
async function shutdown(signal: string, exitCode = 0): Promise<void> {
  if (runtimeState.shuttingDown) return;
  runtimeState.shuttingDown = true;
  console.log(`[SHUTDOWN] ${signal} received (pid ${process.pid}, uptime ${uptimeSeconds()}s). Shutting down gracefully...`);
  supportEscalationService.stopEscalationMonitor();
  if (dbRetryTimer) clearTimeout(dbRetryTimer);

  const forceExit = setTimeout(() => {
    console.error('[SHUTDOWN] Graceful shutdown timed out after 10s. Forcing exit.');
    process.exit(exitCode || 1);
  }, 10_000);
  forceExit.unref();

  if (server) {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    console.log('[SHUTDOWN] HTTP server closed.');
  }
  try {
    await getDatabaseAdapter().disconnect();
    console.log('[SHUTDOWN] Database connections closed.');
  } catch (e: any) {
    console.error(`[SHUTDOWN] Error closing database connections: ${e.message}`);
  }
  console.log(`[SHUTDOWN] Process exit (${exitCode}).`);
  process.exit(exitCode);
}

if (!embedded) {
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('unhandledRejection', (reason: any) => {
    console.error(`[RUNTIME] Unhandled promise rejection: ${reason?.stack || reason}`);
  });
  process.on('uncaughtException', (err) => {
    console.error(`[RUNTIME] Uncaught exception: ${err.stack || err.message}`);
    shutdown('uncaughtException', 1);
  });
}
