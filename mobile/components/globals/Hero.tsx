import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import TrailerPlayer from "./TrailerPlayer";

const heroImage = require("../../assets/home/utils/gracehero.jpeg");

type HeroProps = { isExpanded: boolean; onExploreGames: () => void; onShowHowItWorks: () => void };

export default function Hero({ isExpanded, onExploreGames, onShowHowItWorks }: HeroProps) {
  const { height, width } = useWindowDimensions();
  const translateX = useRef(new Animated.Value(-24)).current;
  const copyOpacity = useRef(new Animated.Value(0.9)).current;
  const isCompact = width < 360;
  const isShort = height < 760 && !isExpanded;

  useEffect(() => {
    let isMounted = true;

    void AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (!isMounted) return;

      if (reduceMotion) {
        translateX.setValue(0);
        copyOpacity.setValue(1);
        return;
      }

      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 620,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.timing(copyOpacity, {
          toValue: 1,
          duration: 420,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
      ]).start();
    });

    return () => {
      isMounted = false;
      translateX.stopAnimation();
      copyOpacity.stopAnimation();
    };
  }, [copyOpacity, translateX]);

  return (
    <ImageBackground
      source={heroImage}
      resizeMode="cover"
      style={[styles.hero, isShort && styles.heroShort, isExpanded && styles.heroExpanded]}
      imageStyle={[styles.heroImage, !isExpanded && styles.heroImageMobile]}
    >
      <View style={styles.heroOverlay} />
      <View style={styles.leftVeilWide} />
      <View style={styles.leftVeilStrong} />
      <View style={styles.bottomVeil} />
      <View style={[styles.content, isShort && styles.contentShort, isExpanded && styles.contentExpanded]}>
        <Animated.View style={[styles.copy, isExpanded && styles.copyExpanded, { opacity: copyOpacity, transform: [{ translateX }] }]}>
          <Text accessibilityRole="header" style={[styles.title, isCompact && styles.titleCompact, isShort && !isCompact && styles.titleShort]}>Entre no próximo nível</Text>
          <Text style={[styles.description, isShort && styles.descriptionShort]}>Explore novos mundos, compare jogos e acompanhe um fluxo de compra simulado com keys para diferentes plataformas.</Text>
          <View style={[styles.actions, isShort && styles.actionsShort, isExpanded && styles.actionsExpanded]}>
            <Pressable accessibilityRole="button" accessibilityLabel="Explorar jogos" onPress={onExploreGames} style={({ pressed }) => [styles.primaryButton, styles.actionButton, isShort && styles.actionButtonShort, pressed && styles.buttonPressed]}>
              <Ionicons name="game-controller-outline" size={20} color="#ffffff" />
              <Text style={styles.primaryButtonText}>Explorar jogos</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Ver como funciona" onPress={onShowHowItWorks} style={({ pressed }) => [styles.secondaryButton, styles.actionButton, isShort && styles.actionButtonShort, pressed && styles.buttonPressed]}>
              <Ionicons name="compass-outline" size={20} color="#bfdbfe" />
              <Text style={styles.secondaryButtonText}>Como funciona</Text>
            </Pressable>
          </View>
        </Animated.View>
        <TrailerPlayer isExpanded={isExpanded} compact={isShort} />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  hero: { minHeight: 570, overflow: "hidden", backgroundColor: "#020617" },
  heroShort: { minHeight: 520 },
  heroExpanded: { minHeight: 730, marginHorizontal: 24, borderRadius: 24 },
  heroImage: { opacity: 0.98 },
  heroImageMobile: { transform: [{ translateX: 28 }, { scale: 1.035 }] },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(1, 4, 12, 0.2)" },
  leftVeilWide: { position: "absolute", top: 0, bottom: 0, left: 0, width: "72%", backgroundColor: "rgba(1, 4, 12, 0.2)" },
  leftVeilStrong: { position: "absolute", top: 0, bottom: 0, left: 0, width: "48%", backgroundColor: "rgba(0, 2, 8, 0.38)" },
  bottomVeil: { position: "absolute", right: 0, bottom: 0, left: 0, height: 190, backgroundColor: "rgba(2, 6, 23, 0.26)" },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 28, paddingBottom: 22 },
  contentShort: { paddingTop: 18, paddingBottom: 18 },
  contentExpanded: { paddingHorizontal: 56, paddingTop: 70, paddingBottom: 48 },
  copy: { width: "100%", maxWidth: 310 },
  copyExpanded: { maxWidth: 560 },
  title: { maxWidth: 310, color: "#ffffff", fontSize: 42, lineHeight: 43, fontWeight: "900", letterSpacing: -1.25 },
  titleCompact: { maxWidth: 280, fontSize: 36, lineHeight: 38, letterSpacing: -1 },
  titleShort: { fontSize: 40, lineHeight: 41 },
  description: { marginTop: 14, maxWidth: 300, color: "#e2e8f0", fontSize: 15, lineHeight: 22 },
  descriptionShort: { marginTop: 11, fontSize: 14, lineHeight: 20 },
  actions: { width: "100%", maxWidth: 266, marginTop: 20, gap: 9 },
  actionsShort: { marginTop: 15, gap: 8 },
  actionsExpanded: { maxWidth: 560, flexDirection: "row" },
  actionButton: { minHeight: 50, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9 },
  actionButtonShort: { minHeight: 48 },
  primaryButton: { paddingHorizontal: 20, borderRadius: 12, backgroundColor: "#2563eb" },
  primaryButtonText: { color: "#ffffff", fontSize: 15, fontWeight: "700" },
  secondaryButton: { paddingHorizontal: 18, borderWidth: 1, borderColor: "#334155", borderRadius: 12, backgroundColor: "rgba(2,6,23,0.88)" },
  secondaryButtonText: { color: "#f8fafc", fontSize: 15, fontWeight: "700" },
  buttonPressed: { opacity: 0.78 },
});
