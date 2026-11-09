import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";
import { BlinkingSquares } from "@/components/effects/blinking-squares";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { ThemeProvider, noFlashScript } from "@/components/theme/theme-provider";

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
      </head>
      <body className="min-h-screen" suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <BlinkingSquares />
            <Navbar />
            <main>{children}</main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
