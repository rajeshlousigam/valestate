import type { Metadata } from "next";
import "./globals.css";
import { BlinkingSquares } from "@/components/effects/blinking-squares";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { ThemeProvider, noFlashScript } from "@/components/theme/theme-provider";

export const metadata: Metadata = {
  title: {
    default: "ValEstate — Verified properties in Imphal",
    template: "%s | ValEstate",
  },
  description:
    "Every property on ValEstate is verified by our operations team before it goes public. No fakes, no duplicates, no brokers — in Imphal, Manipur.",
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    title: "ValEstate — Verified properties in Imphal",
    description: "If it's on ValEstate, it's real.",
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
          <BlinkingSquares />
          <Navbar />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
