import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'PuntoVenta',
  webDir: 'www',
  plugins: {
    Media: {
      androidGalleryMode: true
    }
  }
};

export default config;
