import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { apiApp } from './server/api.ts';
import { getDatabaseAdapter } from './server/database/index.ts';

import express from 'express';
import { getMediaStorage } from './server/storage/mediaStorage.ts';

function zanzirangiApiPlugin(): Plugin {
  return {
    name: 'zanzirangi-api-middleware',
    configureServer(server) {
      getDatabaseAdapter()
        .connect()
        .catch((err) => console.error('[DATABASE] Dev server could not connect:', err.message));
      server.middlewares.use('/api', apiApp);
      server.middlewares.use('/uploads', express.static(getMediaStorage().getStoragePath()));
    },
  };
}

export default defineConfig(() => {
  return {
    base: '/',
    plugins: [react(), tailwindcss(), zanzirangiApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {
        ignored: ['**/videos/**', '**/*.mp4', '**/*.jpg', '**/*.png', '**/*.jpeg', '**/server/data/**'],
      },
    },
  };
});
