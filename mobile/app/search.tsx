import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, SlidersHorizontal, Search as SearchIcon } from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Input } from "@/components/ui/Input";
import { SpecularButton } from "@/components/ui/SpecularButton";
import { PropertyCard } from "@/components/PropertyCard";
import { FilterSheet } from "@/components/FilterSheet";
import { hasFilters, useSearch } from "@/lib/listings";
import { useTheme } from "@/lib/theme";
import type { SearchFilters } from "@/lib/types";

const num = (v?: string) => (v && Number(v) > 0 ? Number(v) : undefined);

export default function SearchScreen() {
  const router = useRouter();
  const { c } = useTheme();
  const params = useLocalSearchParams<{ q?: string; state?: string; district?: string; type?: string }>();

  const [filters, setFilters] = useState<Omit<SearchFilters, "search">>({
    real_estate_type_id: num(params.type),
    state_id: num(params.state),
    district_id: num(params.district),
  });
  const [q, setQ] = useState(params.q ?? "");
  const [debouncedQ, setDebouncedQ] = useState(q);
  const [sheet, setSheet] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 350);
    return () => clearTimeout(t);
  }, [q]);

  const filtered = hasFilters(filters);
  const query = useSearch({ ...filters, search: debouncedQ });
  const results = query.data?.pages.flatMap((p) => p.data) ?? [];
  const total = query.data?.pages[0]?.pagination.total ?? 0;
  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <Screen>
      <View className="flex-row items-center gap-2 px-4 pb-3 pt-1">
        <Pressable onPress={() => router.back()} hitSlop={10} className="p-1" accessibilityRole="button" accessibilityLabel="Back">
          <ChevronLeft size={26} color={c.fg} />
        </Pressable>
        <View className="flex-1">
          <Input
            value={q}
            onChangeText={setQ}
            placeholder={filtered ? "Clear filters to search by text" : "Search address or city…"}
            editable={!filtered}
            autoCorrect={false}
            returnKeyType="search"
          />
        </View>
        <Pressable
          onPress={() => setSheet(true)}
          accessibilityRole="button"
          accessibilityLabel="Open filters"
          className="h-12 w-12 items-center justify-center rounded-2xl border border-line bg-surface/60"
        >
          <SlidersHorizontal size={20} color={c.brand} />
          {activeCount > 0 ? (
            <View className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-accent">
              <Text className="text-[10px] font-bold text-white">{activeCount}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <FlatList
        data={results}
        keyExtractor={(p) => String(p.id)}
        renderItem={({ item }) => <PropertyCard p={item} />}
        contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 32 }}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
        }}
        ListHeaderComponent={
          <Text className="text-sm text-muted">
            {query.isLoading ? "Searching…" : `${total} verified ${total === 1 ? "result" : "results"}`}
          </Text>
        }
        ListFooterComponent={query.isFetchingNextPage ? <ActivityIndicator color={c.brand} /> : null}
        ListEmptyComponent={
          query.isLoading ? null : query.isError ? (
            <View className="items-center gap-3 py-24">
              <Text className="text-base font-semibold text-fg">Couldn't load results</Text>
              <Text className="text-center text-sm text-muted">{query.error.message}</Text>
              <SpecularButton label="Retry" variant="outline" onPress={() => query.refetch()} />
            </View>
          ) : (
            <View className="items-center gap-2 py-24">
              <SearchIcon size={40} color={c.subtle} />
              <Text className="text-base font-semibold text-fg">No matches</Text>
              <Text className="text-center text-sm text-muted">Try widening your filters or a different area.</Text>
            </View>
          )
        }
      />

      <FilterSheet visible={sheet} value={filters} onApply={setFilters} onClose={() => setSheet(false)} />
    </Screen>
  );
}
