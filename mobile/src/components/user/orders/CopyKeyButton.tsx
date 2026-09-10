import { Text } from "@/src/components/ui/Typography";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Clipboard from "expo-clipboard";
import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, AppState, Easing, Pressable, StyleSheet, View } from "react-native";
import ElectricKeyBorder from "./ElectricKeyBorder";

export default function CopyKeyButton({ value, title }: { value: string; title: string }) {
  const progress = useRef(new Animated.Value(0)).current;
  const busy = useRef(false);
  const mounted = useRef(true);
  const [active, setActive] = useState(AppState.currentState === "active");
  const [reduceMotion, setReduceMotion] = useState(true);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [status, setStatus] = useState<"idle" | "copying" | "copied" | "error">("idle");

  useEffect(() => {
    mounted.current = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted.current) setReduceMotion(enabled);
    }).catch(() => {});
    const motion = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    const app = AppState.addEventListener("change", (state) => setActive(state === "active"));
    return () => { mounted.current = false; motion.remove(); app.remove(); };
  }, []);

  useEffect(() => {
    if (reduceMotion || !active || !size.width || status !== "idle") return;
    progress.setValue(0);
    const animation = Animated.loop(Animated.timing(progress, {
      toValue: 1, duration: 1000, easing: Easing.linear, useNativeDriver: true, isInteraction: false,
    }));
    animation.start();
    return () => animation.stop();
  }, [active, progress, reduceMotion, size.width, status]);

  useEffect(() => {
    if (status !== "copied") return;
    const timer = setTimeout(() => setStatus("idle"), 2500);
    return () => clearTimeout(timer);
  }, [status]);

  const copy = async () => {
    if (busy.current) return;
    busy.current = true;
    setStatus("copying");
    try {
      const copied = await Clipboard.setStringAsync(value);
      if (mounted.current) setStatus(copied ? "copied" : "error");
    } catch {
      if (mounted.current) setStatus("error");
    } finally {
      busy.current = false;
    }
  };

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Copiar key de ${title}`}
        accessibilityHint="Copia a key exibida para a área de transferência."
        accessibilityState={{ disabled: status === "copying", busy: status === "copying" }}
        disabled={status === "copying"}
        onPress={() => void copy()}
        onLayout={({ nativeEvent }) => setSize(nativeEvent.layout)}
        style={({ pressed }) => [styles.button, status === "copied" && styles.success, pressed && styles.pressed]}
      >
        <Text style={styles.value}>{value}</Text>
        <View style={styles.action}>
          <Ionicons name={status === "copied" ? "checkmark-circle-outline" : "copy-outline"} size={16} color={status === "copied" ? "#6ee7b7" : "#bfdbfe"} />
          <Text style={styles.label}>{status === "copying" ? "Copiando..." : status === "copied" ? "Copiada" : "Copiar key"}</Text>
        </View>
        {status !== "copied" && size.width > 0 && size.height > 0 ? (
          <ElectricKeyBorder width={size.width - 2} height={size.height - 2} progress={progress} moving={!reduceMotion && active && status === "idle"} />
        ) : null}
      </Pressable>
      <Text accessibilityLiveRegion="polite" style={[styles.feedback, status === "error" && styles.error]}>
        {status === "copied" ? "Key copiada!" : status === "error" ? "Não foi possível copiar. Tente novamente." : ""}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 44, paddingHorizontal: 8, paddingVertical: 6, borderWidth: 1, borderColor: "#1e40af", borderRadius: 10, backgroundColor: "#0b1930", gap: 2 },
  value: { color: "#f8fafc", fontFamily: "monospace", fontSize: 16, lineHeight: 22, flexShrink: 1 },
  action: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 5 },
  label: { color: "#bfdbfe", fontSize: 12, fontWeight: "700" },
  success: { borderColor: "#34d399" },
  pressed: { opacity: 0.75 },
  feedback: { color: "#6ee7b7", fontSize: 12, lineHeight: 18, minHeight: 18, marginTop: 3 },
  error: { color: "#fda4af" },
});
