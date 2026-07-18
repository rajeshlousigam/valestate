import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  // SEO baseline (docs/11)
  title: {
    default: "HousePoint — Verified properties in Imphal",
    template: "%s | HousePoint",
  },
  description:
    "Every property on HousePoint is verified by our operations team before it goes public. No fakes, no duplicates, no brokers.",
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    title: "HousePoint — Verified properties in Imphal",
    description: "If it's on HousePoint, it's real.",
    type: "website",
    locale: "en_IN",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-IN">
      <body>{children}</body>
    </html>
  );
}
