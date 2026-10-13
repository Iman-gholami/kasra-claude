import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "بوتیک کسرا",
    short_name: "کسرا",
    description: "پوشاک زنانه‌ی مینیمال — نسخه‌ی نمایشی",
    lang: "fa-IR",
    dir: "rtl",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF8F5",
    theme_color: "#FAF8F5",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
