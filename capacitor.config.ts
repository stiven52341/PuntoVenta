import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'PuntoVenta',
  webDir: 'www',
  plugins: {
    Media: {
      androidGalleryMode: true
    },
    SplashScreen: {
      launchShowDuration: 0,
    },
    StatusBar: {
      overlaysWebView: false,
      style: "DARK",
      backgroundColor: "#ffffffff"
    }
  },
  android: {
    allowMixedContent: true
  },
  server: {
    cleartext: true  // This enables HTTP support for local dev
  }
};

export default config;
