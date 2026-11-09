import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { CalendarCheck, Heart, MapPin } from "lucide-react-native";
import { Cover } from "./Cover";
import { VerifiedBadge } from "./VerifiedBadge";
import { assetUrl } from "@/lib/api";
import { present, relativeDate } from "@/lib/format";
import { useSaved } from "@/lib/saved";
import { useTheme } from "@/lib/theme";
import type { ListingSummary } from "@/lib/types";

export function listingTitle(p: ListingSummary): string {
  return [present(p.property_type) ? p.property_type : null, p.real_estate_type].filter(Boolean).join(" · ");
}

export function listingLocality(p: ListingSummary): string {
  return [p.city_name, p.district_name].filter(present).join(", ");
}

export function PropertyCard({ p, booking = false }: { p: ListingSummary; booking?: boolean }) {
  const router = useRouter();
  const { c } = useTheme();
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(p.slug);
  const thumb = assetUrl("property", p.thumbnail);
  const title = listingTitle(p);
  const locality = listingLocality(p);

  return (
    <Pressable
      onPress={() => router.push(`/listing/${p.slug}`)}
      className="overflow-hidden rounded-3xl border border-line/70 bg-surface/70"
    >
      <View className="h-48 w-full">
        <Cover uri={thumb} seed={p.id} rounded={false} style={{ flex: 1 }} />
        <View className="absolute left-3 top-3">
          <VerifiedBadge size="sm" />
        </View>
        <Pressable
          onPress={() => toggle({ slug: p.slug, title, thumbnail: thumb, subtitle: p.real_estate_type, locality })}
          accessibilityRole="button"
          accessibilityLabel={saved ? "Remove from saved" : "Save listing"}
          className="absolute right-3 top-3 h-9 w-9 items-center justify-center rounded-full bg-black/35"
        >
          <Heart size={18} color="#fff" fill={saved ? "#fff" : "transparent"} />
        </Pressable>
        {booking ? (
          <View className="absolute bottom-3 left-3 flex-row items-center gap-1 rounded-full bg-accent px-2.5 py-1">
            <CalendarCheck size={12} color="#fff" />
            <Text className="text-[11px] font-bold text-white">SITE VISIT</Text>
          </View>
        ) : null}
      </View>

      <View className="gap-1.5 p-4">
        <Text numberOfLines={1} className="text-base font-semibold text-fg">
          {title}
        </Text>
        <View className="flex-row items-center gap-1">
          <MapPin size={14} color={c.subtle} />
          <Text numberOfLines={1} className="flex-1 text-sm text-muted">
            {p.property_address ? `${p.property_address} · ${locality}` : locality}
          </Text>
        </View>
        <Text className="text-xs text-subtle">Listed {relativeDate(p.date_listed)}</Text>
      </View>
    </Pressable>
  );
}
