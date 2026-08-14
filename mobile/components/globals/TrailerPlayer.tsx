import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";

const trailerImage = require("../../assets/home/utils/residenthero.jpg");
const playerOrigin = "https://nexus.store";
const trailerUrl = "https://www.youtube.com/embed/RJ7eRQgJBbo?autoplay=1&rel=0&playsinline=1&origin=https%3A%2F%2Fnexus.store&widget_referrer=https%3A%2F%2Fnexus.store";

const trailerDocument = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="referrer" content="strict-origin-when-cross-origin" />
    <style>
      html, body, iframe { width: 100%; height: 100%; margin: 0; border: 0; background: #020617; }
    </style>
  </head>
  <body>
    <iframe
      src="${trailerUrl}"
      title="Trailer de Resident Evil Requiem"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
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
    <View style={[styles.card, isExpanded && styles.cardExpanded]}>
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
            originWhitelist={["https://*", "about:blank"]}
            onError={() => setHasError(true)}
          />
        ) : hasError ? (
          <View style={styles.errorState}>
            <Text style={styles.errorTitle}>Não foi possível carregar o trailer. Verifique sua conexão e tente novamente.</Text>
            <Pressable accessibilityRole="button" onPress={retryTrailer} style={({ pressed }) => [styles.retryButton, pressed && styles.buttonPressed]}>
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : (
          <ImageBackground source={trailerImage} style={styles.preview} imageStyle={styles.previewImage}>
            <View style={styles.previewOverlay} />
            <Pressable accessibilityRole="button" accessibilityLabel="Reproduzir trailer de Resident Evil Requiem" onPress={startTrailer} style={({ pressed }) => [styles.playAction, pressed && styles.buttonPressed]}>
              <Ionicons name="play-circle" size={58} color="#bfdbfe" />
              <Text style={styles.playLabel}>Assistir ao trailer</Text>
            </Pressable>
          </ImageBackground>
        )}
      </View>
      <Text style={styles.description}>Resident Evil Requiem mistura terror e ação em uma nova investigação ligada ao desastre de Raccoon City.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: "100%", padding: 12, borderRadius: 24, borderWidth: 1, borderColor: "#334155", backgroundColor: "#020617" },
  cardExpanded: { flex: 1, maxWidth: 560 },
  playerFrame: { aspectRatio: 16 / 9, overflow: "hidden", borderRadius: 16, backgroundColor: "#0f172a" },
  webView: { flex: 1, backgroundColor: "#020617" },
  preview: { flex: 1, justifyContent: "center", alignItems: "center" },
  previewImage: { opacity: 0.92 },
  previewOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(2, 6, 23, 0.48)" },
  playAction: { alignItems: "center", justifyContent: "center", gap: 8, minWidth: 160, minHeight: 112, padding: 12 },
  playLabel: { color: "#ffffff", fontSize: 15, fontWeight: "700" },
  description: { marginTop: 14, paddingHorizontal: 4, color: "#cbd5e1", fontSize: 14, lineHeight: 21 },
  errorState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "#0f172a" },
  errorTitle: { color: "#e2e8f0", fontSize: 15, fontWeight: "700", textAlign: "center" },
  retryButton: { minHeight: 44, marginTop: 16, paddingHorizontal: 16, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: "#2563eb" },
  retryButtonText: { color: "#ffffff", fontSize: 14, fontWeight: "700" },
  buttonPressed: { opacity: 0.78 },
});
