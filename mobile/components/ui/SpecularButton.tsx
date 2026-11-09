import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme, brandGradient } from "@/lib/theme";
import { cn } from "@/lib/utils";

/**
 * Native equivalent of the web React-Bits SpecularButton (which is WebGL/ogl and
 * not portable to RN). Same visual identity — brand gradient fill, soft glow,
 * press-scale, top sheen — and the same simple API (label/size/onPress).
 */
type Size = "sm" | "md" | "lg";
type Variant = "primary" | "outline" | "ghost";

// Padding as explicit style (className on third-party LinearGradient isn't
// guaranteed by NativeWind; core RN components below still use className).
const PAD: Record<Size, { paddingHorizontal: number; paddingVertical: number }> = {
  sm: { paddingHorizontal: 16, paddingVertical: 10 },
  md: { paddingHorizontal: 20, paddingVertical: 14 },
  lg: { paddingHorizontal: 28, paddingVertical: 16 },
};
const TEXT: Record<Size, string> = { sm: "text-sm", md: "text-base", lg: "text-lg" };

export function SpecularButton({
  label,
  onPress,
  size = "md",
  variant = "primary",
  disabled,
  loading,
  icon,
  className,
  full,
}: {
  label: string;
  onPress?: () => void;
  size?: Size;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  className?: string;
  full?: boolean;
}) {
  const { c } = useTheme();
  const isPrimary = variant === "primary";
  const inner = (
    <View className="flex-row items-center justify-center gap-2">
      {loading ? (
        <ActivityIndicator color={isPrimary ? "#fff" : c.brand} />
      ) : (
        <>
          {icon}
          <Text
            className={cn(
              "font-semibold",
              TEXT[size],
              isPrimary ? "text-white" : "text-brand",
            )}
          >
            {label}
          </Text>
        </>
      )}
    </View>
  );

  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          transform: [{ scale: pressed ? 0.97 : 1 }],
          opacity: disabled ? 0.55 : 1,
          shadowColor: c.brand,
          shadowOpacity: isPrimary ? 0.35 : 0,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
        },
        full ? { alignSelf: "stretch" } : undefined,
      ]}
      className={cn(full && "w-full", className)}
    >
      {isPrimary ? (
        <LinearGradient
          colors={brandGradient(c)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ alignItems: "center", borderRadius: 16, ...PAD[size] }}
        >
          {/* top sheen */}
          <View className="absolute left-0 right-0 top-0 h-1/2 rounded-t-2xl bg-white/10" />
          {inner}
        </LinearGradient>
      ) : (
        <View
          style={{ alignItems: "center", borderRadius: 16, ...PAD[size] }}
          className={cn(
            variant === "outline" ? "border border-brand/60 bg-brand-soft/40" : "bg-transparent",
          )}
        >
          {inner}
        </View>
      )}
    </Pressable>
  );
}
