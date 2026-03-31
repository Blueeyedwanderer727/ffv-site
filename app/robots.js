import { headers } from "next/headers";

import { siteUrl } from "./data/site";
import { getLaunchModeFromHeaders } from "./lib/siteAccess";

export default async function robots() {
  const headerStore = await headers();
  const launchClosed = getLaunchModeFromHeaders(headerStore) === "locked";

  if (launchClosed) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
      host: siteUrl,
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}