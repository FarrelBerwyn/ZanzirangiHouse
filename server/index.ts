import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiApp } from './api.ts';
import { getDatabaseAdapter, fallbackToJsonAdapter } from './database/index.ts';
import { mediaStorage } from './storage/mediaStorage.ts';
import { env, validateEnvironment } from './config/env.ts';

// 1. Validate environment configuration
validateEnvironment();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

// 2. Initialize database connection
getDatabaseAdapter()
  .connect()
  .then(() => {
    console.log(`🚀 Database engine initialized [Provider: ${env.DATABASE_PROVIDER}]`);
  })
  .catch((err) => {
    console.error('❌ Failed to initialize database on startup:', err.message);
    if (env.DATABASE_PROVIDER === 'mysql') {
      console.warn('⚠️ Hostinger MySQL connection unreachable. Falling back to JSON database engine to maintain zero downtime...');
      fallbackToJsonAdapter()
        .connect()
        .then(() => {
          console.log('✅ Fallback JSON database engine active and operational.');
        })
        .catch((jsonErr) => {
          console.error('❌ Fallback JSON database failed:', jsonErr.message);
        });
    }
  });

// 3. Mount persistent media storage route
app.use('/uploads', express.static(mediaStorage.getStorageDirectory()));

// 4. Mount API router
app.use('/api', apiApp);

// 5. Serve compiled frontend distribution (supports both server/index.ts and root server.js execution)
const distPath = fs.existsSync(path.resolve(__dirname, '../dist'))
  ? path.resolve(__dirname, '../dist')
  : path.resolve(__dirname, './dist');

app.use(express.static(distPath));

// 6. SPA fallback for direct deep-link route navigation and browser refresh
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).send('Zanzirangi House - Frontend distribution not built yet. Please run `npm run build`.');
    }
  });
});

const PORT = env.PORT || 3000;
const HOST = '0.0.0.0';

let server: any;
if (
  (process.argv[1] && process.argv[1].endsWith('index.ts')) ||
  process.argv[1]?.endsWith('index.js') ||
  process.argv[1]?.endsWith('server.js') ||
  process.env.NODE_ENV === 'production'
) {
  server = app.listen(PORT, HOST, () => {
    console.log(`🏰 Zanzirangi House Production Engine running on ${env.APP_URL} (Host: ${HOST}, Port: ${PORT})`);
  });

  // Graceful shutdown handling
  const shutdown = async (signal: string) => {
    console.log(`\n🛑 Received ${signal}. Initiating graceful shutdown...`);
    if (server) {
      server.close(async () => {
        try {
          await getDatabaseAdapter().disconnect();
          console.log('✅ Closed database connections.');
        } catch (e: any) {
          console.error('Error closing database connections:', e.message);
        }
        console.log('🏁 Application process exited cleanly.');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}
