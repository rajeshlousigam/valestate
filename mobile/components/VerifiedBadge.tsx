import { Text, View } from "react-native";
import { BadgeCheck } from "lucide-react-native";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

/** The signature Estara Properties trust marker (docs/16 §8) — parity with web VerifiedBadge. */
export function VerifiedBadge({
  size = "md",
  label = "Verified",
  className,
}: {
  size?: "sm" | "md";
  label?: string;
  className?: string;
}) {
  const { c } = useTheme();
  const icon = size === "sm" ? 13 : 15;
  return (
    <View
      className={cn(
        "flex-row items-center gap-1 self-start rounded-full bg-brand/90 px-2.5",
        size === "sm" ? "py-1" : "py-1.5",
        className,
      )}
    >
      <BadgeCheck size={icon} color="#fff" />
      <Text className={cn("font-semibold text-white", size === "sm" ? "text-[11px]" : "text-xs")}>
        {label}
      </Text>
    </View>
  );
}
