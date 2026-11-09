"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { GlassCard } from "@/components/ui/glass-card";
import { PHONE_RE, api } from "@/lib/api";

const errMsg = (e: unknown, fallback: string) => (e instanceof Error ? e.message : fallback);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type Note = { kind: "ok" | "err"; msg: string } | null;

/**
 * /logins/updatecustomerinfo and /logins/requestphonechange → verifyphonechange.
 * The API has no "get profile" endpoint, so only name/phone are pre-filled.
 */
export default function ProfilePage() {
  const { user, setName, logout } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: user?.name ?? "", whatsapp: user?.phone ?? "", address: "", email: "" });
  const [profileNote, setProfileNote] = useState<Note>(null);
  const [profileBusy, setProfileBusy] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [phoneNote, setPhoneNote] = useState<Note>(null);
  const [phoneBusy, setPhoneBusy] = useState(false);
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  if (!user) return null;

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.address.trim()) return setProfileNote({ kind: "err", msg: "Name and address are required." });
    if (!PHONE_RE.test(form.whatsapp)) return setProfileNote({ kind: "err", msg: "Enter a 10-digit WhatsApp number." });
    if (form.email.trim() && !EMAIL_RE.test(form.email.trim())) return setProfileNote({ kind: "err", msg: "Enter a valid email or leave it blank." });
    setProfileBusy(true);
    setProfileNote(null);
    try {
      const r = await api.updateProfile({
        name: form.name.trim(),
        whatsapp_no: form.whatsapp,
        address: form.address.trim(),
        email: form.email.trim() || undefined,
      });
      setName(form.name.trim());
      setProfileNote({ kind: "ok", msg: typeof r.msg === "string" ? r.msg : "Profile updated." });
    } catch (err) {
      setProfileNote({ kind: "err", msg: errMsg(err, "Could not update your profile.") });
    } finally {
      setProfileBusy(false);
    }
  }

  async function changePhone(e: React.FormEvent) {
    e.preventDefault();
    if (!PHONE_RE.test(newPhone)) return setPhoneNote({ kind: "err", msg: "Enter the new 10-digit phone number." });
    if (newPhone === user?.phone) return setPhoneNote({ kind: "err", msg: "That's already your phone number." });
    if (otpSent && otp.length < 4) return setPhoneNote({ kind: "err", msg: "Enter the OTP sent to the new number." });
    setPhoneBusy(true);
    setPhoneNote(null);
    try {
      if (!otpSent) {
        await api.requestPhoneChange(newPhone);
        setOtpSent(true);
        setPhoneNote({ kind: "ok", msg: "OTP sent to the new number." });
      } else {
        await api.verifyPhoneChange(newPhone, otp);
        // force_logout: the old token is no longer valid.
        await logout();
        router.push("/login");
      }
    } catch (err) {
      setPhoneNote({ kind: "err", msg: errMsg(err, "Could not change your phone number.") });
    } finally {
      setPhoneBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <h2 className="text-xl font-bold">Your details</h2>
        <form onSubmit={saveProfile} className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="p-name">Full name</Label>
            <Input id="p-name" value={form.name} onChange={(e) => set("name", e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="p-wa">WhatsApp number</Label>
            <Input id="p-wa" inputMode="numeric" maxLength={10} value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value.replace(/\D/g, ""))} required />
          </div>
          <div>
            <Label htmlFor="p-addr">Address</Label>
            <Input id="p-addr" value={form.address} onChange={(e) => set("address", e.target.value)} required placeholder="Locality, city" />
          </div>
          <div>
            <Label htmlFor="p-email">Email (optional)</Label>
            <Input id="p-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            {profileNote && (
              <p role={profileNote.kind === "err" ? "alert" : "status"} className={profileNote.kind === "err" ? "mb-3 text-sm text-red-500" : "mb-3 text-sm text-brand"}>
                {profileNote.msg}
              </p>
            )}
            <Button type="submit" disabled={profileBusy}>{profileBusy ? "Saving…" : "Save changes"}</Button>
          </div>
        </form>
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className="text-xl font-bold">Change phone number</h2>
        <p className="mt-1 text-sm text-muted">Current: {user.phone}. You&apos;ll be logged out after the change.</p>
        <form onSubmit={changePhone} className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="p-new">New phone number</Label>
            <Input
              id="p-new"
              inputMode="numeric"
              maxLength={10}
              value={newPhone}
              onChange={(e) => {
                setNewPhone(e.target.value.replace(/\D/g, ""));
                setOtpSent(false);
              }}
              required
            />
          </div>
          {otpSent && (
            <div>
              <Label htmlFor="p-otp">OTP</Label>
              <Input id="p-otp" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} required />
            </div>
          )}
          <div className="sm:col-span-2">
            {phoneNote && (
              <p role={phoneNote.kind === "err" ? "alert" : "status"} className={phoneNote.kind === "err" ? "mb-3 text-sm text-red-500" : "mb-3 text-sm text-brand"}>
                {phoneNote.msg}
              </p>
            )}
            <Button type="submit" variant="glass" disabled={phoneBusy}>
              {phoneBusy ? "Please wait…" : otpSent ? "Verify & change" : "Send OTP"}
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
