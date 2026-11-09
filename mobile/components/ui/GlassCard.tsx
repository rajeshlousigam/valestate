import { View, type ViewProps } from "react-native";
import { BlurView } from "expo-blur";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

/**
 * The web `.glass` / `.glass-panel` surface. RN can't do CSS backdrop-filter,
 * so we layer an expo-blur BlurView + a translucent token background + hairline
 * border. Same rounded, soft, premium feel as web GlassCard.
 */
export function GlassCard({
  children,
  className,
  intensity = 24,
  style,
  ...rest
}: ViewProps & { className?: string; intensity?: number }) {
  const { isDark } = useTheme();
  return (
    <View
      className={cn("overflow-hidden rounded-3xl border border-line/70", className)}
      style={style}
      {...rest}
    >
      <BlurView
        intensity={intensity}
        tint={isDark ? "dark" : "light"}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <View className="bg-surface/70">{children}</View>
    </View>
  );
}
