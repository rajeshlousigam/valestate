"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/auth/auth-provider";

export default function AccountIndex() {
  const { user, loading, isOwner } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else router.replace(isOwner ? "/account/listings" : "/account/inquiries");
  }, [loading, user, isOwner, router]);
  return <div className="py-16 text-center text-muted">Loading…</div>;
}
