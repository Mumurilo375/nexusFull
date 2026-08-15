import { useState } from "react";
import { ScrollView, StatusBar, StyleSheet, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Footer from "../globals/Footer";
import Hero from "../globals/Hero";
import Highlights from "../globals/Highlights";
import HomeHeader from "../globals/HomeHeader";
import HowItWorksSheet from "../globals/HowItWorksSheet";
import Platforms from "../globals/Platforms";

const showCatalogNotice = (platform?: string) => {
  router.push(platform ? { pathname: "/(tabs)/loja", params: { platform } } as never : "/(tabs)/loja" as never);
};

export default function App() {
  const { width } = useWindowDimensions();
  const isExpanded = width >= 700;
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const openStoreFromSheet = () => {
    setShowHowItWorks(false);
    showCatalogNotice();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, isExpanded && styles.contentExpanded]}
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader />
        <Hero isExpanded={isExpanded} onExploreGames={showCatalogNotice} onShowHowItWorks={() => setShowHowItWorks(true)} />
        <Platforms isExpanded={isExpanded} onExploreGames={showCatalogNotice} />
        <Highlights isExpanded={isExpanded} />
        <Footer />
      </ScrollView>
      <HowItWorksSheet visible={showHowItWorks} onClose={() => setShowHowItWorks(false)} onExplore={openStoreFromSheet} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#020617" },
  screen: { flex: 1, backgroundColor: "#020617" },
  content: { paddingBottom: 24 },
  contentExpanded: { alignSelf: "center", width: "100%", maxWidth: 1120 },
});
