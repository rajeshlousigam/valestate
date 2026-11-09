import { ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import {
  Bell,
  ChevronRight,
  Building2,
  LogOut,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { BrandMark } from "@/components/BrandLogo";
import { GlassCard } from "@/components/ui/GlassCard";
import { SpecularButton } from "@/components/ui/SpecularButton";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { Pressable } from "react-native";

export default function Account() {
  const router = useRouter();
  const { c } = useTheme();
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <Screen className="items-center justify-center gap-5 px-8">
        <BrandMark size={72} />
        <Text className="text-center text-xl font-bold text-fg">Welcome to Estara Properties</Text>
        <Text className="text-center text-sm text-muted">
          Log in to send enquiries, book site visits, and list your property.
        </Text>
        <View className="w-full gap-3">
          <SpecularButton label="Log in" full onPress={() => router.push("/(auth)/login")} />
          <SpecularButton
            label="Create account"
            variant="outline"
            full
            onPress={() => router.push("/(auth)/signup")}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 18, paddingBottom: 32 }}>
        {/* Profile */}
        <GlassCard>
          <View className="flex-row items-center gap-4 p-5">
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-brand">
              <Text className="text-xl font-bold text-white">
                {(user.name || user.phone).charAt(0).toUpperCase()}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-fg">{user.name || "Customer"}</Text>
              <Text className="text-sm text-muted">{user.phone}</Text>
            </View>
          </View>
          <Divider />
          <Row
            icon={<UserRound size={20} color={c.brand} />}
            label="Edit profile"
            subtitle="Details & phone number"
            onPress={() => router.push("/profile")}
          />
        </GlassCard>

        {/* Owner tools */}
        <View className="gap-2">
          <Text className="px-1 text-sm font-semibold text-muted">Owner</Text>
          <GlassCard>
            <Row
              icon={<Building2 size={20} color={c.brand} />}
              label="My listing requests"
              onPress={() => router.push("/(owner)/properties")}
            />
            <Divider />
            <Row
              icon={<PlusCircle size={20} color={c.brand} />}
              label="List a property"
              onPress={() => router.push("/(owner)/add-property")}
            />
          </GlassCard>
        </View>

        {/* Preferences */}
        <View className="gap-2">
          <Text className="px-1 text-sm font-semibold text-muted">Preferences</Text>
          <GlassCard>
            <Row icon={<Bell size={20} color={c.muted} />} label="Notifications" subtitle="Coming soon" />
            <Divider />
            <Row
              icon={<ShieldCheck size={20} color={c.muted} />}
              label="How verification works"
              subtitle="Every listing is human-checked"
            />
            <Divider />
            <Row
              icon={<Sparkles size={20} color={c.muted} />}
              label="See the intro again"
              onPress={() => router.push("/onboarding")}
            />
          </GlassCard>
        </View>

        <SpecularButton
          label="Log out"
          variant="outline"
          full
          icon={<LogOut size={18} color={c.brand} />}
          onPress={logout}
        />
      </ScrollView>
    </Screen>
  );
}

function Row({
  icon,
  label,
  subtitle,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  onPress?: () => void;
}) {
  const { c } = useTheme();
  return (
    <Pressable onPress={onPress} className="flex-row items-center gap-3 p-4">
      {icon}
      <View className="flex-1">
        <Text className="font-semibold text-fg">{label}</Text>
        {subtitle ? <Text className="text-xs text-subtle">{subtitle}</Text> : null}
      </View>
      {onPress ? <ChevronRight size={18} color={c.subtle} /> : null}
    </Pressable>
  );
}

function Divider() {
  return <View className="h-px bg-line" />;
}
