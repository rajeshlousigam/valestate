"use client";

import { Heart, Home, Inbox, MessageSquare } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { GlassCard } from "@/components/ui/glass-card";
import { Container } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isOwner, isBuyer } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return <Container className="py-24 text-center text-muted">Loading…</Container>;
  }

  // demo/default users with no explicit role are treated as buyers
  const owner = isOwner;
  const buyer = isBuyer || (!isOwner && !isBuyer);

  const items = [
    ...(owner ? [
      { href: "/account/listings", label: "My listings", icon: Home },
      { href: "/account/leads", label: "Leads", icon: Inbox },
    ] : []),
    ...(buyer ? [
      { href: "/account/inquiries", label: "My inquiries", icon: MessageSquare },
      { href: "/account/saved", label: "Saved", icon: Heart },
    ] : []),
  ];

  return (
    <Container className="py-10">
      <h1 className="text-3xl font-bold tracking-tight">Hi, {user.name.split(" ")[0]}</h1>
      <p className="mt-1 text-muted">Manage your ValEstate activity.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside>
          <GlassCard className="p-2">
            {items.map((it) => {
              const active = pathname === it.href;
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                    active ? "bg-brand-soft/60 text-brand" : "text-fg/75 hover:bg-fg/[0.05]",
                  )}
                >
                  <it.icon className="h-4 w-4" /> {it.label}
                </Link>
              );
            })}
          </GlassCard>
        </aside>
        <div>{children}</div>
      </div>
    </Container>
  );
}
