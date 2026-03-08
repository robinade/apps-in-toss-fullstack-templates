import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'scenario-milestone-withdraw',
  brand: {
    displayName: '마일스톤 + 포인트 출금',
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
