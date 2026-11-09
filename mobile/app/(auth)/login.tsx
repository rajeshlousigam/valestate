import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { X } from "lucide-react-native";
import { BrandMark } from "@/components/BrandLogo";
import { Screen } from "@/components/ui/Screen";
import { Input } from "@/components/ui/Input";
import { SpecularButton } from "@/components/ui/SpecularButton";
import { PHONE_RE, api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";

const errMsg = (e: unknown, fallback: string) => (e instanceof Error ? e.message : fallback);

/** Phone-OTP login: /logins/otplogin → /logins/verifyloginotp (OTP valid 3 min). */
export default function Login() {
  const router = useRouter();
  const { c } = useTheme();
  const { verifyLogin } = useAuth();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const sendOtp = async () => {
    const p = phone.trim();
    if (!PHONE_RE.test(p)) return setError("Enter your 10-digit phone number.");
    setBusy(true);
    setError(null);
    try {
      const r = await api.requestLoginOtp(p);
      setInfo(typeof r.msg === "string" ? r.msg : "OTP sent.");
      setStep("otp");
    } catch (e) {
      setError(errMsg(e, "Could not send the OTP."));
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    if (otp.trim().length < 4) return setError("Enter the OTP we sent you.");
    setBusy(true);
    setError(null);
    try {
      await verifyLogin(phone.trim(), otp.trim());
      router.back();
    } catch (e) {
      setError(errMsg(e, "Could not verify the OTP."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen edges={["top", "bottom"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-row justify-end px-5 pt-2">
            <Pressable onPress={() => router.back()} hitSlop={10} className="p-1" accessibilityRole="button" accessibilityLabel="Close">
              <X size={24} color={c.muted} />
            </Pressable>
          </View>

          <View className="items-center px-6 pb-4 pt-2">
            <BrandMark size={72} />
            <Text className="mt-4 text-2xl font-extrabold text-fg">Welcome back</Text>
            <Text className="mt-1 text-center text-sm text-muted">
              {step === "phone" ? "Log in with your phone number" : `Enter the OTP sent to ${phone}`}
            </Text>
          </View>

          <View className="gap-4 px-6 pt-2">
            {step === "phone" ? (
              <>
                <Input
                  label="Phone number"
                  value={phone}
                  onChangeText={(t) => setPhone(t.replace(/\D/g, ""))}
                  placeholder="9876543210"
                  keyboardType="number-pad"
                  autoComplete="tel"
                  maxLength={10}
                />
                {error ? <Text className="text-sm text-warning">{error}</Text> : null}
                <SpecularButton label="Send OTP" full loading={busy} onPress={sendOtp} />
              </>
            ) : (
              <>
                {info ? <Text className="text-sm text-muted">{info}</Text> : null}
                <Input
                  label="OTP"
                  value={otp}
                  onChangeText={(t) => setOtp(t.replace(/\D/g, ""))}
                  placeholder="123456"
                  keyboardType="number-pad"
                  autoComplete="sms-otp"
                  textContentType="oneTimeCode"
                  maxLength={6}
                />
                {error ? <Text className="text-sm text-warning">{error}</Text> : null}
                <SpecularButton label="Verify & log in" full loading={busy} onPress={verify} />
                <View className="flex-row justify-center gap-6">
                  <Pressable onPress={sendOtp} disabled={busy} className="py-1">
                    <Text className="text-sm font-semibold text-brand">Resend OTP</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setStep("phone");
                      setOtp("");
                      setError(null);
                    }}
                    className="py-1"
                  >
                    <Text className="text-sm font-semibold text-brand">Change number</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>

          <View className="flex-1" />
          <View className="flex-row justify-center gap-1 px-6 pb-4">
            <Text className="text-sm text-muted">New here?</Text>
            <Pressable onPress={() => router.replace("/(auth)/signup")}>
              <Text className="text-sm font-bold text-brand">Create an account</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
