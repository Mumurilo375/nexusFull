import { ImageBackground, type ImageSourcePropType, StyleSheet, Text, useWindowDimensions, View } from "react-native";

const actionImage = require("../../assets/home/highlights/homemaranha.png");
const rpgImage = require("../../assets/home/highlights/eldenring.jpg");

type HighlightsProps = { isExpanded: boolean };

export default function Highlights({ isExpanded }: HighlightsProps) {
  const { width } = useWindowDimensions();
  const availableWidth = width - (isExpanded ? 56 : 40);
  const cardWidth = isExpanded ? availableWidth / 2 : availableWidth;
  const actionImageScale = Math.max(1, (270 / (cardWidth * 0.564)) * 1.03);

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Mundos para cada estilo de jogador</Text>
      <Text style={styles.description}>Comece pelo gênero que combina com o seu ritmo e refine a busca no catálogo.</Text>
      <View style={[styles.list, isExpanded && styles.listExpanded]}>
        <GenreHighlight image={actionImage} imageScale={actionImageScale} title="Ação e aventura" description="Enfrente desafios intensos e explore histórias em mundos cheios de movimento." />
        <GenreHighlight image={rpgImage} title="Estratégia e RPG" description="Planeje cada decisão e construa sua própria jornada." />
      </View>
    </View>
  );
}

function GenreHighlight({ image, imageScale = 1, title, description }: { image: ImageSourcePropType; imageScale?: number; title: string; description: string }) {
  return (
    <ImageBackground source={image} style={styles.highlight} imageStyle={[styles.highlightImage, { transform: [{ scale: imageScale }] }]}>
      <View style={styles.highlightOverlay} />
      <View style={styles.highlightCopy}>
        <Text style={styles.highlightTitle}>{title}</Text>
        <Text style={styles.highlightDescription}>{description}</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: 20, paddingBottom: 64 },
  title: { color: "#ffffff", fontSize: 31, lineHeight: 36, fontWeight: "900", letterSpacing: -1 },
  description: { marginTop: 14, maxWidth: 650, color: "#cbd5e1", fontSize: 16, lineHeight: 24 },
  list: { marginTop: 24, gap: 16 },
  listExpanded: { flexDirection: "row" },
  highlight: { minHeight: 270, flex: 1, justifyContent: "flex-end", overflow: "hidden", borderRadius: 16, backgroundColor: "#0f172a" },
  highlightImage: { opacity: 0.84 },
  highlightOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(2, 6, 23, 0.47)" },
  highlightCopy: { padding: 22 },
  highlightTitle: { color: "#ffffff", fontSize: 25, lineHeight: 30, fontWeight: "900", letterSpacing: -0.6 },
  highlightDescription: { marginTop: 8, color: "#e2e8f0", fontSize: 15, lineHeight: 22 },
});
