import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // need change to app id before publish
  appId: 'io.ionic.mobile',
  appName: 'mobile-app',
  webDir: '../../dist/apps/mobile-app',
  bundledWebRuntime: false,
};

export default config;
