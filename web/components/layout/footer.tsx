import Link from "next/link";
import { Container } from "@/components/ui/primitives";
import { Logo } from "./logo";

const COLS = [
  {
    title: "Explore",
    links: [
      { label: "Buy in Imphal", href: "/search?intent=SALE" },
      { label: "Rent in Imphal", href: "/search?intent=RENT" },
      { label: "Commercial", href: "/search?type=COMMERCIAL" },
      { label: "Land & Plots", href: "/search?type=LAND" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "How verification works", href: "/#how-it-works" },
      { label: "Why HousePoint", href: "/#why" },
      { label: "List your property", href: "/list-property" },
    ],
  },
  {
    title: "Localities",
    links: [
      { label: "Thangmeiband", href: "/search?locality=thangmeiband" },
      { label: "Uripok", href: "/search?locality=uripok" },
      { label: "Lamphel", href: "/search?locality=lamphel" },
      { label: "Khurai", href: "/search?locality=khurai" },
    ],
  },
];

export function Footer() {
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
                If it&apos;s on HousePoint, it&apos;s real.
              </p>
            </div>
            {COLS.map((col) => (
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
            <p>© {new Date().getFullYear()} HousePoint · Imphal, Manipur</p>
            <p className="flex gap-4">
              <Link href="#" className="hover:text-fg">Privacy</Link>
              <Link href="#" className="hover:text-fg">Terms</Link>
              <Link href="#" className="hover:text-fg">Grievance</Link>
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
