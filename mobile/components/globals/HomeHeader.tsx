import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useAuth } from "../../src/contexts/useAuth";
import { resolveAssetUrl } from "../../src/services/assets";

const logoImage = require("../../assets/home/utils/logo.png");

export default function HomeHeader() {
  const { width } = useWindowDimensions();
  const { isAuthenticated, isReady, user } = useAuth();
  const [brokenAvatarUrl, setBrokenAvatarUrl] = useState("");
  const avatarUrl = resolveAssetUrl(user?.avatarUrl, "");
  const showAvatar = Boolean(avatarUrl && avatarUrl !== brokenAvatarUrl);
  const profileLabel = user?.username?.trim() || "Minha conta";
  const showProfileName = width >= 350;

  const openAccount = () => {
    if (isReady && isAuthenticated) {
      router.push("/(tabs)/perfil" as never);
      return;
    }

    router.replace({ pathname: "/login", params: { from: "/(tabs)" } } as never);
  };

  return (
    <View style={styles.container}>
      <Image source={logoImage} style={styles.logo} resizeMode="contain" accessibilityLabel="Nexus Full" />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isAuthenticated ? `Abrir perfil de ${profileLabel}` : "Entrar na conta"}
        accessibilityState={{ disabled: !isReady }}
        disabled={!isReady}
        onPress={openAccount}
        style={({ pressed }) => [styles.accountButton, (pressed || !isReady) && styles.accountButtonPressed]}
      >
        <View style={styles.avatarFrame}>
          {showAvatar ? (
            <Image
              source={{ uri: avatarUrl }}
              accessibilityLabel="Foto do usuário"
              onError={() => setBrokenAvatarUrl(avatarUrl)}
              style={styles.avatar}
            />
          ) : isAuthenticated && user ? (
            <Text style={styles.avatarInitial}>{profileLabel.slice(0, 1).toUpperCase()}</Text>
          ) : (
            <Ionicons name="person-outline" size={20} color="#dbeafe" />
          )}
        </View>
        {showProfileName ? (
          <Text style={styles.accountLabel} numberOfLines={1}>
            {isAuthenticated ? profileLabel : "Entrar"}
          </Text>
        ) : null}
        <Ionicons name="chevron-forward" size={16} color="#64748b" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 68,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    backgroundColor: "#000000",
  },
  logo: { width: 78, height: 36 },
  accountButton: {
    minWidth: 52,
    maxWidth: 190,
    minHeight: 48,
    paddingVertical: 5,
    paddingLeft: 5,
    paddingRight: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    borderWidth: 1,
    borderColor: "#26344d",
    borderRadius: 25,
    backgroundColor: "#07101f",
  },
  avatarFrame: {
    width: 38,
    height: 38,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 19,
    backgroundColor: "#111c30",
  },
  avatar: { width: "100%", height: "100%" },
  avatarInitial: { color: "#ffffff", fontSize: 16, fontWeight: "900" },
  accountLabel: { minWidth: 0, flexShrink: 1, color: "#ffffff", fontSize: 14, fontWeight: "800" },
  accountButtonPressed: { opacity: 0.7 },
});
