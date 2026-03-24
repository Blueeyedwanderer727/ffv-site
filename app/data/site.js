const DEFAULT_SITE_URL = "https://foundfootagevault.com";

function normalizeSiteUrl(value) {
  if (!value) {
    return DEFAULT_SITE_URL;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return DEFAULT_SITE_URL;
  }

  const normalizedValue = /^https?:\/\//i.test(trimmedValue) ? trimmedValue : `https://${trimmedValue}`;

  try {
    return new URL(normalizedValue).toString().replace(/\/$/, "");
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

export const siteName = "Found Footage Vault";

export const siteDescription = "A classified archive for found footage horror discovery, fear rankings, quiz experiments, and case-file search.";

export const siteKeywords = [
  "found footage horror",
  "found footage movies",
  "horror movie archive",
  "scariest found footage movies",
  "found footage quiz",
  "horror movie lists",
  "fear experiment",
  "found footage vault",
];