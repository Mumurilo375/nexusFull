import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Linking, Pressable, StyleSheet, Text, View } from "react-native";

const logo = require("../../../assets/home/utils/logo.png");

const openStore = () => router.push("/(tabs)/loja" as never);
const openHowItWorks = () => router.push("/comofunciona" as never);

const openExternalLink = (url: string) => {
  void Linking.openURL(url);
};

export default function Footer() {
  return (
    <View accessibilityLabel="Rodapé do Nexus Store" style={styles.footer}>
      <View style={styles.content}>
        <View style={styles.brandSection}>
          <Pressable accessibilityRole="link" accessibilityLabel="Ir para o início" onPress={() => router.push("/(tabs)" as never)} hitSlop={8}>
            <Text style={styles.brandName}>Nexus</Text>
          </Pressable>
          <Text style={styles.description}>
            Descubra novos mundos, compare plataformas e encontre seu próximo jogo no catálogo Nexus Store.
          </Text>
        </View>

        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>Navegação</Text>
          <View style={styles.links}>
            <FooterLink label="Loja" icon="storefront-outline" onPress={openStore} />
            <FooterLink label="Ofertas" icon="pricetag-outline" onPress={openStore} />
            <FooterLink label="Como funciona" icon="help-circle-outline" onPress={openHowItWorks} />
          </View>
        </View>

        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>Sobre o projeto</Text>
          <View style={styles.about}>
            <Text style={styles.aboutText}>Uma loja para descobrir jogos e escolher a plataforma certa para você.</Text>
            <Text style={styles.aboutText}>Compare opções, acompanhe seus pedidos e acesse suas keys em um só lugar.</Text>
            <Text style={styles.aboutText}>Steam, Xbox e PlayStation estão disponíveis para facilitar sua escolha.</Text>
          </View>
        </View>

        <View style={styles.credits}>
          <Image source={logo} style={styles.logo} resizeMode="contain" accessibilityLabel="Nexus Store" />
          <View style={styles.creditText}>
            <Text style={styles.copyright}>Nexus Store © 2026</Text>
            <Text style={styles.developedBy}>Desenvolvido por</Text>
            <View style={styles.authors}>
              <Pressable accessibilityRole="link" accessibilityLabel="GitHub de Murilo Pereira" onPress={() => openExternalLink("https://github.com/Mumurilo375")}>
                <Text style={styles.authorLink}>Murilo Pereira</Text>
              </Pressable>
              <Text style={styles.and}>e</Text>
              <Pressable accessibilityRole="link" accessibilityLabel="GitHub de Izaac Eduardo" onPress={() => openExternalLink("https://github.com/Izaac-eduardo")}>
                <Text style={styles.authorLink}>Izaac Eduardo.</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function FooterLink({ label, icon, onPress }: { label: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="link" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.link, pressed && styles.pressed]}>
      <Ionicons name={icon} size={18} color="#94a3b8" />
      <Text style={styles.linkText}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color="#64748b" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  footer: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)", backgroundColor: "#02050f" },
  content: { width: "100%", maxWidth: 1120, alignSelf: "center", paddingHorizontal: 20, paddingTop: 44, paddingBottom: 28 },
  brandSection: { maxWidth: 500 },
  brandName: { color: "#ffffff", fontSize: 30, lineHeight: 36, fontWeight: "900", letterSpacing: -0.8 },
  description: { marginTop: 12, color: "#cbd5e1", fontSize: 14, lineHeight: 22 },
  section: { marginTop: 34 },
  sectionTitle: { color: "#e2e8f0", fontSize: 12, fontWeight: "800", letterSpacing: 2.1, textTransform: "uppercase" },
  links: { marginTop: 11, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)" },
  link: { minHeight: 48, flexDirection: "row", alignItems: "center", gap: 10, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.08)" },
  linkText: { flex: 1, color: "#cbd5e1", fontSize: 14, fontWeight: "600" },
  about: { marginTop: 14, gap: 10 },
  aboutText: { color: "#cbd5e1", fontSize: 14, lineHeight: 21 },
  credits: { marginTop: 38, paddingTop: 20, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)", flexDirection: "row", alignItems: "flex-start", gap: 10 },
  logo: { width: 26, height: 26 },
  creditText: { flex: 1 },
  copyright: { color: "#94a3b8", fontSize: 12, lineHeight: 18 },
  developedBy: { marginTop: 3, color: "#94a3b8", fontSize: 12, lineHeight: 18 },
  authors: { marginTop: 2, flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 5 },
  authorLink: { color: "#bfdbfe", fontSize: 12, lineHeight: 18, fontWeight: "700" },
  and: { color: "#94a3b8", fontSize: 12, lineHeight: 18 },
  pressed: { opacity: 0.76 },
});
