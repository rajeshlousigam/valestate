"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/auth/auth-provider";

export default function AccountIndex() {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else router.replace("/account/activity");
  }, [loading, user, router]);
  return <div className="py-16 text-center text-muted">Loading…</div>;
}
