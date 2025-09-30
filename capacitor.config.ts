import type { CapacitorConfig } from "@capacitor/cli";
import { KeyboardResize } from "@capacitor/keyboard";

const config: CapacitorConfig = {
  appId: "reyno.software.sells.point",
  appName: "Punto de Venta",
  webDir: "www",
  plugins: {
    Media: {
      androidGalleryMode: true,
    },
    SplashScreen: {
      launchShowDuration: 0,
    },
    StatusBar: {
      overlaysWebView: false,
      style: "DARK",
      backgroundColor: "#ffffffff",
    },
    Keyboard: {
      resize: KeyboardResize.Ionic,
      resizeOnFullScreen: true,
    },
    BluetoothLe: {
      displayStrings: {
        scanning: "Scanning",
        cancel: "Cancel",
        availableDevices: "Available devices",
        noDeviceFound: "No device found",
      },
    },
    LocalNotifications: {
      "smallIcon": "ic_stat_icon_config_sample",
      "iconColor": "#488AFF",
      "sound": "beep.wav"
    }
  },
  android: {
    allowMixedContent: true,
  },
  server: {
    cleartext: true, // This enables HTTP support for local dev
    allowNavigation: ["*"],
  },
};

export default config;
