export default function manifest() {
  return {
    name: "Finora App",
    short_name: "finora",
    description: "My Next.js PWA",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#13cce4e0",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
