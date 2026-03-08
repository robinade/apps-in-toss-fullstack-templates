import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'scenario-share-viral',
  brand: {
    displayName: '공유 바이럴 리워드',
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
