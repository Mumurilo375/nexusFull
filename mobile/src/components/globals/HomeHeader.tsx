import { Text } from "@/src/components/ui/Typography";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState, type ComponentProps } from "react";
import { Image, Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { useAuth } from "../../contexts/useAuth";
import { resolveAssetUrl } from "../../services/assets";

const logoImage = require("../../../assets/home/utils/logo.png");

export default function HomeHeader() {
  const { width } = useWindowDimensions();
  const { isAuthenticated, isReady, logout, user } = useAuth();
  const [brokenAvatarUrl, setBrokenAvatarUrl] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
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
      setIsSigningOut(true);
      await logout();
      setIsMenuOpen(false);
      router.replace("/login");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Image source={logoImage} style={styles.logo} resizeMode="contain" accessibilityLabel="Nexus Full" />
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
          <Ionicons name={isMenuOpen ? "chevron-up" : "chevron-down"} size={16} color="#64748b" />
        </Pressable>
      </View>
      {isAuthenticated && isMenuOpen ? (
        <View style={styles.menu} accessibilityLabel="Menu da conta">
          <MenuItem icon="person-outline" label="Perfil" onPress={() => openMenuItem("/(tabs)/perfil")} />
          <MenuItem icon="cart-outline" label="Carrinho" onPress={() => openMenuItem("/(tabs)/carrinho")} />
          <MenuItem icon="heart-outline" label="Favoritos" onPress={() => openMenuItem("/favoritos")} />
          <MenuItem icon="key-outline" label="Biblioteca" onPress={() => openMenuItem("/biblioteca")} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sair da conta"
            accessibilityState={{ disabled: isSigningOut, busy: isSigningOut }}
            disabled={isSigningOut}
            onPress={() => void signOut()}
            style={({ pressed }) => [styles.menuItem, styles.menuItemDanger, pressed && styles.menuItemPressed]}
          >
            {isSigningOut ? <Text style={styles.menuItemText}>Saindo...</Text> : <><Ionicons name="log-out-outline" size={18} color="#fecdd3" /><Text style={styles.menuItemDangerText}>Sair</Text></>}
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function MenuItem({ icon, label, onPress }: { icon: ComponentProps<typeof Ionicons>["name"]; label: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}><Ionicons name={icon} size={18} color="#67e8f9" /><Text numberOfLines={1} style={styles.menuItemText}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: "#000000",
  },
  headerRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
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
  menu: { width: 228, alignSelf: "flex-end", flexDirection: "row", flexWrap: "wrap", gap: 2, marginTop: 2, padding: 6, borderWidth: 1, borderColor: "#26344d", borderRadius: 14, backgroundColor: "#07101f" },
  menuItem: { width: "49%", minHeight: 44, paddingHorizontal: 8, flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 9 },
  menuItemText: { flex: 1, color: "#e2e8f0", fontSize: 12, fontWeight: "700" },
  menuItemDanger: { borderRadius: 9 },
  menuItemDangerText: { flex: 1, color: "#fecdd3", fontSize: 12, fontWeight: "700" },
  menuItemPressed: { backgroundColor: "#10203a", opacity: 0.8 },
});
