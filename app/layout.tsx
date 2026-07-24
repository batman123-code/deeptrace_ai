import type { Metadata } from "next";
import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/auth-context";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SplashScreen } from "@/components/splash-screen";
import { SmoothScrolling } from "@/components/smooth-scrolling";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "DeepTrace AI — Real-Time Multimodal Misinformation Verification",
  description:
    "DeepTrace AI extracts multimodal claims from images, audio, and social posts, cross-references trusted sources, and outputs forensic-grade context verification in seconds. Powered by Gemma 4.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${display.variable} ${sans.variable} ${mono.variable} font-sans bg-slate-50 text-slate-900`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <SmoothScrolling>
              <ScrollProgress />
              <SplashScreen />
              <SiteHeader />
              {children}
              <SiteFooter />
            </SmoothScrolling>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
