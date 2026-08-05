import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.netlify.app";

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
    <html lang="en" dir="ltr">
      <body>{children}</body>
    </html>
  );
}
