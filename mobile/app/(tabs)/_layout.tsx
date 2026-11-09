import { Tabs } from "expo-router";
import { Heart, Home, Inbox, User } from "lucide-react-native";
import { useTheme } from "@/lib/theme";

export default function TabsLayout() {
  const { c } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.brand,
        tabBarInactiveTintColor: c.subtle,
        tabBarStyle: {
          backgroundColor: c.surface,
          borderTopColor: c.line,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Explore", tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="saved"
        options={{ title: "Saved", tabBarIcon: ({ color, size }) => <Heart color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="activity"
        options={{ title: "Activity", tabBarIcon: ({ color, size }) => <Inbox color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="account"
        options={{ title: "Account", tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
      />
    </Tabs>
  );
}
