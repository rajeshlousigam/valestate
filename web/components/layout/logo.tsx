import { Home } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)}>
      <span className="grid h-9 w-9 place-items-center rounded-2xl brand-gradient text-white shadow-glow transition-transform group-hover:scale-105">
        <Home className="h-5 w-5" strokeWidth={2.5} />
      </span>
      <span className="text-lg font-bold tracking-tight">
        House<span className="brand-text">Point</span>
      </span>
    </Link>
  );
}
