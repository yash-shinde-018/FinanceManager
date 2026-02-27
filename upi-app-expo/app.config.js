import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'UPI Pay App',
  slug: 'upi-pay-app',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#0f172a',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.yourcompany.upipay',
    buildNumber: '1.0.0',
    infoPlist: {
      NSCameraUsageDescription: 'This app uses the camera to scan QR codes for payments',
      NSFaceIDUsageDescription: 'This app uses Face ID for secure authentication',
    },
  },
  android: {
    package: 'com.yourcompany.upipay',
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0f172a',
    },
    permissions: [
      'CAMERA',
      'USE_BIOMETRIC',
    ],
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  extra: {
    // Environment variables
    apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api',
    environment: process.env.NODE_ENV || 'development',
  },
  plugins: [
    'expo-secure-store',
    'expo-barcode-scanner',
  ],
});
