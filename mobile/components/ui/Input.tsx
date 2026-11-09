import { useState } from "react";
import { Text, TextInput, View, type TextInputProps } from "react-native";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

/** Text field mirroring the web .glass-input: visible field border, brand focus ring. */
export function Input({
  label,
  error,
  className,
  ...props
}: TextInputProps & { label?: string; error?: string }) {
  const { c } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View className={cn("gap-1.5", className)}>
      {label ? <Text className="text-sm font-medium text-fg">{label}</Text> : null}
      <TextInput
        placeholderTextColor={c.subtle}
        {...props}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        style={[
          {
            borderWidth: 1.5,
            borderColor: error ? c.warning : focused ? c.brand : c.field,
          },
          props.style,
        ]}
        className="rounded-2xl bg-surface/60 px-4 py-3.5 text-base text-fg"
      />
      {error ? <Text className="text-xs text-warning">{error}</Text> : null}
    </View>
  );
}
