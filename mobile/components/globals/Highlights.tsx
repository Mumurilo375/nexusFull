import { ImageBackground, ScrollView, type ImageSourcePropType, StyleSheet, Text, useWindowDimensions, View } from "react-native";

const actionImage = require("../../assets/home/highlights/homemaranha.png");
const rpgImage = require("../../assets/home/highlights/eldenring.jpg");

type HighlightsProps = { isExpanded: boolean };

export default function Highlights({ isExpanded }: HighlightsProps) {
  const { width } = useWindowDimensions();
  const availableWidth = width - (isExpanded ? 56 : 40);
  const cardWidth = isExpanded ? availableWidth / 2 : 292;
  const actionImageScale = Math.max(1, (270 / (cardWidth * 0.564)) * 1.03);

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Mundos para cada estilo de jogador</Text>
      <Text style={styles.description}>Comece pelo gênero que combina com o seu ritmo e refine a busca no catálogo.</Text>
      {isExpanded ? (
        <View style={[styles.list, styles.listExpanded]}>
          <GenreHighlight image={actionImage} imageScale={actionImageScale} title="Ação e aventura" description="Enfrente desafios intensos e explore histórias em mundos cheios de movimento." />
          <GenreHighlight image={rpgImage} title="Estratégia e RPG" description="Planeje cada decisão e construa sua própria jornada." />
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mobileList}>
          <GenreHighlight compact image={actionImage} imageScale={actionImageScale} title="Ação e aventura" description="Enfrente desafios intensos e explore histórias em mundos cheios de movimento." />
          <GenreHighlight compact image={rpgImage} title="Estratégia e RPG" description="Planeje cada decisão e construa sua própria jornada." />
        </ScrollView>
      )}
    </View>
  );
}

function GenreHighlight({ image, imageScale = 1, title, description, compact = false }: { image: ImageSourcePropType; imageScale?: number; title: string; description: string; compact?: boolean }) {
  return (
    <ImageBackground source={image} style={[styles.highlight, compact && styles.highlightCompact]} imageStyle={[styles.highlightImage, { transform: [{ scale: imageScale }] }]}>
      <View style={styles.highlightOverlay} />
      <View style={styles.highlightCopy}>
        <Text style={styles.highlightTitle}>{title}</Text>
        <Text style={styles.highlightDescription}>{description}</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: 20, paddingBottom: 52 },
  title: { color: "#ffffff", fontSize: 29, lineHeight: 34, fontWeight: "900", letterSpacing: -0.7 },
  description: { marginTop: 10, maxWidth: 650, color: "#cbd5e1", fontSize: 15, lineHeight: 23 },
  list: { marginTop: 24, gap: 16 },
  listExpanded: { flexDirection: "row" },
  mobileList: { gap: 12, paddingRight: 20 },
  highlight: { minHeight: 270, flex: 1, justifyContent: "flex-end", overflow: "hidden", borderRadius: 16, backgroundColor: "#0f172a" },
  highlightCompact: { width: 292, minHeight: 190, flex: 0 },
  highlightImage: { opacity: 0.84 },
  highlightOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(2, 6, 23, 0.47)" },
  highlightCopy: { padding: 22 },
  highlightTitle: { color: "#ffffff", fontSize: 25, lineHeight: 30, fontWeight: "900", letterSpacing: -0.6 },
  highlightDescription: { marginTop: 8, color: "#e2e8f0", fontSize: 15, lineHeight: 22 },
});
