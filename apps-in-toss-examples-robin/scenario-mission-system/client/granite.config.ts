import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'scenario-mission-system',
  brand: {
    displayName: '미션 시스템',
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
