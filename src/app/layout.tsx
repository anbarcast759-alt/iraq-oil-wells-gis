import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import ChatWidget from "@/components/assistant/ChatWidget";
import BackToTop from "@/components/layout/BackToTop";
import { HighlightProvider } from "@/context/HighlightContext";

// Space Grotesk: geometric/technical display face for headings — fits
// a data/engineering platform better than a generic system font.
// Inter stays as the body face (readable at small sizes for tables/data).
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.netlify.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Iraq Oil Wells GIS Platform",
    template: "%s",
  },
  description:
    "GIS platform for Iraqi oil wells, starting with the East Baghdad South Oil Field.",
  openGraph: {
    title: "Iraq Oil Wells GIS Platform",
    description:
      "GIS platform for Iraqi oil wells, starting with the East Baghdad South Oil Field.",
    type: "website",
  },
  // Unlisted by request: reachable via direct link, but never indexed
  // by search engines. robots.txt blocks crawling; this meta tag is a
  // second layer some crawlers/previews check independently of it.
  robots: {
    index: false,
    follow: false,
  },
};

// dir/lang are static "en"/"ltr" for now. The language-switch milestone
// will move this into a client-side provider that flips both based on
// user selection (and persists it), without touching this file's shape.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body>
        <HighlightProvider>
          {children}
          <ChatWidget />
          <BackToTop />
        </HighlightProvider>
      </body>
    </html>
  );
}
