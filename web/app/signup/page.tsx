"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Chip } from "@/components/ui/chip";
import { Input, Label } from "@/components/ui/field";
import { GlassCard } from "@/components/ui/glass-card";
import { Container } from "@/components/ui/primitives";
import { SpecularCTA } from "@/components/ui/specular-cta";
import { ApiError, USE_API } from "@/lib/api";

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [as, setAs] = useState<"buyer" | "owner">("buyer");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signup(form.name, form.email, form.password, as, form.phone || undefined);
      router.push("/account");
    } catch (err) {
      const msg = err instanceof ApiError && err.details?.length ? `${err.message}: ${err.details[0].issue}` : err instanceof Error ? err.message : "Signup failed";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <GlassCard panel className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="mt-1 text-sm text-muted">Join ValEstate — verified real estate in Imphal.</p>

        <div className="mt-5">
          <Label>I want to</Label>
          <div className="flex gap-2">
            <Chip active={as === "buyer"} onClick={() => setAs("buyer")}>Find a property</Chip>
            <Chip active={as === "owner"} onClick={() => setAs("owner")}>List my property</Chip>
          </div>
        </div>

        {error && <div className="mt-4 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>}
        <form onSubmit={submit} className="mt-5 space-y-4">
          <div><Label>Name</Label><Input value={form.name} onChange={(e) => set("name", e.target.value)} required /></div>
          <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required /></div>
          <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="Optional" /></div>
          <div><Label>Password</Label><Input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} required placeholder="min 8 characters" /></div>
          <SpecularCTA size="md" type="submit" className="w-full justify-center" onClick={() => submit()}>
            {busy ? "Creating…" : "Create account"}
          </SpecularCTA>
        </form>
        <p className="mt-5 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand hover:underline">Sign in</Link>
        </p>
        {!USE_API && (
          <p className="mt-4 rounded-xl bg-brand-soft/50 p-3 text-center text-xs text-fg/60">
            Demo mode — your account stays in this browser.
          </p>
        )}
      </GlassCard>
    </Container>
  );
}
