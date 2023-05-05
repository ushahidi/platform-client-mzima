import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // need change to app id before publish
  appId: 'com.ushahidi.mobile',
  appName: 'Ushahidi',
  webDir: '../../dist/apps/mobile-mzima-client',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: '#000000',
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
