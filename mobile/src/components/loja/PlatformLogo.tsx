import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Image,
  type ImageSourcePropType,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import { resolveAssetUrl } from "../../services/assets";

const platformImages = {
  steam: require("../../../assets/home/platforms/steamlogo.png"),
  playstation: require("../../../assets/home/platforms/playstationlogo.webp"),
  xbox: require("../../../assets/home/platforms/Xbox_logo.svg.webp"),
  nintendo: require("../../../assets/home/platforms/Nintendo-logo.png"),
} satisfies Record<string, ImageSourcePropType>;

function normalizePlatformName(value?: string | null) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function getLocalPlatformImage(platformName?: string | null) {
  const normalized = normalizePlatformName(platformName);
  const key = Object.keys(platformImages).find((platform) => normalized.includes(platform));
  return key ? platformImages[key as keyof typeof platformImages] : null;
}

export function getPlatformDisplayName(platformName?: string | null) {
  const name = String(platformName ?? "").trim();
  return normalizePlatformName(name) === "nintendo switch" ? "Nintendo" : name;
}

type PlatformLogoProps = {
  platformName?: string | null;
  iconUrl?: string | null;
  size?: number;
  dense?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function PlatformLogo({ platformName, iconUrl, size = 38, dense = false, style }: PlatformLogoProps) {
  const remoteUrl = useMemo(() => resolveAssetUrl(iconUrl, ""), [iconUrl]);
  const localImage = useMemo(() => getLocalPlatformImage(platformName), [platformName]);

  return <PlatformLogoImage key={remoteUrl} remoteUrl={remoteUrl} localImage={localImage} size={size} dense={dense} style={style} />;
}

function PlatformLogoImage({ remoteUrl, localImage, size, dense, style }: { remoteUrl: string; localImage: ImageSourcePropType | null; size: number; dense: boolean; style?: StyleProp<ViewStyle> }) {
  const [remoteFailed, setRemoteFailed] = useState(false);

  const source = remoteUrl && !remoteFailed ? { uri: remoteUrl } : localImage;

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.frame, { width: size, height: size, borderRadius: dense ? 4 : Math.max(10, size * 0.28) }, dense && styles.denseFrame, style]}
    >
      {source ? (
        <Image
          source={source}
          onError={() => setRemoteFailed(true)}
          resizeMode="contain"
          style={styles.image}
        />
      ) : (
        <Ionicons name="game-controller-outline" size={Math.round(size * 0.52)} color="#67e8f9" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#334155",
    backgroundColor: "#f8fafc",
    padding: 5,
  },
  denseFrame: { padding: 1 },
  image: { width: "100%", height: "100%" },
});
