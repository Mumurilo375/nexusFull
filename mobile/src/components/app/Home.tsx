import { useCallback } from "react";
import { FlatList, Platform, StatusBar, StyleSheet, useWindowDimensions, View, type ListRenderItem } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Footer from "../globals/Footer";
import Hero from "../globals/Hero";
import Highlights from "../globals/Highlights";
import HomeHeader from "../globals/HomeHeader";
import HomeShowcase from "../globals/HomeShowcase";
import Platforms from "../globals/Platforms";
import TrailerPlayer from "../globals/TrailerPlayer";

const showCatalogNotice = (platform?: string) => {
  router.push(platform ? { pathname: "/(tabs)/loja", params: { platform } } as never : "/(tabs)/loja" as never);
};

const homeSections = ["hero", "trailer", "showcase", "highlights", "platforms"] as const;
type HomeSection = (typeof homeSections)[number];

export default function Home() {
  const { width } = useWindowDimensions();
  const isExpanded = width >= 700;
  const handleShowHowItWorks = useCallback(() => router.push("/comofunciona" as never), []);
  const renderSection = useCallback<ListRenderItem<HomeSection>>(({ item }) => {
    switch (item) {
      case "hero":
        return <Hero isExpanded={isExpanded} onExploreGames={showCatalogNotice} onShowHowItWorks={handleShowHowItWorks} />;
      case "trailer":
        return <TrailerPlayer isExpanded={isExpanded} />;
      case "showcase":
        return <HomeShowcase />;
      case "highlights":
        return <Highlights isExpanded={isExpanded} />;
      case "platforms":
        return <Platforms isExpanded={isExpanded} onExploreGames={showCatalogNotice} />;
    }
  }, [handleShowHowItWorks, isExpanded]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.screen}>
        <HomeHeader />
        <FlatList
          data={homeSections}
          renderItem={renderSection}
          keyExtractor={(item) => item}
          ListFooterComponent={Footer}
          contentContainerStyle={[styles.content, isExpanded && styles.contentExpanded]}
          showsVerticalScrollIndicator={false}
          initialNumToRender={2}
          maxToRenderPerBatch={2}
          windowSize={4}
          removeClippedSubviews={Platform.OS === "android"}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#020617" },
  screen: { flex: 1, backgroundColor: "#020617" },
  content: { paddingBottom: 24 },
  contentExpanded: { alignSelf: "center", width: "100%", maxWidth: 1120 },
});
