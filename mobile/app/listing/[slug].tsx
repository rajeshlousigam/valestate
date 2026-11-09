import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CalendarCheck, ChevronLeft, Heart, MapPin, MessageCircle } from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { GlassCard } from "@/components/ui/GlassCard";
import { Chip } from "@/components/ui/Chip";
import { SpecularButton } from "@/components/ui/SpecularButton";
import { Gallery } from "@/components/Gallery";
import { TrustPanel } from "@/components/TrustPanel";
import { ApiError, assetUrl, isBookingMode } from "@/lib/api";
import { costLabel, formatINR, present, relativeDate } from "@/lib/format";
import { useBookSite, useDetail, useEnquire } from "@/lib/listings";
import { useSaved } from "@/lib/saved";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import type { Id } from "@/lib/types";

export default function ListingDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { c } = useTheme();
  const { user } = useAuth();
  const { isSaved, toggle } = useSaved();
  const { data, isLoading, isError, error, refetch } = useDetail(String(slug ?? ""));
  const enquire = useEnquire();
  const book = useBookSite();
  const [slotId, setSlotId] = useState<Id | null>(null);

  if (isLoading || isError || !data) {
    return (
      <Screen className="items-center justify-center gap-3 px-8">
        <Text className="text-center text-muted">
          {isLoading ? "Loading…" : isError ? error.message : "Listing not found."}
        </Text>
        {isError ? <SpecularButton label="Retry" variant="outline" onPress={() => refetch()} /> : null}
        {!isLoading ? <SpecularButton label="Go back" variant="ghost" onPress={() => router.back()} /> : null}
      </Screen>
    );
  }

  const p = data.property;
  const booking = isBookingMode(p.request_mode);
  const images = data.images.map((i) => assetUrl("property", i.prop_img)).filter((u): u is string => !!u);
  const price = costLabel(p.rent_or_cost, p.rent_cost_type);
  const deposit = Number(p.deposit) > 0 ? formatINR(Number(p.deposit)) : null;
  const locality = [p.city_name, p.district_name, p.state_name].filter(present).join(", ");
  const saved = isSaved(p.slug);
  const busy = enquire.isPending || book.isPending;

  const requireLogin = () => {
    if (user) return false;
    router.push("/(auth)/login");
    return true;
  };

  const onError = (e: unknown) => {
    if (e instanceof ApiError && e.status === 401) {
      router.push("/(auth)/login");
      return;
    }
    Alert.alert("Couldn't complete that", e instanceof Error ? e.message : "Please try again.");
  };

  const submitEnquiry = () => {
    if (requireLogin()) return;
    enquire.mutate(p.id, {
      onSuccess: (r) =>
        Alert.alert("Enquiry sent", `${typeof r.msg === "string" ? r.msg : ""} Track it under Activity.`.trim()),
      onError,
    });
  };

  const submitBooking = () => {
    if (requireLogin()) return;
    if (!slotId) {
      Alert.alert("Pick a time slot", "Choose one of the available slots for today's visit.");
      return;
    }
    book.mutate(
      { propertyId: p.id, timeSlotId: slotId },
      {
        onSuccess: (r) => {
          const code = (r.data as { booking_code?: string } | undefined)?.booking_code;
          Alert.alert("Site visit booked", code ? `Booking code: ${code}` : "Track it under Activity.");
        },
        onError,
      },
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View>
          <Gallery uris={images} seed={p.id} height={320} />
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Back"
            className="absolute left-4 top-12 h-10 w-10 items-center justify-center rounded-full bg-black/40"
          >
            <ChevronLeft size={24} color="#fff" />
          </Pressable>
          <Pressable
            onPress={() =>
              toggle({ slug: p.slug, title: p.title_property, thumbnail: images[0], subtitle: p.real_estate_type, locality })
            }
            accessibilityRole="button"
            accessibilityLabel={saved ? "Remove from saved" : "Save listing"}
            className="absolute right-4 top-12 h-10 w-10 items-center justify-center rounded-full bg-black/40"
          >
            <Heart size={20} color="#fff" fill={saved ? "#fff" : "transparent"} />
          </Pressable>
        </View>

        <View className="gap-5 p-5">
          <View className="gap-1">
            {price ? <Text className="text-2xl font-extrabold text-brand">{price}</Text> : null}
            <Text className="text-xl font-bold text-fg">{p.title_property}</Text>
            <View className="flex-row items-center gap-1.5">
              <MapPin size={15} color={c.subtle} />
              <Text className="flex-1 text-sm text-muted">
                {[p.address, locality].filter(present).join(" · ")}
              </Text>
            </View>
            <Text className="text-xs text-subtle">Listed {relativeDate(p.date_listed)}</Text>
          </View>

          <GlassCard>
            <View className="flex-row flex-wrap gap-y-4 p-4">
              <Spec label="Purpose" value={p.real_estate_type} />
              {present(p.property_type) ? <Spec label="Type" value={p.property_type} /> : null}
              {deposit ? <Spec label="Deposit" value={deposit} /> : null}
              {present(p.owner_name) ? <Spec label="Owner" value={p.owner_name} /> : null}
            </View>
          </GlassCard>

          {booking ? (
            <View className="gap-2.5">
              <Text className="text-lg font-bold text-fg">Book a site visit today</Text>
              {data.time_slots.length ? (
                <View className="flex-row flex-wrap gap-2">
                  {data.time_slots.map((s) => (
                    <Chip key={s.id} label={s.slot_name} active={slotId === s.id} onPress={() => setSlotId(s.id)} />
                  ))}
                </View>
              ) : (
                <Text className="text-sm text-muted">No slots available today.</Text>
              )}
            </View>
          ) : null}

          <TrustPanel listedOn={p.date_listed} />

          {present(p.about_property) ? (
            <View className="gap-2">
              <Text className="text-lg font-bold text-fg">About this property</Text>
              <Text className="text-sm leading-relaxed text-fg/80">{p.about_property}</Text>
            </View>
          ) : null}

          {data.features.length ? (
            <View className="gap-2.5">
              <Text className="text-lg font-bold text-fg">Features</Text>
              <View className="flex-row flex-wrap gap-2">
                {data.features.map((f) => (
                  <View key={f.id} className="rounded-full border border-line bg-surface/60 px-3 py-1.5">
                    <Text className="text-xs text-fg/80">{f.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 w-full flex-row items-center gap-3 border-t border-line bg-surface px-5 pb-8 pt-3">
        <View className="flex-1">
          <Text className="text-xs text-subtle">{p.real_estate_type}</Text>
          <Text numberOfLines={1} className="text-base font-bold text-fg">
            {price ?? p.title_property}
          </Text>
        </View>
        {booking ? (
          <SpecularButton
            label="Book visit"
            icon={<CalendarCheck size={18} color="#fff" />}
            loading={busy}
            disabled={!data.time_slots.length}
            onPress={submitBooking}
          />
        ) : (
          <SpecularButton
            label="Send enquiry"
            icon={<MessageCircle size={18} color="#fff" />}
            loading={busy}
            onPress={submitEnquiry}
          />
        )}
      </View>
    </View>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <View className="w-1/2 gap-0.5 pr-2">
      <Text className="text-xs text-subtle">{label}</Text>
      <Text className="text-base font-semibold text-fg">{value}</Text>
    </View>
  );
}
