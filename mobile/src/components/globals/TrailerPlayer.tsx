import { Text } from "@/src/components/ui/Typography";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ImageBackground, Pressable, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

const trailerImage = require("../../../assets/home/utils/residenthero.jpg");
const playerOrigin = "https://nexus.store";
const trailerUrl = "https://www.youtube-nocookie.com/embed/RJ7eRQgJBbo?autoplay=1&rel=0&playsinline=1&origin=https%3A%2F%2Fnexus.store&widget_referrer=https%3A%2F%2Fnexus.store";

const trailerDocument = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="referrer" content="strict-origin-when-cross-origin" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; frame-src https://www.youtube-nocookie.com; style-src 'unsafe-inline'" />
    <style>
      html, body, iframe { width: 100%; height: 100%; margin: 0; border: 0; background: #020617; }
    </style>
  </head>
  <body>
    <iframe
      src="${trailerUrl}"
      title="Trailer de Resident Evil Requiem"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      sandbox="allow-scripts allow-same-origin allow-presentation"
      allowfullscreen
    ></iframe>
  </body>
</html>`;

type TrailerPlayerProps = { isExpanded: boolean };

export default function TrailerPlayer({ isExpanded }: TrailerPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [playerKey, setPlayerKey] = useState(0);

  const startTrailer = () => {
    setHasError(false);
    setIsPlaying(true);
  };

  const retryTrailer = () => {
    setPlayerKey((value) => value + 1);
    setHasError(false);
    setIsPlaying(true);
  };

  return (
    <View style={[styles.section, isExpanded && styles.sectionExpanded]}>
      <View style={styles.headingRow}>
        <View style={styles.headingCopy}>
          <Text accessibilityRole="header" style={styles.title}>Uma prévia do que vem por aí</Text>
          <Text style={styles.description}>Resident Evil Requiem · assista ao trailer em destaque.</Text>
        </View>
        <View style={styles.duration}>
          <Ionicons name="play-circle-outline" size={15} color="#67e8f9" />
          <Text style={styles.durationText}>Trailer</Text>
        </View>
      </View>
      <View style={styles.card}>
        <View style={styles.playerFrame}>
          {isPlaying && !hasError ? (
            <WebView
              key={playerKey}
              source={{ html: trailerDocument, baseUrl: playerOrigin }}
              style={styles.webView}
              javaScriptEnabled
              domStorageEnabled
              allowsFullscreenVideo
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
              setSupportMultipleWindows={false}
              javaScriptCanOpenWindowsAutomatically={false}
              allowFileAccess={false}
              allowUniversalAccessFromFileURLs={false}
              mixedContentMode="never"
              originWhitelist={["about:blank", "https://nexus.store", "https://www.youtube-nocookie.com"]}
              onError={() => setHasError(true)}
              onHttpError={() => setHasError(true)}
            />
          ) : hasError ? (
            <View style={styles.errorState}>
              <Text style={styles.errorTitle}>Não foi possível carregar o trailer. Verifique sua conexão e tente novamente.</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Tentar carregar o trailer novamente" onPress={retryTrailer} style={({ pressed }) => [styles.retryButton, pressed && styles.buttonPressed]}>
                <Text style={styles.retryButtonText}>Tentar novamente</Text>
              </Pressable>
            </View>
          ) : (
            <ImageBackground source={trailerImage} style={styles.preview} imageStyle={styles.previewImage}>
              <View style={styles.previewOverlay} />
              <Pressable accessibilityRole="button" accessibilityLabel="Reproduzir trailer de Resident Evil Requiem" onPress={startTrailer} style={({ pressed }) => [styles.playAction, pressed && styles.buttonPressed]}>
                <View style={styles.playDisc}>
                  <Ionicons name="play" size={24} color="#3b82f6" style={styles.playIcon} />
                </View>
                <Text style={styles.playLabel}>Assistir ao trailer</Text>
              </Pressable>
            </ImageBackground>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { width: "100%", paddingHorizontal: 20, paddingTop: 28, paddingBottom: 8, backgroundColor: "#020617" },
  sectionExpanded: { paddingHorizontal: 24, paddingTop: 36 },
  headingRow: { width: "100%", maxWidth: 760, alignSelf: "center", marginBottom: 14, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 14 },
  headingCopy: { flex: 1, minWidth: 0 },
  title: { color: "#ffffff", fontSize: 22, lineHeight: 27, fontWeight: "700", letterSpacing: -0.4 },
  description: { marginTop: 5, color: "#94a3b8", fontSize: 13, lineHeight: 19 },
  duration: { minHeight: 32, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: "#334155", borderRadius: 10 },
  durationText: { color: "#cbd5e1", fontSize: 11, fontWeight: "600" },
  card: { width: "100%", maxWidth: 760, alignSelf: "center", padding: 4, borderRadius: 16, borderWidth: 1, borderColor: "#334155", backgroundColor: "#081120" },
  playerFrame: { minHeight: 163, aspectRatio: 16 / 7.9, overflow: "hidden", borderRadius: 13, backgroundColor: "#0f172a" },
  webView: { flex: 1, backgroundColor: "#020617" },
  preview: { flex: 1, justifyContent: "center", alignItems: "center" },
  previewImage: { opacity: 0.96 },
  previewOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(2, 6, 23, 0.2)" },
  playAction: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", gap: 9, padding: 10 },
  playDisc: { width: 54, height: 54, alignItems: "center", justifyContent: "center", borderRadius: 27, borderWidth: 1.5, borderColor: "#3b82f6", backgroundColor: "transparent", shadowColor: "#2563eb", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.95, shadowRadius: 9, elevation: 8 },
  playIcon: { marginLeft: 3 },
  playLabel: { color: "#ffffff", fontSize: 13, fontWeight: "800", textAlign: "center" },
  errorState: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 18, backgroundColor: "#0f172a" },
  errorTitle: { color: "#e2e8f0", fontSize: 12, lineHeight: 17, fontWeight: "700", textAlign: "center" },
  retryButton: { minHeight: 48, marginTop: 8, paddingHorizontal: 14, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: "#2563eb" },
  retryButtonText: { color: "#ffffff", fontSize: 12, fontWeight: "700" },
  buttonPressed: { opacity: 0.78 },
});
