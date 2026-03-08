import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'with-locale',
  brand: {
    displayName: '언어/지역 설정',
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
