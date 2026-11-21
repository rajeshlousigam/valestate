"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Input, Label } from "@/components/ui/field";
import { GlassCard } from "@/components/ui/glass-card";
import { Container } from "@/components/ui/primitives";
import { SpecularCTA } from "@/components/ui/specular-cta";
import { PHONE_RE, api, isBadOtp, isNotRegistered } from "@/lib/api";

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
  // Set when the API says this number has no account: offer signup instead.
  const [notRegistered, setNotRegistered] = useState(false);

  // Prefill from /login?phone=… (e.g. when sent here from signup). Read after
  // mount because this page is statically prerendered.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("phone")?.replace(/\D/g, "").slice(0, 10);
    if (p) setPhone(p);
  }, []);

  async function sendOtp() {
    if (!PHONE_RE.test(phone)) return setError("Enter your 10-digit phone number.");
    setBusy(true);
    setError(null);
    setNotRegistered(false);
    try {
      const r = await api.requestLoginOtp(phone);
      setInfo(typeof r.msg === "string" ? r.msg : "OTP sent.");
      setStep("otp");
    } catch (e) {
      if (isNotRegistered(e)) setNotRegistered(true);
      else setError(errMsg(e, "Could not send the OTP."));
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
      setError(
        isBadOtp(e)
          ? "That code is wrong or has expired (codes last 3 minutes). Check it, or tap Resend OTP for a new one."
          : errMsg(e, "Could not verify the OTP."),
      );
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
        {notRegistered && (
          <div role="alert" className="mt-4 rounded-2xl border border-brand/30 bg-brand-soft/60 p-4 text-sm">
            <p className="font-semibold text-fg">No account for {phone} yet</p>
            <p className="mt-1 text-muted">Create a free account with this number — it only takes a minute.</p>
            <SpecularCTA size="sm" className="mt-3" onClick={() => router.push(`/signup?phone=${phone}`)}>
              Create an account
            </SpecularCTA>
          </div>
        )}
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
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, ""));
                  setNotRegistered(false);
                }}
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
          <Link href={PHONE_RE.test(phone) ? `/signup?phone=${phone}` : "/signup"} className="font-semibold text-brand hover:underline">Create an account</Link>
        </p>
      </GlassCard>
    </Container>
  );
}
