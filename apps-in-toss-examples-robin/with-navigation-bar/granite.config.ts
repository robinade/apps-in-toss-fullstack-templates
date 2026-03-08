import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'with-navigation-bar',
  brand: {
    displayName: '네비게이션바',
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
