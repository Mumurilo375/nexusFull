import { Alert, ScrollView, StatusBar, StyleSheet, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Footer from "../globals/Footer";
import Hero from "../globals/Hero";
import Highlights from "../globals/Highlights";
import HomeHeader from "../globals/HomeHeader";
import Intro from "../globals/Intro";
import Platforms from "../globals/Platforms";

const showCatalogNotice = () => {
  router.push("/(tabs)/loja" as never);
};

const showHowItWorks = () => {
  Alert.alert("Como funciona", "Escolha um jogo, defina a plataforma e avance pelo checkout simulado.");
};

export default function App() {
  const { width } = useWindowDimensions();
  const isExpanded = width >= 700;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, isExpanded && styles.contentExpanded]}
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader />
        <Hero isExpanded={isExpanded} onExploreGames={showCatalogNotice} />
        <Intro isExpanded={isExpanded} onExploreStore={showCatalogNotice} onShowHowItWorks={showHowItWorks} />
        <Highlights isExpanded={isExpanded} />
        <Platforms isExpanded={isExpanded} onExploreGames={showCatalogNotice} />
        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#020617" },
  screen: { flex: 1, backgroundColor: "#020617" },
  content: { paddingBottom: 32 },
  contentExpanded: { alignSelf: "center", width: "100%", maxWidth: 1120 },
});
