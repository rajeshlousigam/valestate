import { Pressable, Text } from "react-native";
import { cn } from "@/lib/utils";

/** Selectable pill used for locality chips, filter options, amenities. */
export function Chip({
  label,
  active,
  onPress,
  className,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  className?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "rounded-full border px-4 py-2",
        active ? "border-brand bg-brand" : "border-line bg-surface/60",
        className,
      )}
    >
      <Text className={cn("text-sm font-medium", active ? "text-white" : "text-fg")}>{label}</Text>
    </Pressable>
  );
}
