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
import { ThemeProvider, useTheme } from "@/lib/theme";
import { BRAND_TEAL, BrandLogo } from "@/components/BrandLogo";

export default function RootLayout() {
  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  // Decide the first screen before rendering the navigator (no flash).
  useEffect(() => {
    getOnboarded().then(setOnboarded);
  }, []);

  if (onboarded === null) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: BRAND_TEAL }}>
        <BrandLogo size={200} />
        <ActivityIndicator color="#e8c568" style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthProvider>
              <RootStack initialRoute={onboarded ? "(tabs)" : "onboarding"} />
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/** Reads the theme from inside ThemeProvider so the colours apply to every screen. */
function RootStack({ initialRoute }: { initialRoute: string }) {
  const { c } = useTheme();
  return (
    <Stack
      initialRouteName={initialRoute}
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
  );
}
