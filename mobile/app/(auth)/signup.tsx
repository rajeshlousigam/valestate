import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { X } from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Input } from "@/components/ui/Input";
import { SpecularButton } from "@/components/ui/SpecularButton";
import { PHONE_RE, api } from "@/lib/api";
import { useTheme } from "@/lib/theme";

const errMsg = (e: unknown, fallback: string) => (e instanceof Error ? e.message : fallback);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Signup: /logins/otpsignup → /logins/verifysignupotp (→ signup_token, 5 min)
 * → /logins/createcustomerinfo. The API returns no auth token on signup, so
 * the user logs in afterwards.
 */
export default function Signup() {
  const router = useRouter();
  const { c } = useTheme();
  const [step, setStep] = useState<"phone" | "otp" | "profile">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [signupToken, setSignupToken] = useState("");
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (fn: () => Promise<void>, fallback: string) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(errMsg(e, fallback));
    } finally {
      setBusy(false);
    }
  };

  const sendOtp = () => {
    if (!PHONE_RE.test(phone)) return setError("Enter your 10-digit phone number.");
    return run(async () => {
      await api.requestSignupOtp(phone);
      setStep("otp");
    }, "Could not send the OTP.");
  };

  const verifyOtp = () => {
    if (otp.length < 4) return setError("Enter the OTP we sent you.");
    return run(async () => {
      setSignupToken(await api.verifySignupOtp(phone, otp));
      setWhatsapp((w) => w || phone);
      setStep("profile");
    }, "Could not verify the OTP.");
  };

  const createProfile = () => {
    if (!name.trim() || !address.trim()) return setError("Name and address are required.");
    if (!PHONE_RE.test(whatsapp)) return setError("Enter a 10-digit WhatsApp number.");
    if (email.trim() && !EMAIL_RE.test(email.trim())) return setError("Enter a valid email or leave it blank.");
    return run(async () => {
      await api.createCustomer(phone, signupToken, {
        name: name.trim(),
        whatsapp_no: whatsapp,
        address: address.trim(),
        email: email.trim() || undefined,
      });
      Alert.alert("Account created", "Log in with your phone number to continue.");
      router.replace("/(auth)/login");
    }, "Could not create your account.");
  };

  const subtitle =
    step === "phone"
      ? "Verify your phone number to get started."
      : step === "otp"
        ? `Enter the OTP sent to ${phone}.`
        : "Almost done — tell us a bit about you.";

  return (
    <Screen edges={["top", "bottom"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ paddingBottom: 28 }} keyboardShouldPersistTaps="handled">
          <View className="flex-row justify-end px-5 pt-2">
            <Pressable onPress={() => router.back()} hitSlop={10} className="p-1" accessibilityRole="button" accessibilityLabel="Close">
              <X size={24} color={c.muted} />
            </Pressable>
          </View>

          <View className="px-6 pb-4 pt-1">
            <Text className="text-2xl font-extrabold text-fg">Create your account</Text>
            <Text className="mt-1 text-sm text-muted">{subtitle}</Text>
          </View>

          <View className="gap-4 px-6">
            {step === "phone" ? (
              <>
                <Input
                  label="Phone number"
                  value={phone}
                  onChangeText={(t) => setPhone(t.replace(/\D/g, ""))}
                  placeholder="9876543210"
                  keyboardType="number-pad"
                  maxLength={10}
                />
                {error ? <Text className="text-sm text-warning">{error}</Text> : null}
                <SpecularButton label="Send OTP" full loading={busy} onPress={sendOtp} />
              </>
            ) : step === "otp" ? (
              <>
                <Input
                  label="OTP"
                  value={otp}
                  onChangeText={(t) => setOtp(t.replace(/\D/g, ""))}
                  placeholder="123456"
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  maxLength={6}
                />
                {error ? <Text className="text-sm text-warning">{error}</Text> : null}
                <SpecularButton label="Verify OTP" full loading={busy} onPress={verifyOtp} />
                <Pressable onPress={() => setStep("phone")} className="items-center py-1">
                  <Text className="text-sm font-semibold text-brand">Use a different number</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Input label="Full name" value={name} onChangeText={setName} placeholder="Your name" />
                <Input
                  label="WhatsApp number"
                  value={whatsapp}
                  onChangeText={(t) => setWhatsapp(t.replace(/\D/g, ""))}
                  keyboardType="number-pad"
                  maxLength={10}
                />
                <Input label="Address" value={address} onChangeText={setAddress} placeholder="Locality, city" />
                <Input
                  label="Email (optional)"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                {error ? <Text className="text-sm text-warning">{error}</Text> : null}
                <SpecularButton label="Create account" full loading={busy} onPress={createProfile} />
              </>
            )}

            <View className="flex-row justify-center gap-1 pt-1">
              <Text className="text-sm text-muted">Already have an account?</Text>
              <Pressable onPress={() => router.replace("/(auth)/login")}>
                <Text className="text-sm font-bold text-brand">Log in</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
