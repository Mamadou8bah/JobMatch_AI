import { Stack } from "expo-router";

import * as SplashScreen from "expo-splash-screen";

import { useEffect } from "react";

import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider, useAuth } from "../context/AuthContext";



SplashScreen.preventAutoHideAsync();



function RootNavigator() {

  const { loading } = useAuth();



  useEffect(() => {

    if (!loading) {

      SplashScreen.hideAsync().catch(() => {});

    }

  }, [loading]);



  return (

    <Stack screenOptions={{ headerShown: false, animation: "fade" }} />

  );

}



export default function RootLayout() {

  return (

    <SafeAreaProvider>

      <AuthProvider>

        <RootNavigator />

      </AuthProvider>

    </SafeAreaProvider>

  );

}

