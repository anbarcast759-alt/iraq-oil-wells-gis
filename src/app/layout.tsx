import type { Metadata, Viewport } from "next";
// Self-hosted fonts: next/font/google fetches font files from
// fonts.gstatic.com AT BUILD TIME, which fails the whole build if
// Netlify's build servers can't reach Google's CDN (happened in
// practice). @fontsource bundles the font files as local static
// assets instead, so the build never depends on external network access.
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "./globals.css";
import ChatWidget from "@/components/assistant/ChatWidget";
import BackToTop from "@/components/layout/BackToTop";
import ServiceWorkerRegistration from "@/components/layout/ServiceWorkerRegistration";
import { HighlightProvider } from "@/context/HighlightContext";

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
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Oil Wells GIS",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A1A2F",
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
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
    >
      <head>
        {/* Blocking (not deferred) so the theme class is set before
            first paint — avoids a flash of the wrong theme on load. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('theme')==='light'){document.documentElement.classList.add('light')}}catch(e){}",
          }}
        />
      </head>
      <body>
        <HighlightProvider>
          {children}
          <ChatWidget />
          <BackToTop />
          <ServiceWorkerRegistration />
        </HighlightProvider>
      </body>
    </html>
  );
}
