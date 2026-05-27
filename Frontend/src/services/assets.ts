import nintendoLogo from "../assets/nintendo.png";
import playstationLogo from "../assets/playlogo.png";
import steamLogo from "../assets/steam.png";
import xboxLogo from "../assets/xbox.png";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "/api").trim() || "/api";
const defaultAssetFallback = "/utils/logo.png";

function getApiOrigin() {
  if (!/^https?:\/\//i.test(apiBaseUrl)) {
    return "";
  }

  return new URL(apiBaseUrl).origin;
}

function normalizePlatformName(platformName?: string | null) {
  return String(platformName ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function resolveAssetUrl(value?: string | null, fallback = defaultAssetFallback) {
  const assetPath = String(value ?? "").trim();

  if (!assetPath) {
    return fallback;
  }

  if (
    assetPath.startsWith("http://") ||
    assetPath.startsWith("https://") ||
    assetPath.startsWith("data:") ||
    assetPath.startsWith("blob:")
  ) {
    return assetPath;
  }

  if (assetPath.startsWith("/media/")) {
    const apiOrigin = getApiOrigin();
    return apiOrigin ? `${apiOrigin}${assetPath}` : assetPath;
  }

  return assetPath;
}

export function resolvePlatformLogoUrl(
  platformName?: string | null,
  iconUrl?: string | null,
  fallback = defaultAssetFallback,
) {
  if (String(iconUrl ?? "").trim()) {
    return resolveAssetUrl(iconUrl, fallback);
  }

  const normalizedPlatformName = normalizePlatformName(platformName);

  if (normalizedPlatformName.includes("steam")) {
    return steamLogo;
  }

  if (normalizedPlatformName.includes("playstation")) {
    return playstationLogo;
  }

  if (normalizedPlatformName.includes("xbox")) {
    return xboxLogo;
  }

  if (normalizedPlatformName.includes("nintendo")) {
    return nintendoLogo;
  }

  return resolveAssetUrl(iconUrl, fallback);
}
