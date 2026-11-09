import { Pressable, Text, View } from "react-native";
import { cn } from "@/lib/utils";

/** iOS-style segmented control for enum toggles (intent, type, sort…). */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  className,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <View className={cn("flex-row rounded-2xl border border-line bg-surface/60 p-1", className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            className={cn("flex-1 items-center rounded-xl py-2.5", active && "bg-brand")}
          >
            <Text className={cn("text-sm font-semibold", active ? "text-white" : "text-muted")}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
