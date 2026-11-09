import { useState } from "react";
import { ScrollView, View, useWindowDimensions } from "react-native";
import { Cover } from "./Cover";
import { cn } from "@/lib/utils";

/** Swipeable, paged photo gallery for the listing detail hero. */
export function Gallery({ uris, seed = 0, height = 300 }: { uris: string[]; seed?: number; height?: number }) {
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);
  const imgs: (string | undefined)[] = uris.length ? uris : [undefined];

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) =>
          setPage(Math.round(e.nativeEvent.contentOffset.x / width))
        }
      >
        {imgs.map((uri, i) => (
          <Cover key={uri ?? `empty-${i}`} uri={uri} seed={seed + i} rounded={false} style={{ width, height }} />
        ))}
      </ScrollView>
      {imgs.length > 1 ? (
        <View className="absolute bottom-3 w-full flex-row justify-center gap-1.5">
          {imgs.map((uri, i) => (
            <View
              key={uri ?? `dot-${i}`}
              className={cn(
                "h-1.5 rounded-full",
                i === page ? "w-5 bg-white" : "w-1.5 bg-white/50",
              )}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
