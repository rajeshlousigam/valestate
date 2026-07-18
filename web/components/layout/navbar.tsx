"use client";

import { Menu, Plus, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Container } from "@/components/ui/primitives";
import { SpecularCTA } from "@/components/ui/specular-cta";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";

const NAV = [
  { href: "/search?intent=SALE", label: "Buy" },
  { href: "/search?intent=RENT", label: "Rent" },
  { href: "/search?type=COMMERCIAL", label: "Commercial" },
  { href: "/search?type=LAND", label: "Land" },
  { href: "/#how-it-works", label: "How it works" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50">
      <div className="glass-nav">
        <Container className="flex h-16 items-center justify-between gap-4">
          <Logo />

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium text-fg/75 transition-colors hover:bg-fg/[0.06] hover:text-fg",
                  pathname === item.href && "text-brand",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <SpecularCTA href="/list-property" size="sm" className="hidden sm:inline-flex">
              <Plus className="h-4 w-4" />
              List property
            </SpecularCTA>
            <ThemeToggle />
            <button
              type="button"
              aria-label="Menu"
              onClick={() => setOpen((v) => !v)}
              className="glass grid h-10 w-10 place-items-center rounded-full lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </Container>
      </div>

      {/* mobile drawer */}
      {open && (
        <div className="lg:hidden">
          <Container className="pt-2">
            <div className="glass-panel animate-fade-up flex flex-col gap-1 rounded-3xl p-3">
              {NAV.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-2xl px-4 py-3 text-sm font-medium text-fg/80 hover:bg-fg/[0.06]"
                >
                  {item.label}
                </Link>
              ))}
              <SpecularCTA
                href="/list-property"
                size="md"
                className="mt-1 w-full"
                onClick={() => setOpen(false)}
              >
                <Plus className="h-4 w-4" /> List your property
              </SpecularCTA>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
