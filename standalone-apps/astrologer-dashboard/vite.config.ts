import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const dashboardDir = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(dashboardDir, '../..');

export default defineConfig({
  root: dashboardDir,
  base: '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': repositoryRoot,
    },
  },
  server: {
    port: 3002,
    fs: {
      allow: [repositoryRoot],
    },
  },
  build: {
    outDir: path.resolve(dashboardDir, 'dist'),
    emptyOutDir: true,
  },
});
