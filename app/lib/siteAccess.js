const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);

function normalizeLaunchMode(value) {
  const normalizedValue = value?.trim().toLowerCase();

  if (normalizedValue === "locked" || normalizedValue === "open" || normalizedValue === "auto") {
    return normalizedValue;
  }

  return "auto";
}

export function getConfiguredLaunchMode() {
  return normalizeLaunchMode(process.env.FFV_LAUNCH_MODE);
}

export function getHostnameFromHeaderValue(rawHost) {
  if (!rawHost) {
    return "";
  }

  const host = rawHost.split(",")[0].trim().toLowerCase();

  if (!host) {
    return "";
  }

  if (host.startsWith("[")) {
    const closingBracketIndex = host.indexOf("]");
    return closingBracketIndex === -1 ? host.slice(1) : host.slice(1, closingBracketIndex);
  }

  return host.split(":")[0];
}

export function isLocalHostname(hostname) {
  return LOCAL_HOSTNAMES.has(hostname) || hostname.endsWith(".localhost");
}

export function isLaunchClosedHost(hostname) {
  return !isLocalHostname(hostname);
}

export function getLaunchModeForHostname(hostname) {
  const configuredLaunchMode = getConfiguredLaunchMode();

  if (configuredLaunchMode === "locked" || configuredLaunchMode === "open") {
    return configuredLaunchMode;
  }

  return isLaunchClosedHost(hostname) ? "locked" : "open";
}

export function getLaunchModeFromHeaders(headersLike) {
  const explicitMode = headersLike.get("x-vault-mode");

  if (explicitMode === "locked" || explicitMode === "open") {
    return explicitMode;
  }

  const hostname = getHostnameFromHeaderValue(headersLike.get("x-forwarded-host") ?? headersLike.get("host") ?? "");
  return getLaunchModeForHostname(hostname);
}