import { FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Building2, ChevronLeft, Plus } from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { GlassCard } from "@/components/ui/GlassCard";
import { SpecularButton } from "@/components/ui/SpecularButton";
import { useHistory } from "@/lib/listings";
import { formatDate, present } from "@/lib/format";
import { useTheme } from "@/lib/theme";

/** Listing requests the customer has submitted (myhistory.property_listing_request_history). */
export default function OwnerProperties() {
  const router = useRouter();
  const { c } = useTheme();
  const history = useHistory();
  const items = history.data?.property_listing_request_history ?? [];

  return (
    <Screen>
      <View className="flex-row items-center gap-2 px-4 pb-2 pt-1">
        <Pressable onPress={() => router.back()} hitSlop={10} className="p-1" accessibilityRole="button" accessibilityLabel="Back">
          <ChevronLeft size={26} color={c.fg} />
        </Pressable>
        <Text className="flex-1 text-2xl font-extrabold text-fg">My listing requests</Text>
        <Pressable
          onPress={() => router.push("/(owner)/add-property")}
          accessibilityRole="button"
          accessibilityLabel="Request a new listing"
          className="h-11 w-11 items-center justify-center rounded-2xl bg-brand"
        >
          <Plus size={22} color="#fff" />
        </Pressable>
      </View>

      <FlatList
        data={items}
        keyExtractor={(p) => String(p.id)}
        contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={history.isRefetching} onRefresh={() => history.refetch()} tintColor={c.brand} />
        }
        renderItem={({ item }) => (
          <GlassCard>
            <View className="gap-1.5 p-4">
              <Text className="font-semibold text-fg">
                {[item.property_type, item.real_estate_type].filter(present).join(" · ")}
              </Text>
              <Text className="text-sm text-fg/75">
                {[item.property_address, item.property_district].filter(present).join(", ")}
              </Text>
              {present(item.description) ? (
                <Text numberOfLines={2} className="text-xs text-muted">
                  {item.description}
                </Text>
              ) : null}
              <Text className="text-xs text-subtle">Requested {formatDate(item.apply_date)}</Text>
            </View>
          </GlassCard>
        )}
        ListEmptyComponent={
          history.isLoading ? (
            <Text className="py-24 text-center text-muted">Loading…</Text>
          ) : history.isError ? (
            <View className="items-center gap-3 py-24">
              <Text className="text-base font-semibold text-fg">Couldn't load requests</Text>
              <Text className="text-center text-sm text-muted">{history.error.message}</Text>
              <SpecularButton label="Retry" variant="outline" onPress={() => history.refetch()} />
            </View>
          ) : (
            <View className="items-center gap-3 py-24">
              <Building2 size={40} color={c.subtle} />
              <Text className="text-base font-semibold text-fg">No listing requests yet</Text>
              <Text className="text-center text-sm text-muted">
                Tell us about your property — our team will verify it before it goes public.
              </Text>
              <SpecularButton label="List a property" onPress={() => router.push("/(owner)/add-property")} />
            </View>
          )
        }
      />
    </Screen>
  );
}
