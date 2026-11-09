import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Input } from "@/components/ui/Input";
import { Chip } from "@/components/ui/Chip";
import { SpecularButton } from "@/components/ui/SpecularButton";
import { present } from "@/lib/format";
import { useDistricts, usePropertyTypes, useRealEstateTypes, useRequestListing, useStates } from "@/lib/listings";
import { useTheme } from "@/lib/theme";
import type { Id } from "@/lib/types";

/** POST /masters/propertylistingrequest — the ops team follows up to verify. */
export default function AddProperty() {
  const router = useRouter();
  const { c } = useTheme();
  const reTypes = useRealEstateTypes();
  const pTypes = usePropertyTypes();
  const states = useStates();
  const districts = useDistricts();
  const request = useRequestListing();

  const [reType, setReType] = useState<Id | null>(null);
  const [pType, setPType] = useState<Id | null>(null);
  const [stateId, setStateId] = useState<Id | null>(null);
  const [districtId, setDistrictId] = useState<Id | null>(null);
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const ptOpts = (pTypes.data ?? []).filter((t) => t.real_estate_type_id === reType && present(t.type_name));
  const dOpts = (districts.data ?? []).filter((d) => d.state_id === stateId && present(d.name));
  const loading = reTypes.isLoading || pTypes.isLoading || states.isLoading || districts.isLoading;
  const loadError = [reTypes, pTypes, states, districts].find((q) => q.isError)?.error;

  const submit = () => {
    if (!reType || !pType || !districtId) return setError("Choose a purpose, property type and district.");
    if (address.trim().length < 3) return setError("Add the property address.");
    if (description.trim().length < 10) return setError("Describe the property (10+ characters).");
    setError(null);
    request.mutate(
      {
        real_estate_type_master_id: reType,
        property_type_master_id: pType,
        property_district_id: districtId,
        property_address: address.trim(),
        property_description: description.trim(),
      },
      {
        onSuccess: (r) => {
          Alert.alert(
            "Request submitted",
            typeof r.msg === "string" ? r.msg : "Our team will contact you to verify the property.",
          );
          router.replace("/(owner)/properties");
        },
        onError: (e) => setError(e.message),
      },
    );
  };

  return (
    <Screen edges={["top", "bottom"]}>
      <View className="flex-row items-center gap-2 px-4 pb-2 pt-1">
        <Pressable onPress={() => router.back()} hitSlop={10} className="p-1" accessibilityRole="button" accessibilityLabel="Back">
          <ChevronLeft size={26} color={c.fg} />
        </Pressable>
        <Text className="flex-1 text-2xl font-extrabold text-fg">List a property</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <Text className="text-sm text-muted">
            Tell us about your property. Our verification team will contact you before it goes public.
          </Text>
          {loading ? <Text className="text-sm text-muted">Loading options…</Text> : null}
          {loadError ? <Text className="text-sm text-warning">{loadError.message}</Text> : null}

          <Group label="Purpose">
            {(reTypes.data ?? []).map((t) => (
              <Chip
                key={t.id}
                label={t.type_name}
                active={reType === t.id}
                onPress={() => {
                  setReType(t.id);
                  setPType(null);
                }}
              />
            ))}
          </Group>
          {reType ? (
            <Group label="Property type">
              {ptOpts.map((t) => (
                <Chip key={t.id} label={t.type_name} active={pType === t.id} onPress={() => setPType(t.id)} />
              ))}
            </Group>
          ) : null}
          <Group label="State">
            {(states.data ?? []).map((s) => (
              <Chip
                key={s.id}
                label={s.name}
                active={stateId === s.id}
                onPress={() => {
                  setStateId(s.id);
                  setDistrictId(null);
                }}
              />
            ))}
          </Group>
          {stateId ? (
            <Group label="District">
              {dOpts.map((d) => (
                <Chip key={d.id} label={d.name} active={districtId === d.id} onPress={() => setDistrictId(d.id)} />
              ))}
            </Group>
          ) : null}

          <Input label="Address" value={address} onChangeText={setAddress} placeholder="Locality, landmark" />
          <Input
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Size, rooms, price expectation…"
            multiline
            numberOfLines={4}
            style={{ height: 110, textAlignVertical: "top" }}
          />
          {error ? <Text className="text-sm text-warning">{error}</Text> : null}
          <SpecularButton label="Submit request" full loading={request.isPending} onPress={submit} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="gap-2.5">
      <Text className="text-sm font-semibold text-fg">{label}</Text>
      <View className="flex-row flex-wrap gap-2">{children}</View>
    </View>
  );
}
