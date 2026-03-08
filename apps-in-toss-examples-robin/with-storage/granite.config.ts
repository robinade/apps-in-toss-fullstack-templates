import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'with-storage',
  brand: {
    displayName: '네이티브 스토리지',
    primaryColor: '#6366f1',
  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite',
      build: 'vite build',
    },
  },
  outdir: 'dist',
});
