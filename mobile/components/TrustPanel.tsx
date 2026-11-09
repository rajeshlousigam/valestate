import { Text, View } from "react-native";
import { BadgeCheck, ShieldCheck } from "lucide-react-native";
import { GlassCard } from "./ui/GlassCard";
import { formatDate } from "@/lib/format";
import { useHowVerify } from "@/lib/listings";
import { useTheme } from "@/lib/theme";

/** Verification explainer; steps come from GET /masters/howverify. */
export function TrustPanel({ listedOn }: { listedOn: string }) {
  const { c } = useTheme();
  const { data: blocks = [] } = useHowVerify();
  const block = blocks[0];

  return (
    <GlassCard>
      <View className="p-5">
        <View className="flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-brand">
            <ShieldCheck size={22} color="#fff" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-fg">{block?.header ?? "Verified listing"}</Text>
            <Text className="text-xs text-muted">Published {formatDate(listedOn)}</Text>
          </View>
        </View>

        {block?.types.length ? (
          <View className="mt-5 gap-3">
            {block.types.map((step) => (
              <View key={step.id} className="flex-row gap-2.5">
                <BadgeCheck size={18} color={c.brand} />
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-fg/90">{step.title}</Text>
                  <Text className="text-xs text-muted">{step.notes}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {block?.short_notes ? (
          <View className="mt-5 rounded-2xl bg-brand-soft/60 p-3">
            <Text className="text-xs leading-relaxed text-fg/70">{block.short_notes}</Text>
          </View>
        ) : null}
      </View>
    </GlassCard>
  );
}
