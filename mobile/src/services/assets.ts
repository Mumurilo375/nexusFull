const defaultAssetFallback = "";

function getApiOrigin(): string {
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

  if (!apiBaseUrl || !/^https?:\/\//i.test(apiBaseUrl)) {
    return "";
  }

  try {
    return new URL(apiBaseUrl).origin;
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

  if (/^(https?:|data:|file:)/i.test(assetPath)) {
    return assetPath;
  }

  if (assetPath.startsWith("/media/")) {
    const apiOrigin = getApiOrigin();
    return apiOrigin ? `${apiOrigin}${assetPath}` : assetPath;
  }

  return assetPath;
}
