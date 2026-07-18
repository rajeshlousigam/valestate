import Link from "next/link";
import { cn } from "@/lib/utils";

/** ValEstate mark: emerald→gold estate tile + roofline + a gold-backed verified check. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={cn("h-9 w-9", className)}
      role="img"
      aria-label="ValEstate"
    >
      <defs>
        <linearGradient id="ve-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0f766e" />
          <stop offset="1" stopColor="#d9a441" />
        </linearGradient>
      </defs>
      {/* estate tile */}
      <rect x="1" y="1" width="38" height="38" rx="11" fill="url(#ve-grad)" />
      {/* house body (faint) */}
      <path
        d="M11 20 L20 12 L29 20 V27.5 A1.5 1.5 0 0 1 27.5 29 H12.5 A1.5 1.5 0 0 1 11 27.5 Z"
        fill="#ffffff"
        fillOpacity="0.18"
      />
      {/* roofline */}
      <path
        d="M8.5 20.5 L20 10.5 L31.5 20.5"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* verified check badge */}
      <circle cx="27.6" cy="27.4" r="6.4" fill="#ffffff" />
      <path
        d="M24.7 27.5 l2 2 l3.4 -3.9"
        fill="none"
        stroke="#0f766e"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)}>
      <span className="transition-transform group-hover:scale-105">
        <LogoMark />
      </span>
      <span className="text-lg font-bold tracking-tight">
        <span className="brand-text">Val</span>
        <span className="text-fg">Estate</span>
      </span>
    </Link>
  );
}
