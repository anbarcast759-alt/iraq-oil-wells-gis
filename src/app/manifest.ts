import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Iraq Oil Wells GIS Platform",
    short_name: "Oil Wells GIS",
    description:
      "GIS platform for Iraqi oil wells, starting with the East Baghdad South Oil Field.",
    start_url: "/",
    display: "standalone",
    background_color: "#0A1A2F",
    theme_color: "#0A1A2F",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
