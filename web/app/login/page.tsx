"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Input, Label } from "@/components/ui/field";
import { GlassCard } from "@/components/ui/glass-card";
import { Container } from "@/components/ui/primitives";
import { SpecularCTA } from "@/components/ui/specular-cta";
import { USE_API } from "@/lib/api";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email, password);
      router.push("/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <GlassCard panel className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-sm text-muted">Sign in to manage your properties and inquiries.</p>
        {error && <div className="mt-4 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>}
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus placeholder="you@example.com" />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          <SpecularCTA size="md" type="submit" className="w-full justify-center" onClick={() => submit()}>
            {busy ? "Signing in…" : "Sign in"}
          </SpecularCTA>
        </form>
        <p className="mt-5 text-center text-sm text-muted">
          New here?{" "}
          <Link href="/signup" className="font-semibold text-brand hover:underline">Create an account</Link>
        </p>
        {!USE_API && (
          <p className="mt-4 rounded-xl bg-brand-soft/50 p-3 text-center text-xs text-fg/60">
            Demo mode — any email/password works and data stays in your browser.
          </p>
        )}
      </GlassCard>
    </Container>
  );
}
