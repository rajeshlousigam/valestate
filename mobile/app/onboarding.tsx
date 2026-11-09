import { useRef, useState } from "react";
import { Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BadgeCheck, Building2, ShieldCheck, type LucideIcon } from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { SpecularButton } from "@/components/ui/SpecularButton";
import { setOnboarded } from "@/lib/onboarding";
import { brandGradient, useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

type Slide = { icon: LucideIcon; title: string; body: string };

const SLIDES: Slide[] = [
  {
    icon: ShieldCheck,
    title: "Every listing, verified",
    body: "We check ownership, identity, and property details before anything goes public. If it's on Estara Properties, it's real.",
  },
  {
    icon: BadgeCheck,
    title: "No fakes. No chasing.",
    body: "Browse only human-verified homes, flats, and plots across Imphal — with a clear trust badge on every one.",
  },
  {
    icon: Building2,
    title: "List with confidence",
    body: "Owners request a listing in minutes. Our team verifies it before any buyer sees it.",
  },
];

export default function Onboarding() {
  const router = useRouter();
  const { c } = useTheme();
  const { width } = useWindowDimensions();
  const scroller = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);
  const last = page === SLIDES.length - 1;

  const finish = async () => {
    await setOnboarded();
    router.replace("/(tabs)");
  };

  const next = () => {
    if (last) return finish();
    scroller.current?.scrollTo({ x: width * (page + 1), animated: true });
    setPage((p) => p + 1);
  };

  return (
    <Screen edges={["top", "bottom"]}>
      {/* Skip */}
      <View className="flex-row justify-end px-5 pt-2">
        <Pressable onPress={finish} hitSlop={10} className="px-2 py-1">
          <Text className="text-sm font-semibold text-muted">Skip</Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scroller}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
      >
        {SLIDES.map((s, i) => {
          const Icon = s.icon;
          return (
            <View key={i} style={{ width }} className="items-center justify-center gap-6 px-10">
              <LinearGradient
                colors={brandGradient(c)}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ height: 120, width: 120, alignItems: "center", justifyContent: "center", borderRadius: 40 }}
              >
                <Icon size={56} color="#fff" />
              </LinearGradient>
              <View className="gap-3">
                <Text className="text-center text-3xl font-extrabold text-fg">{s.title}</Text>
                <Text className="text-center text-base leading-relaxed text-muted">{s.body}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Dots */}
      <View className="flex-row justify-center gap-2 pb-6">
        {SLIDES.map((_, i) => (
          <View
            key={i}
            className={cn("h-2 rounded-full", i === page ? "w-6 bg-brand" : "w-2 bg-line")}
          />
        ))}
      </View>

      {/* CTA */}
      <View className="gap-3 px-6 pb-4">
        <SpecularButton label={last ? "Get started" : "Next"} full onPress={next} />
      </View>
    </Screen>
  );
}
