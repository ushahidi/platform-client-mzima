import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // need change to app id before publish
  appId: 'com.ushahidi.app',
  appName: 'Ushahidi',
  webDir: '../../dist/apps/mobile-mzima-client',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: '#000000',
      androidScaleType: 'CENTER_CROP',
      iosContentMode: 'scaleAspectFill',
      showSpinner: false,
      spinnerStyle: 'lines',
      webShowSpinner: false,
    },
  },
};

export default config;
