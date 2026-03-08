import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'with-back-event',
  brand: {
    displayName: '뒤로가기 이벤트',
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
