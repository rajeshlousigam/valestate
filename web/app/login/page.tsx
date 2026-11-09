"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Input, Label } from "@/components/ui/field";
import { GlassCard } from "@/components/ui/glass-card";
import { Container } from "@/components/ui/primitives";
import { SpecularCTA } from "@/components/ui/specular-cta";
import { PHONE_RE, api } from "@/lib/api";

const errMsg = (e: unknown, fallback: string) => (e instanceof Error ? e.message : fallback);

/** Phone-OTP login: /logins/otplogin → /logins/verifyloginotp (OTP valid 3 min). */
export default function LoginPage() {
  const { verifyLogin } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function sendOtp() {
    if (!PHONE_RE.test(phone)) return setError("Enter your 10-digit phone number.");
    setBusy(true);
    setError(null);
    try {
      const r = await api.requestLoginOtp(phone);
      setInfo(typeof r.msg === "string" ? r.msg : "OTP sent.");
      setStep("otp");
    } catch (e) {
      setError(errMsg(e, "Could not send the OTP."));
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    if (otp.length < 4) return setError("Enter the OTP we sent you.");
    setBusy(true);
    setError(null);
    try {
      await verifyLogin(phone, otp);
      router.push("/account");
    } catch (e) {
      setError(errMsg(e, "Could not verify the OTP."));
    } finally {
      setBusy(false);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    void (step === "phone" ? sendOtp() : verify());
  }

  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <GlassCard panel className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-sm text-muted">
          {step === "phone" ? "Log in with your phone number." : `Enter the OTP sent to ${phone}.`}
        </p>
        {error && <div role="alert" className="mt-4 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>}
        {step === "otp" && info && !error && <p className="mt-4 text-sm text-muted">{info}</p>}
        <form onSubmit={submit} className="mt-6 space-y-4">
          {step === "phone" ? (
            <div>
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                inputMode="numeric"
                autoComplete="tel-national"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                required
                autoFocus
                placeholder="9876543210"
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="otp">OTP</Label>
              <Input
                id="otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                required
                autoFocus
                placeholder="123456"
              />
            </div>
          )}
          <SpecularCTA size="md" type="submit" className="w-full justify-center">
            {busy ? "Please wait…" : step === "phone" ? "Send OTP" : "Verify & log in"}
          </SpecularCTA>
        </form>
        {step === "otp" && (
          <div className="mt-4 flex justify-center gap-6 text-sm">
            <button type="button" onClick={() => void sendOtp()} disabled={busy} className="font-semibold text-brand hover:underline">
              Resend OTP
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setOtp("");
                setError(null);
              }}
              className="font-semibold text-brand hover:underline"
            >
              Change number
            </button>
          </div>
        )}
        <p className="mt-5 text-center text-sm text-muted">
          New here?{" "}
          <Link href="/signup" className="font-semibold text-brand hover:underline">Create an account</Link>
        </p>
      </GlassCard>
    </Container>
  );
}
