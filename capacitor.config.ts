import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'reyno.software.sells.point',
  appName: 'Punto de Venta',
  webDir: 'www',
  plugins: {
    Media: {
      androidGalleryMode: true,
    },
    SplashScreen: {
      launchShowDuration: 0,
    },
    StatusBar: {
      overlaysWebView: false,
      style: 'DARK',
      backgroundColor: '#ffffffff',
    }
  },
  android: {
    allowMixedContent: true,
  },
  server: {
    cleartext: true, // This enables HTTP support for local dev
    allowNavigation: ['*']
  },
};

export default config;
