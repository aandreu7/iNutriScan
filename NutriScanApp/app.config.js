import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, 'private.env') });

export default () => ({
  expo: {
    name: "NutriScanApp",
    slug: "NutriScanApp",
    owner: "aandreu",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "nutriscanapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.nutriscanteam.inutriscan",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      package: "com.nutriscanteam.inutriscan",
      googleServicesFile: "./google-services.json",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      [
        "expo-build-properties",
        {
          ios: {
            useFrameworks: "static",
          },
        },
      ],
      "@react-native-firebase/app",
      "@react-native-firebase/auth",
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: "ffdbcb28-e29a-4d66-8e67-6735a061ebee",
      },
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      IOS_CLIENT_ID: process.env.IOS_CLIENT_ID,
      EXPO_CLIENT_ID: process.env.EXPO_CLIENT_ID,
      ANDROID_CLIENT_ID: process.env.ANDROID_CLIENT_ID,
      GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    },
  },
});
