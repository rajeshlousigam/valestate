import type { Metadata } from "next";
import "./globals.css";
import { AuroraBackground } from "@/components/layout/aurora-background";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { ThemeProvider, noFlashScript } from "@/components/theme/theme-provider";

export const metadata: Metadata = {
  title: {
    default: "HousePoint — Verified properties in Imphal",
    template: "%s | HousePoint",
  },
  description:
    "Every property on HousePoint is verified by our operations team before it goes public. No fakes, no duplicates, no brokers — in Imphal, Manipur.",
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    title: "HousePoint — Verified properties in Imphal",
    description: "If it's on HousePoint, it's real.",
    type: "website",
    locale: "en_IN",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
      </head>
      <body className="min-h-screen">
        <ThemeProvider>
          <AuroraBackground />
          <Navbar />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
