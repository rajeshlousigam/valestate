import { FlatList, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Heart, Trash2 } from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Cover } from "@/components/Cover";
import { useSaved } from "@/lib/saved";
import { useTheme } from "@/lib/theme";

export default function Saved() {
  const router = useRouter();
  const { c } = useTheme();
  const { items, toggle } = useSaved();

  return (
    <Screen>
      <View className="px-5 pb-2 pt-2">
        <Text className="text-2xl font-extrabold text-fg">Saved</Text>
        <Text className="text-sm text-muted">Listings you're interested in</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(i) => i.slug}
        contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 32 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/listing/${item.slug}`)}
            className="flex-row items-center gap-3 overflow-hidden rounded-3xl border border-line/70 bg-surface/70 p-3"
          >
            <Cover uri={item.thumbnail} seed={item.slug.length} style={{ width: 92, height: 92 }} />
            <View className="flex-1 gap-1">
              <Text className="text-xs font-bold uppercase text-brand">{item.subtitle}</Text>
              <Text numberOfLines={2} className="font-semibold text-fg">
                {item.title}
              </Text>
              <Text className="text-xs text-subtle">{item.locality}</Text>
            </View>
            <Pressable onPress={() => toggle(item)} hitSlop={10} className="p-2">
              <Trash2 size={20} color={c.muted} />
            </Pressable>
          </Pressable>
        )}
        ListEmptyComponent={
          <View className="items-center gap-2 py-28">
            <Heart size={40} color={c.subtle} />
            <Text className="text-base font-semibold text-fg">Nothing saved yet</Text>
            <Text className="text-center text-sm text-muted">
              Tap the heart on any listing to keep it here.
            </Text>
          </View>
        }
      />
    </Screen>
  );
}
