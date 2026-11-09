import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { Redirect, useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { SpecularButton } from "@/components/ui/SpecularButton";
import { PHONE_RE, api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";

const errMsg = (e: unknown, fallback: string) => (e instanceof Error ? e.message : fallback);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * /logins/updatecustomerinfo + /logins/requestphonechange → verifyphonechange.
 * The API has no "get profile" endpoint, so only the name (from login) is
 * pre-filled; the other fields must be re-entered when updating.
 */
export default function Profile() {
  const router = useRouter();
  const { c } = useTheme();
  const { user, setName: saveName, logout } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [whatsapp, setWhatsapp] = useState(user?.phone ?? "");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileErr, setProfileErr] = useState<string | null>(null);

  const [newPhone, setNewPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [phoneBusy, setPhoneBusy] = useState(false);
  const [phoneErr, setPhoneErr] = useState<string | null>(null);

  if (!user) return <Redirect href="/(auth)/login" />;

  const saveProfile = async () => {
    if (!name.trim() || !address.trim()) return setProfileErr("Name and address are required.");
    if (!PHONE_RE.test(whatsapp)) return setProfileErr("Enter a 10-digit WhatsApp number.");
    if (email.trim() && !EMAIL_RE.test(email.trim())) return setProfileErr("Enter a valid email or leave it blank.");
    setProfileBusy(true);
    setProfileErr(null);
    try {
      const r = await api.updateProfile({
        name: name.trim(),
        whatsapp_no: whatsapp,
        address: address.trim(),
        email: email.trim() || undefined,
      });
      await saveName(name.trim());
      Alert.alert("Profile updated", typeof r.msg === "string" ? r.msg : "");
    } catch (e) {
      setProfileErr(errMsg(e, "Could not update your profile."));
    } finally {
      setProfileBusy(false);
    }
  };

  const requestChange = async () => {
    if (!PHONE_RE.test(newPhone)) return setPhoneErr("Enter the new 10-digit phone number.");
    if (newPhone === user.phone) return setPhoneErr("That's already your phone number.");
    setPhoneBusy(true);
    setPhoneErr(null);
    try {
      await api.requestPhoneChange(newPhone);
      setOtpSent(true);
    } catch (e) {
      setPhoneErr(errMsg(e, "Could not send the OTP."));
    } finally {
      setPhoneBusy(false);
    }
  };

  const verifyChange = async () => {
    if (otp.length < 4) return setPhoneErr("Enter the OTP sent to the new number.");
    setPhoneBusy(true);
    setPhoneErr(null);
    try {
      const r = await api.verifyPhoneChange(newPhone, otp);
      // API sets force_logout: the old token is no longer valid.
      await logout();
      Alert.alert("Phone number updated", typeof r.msg === "string" ? r.msg : "Please log in again.");
      router.replace("/(auth)/login");
    } catch (e) {
      setPhoneErr(errMsg(e, "Could not verify the OTP."));
    } finally {
      setPhoneBusy(false);
    }
  };

  return (
    <Screen edges={["top", "bottom"]}>
      <View className="flex-row items-center gap-2 px-4 pb-2 pt-1">
        <Pressable onPress={() => router.back()} hitSlop={10} className="p-1" accessibilityRole="button" accessibilityLabel="Back">
          <ChevronLeft size={26} color={c.fg} />
        </Pressable>
        <Text className="flex-1 text-2xl font-extrabold text-fg">Profile</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <GlassCard>
            <View className="gap-4 p-5">
              <Text className="text-lg font-bold text-fg">Your details</Text>
              <Input label="Full name" value={name} onChangeText={setName} />
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
                autoCapitalize="none"
                keyboardType="email-address"
              />
              {profileErr ? <Text className="text-sm text-warning">{profileErr}</Text> : null}
              <SpecularButton label="Save changes" full loading={profileBusy} onPress={saveProfile} />
            </View>
          </GlassCard>

          <GlassCard>
            <View className="gap-4 p-5">
              <Text className="text-lg font-bold text-fg">Change phone number</Text>
              <Text className="text-sm text-muted">Current: {user.phone}. You'll be logged out after the change.</Text>
              <Input
                label="New phone number"
                value={newPhone}
                onChangeText={(t) => {
                  setNewPhone(t.replace(/\D/g, ""));
                  setOtpSent(false);
                }}
                keyboardType="number-pad"
                maxLength={10}
              />
              {otpSent ? (
                <Input
                  label="OTP"
                  value={otp}
                  onChangeText={(t) => setOtp(t.replace(/\D/g, ""))}
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  maxLength={6}
                />
              ) : null}
              {phoneErr ? <Text className="text-sm text-warning">{phoneErr}</Text> : null}
              <SpecularButton
                label={otpSent ? "Verify & change" : "Send OTP"}
                full
                variant="outline"
                loading={phoneBusy}
                onPress={otpSent ? verifyChange : requestChange}
              />
            </View>
          </GlassCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
