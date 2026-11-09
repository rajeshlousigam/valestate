"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input, Label } from "@/components/ui/field";
import { GlassCard } from "@/components/ui/glass-card";
import { Container } from "@/components/ui/primitives";
import { SpecularCTA } from "@/components/ui/specular-cta";
import { PHONE_RE, api } from "@/lib/api";

const errMsg = (e: unknown, fallback: string) => (e instanceof Error ? e.message : fallback);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * /logins/otpsignup → /logins/verifysignupotp (→ signup_token, 5 min) →
 * /logins/createcustomerinfo. Signup returns no auth token, so the user logs in after.
 */
export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp" | "profile" | "done">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [signupToken, setSignupToken] = useState("");
  const [form, setForm] = useState({ name: "", whatsapp: "", address: "", email: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function run(fn: () => Promise<void>, fallback: string) {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(errMsg(e, fallback));
    } finally {
      setBusy(false);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (step === "phone") {
      if (!PHONE_RE.test(phone)) return setError("Enter your 10-digit phone number.");
      void run(async () => {
        await api.requestSignupOtp(phone);
        setStep("otp");
      }, "Could not send the OTP.");
    } else if (step === "otp") {
      if (otp.length < 4) return setError("Enter the OTP we sent you.");
      void run(async () => {
        setSignupToken(await api.verifySignupOtp(phone, otp));
        setForm((f) => ({ ...f, whatsapp: f.whatsapp || phone }));
        setStep("profile");
      }, "Could not verify the OTP.");
    } else if (step === "profile") {
      if (!form.name.trim() || !form.address.trim()) return setError("Name and address are required.");
      if (!PHONE_RE.test(form.whatsapp)) return setError("Enter a 10-digit WhatsApp number.");
      if (form.email.trim() && !EMAIL_RE.test(form.email.trim())) return setError("Enter a valid email or leave it blank.");
      void run(async () => {
        await api.createCustomer(phone, signupToken, {
          name: form.name.trim(),
          whatsapp_no: form.whatsapp,
          address: form.address.trim(),
          email: form.email.trim() || undefined,
        });
        setStep("done");
      }, "Could not create your account.");
    }
  }

  const subtitle = {
    phone: "Verify your phone number to get started.",
    otp: `Enter the OTP sent to ${phone}.`,
    profile: "Almost done — tell us a bit about you.",
    done: "Your account is ready. Log in with your phone number.",
  }[step];

  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <GlassCard panel className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="mt-1 text-sm text-muted">{subtitle}</p>
        {error && <div role="alert" className="mt-4 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>}

        {step === "done" ? (
          <SpecularCTA size="md" className="mt-6 w-full justify-center" onClick={() => router.push("/login")}>
            Log in
          </SpecularCTA>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            {step === "phone" && (
              <div>
                <Label htmlFor="phone">Phone number</Label>
                <Input id="phone" inputMode="numeric" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} required autoFocus placeholder="9876543210" />
              </div>
            )}
            {step === "otp" && (
              <div>
                <Label htmlFor="otp">OTP</Label>
                <Input id="otp" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} required autoFocus placeholder="123456" />
              </div>
            )}
            {step === "profile" && (
              <>
                <div>
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} required autoFocus />
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp number</Label>
                  <Input id="whatsapp" inputMode="numeric" maxLength={10} value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value.replace(/\D/g, ""))} required />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" value={form.address} onChange={(e) => set("address", e.target.value)} required placeholder="Locality, city" />
                </div>
                <div>
                  <Label htmlFor="email">Email (optional)</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" />
                </div>
              </>
            )}
            <SpecularCTA size="md" type="submit" className="w-full justify-center">
              {busy ? "Please wait…" : step === "phone" ? "Send OTP" : step === "otp" ? "Verify OTP" : "Create account"}
            </SpecularCTA>
            {step === "otp" && (
              <button type="button" onClick={() => setStep("phone")} className="w-full text-center text-sm font-semibold text-brand hover:underline">
                Use a different number
              </button>
            )}
          </form>
        )}

        <p className="mt-5 text-center text-sm text-muted">
          Already have an account? <Link href="/login" className="font-semibold text-brand hover:underline">Log in</Link>
        </p>
      </GlassCard>
    </Container>
  );
}
