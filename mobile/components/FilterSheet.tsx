import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { X } from "lucide-react-native";
import { Chip } from "./ui/Chip";
import { SpecularButton } from "./ui/SpecularButton";
import { present } from "@/lib/format";
import { useBudgets, useDistricts, usePropertyTypes, useRealEstateTypes, useStates } from "@/lib/listings";
import { useTheme } from "@/lib/theme";
import type { Id, SearchFilters } from "@/lib/types";

type Filters = Omit<SearchFilters, "search">;
type Option = { id: Id; label: string };

/** Dependent dropdowns per API doc §8: property type + budget depend on the
 *  real-estate type; district depends on state. */
export function FilterSheet({
  visible,
  value,
  onApply,
  onClose,
}: {
  visible: boolean;
  value: Filters;
  onApply: (f: Filters) => void;
  onClose: () => void;
}) {
  const { c } = useTheme();
  const [f, setF] = useState<Filters>(value);
  const reTypes = useRealEstateTypes();
  const pTypes = usePropertyTypes();
  const budgets = useBudgets();
  const states = useStates();
  const districts = useDistricts();

  const setReType = (id?: Id) =>
    setF((cur) => ({ ...cur, real_estate_type_id: id, property_type_id: undefined, budget_id: undefined }));
  const setState = (id?: Id) => setF((cur) => ({ ...cur, state_id: id, district_id: undefined }));

  const reOpts: Option[] = (reTypes.data ?? []).map((t) => ({ id: t.id, label: t.type_name }));
  const ptOpts: Option[] = (pTypes.data ?? [])
    .filter((t) => t.real_estate_type_id === f.real_estate_type_id && present(t.type_name))
    .map((t) => ({ id: t.id, label: t.type_name }));
  const budgetOpts: Option[] = (budgets.data ?? [])
    .filter((b) => b.real_estate_type_id === f.real_estate_type_id && present(b.budget_amount))
    .map((b) => ({ id: b.id, label: b.budget_amount }));
  const stateOpts: Option[] = (states.data ?? []).map((s) => ({ id: s.id, label: s.name }));
  const districtOpts: Option[] = (districts.data ?? [])
    .filter((d) => d.state_id === f.state_id && present(d.name))
    .map((d) => ({ id: d.id, label: d.name }));

  const loadError = [reTypes, pTypes, budgets, states, districts].some((q) => q.isError);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40">
        <View className="max-h-[88%] rounded-t-3xl border-t border-line bg-bg">
          <View className="flex-row items-center justify-between border-b border-line px-5 py-4">
            <Text className="text-lg font-bold text-fg">Filters</Text>
            <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button" accessibilityLabel="Close filters">
              <X size={22} color={c.muted} />
            </Pressable>
          </View>

          <ScrollView className="px-5" contentContainerStyle={{ paddingVertical: 18, gap: 20 }}>
            {loadError ? (
              <Text className="text-sm text-warning">Some filter options couldn't load. Check your connection.</Text>
            ) : null}

            <ChipGroup label="I want to" options={reOpts} value={f.real_estate_type_id} onChange={setReType} />
            {f.real_estate_type_id && ptOpts.length ? (
              <ChipGroup
                label="Property type"
                options={ptOpts}
                value={f.property_type_id}
                onChange={(id) => setF((cur) => ({ ...cur, property_type_id: id }))}
              />
            ) : null}
            {f.real_estate_type_id && budgetOpts.length ? (
              <ChipGroup
                label="Budget"
                options={budgetOpts}
                value={f.budget_id}
                onChange={(id) => setF((cur) => ({ ...cur, budget_id: id }))}
              />
            ) : null}
            <ChipGroup label="State" options={stateOpts} value={f.state_id} onChange={setState} />
            {f.state_id && districtOpts.length ? (
              <ChipGroup
                label="District"
                options={districtOpts}
                value={f.district_id}
                onChange={(id) => setF((cur) => ({ ...cur, district_id: id }))}
              />
            ) : null}
          </ScrollView>

          <View className="flex-row gap-3 border-t border-line px-5 py-4">
            <SpecularButton label="Reset" variant="outline" onPress={() => setF({})} />
            <View className="flex-1">
              <SpecularButton
                label="Show results"
                full
                onPress={() => {
                  onApply(f);
                  onClose();
                }}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ChipGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Option[];
  value?: Id;
  onChange: (id?: Id) => void;
}) {
  return (
    <View className="gap-2.5">
      <Text className="text-sm font-semibold text-fg">{label}</Text>
      <View className="flex-row flex-wrap gap-2">
        <Chip label="Any" active={!value} onPress={() => onChange(undefined)} />
        {options.map((o) => (
          <Chip key={o.id} label={o.label} active={value === o.id} onPress={() => onChange(o.id)} />
        ))}
      </View>
    </View>
  );
}
