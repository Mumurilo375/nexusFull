import Pressable from "@/src/components/ui/MotionPressable";
import { Text } from "@/src/components/ui/Typography";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useReduceMotion } from "../../contexts/MotionContext";
import {
  Animated, Easing, ImageBackground, Platform, StyleSheet, useWindowDimensions, View } from "react-native";
const heroImage = require("../../../assets/home/utils/gracehero.jpeg");

type HeroProps = { isExpanded: boolean; onExploreGames: () => void; onShowHowItWorks: () => void };

export default function Hero({ isExpanded, onExploreGames, onShowHowItWorks }: HeroProps) {
  const { height, width } = useWindowDimensions();
  const reduceMotion = useReduceMotion();
  const [translateX] = useState(() => new Animated.Value(0));
  const [copyOpacity] = useState(() => new Animated.Value(1));
  const isCompact = width < 360;
  const isShort = height < 760 && !isExpanded;

  useEffect(() => {
    if (reduceMotion) {
      translateX.setValue(0);
      copyOpacity.setValue(1);
      return;
    }
    translateX.setValue(-18);
    copyOpacity.setValue(0.85);
    const animation = Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration: 480,
        easing: Easing.out(Easing.exp),
        useNativeDriver: Platform.OS !== "web",
        isInteraction: false,
      }),
      Animated.timing(copyOpacity, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.exp),
        useNativeDriver: Platform.OS !== "web",
        isInteraction: false,
      }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [copyOpacity, reduceMotion, translateX]);

  return (
    <ImageBackground
      source={heroImage}
      resizeMode="cover"
      style={[styles.hero, isShort && styles.heroShort, isExpanded && styles.heroExpanded]}
      imageStyle={[styles.heroImage, !isExpanded && styles.heroImageMobile]}
    >
      <View style={[styles.content, isShort && styles.contentShort, isExpanded && styles.contentExpanded]}>
        <Animated.View style={[styles.copy, isExpanded && styles.copyExpanded, { opacity: copyOpacity, transform: [{ translateX }] }]}>
          <Text accessibilityRole="header" style={[styles.title, isCompact && styles.titleCompact, isShort && !isCompact && styles.titleShort]}>Entre no próximo nível</Text>
          <Text style={[styles.description, isShort && styles.descriptionShort]}>Explore novos mundos, compare jogos e encontre keys para diferentes plataformas.</Text>
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
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  hero: { minHeight: 470, overflow: "hidden", backgroundColor: "#020617" },
  heroShort: { minHeight: 430 },
  heroExpanded: { minHeight: 610, marginHorizontal: 24, borderRadius: 24 },
  heroImage: { opacity: 0.98 },
  heroImageMobile: { transform: [{ translateX: 28 }, { scale: 1.035 }] },
  content: { flex: 1, justifyContent: "center", paddingHorizontal: 20, paddingTop: 28, paddingBottom: 34 },
  contentShort: { paddingTop: 18, paddingBottom: 26 },
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
