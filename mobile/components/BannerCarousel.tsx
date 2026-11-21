import { useCallback, useEffect, useRef, useState } from "react";
import { AccessibilityInfo, AppState, FlatList, Pressable, View, type ViewToken } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { Cover } from "./Cover";
import { cn } from "@/lib/utils";

/** mobile: 16:9 (1600×900) · desktop: 2.34:1 (1920×820). Either may be missing. */
export type Slide = { id: number; title: string; mobile?: string; desktop?: string };

const TABLET_MIN_WIDTH = 768; // tablets and up get the wide desktop artwork
const MOBILE_RATIO = 16 / 9;
const DESKTOP_RATIO = 1920 / 820;

const INTERVAL_MS = 5000;
const GAP = 12;

/**
 * Auto-advancing banner carousel that loops (last → first), with side arrows
 * and dots. Pauses while the user is dragging, when the app is backgrounded,
 * and doesn't autoplay with "Reduce motion" on.
 */
export function BannerCarousel({ slides, width }: { slides: Slide[]; width: number }) {
  const n = slides.length;
  const list = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [active, setActive] = useState(true);
  const [reduced, setReduced] = useState(false);
  const itemW = width - 40; // 20px page gutters
  const snap = itemW + GAP;
  const wide = width >= TABLET_MIN_WIDTH;
  const pickUri = (s: Slide) => (wide ? s.desktop ?? s.mobile : s.mobile ?? s.desktop);
  // Slide height follows the artwork shown, so nothing is cropped.
  const slideH = Math.round(itemW / (wide && slides.some((s) => s.desktop) ? DESKTOP_RATIO : MOBILE_RATIO));

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then(setReduced)
      .catch((e: unknown) => console.warn("reduce-motion check failed", e));
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduced);
    const app = AppState.addEventListener("change", (s) => setActive(s === "active"));
    return () => {
      sub.remove();
      app.remove();
    };
  }, []);

  const goTo = useCallback(
    (i: number) => {
      if (!n) return;
      const next = ((i % n) + n) % n; // wrap both ways → loop
      list.current?.scrollToOffset({ offset: next * snap, animated: true });
      setIndex(next);
    },
    [n, snap],
  );

  useEffect(() => {
    if (n < 2 || dragging || !active || reduced) return;
    const t = setInterval(() => goTo(index + 1), INTERVAL_MS);
    return () => clearInterval(t);
  }, [n, dragging, active, reduced, index, goTo]);

  const onViewable = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const first = viewableItems[0];
    if (first?.index != null) setIndex(first.index);
  }).current;

  if (!n) return null;

  return (
    <View>
      <FlatList
        ref={list}
        data={slides}
        horizontal
        keyExtractor={(s) => String(s.id)}
        showsHorizontalScrollIndicator={false}
        snapToInterval={snap}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 20, gap: GAP }}
        onScrollBeginDrag={() => setDragging(true)}
        onScrollEndDrag={() => setDragging(false)}
        onViewableItemsChanged={onViewable}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        getItemLayout={(_, i) => ({ length: snap, offset: snap * i, index: i })}
        renderItem={({ item }) => (
          <View
            style={{ width: itemW, height: slideH }}
            className="overflow-hidden rounded-3xl"
            accessible
            accessibilityRole="image"
            accessibilityLabel={item.title}
          >
            <Cover uri={pickUri(item)} seed={item.id} rounded={false} style={{ flex: 1 }} />
          </View>
        )}
      />

      {n > 1 ? (
        <>
          <Arrow side="left" top={slideH / 2 - 22} onPress={() => goTo(index - 1)} />
          <Arrow side="right" top={slideH / 2 - 22} onPress={() => goTo(index + 1)} />
          <View className="mt-3 flex-row justify-center gap-1.5">
            {slides.map((s, i) => (
              <Pressable
                key={s.id}
                onPress={() => goTo(i)}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel={`Go to slide ${i + 1}`}
                className={cn("h-1.5 rounded-full", i === index ? "w-5 bg-brand" : "w-1.5 bg-subtle/50")}
              />
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}

function Arrow({ side, top, onPress }: { side: "left" | "right"; top: number; onPress: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={side === "left" ? "Previous banner" : "Next banner"}
      style={{ position: "absolute", top, [side]: 28 }}
      className="h-11 w-11 items-center justify-center rounded-full bg-black/45"
    >
      <Icon size={24} color="#fff" />
    </Pressable>
  );
}
