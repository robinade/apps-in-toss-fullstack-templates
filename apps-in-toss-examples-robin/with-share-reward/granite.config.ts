import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'with-share-reward',
  brand: {
    displayName: '공유 리워드',
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
