import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";
import { BlinkingSquares } from "@/components/effects/blinking-squares";
import { EstateArt } from "@/components/effects/estate-art";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { ThemeProvider, noFlashScript } from "@/components/theme/theme-provider";
import { fetchBrowseLinks } from "@/lib/nav";

export const metadata: Metadata = {
  title: {
    default: "Estara Properties — Verified properties in Imphal",
    template: "%s | Estara Properties",
  },
  description:
    "Every property on Estara Properties is verified by our operations team before it goes public. No fakes, no duplicates, no brokers — in Imphal, Manipur.",
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    title: "Estara Properties — Verified properties in Imphal",
    description: "If it's on Estara Properties, it's real.",
    type: "website",
    locale: "en_IN",
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { purposes, districts } = await fetchBrowseLinks();
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
      </head>
      <body className="min-h-screen" suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <BlinkingSquares />
            <EstateArt />
            <Navbar purposes={purposes} />
            <main>{children}</main>
            <Footer purposes={purposes} districts={districts} />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
