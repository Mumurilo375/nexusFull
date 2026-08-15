const defaultAssetFallback = "";

function getApiOrigin(): string {
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

  if (!apiBaseUrl || !/^https?:\/\//i.test(apiBaseUrl)) {
    return "";
  }

  try {
    const url = new URL(apiBaseUrl);
    if (!__DEV__ && url.protocol !== "https:") return "";
    return url.origin;
  } catch {
    return "";
  }
}

export function resolveAssetUrl(
  value?: string | null,
  fallback = defaultAssetFallback,
): string {
  const assetPath = String(value ?? "").trim();

  if (!assetPath) {
    return fallback;
  }

  if (/^https?:\/\//i.test(assetPath)) {
    try {
      const url = new URL(assetPath);
      if (!__DEV__ && url.protocol !== "https:") return fallback;
      return url.toString();
    } catch {
      return fallback;
    }
  }

  if (assetPath.startsWith("/media/")) {
    const apiOrigin = getApiOrigin();
    return apiOrigin ? `${apiOrigin}${assetPath}` : fallback;
  }

  return fallback;
}

/**
 * Local picker previews are intentionally allowed to use the device URI.
 * Remote values still go through the same protocol allowlist as API media.
 */
export function resolvePreviewUrl(value?: string | null): string {
  const normalized = String(value ?? "").trim();
  if (/^(file|blob):/i.test(normalized)) return normalized;
  return resolveAssetUrl(normalized);
}
