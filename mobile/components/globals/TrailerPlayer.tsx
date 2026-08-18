import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";

const trailerImage = require("../../assets/home/utils/residenthero.jpg");
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

type TrailerPlayerProps = { isExpanded: boolean; compact?: boolean };

export default function TrailerPlayer({ isExpanded, compact = false }: TrailerPlayerProps) {
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
    <View style={[styles.card, compact && styles.cardCompact, isExpanded && styles.cardExpanded]}>
      <View style={[styles.playerFrame, compact && styles.playerFrameCompact]}>
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
                <Ionicons name="play" size={24} color="#ffffff" style={styles.playIcon} />
              </View>
              <Text style={styles.playLabel}>Assistir ao trailer</Text>
            </Pressable>
          </ImageBackground>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: "100%", marginTop: 26, padding: 4, borderRadius: 18, borderWidth: 1, borderColor: "#334155", backgroundColor: "rgba(2,6,23,0.9)" },
  cardCompact: { marginTop: 18 },
  cardExpanded: { maxWidth: 760, marginTop: 40 },
  playerFrame: { minHeight: 136, aspectRatio: 16 / 6.6, overflow: "hidden", borderRadius: 13, backgroundColor: "#0f172a" },
  playerFrameCompact: { minHeight: 124 },
  webView: { flex: 1, backgroundColor: "#020617" },
  preview: { flex: 1, justifyContent: "center", alignItems: "center" },
  previewImage: { opacity: 0.96 },
  previewOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(2, 6, 23, 0.2)" },
  playAction: { position: "absolute", top: 0, right: 0, bottom: 0, width: "46%", alignItems: "center", justifyContent: "center", gap: 7, padding: 10 },
  playDisc: { width: 52, height: 52, alignItems: "center", justifyContent: "center", borderRadius: 26, backgroundColor: "#2563eb" },
  playIcon: { marginLeft: 2 },
  playLabel: { color: "#ffffff", fontSize: 13, fontWeight: "800", textAlign: "center" },
  errorState: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 18, backgroundColor: "#0f172a" },
  errorTitle: { color: "#e2e8f0", fontSize: 12, lineHeight: 17, fontWeight: "700", textAlign: "center" },
  retryButton: { minHeight: 48, marginTop: 8, paddingHorizontal: 14, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: "#2563eb" },
  retryButtonText: { color: "#ffffff", fontSize: 12, fontWeight: "700" },
  buttonPressed: { opacity: 0.78 },
});
