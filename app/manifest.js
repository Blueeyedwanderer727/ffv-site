import { siteDescription, siteName, siteUrl } from "./data/site";

export default function manifest() {
  return {
    name: siteName,
    short_name: "FF Vault",
    description: siteDescription,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#07110b",
    theme_color: "#07110b",
    categories: ["entertainment", "books", "lifestyle"],
    lang: "en-US",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "48x48 32x32 16x16",
        type: "image/x-icon",
      },
    ],
    id: siteUrl,
  };
}