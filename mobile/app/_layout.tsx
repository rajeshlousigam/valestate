import "../global.css";
import "react-native-gesture-handler";
import "react-native-reanimated";

import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { AuthProvider } from "@/lib/auth";
import { queryClient } from "@/lib/query";
import { getOnboarded } from "@/lib/onboarding";
import { useTheme } from "@/lib/theme";
import { BrandLogo } from "@/components/BrandLogo";

export default function RootLayout() {
  const { c } = useTheme();
  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  // Decide the first screen before rendering the navigator (no flash).
  useEffect(() => {
    getOnboarded().then(setOnboarded);
  }, []);

  if (onboarded === null) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#000" }}>
        <BrandLogo size={200} />
        <ActivityIndicator color="#d4a531" style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Stack
              initialRouteName={onboarded ? "(tabs)" : "onboarding"}
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: c.bg },
                animation: "slide_from_right",
              }}
            >
              <Stack.Screen name="onboarding" options={{ animation: "fade" }} />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="listing/[slug]" />
              <Stack.Screen name="search" />
              <Stack.Screen name="profile" />
              <Stack.Screen name="(auth)" options={{ presentation: "modal" }} />
              <Stack.Screen name="(owner)" />
            </Stack>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
