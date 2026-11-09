import { RefreshControl, SectionList, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { CalendarCheck, Inbox, MessageCircle } from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { GlassCard } from "@/components/ui/GlassCard";
import { SpecularButton } from "@/components/ui/SpecularButton";
import { useHistory } from "@/lib/listings";
import { useAuth } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { useTheme } from "@/lib/theme";

type Row = { key: string; title: string; address: string; code: string; meta: string; status?: string };

export default function Activity() {
  const router = useRouter();
  const { c } = useTheme();
  const { user } = useAuth();
  const history = useHistory();

  if (!user) {
    return (
      <Screen className="items-center justify-center gap-4 px-8">
        <Inbox size={44} color={c.subtle} />
        <Text className="text-center text-lg font-bold text-fg">Sign in to see your activity</Text>
        <Text className="text-center text-sm text-muted">Your enquiries and site-visit bookings live here.</Text>
        <SpecularButton label="Log in" onPress={() => router.push("/(auth)/login")} />
      </Screen>
    );
  }

  const h = history.data;
  const sections = [
    {
      title: "Site visits",
      icon: <CalendarCheck size={16} color={c.brand} />,
      data: (h?.site_booking_history ?? []).map<Row>((b) => ({
        key: `b${b.id}`,
        title: b.title_property,
        address: b.property_address,
        code: b.booking_code,
        meta: `${formatDate(b.booking_date)} · ${b.time_slot}`,
        status: b.status,
      })),
    },
    {
      title: "Enquiries",
      icon: <MessageCircle size={16} color={c.brand} />,
      data: (h?.property_enquiry_history ?? []).map<Row>((e) => ({
        key: `e${e.id}`,
        title: e.title_property,
        address: e.property_address,
        code: e.enquiry_code,
        meta: formatDate(e.enquiry_date),
      })),
    },
  ].filter((s) => s.data.length);

  return (
    <Screen>
      <View className="px-5 pb-2 pt-2">
        <Text className="text-2xl font-extrabold text-fg">Activity</Text>
        <Text className="text-sm text-muted">Your site visits and enquiries</Text>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(r) => r.key}
        contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={history.isRefetching} onRefresh={() => history.refetch()} tintColor={c.brand} />
        }
        renderSectionHeader={({ section }) => (
          <View className="flex-row items-center gap-2 pb-1 pt-2">
            {section.icon}
            <Text className="text-sm font-semibold text-muted">{section.title}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <GlassCard>
            <View className="gap-1.5 p-4">
              <View className="flex-row items-start justify-between gap-3">
                <Text className="flex-1 font-semibold text-fg" numberOfLines={1}>
                  {item.title}
                </Text>
                {item.status ? <StatusPill status={item.status} /> : null}
              </View>
              <Text numberOfLines={1} className="text-sm text-fg/75">
                {item.address}
              </Text>
              <Text className="text-xs text-subtle">
                {item.code} · {item.meta}
              </Text>
            </View>
          </GlassCard>
        )}
        ListEmptyComponent={
          history.isLoading ? (
            <Text className="py-28 text-center text-muted">Loading…</Text>
          ) : history.isError ? (
            <View className="items-center gap-3 py-28">
              <Text className="text-base font-semibold text-fg">Couldn't load activity</Text>
              <Text className="text-center text-sm text-muted">{history.error.message}</Text>
              <SpecularButton label="Retry" variant="outline" onPress={() => history.refetch()} />
            </View>
          ) : (
            <View className="items-center gap-2 py-28">
              <Inbox size={40} color={c.subtle} />
              <Text className="text-base font-semibold text-fg">No activity yet</Text>
              <Text className="text-center text-sm text-muted">
                Send an enquiry or book a site visit from any listing.
              </Text>
            </View>
          )
        }
      />
    </Screen>
  );
}

function StatusPill({ status }: { status: string }) {
  const bad = /cancel|reject/i.test(status);
  return (
    <View className={bad ? "rounded-full bg-warning/20 px-2.5 py-1" : "rounded-full bg-brand/15 px-2.5 py-1"}>
      <Text className={bad ? "text-[11px] font-bold text-warning" : "text-[11px] font-bold text-brand"}>{status}</Text>
    </View>
  );
}
