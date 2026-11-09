import { View, type ViewStyle } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";

// On-brand gradient placeholders shown under the photo while it loads, if it
// fails, or when the listing has no image, so the card never looks broken.
const GRADIENTS: [string, string][] = [
  ["#0f766e", "#22d3ee"],
  ["#7c3aed", "#db2777"],
  ["#0891b2", "#84cc16"],
  ["#4f46e5", "#06b6d4"],
  ["#be185d", "#2563eb"],
  ["#059669", "#0ea5e9"],
  ["#ea580c", "#db2777"],
  ["#1e3a8a", "#14b8a6"],
];

/** Listing image with a gradient fallback; `seed` picks the gradient. */
export function Cover({
  uri,
  seed = 0,
  style,
  className,
  rounded = true,
}: {
  uri?: string;
  seed?: number;
  style?: ViewStyle;
  className?: string;
  rounded?: boolean;
}) {
  const g = GRADIENTS[Math.abs(seed) % GRADIENTS.length];
  return (
    <View
      className={className}
      style={[{ overflow: "hidden", borderRadius: rounded ? 22 : 0 }, style]}
    >
      <LinearGradient
        colors={g}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      {uri ? (
        <Image source={{ uri }} style={{ width: "100%", height: "100%" }} contentFit="cover" transition={250} />
      ) : null}
    </View>
  );
}
