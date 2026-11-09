import { View, type ViewProps } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

/** Themed screen wrapper: safe-area + token background + matching status bar. */
export function Screen({
  children,
  className,
  edges = ["top"],
  ...rest
}: ViewProps & { className?: string; edges?: Edge[] }) {
  const { isDark, c } = useTheme();
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: c.bg }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View className={cn("flex-1", className)} {...rest}>
        {children}
      </View>
    </SafeAreaView>
  );
}
