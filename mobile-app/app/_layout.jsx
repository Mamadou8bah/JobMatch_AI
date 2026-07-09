import { Stack } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  GoogleSansFlex_400Regular,
  GoogleSansFlex_500Medium,
  GoogleSansFlex_600SemiBold,
  GoogleSansFlex_700Bold,
  GoogleSansFlex_800ExtraBold,
  GoogleSansFlex_900Black,
  useFonts,
} from "@expo-google-fonts/google-sans-flex";
import * as SplashScreen from "expo-splash-screen";
import * as Updates from "expo-updates";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { applyAppFontDefaults } from "../constants/fonts";
import { AuthProvider, useAuth } from "../context/AuthContext";

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loading]);

  return <Stack screenOptions={{ headerShown: false, animation: "fade" }} />;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    GoogleSansFlex_400Regular,
    GoogleSansFlex_500Medium,
    GoogleSansFlex_600SemiBold,
    GoogleSansFlex_700Bold,
    GoogleSansFlex_800ExtraBold,
    GoogleSansFlex_900Black,
    ...Ionicons.font,
  });

  useEffect(() => {
    if (fontsLoaded) {
      applyAppFontDefaults();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (__DEV__) return;

    async function checkForOtaUpdate() {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      } catch {
        // OTA unavailable until the app is linked to EAS and built with expo-updates
      }
    }

    checkForOtaUpdate();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
