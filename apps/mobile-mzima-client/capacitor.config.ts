import { CapacitorConfig } from '@capacitor/cli';

const appName: string = 'Ushahidi';

const config: CapacitorConfig = {
  // need change to app id before publish
  appId: 'com.ushahidi.mobile',
  appName: appName,
  webDir: '../../dist/apps/mobile-mzima-client',
  bundledWebRuntime: false,
  loggingBehavior: process.env['NODE_ENV'] === 'production' ? 'production' : 'debug',
  plugins: {
    SplashScreen: {
      launchShowDuration: 1000,
      launchAutoHide: true,
      backgroundColor: '#000000',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER',
      splashFullScreen: true,
      splashImmersive: true,
    },
    CapacitorSQLite: {
      iosDatabaseLocation: 'Library/CapacitorDatabase',
      iosIsEncryption: false,
      iosKeychainPrefix: appName,
      iosBiometric: {
        biometricAuth: false,
        biometricTitle: 'Biometric login for capacitor sqlite',
      },
      androidIsEncryption: false,
      androidBiometric: {
        biometricAuth: false,
        biometricTitle: 'Biometric login for capacitor sqlite',
        biometricSubTitle: 'Log in using your biometric',
      },
    },
    CapacitorHttp: {
      enabled: true,
    },
    Intercom: {
      iosApiKey: 'ios_sdk-39fba04b7c5ab918fb743cc4a55ea9380221eb3c',
      iosAppId: 'hl5rfiga',
      androidApiKey: 'android_sdk-1643361a166d7bca0ba7ae40945250a1c8ebe9ff',
      androidAppId: 'hl5rfiga',
    },
  },
  android: {
    appendUserAgent: 'Mzima-Mobile-Android',
  },
  ios: {
    preferredContentMode: 'mobile',
    appendUserAgent: 'Mzima-Mobile-Ios',
  },
  server: {
    cleartext: process.env['NODE_ENV'] === 'production' ? false : true,
  },
};

export default config;
