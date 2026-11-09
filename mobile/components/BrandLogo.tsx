import { Platform, Text, View } from "react-native";
import { Image } from "expo-image";

const MARK = require("../assets/brand-mark.png");
const FULL = require("../assets/brand-logo.jpg");
// Serif wordmark like the logo; "serif" only resolves on Android.
const SERIF = Platform.select({ ios: "Georgia", default: "serif" });

/** Gold house/towers mark from the Estara Properties logo, on its black tile. */
export function BrandMark({ size = 40 }: { size?: number }) {
  return (
    <View
      style={{ width: size, height: size, borderRadius: size * 0.28 }}
      className="items-center justify-center overflow-hidden bg-black"
      accessibilityLabel="Estara Properties"
    >
      <Image source={MARK} style={{ width: size * 0.78, height: size * 0.78 }} contentFit="contain" />
    </View>
  );
}

/** Mark + "ESTARA / PROPERTIES" wordmark. `light` for use on dark/gradient backgrounds. */
export function BrandLockup({ size = 36, light = false }: { size?: number; light?: boolean }) {
  return (
    <View className="flex-row items-center gap-2.5">
      <BrandMark size={size} />
      <View>
        <Text style={{ fontFamily: SERIF, letterSpacing: 1 }} className="text-lg font-bold text-accent">
          ESTARA
        </Text>
        <Text style={{ letterSpacing: 3.5 }} className={light ? "text-[9px] font-semibold text-white/85" : "text-[9px] font-semibold text-muted"}>
          PROPERTIES
        </Text>
      </View>
    </View>
  );
}

/** The full square logo (gold on black), e.g. for the launch screen. */
export function BrandLogo({ size = 180 }: { size?: number }) {
  return (
    <Image
      source={FULL}
      style={{ width: size, height: size, borderRadius: size * 0.12 }}
      contentFit="cover"
      accessibilityLabel="Estara Properties"
    />
  );
}
