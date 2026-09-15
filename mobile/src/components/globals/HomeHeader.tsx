import Pressable from "@/src/components/ui/MotionPressable";
import { Text } from "@/src/components/ui/Typography";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState, type ComponentProps } from "react";
import { Image, StyleSheet, useWindowDimensions, View } from "react-native";
import { useAuth } from "../../contexts/useAuth";
import { resolveAssetUrl } from "../../services/assets";
import { LogoutConfirmModal } from "./LogoutConfirmModal";
import MotionPresence from "../ui/MotionPresence";
import MotionIndicator from "../ui/MotionIndicator";

const logoImage = require("../../../assets/home/utils/logo.png");

export default function HomeHeader() {
  const { width } = useWindowDimensions();
  const { isAuthenticated, isReady, logout, user } = useAuth();
  const [brokenAvatarUrl, setBrokenAvatarUrl] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const avatarUrl = resolveAssetUrl(user?.avatarUrl, "");
  const showAvatar = Boolean(avatarUrl && avatarUrl !== brokenAvatarUrl);
  const profileLabel = user?.username?.trim() || "Minha conta";
  const showProfileName = width >= 350;

  const openAccount = () => {
    if (isReady && isAuthenticated) {
      setIsMenuOpen((current) => !current);
      return;
    }

    router.replace({ pathname: "/login", params: { from: "/(tabs)" } } as never);
  };

  const openMenuItem = (path: string) => {
    setIsMenuOpen(false);
    router.push(path as never);
  };

  const signOut = async () => {
    try {
      setShowLogoutConfirmation(false);
      setIsSigningOut(true);
      await logout();
      setIsMenuOpen(false);
      router.replace("/login");
    } finally {
      setIsSigningOut(false);
    }
  };

  const confirmSignOut = () => {
    if (isSigningOut) return;
    setShowLogoutConfirmation(true);
  };

  return (
    <View style={styles.container}>
      <View pointerEvents="none" style={styles.headerSurface} />
      <View pointerEvents="none" style={styles.headerGlow} />
      <View pointerEvents="none" style={styles.headerRule} />
      <View style={styles.headerRow}>
        <View accessible accessibilityLabel="Nexus Full" style={styles.brandLockup}>
          <View style={styles.brandMark}>
            <Image source={logoImage} style={styles.logoImage} resizeMode="contain" />
          </View>
          <View style={styles.brandCopy}>
            <Text style={styles.brandName}>NEXUS</Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isAuthenticated ? `Abrir menu de ${profileLabel}` : "Entrar na conta"}
          accessibilityState={{ disabled: !isReady, expanded: isMenuOpen }}
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
          {showProfileName ? <Text style={styles.accountLabel} numberOfLines={1}>{isAuthenticated ? profileLabel : "Entrar"}</Text> : null}
          <MotionIndicator active={isMenuOpen} style={styles.chevronFrame}>
            <Ionicons name="chevron-down" size={14} color="#93c5fd" />
          </MotionIndicator>
        </Pressable>
      </View>
      {isAuthenticated ? (
        <MotionPresence visible={isMenuOpen} style={styles.menu} accessibilityLabel="Menu da conta">
          <MenuItem icon="person-outline" label="Perfil" onPress={() => openMenuItem("/(tabs)/perfil")} />
          <MenuItem icon="cart-outline" label="Carrinho" onPress={() => openMenuItem("/(tabs)/carrinho")} />
          <MenuItem icon="heart-outline" label="Favoritos" onPress={() => openMenuItem("/favoritos")} />
          <MenuItem icon="key-outline" label="Biblioteca" onPress={() => openMenuItem("/biblioteca")} />
          <View style={styles.menuDivider} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sair da conta"
            accessibilityState={{ disabled: isSigningOut, busy: isSigningOut }}
            disabled={isSigningOut}
            onPress={confirmSignOut}
            style={({ pressed }) => [styles.menuItem, styles.menuItemDanger, pressed && styles.menuItemPressed]}
          >
            {isSigningOut ? <Text style={styles.menuItemText}>Saindo...</Text> : <><Ionicons name="log-out-outline" size={18} color="#fecdd3" /><Text style={styles.menuItemDangerText}>Sair</Text></>}
          </Pressable>
        </MotionPresence>
      ) : null}
      <LogoutConfirmModal visible={showLogoutConfirmation} processing={isSigningOut} onCancel={() => setShowLogoutConfirmation(false)} onConfirm={() => void signOut()} />
    </View>
  );
}

function MenuItem({ icon, label, onPress }: { icon: ComponentProps<typeof Ionicons>["name"]; label: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}><Ionicons name={icon} size={18} color="#67e8f9" /><Text numberOfLines={1} style={styles.menuItemText}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    zIndex: 10,
    elevation: 10,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    overflow: "visible",
    backgroundColor: "#050a14",
  },
  headerSurface: { ...StyleSheet.absoluteFill, backgroundColor: "#050a14" },
  headerGlow: { position: "absolute", top: -31, left: -24, width: 148, height: 94, borderTopRightRadius: 42, borderBottomRightRadius: 70, borderBottomLeftRadius: 18, backgroundColor: "rgba(37, 99, 235, 0.1)", transform: [{ rotate: "-8deg" }] },
  headerRule: { position: "absolute", right: 20, bottom: 0, left: 20, height: 1, backgroundColor: "#17304e" },
  headerRow: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  brandLockup: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandMark: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#28517a", borderRadius: 11, backgroundColor: "#0b1a2d" },
  logoImage: { width: 35, height: 25 },
  brandCopy: { justifyContent: "center", gap: 1 },
  brandName: { color: "#ffffff", fontSize: 17, fontWeight: "900", letterSpacing: 2.4 },
  accountButton: {
    minWidth: 52,
    maxWidth: 218,
    minHeight: 51,
    paddingVertical: 4,
    paddingLeft: 4,
    paddingRight: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    borderWidth: 1,
    borderColor: "#243b5a",
    borderRadius: 14,
    backgroundColor: "#0a1526",
  },
  avatarFrame: {
    width: 39,
    height: 39,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#375879",
    borderRadius: 11,
    backgroundColor: "#12233a",
  },
  avatar: { width: "100%", height: "100%" },
  avatarInitial: { color: "#ffffff", fontSize: 16, fontWeight: "900" },
  accountLabel: { minWidth: 0, flexShrink: 1, color: "#f8fafc", fontSize: 14, fontWeight: "700" },
  chevronFrame: { width: 24, height: 24, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#284563", borderRadius: 8, backgroundColor: "#0f2035" },
  accountButtonPressed: { opacity: 0.7 },
  menu: { position: "absolute", top: 80, right: 20, zIndex: 20, elevation: 20, width: 236, padding: 7, borderWidth: 1, borderColor: "#2a4665", borderRadius: 11, backgroundColor: "#091525", shadowColor: "#000000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.28, shadowRadius: 18 },
  menuItem: { width: "100%", minHeight: 42, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 7 },
  menuItemText: { flex: 1, color: "#e2e8f0", fontSize: 13, fontWeight: "700" },
  menuDivider: { height: 1, marginVertical: 5, backgroundColor: "#1d334d" },
  menuItemDanger: { borderRadius: 7 },
  menuItemDangerText: { flex: 1, color: "#fecdd3", fontSize: 12, fontWeight: "700" },
  menuItemPressed: { backgroundColor: "#122944", opacity: 0.9 },
});
