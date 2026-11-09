import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Search, ShieldCheck } from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { BrandLockup } from "@/components/BrandLogo";
import { Cover } from "@/components/Cover";
import { PropertyCard } from "@/components/PropertyCard";
import { assetUrl } from "@/lib/api";
import { useBanners, useLatestBooking, useLatestEnquiry, useRealEstateTypes } from "@/lib/listings";
import { brandGradient, useTheme } from "@/lib/theme";
import type { ListingSummary } from "@/lib/types";

export default function Home() {
  const router = useRouter();
  const { c } = useTheme();
  const { width } = useWindowDimensions();
  const banners = useBanners();
  const types = useRealEstateTypes();
  const enquiry = useLatestEnquiry();
  const booking = useLatestBooking();

  const refreshing = enquiry.isRefetching || booking.isRefetching;
  const refresh = () => {
    banners.refetch();
    types.refetch();
    enquiry.refetch();
    booking.refetch();
  };

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 28 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={c.brand} />}
      >
        <LinearGradient
          colors={brandGradient(c)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 26 }}
        >
          <BrandLockup light />
          <View className="mt-4 flex-row items-center gap-2">
            <ShieldCheck size={18} color="#fff" />
            <Text className="text-xs font-semibold uppercase tracking-wider text-white/90">
              Verification-first · Imphal
            </Text>
          </View>
          <Text className="mt-3 text-3xl font-extrabold leading-tight text-white">
            Find a home you can{"\n"}actually trust.
          </Text>
          <Text className="mt-2 text-sm text-white/85">
            Every listing is checked by a human before it goes public.
          </Text>

          <Pressable
            onPress={() => router.push("/search")}
            accessibilityRole="search"
            className="mt-5 flex-row items-center gap-3 rounded-2xl bg-white px-4 py-4"
          >
            <Search size={20} color={c.brand} />
            <Text className="text-base text-subtle">Search address or city…</Text>
          </Pressable>
        </LinearGradient>

        {banners.data?.length ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingTop: 20 }}
          >
            {banners.data.map((b) => (
              <View key={b.id} style={{ width: width * 0.78 }} className="overflow-hidden rounded-3xl">
                <Cover uri={assetUrl("banner", b.image)} seed={b.id} rounded={false} style={{ height: 140 }} />
                <View className="absolute bottom-0 w-full bg-black/45 px-4 py-2.5">
                  <Text numberOfLines={1} className="font-bold text-white">{b.title}</Text>
                  <Text numberOfLines={1} className="text-xs text-white/85">{b.body}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        ) : null}

        {types.data?.length ? (
          <View className="mt-6">
            <SectionHeader title="Browse by purpose" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 10, paddingTop: 12 }}
            >
              {types.data.map((t) => (
                <Pressable
                  key={t.id}
                  onPress={() => router.push(`/search?type=${t.id}`)}
                  className="w-32 overflow-hidden rounded-2xl border border-line bg-surface/70"
                >
                  <Cover uri={assetUrl("realestate", t.real_estate_img)} seed={t.id} rounded={false} style={{ height: 72 }} />
                  <Text numberOfLines={1} className="px-3 py-2 font-semibold text-fg">{t.type_name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}

        <Section
          title="Site visits available"
          items={booking.data}
          loading={booking.isLoading}
          error={booking.isError ? booking.error.message : null}
          booking
          onAction={() => router.push("/search")}
        />
        <Section
          title="Newly listed"
          items={enquiry.data}
          loading={enquiry.isLoading}
          error={enquiry.isError ? enquiry.error.message : null}
          onAction={() => router.push("/search")}
        />
      </ScrollView>
    </Screen>
  );
}

function Section({
  title,
  items,
  loading,
  error,
  booking = false,
  onAction,
}: {
  title: string;
  items?: ListingSummary[];
  loading: boolean;
  error: string | null;
  booking?: boolean;
  onAction: () => void;
}) {
  const { c } = useTheme();
  if (!loading && !error && !items?.length) return null;
  return (
    <View className="mt-7">
      <SectionHeader title={title} action="See all" onAction={onAction} />
      <View className="gap-4 px-5 pt-3">
        {loading ? <ActivityIndicator color={c.brand} /> : null}
        {error ? <Text className="text-sm text-warning">{error}</Text> : null}
        {items?.map((p) => <PropertyCard key={p.id} p={p} booking={booking} />)}
      </View>
    </View>
  );
}

function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View className="flex-row items-center justify-between px-5">
      <Text className="text-xl font-bold text-fg">{title}</Text>
      {action ? (
        <Pressable onPress={onAction} accessibilityRole="button">
          <Text className="text-sm font-semibold text-brand">{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
