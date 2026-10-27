import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ command }) => {
  // A shell-level NODE_ENV=development would otherwise make `vite build`
  // bundle React's development build (≈60 % larger, with dev-only checks).
  // Forcing it here works on every OS, unlike an inline `NODE_ENV=…` prefix
  // in the npm script, which Windows shells don't understand.
  if (command === 'build') process.env.NODE_ENV = 'production';

  return {
    plugins: [react(), tailwindcss()],
    server: {
      // `npm run dev:worker` runs the Cloudflare Worker on :8787.
      proxy: {
        '/api': { target: 'http://localhost:8787', ws: true },
      },
    },
    test: {
      environment: 'node',
      include: ['src/**/*.test.ts'],
    },
  };
});
