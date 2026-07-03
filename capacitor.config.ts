import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor wrapper for the Android release (GDD Fáza 4).
 *
 * The APK ships the built web app from dist/; the multiplayer backend
 * stays on Cloudflare, so Android builds must bake in the Worker URL:
 *   VITE_API_BASE=https://<worker>.workers.dev npm run build && npx cap sync android
 */
const config: CapacitorConfig = {
  appId: 'com.navia.pantheon',
  appName: 'Navia',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
