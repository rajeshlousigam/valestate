import Link from "next/link";
import { Container } from "@/components/ui/primitives";
import type { NavLink } from "@/lib/nav";
import { Logo } from "./logo";

const COMPANY: NavLink[] = [
  { label: "How verification works", href: "/#how-it-works" },
  { label: "Why Estara Properties", href: "/#why" },
  { label: "List your property", href: "/list-property" },
];

export function Footer({ purposes, districts }: { purposes: NavLink[]; districts: NavLink[] }) {
  const cols = [
    { title: "Explore", links: [{ label: "All properties", href: "/search" }, ...purposes] },
    { title: "Company", links: COMPANY },
    { title: "Districts", links: districts.slice(0, 6) },
  ].filter((c) => c.links.length);
  return (
    <footer className="mt-24">
      <Container>
        <div className="glass-panel rounded-t-5xl p-8 sm:p-12">
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div className="max-w-xs">
              <Logo />
              <p className="mt-4 text-sm text-muted">
                The verified real-estate marketplace for Imphal. Every listing is
                checked by our team before it goes public.
              </p>
              <p className="mt-4 text-sm font-semibold brand-text">
                If it&apos;s on Estara Properties, it&apos;s real.
              </p>
            </div>
            {cols.map((col) => (
              <div key={col.title}>
                <h3 className="text-sm font-semibold text-fg">{col.title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-sm text-muted transition-colors hover:text-brand">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-xs text-subtle sm:flex-row">
            <p>© {new Date().getFullYear()} Estara Properties · Imphal, Manipur</p>
            <p>Every listing verified before it goes public.</p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
