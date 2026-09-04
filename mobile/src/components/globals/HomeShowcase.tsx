import { Text } from "@/src/components/ui/Typography";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { memo, useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator, FlatList, Image, InteractionManager, Pressable, StyleSheet, useWindowDimensions, View,
  type ListRenderItem,
} from "react-native";
import { loadCatalogData } from "../loja/catalogData";
import type {
  GameSummary,
  ListingItem,
  OfferItem,
  PaginatedResponse,
  Platform,
} from "../loja/store.types";
import {
  buildCatalogState,
  getListingDiscountPercentage,
  getListingDisplayPrice,
  getListingPlatformName,
  toMoney,
} from "../loja/store.utils";
import PlatformLogo, { getPlatformDisplayName } from "../loja/PlatformLogo";
import api from "../../services/api";
import { resolveAssetUrl } from "../../services/assets";

type ShowcasePlatform = { name: string; iconUrl?: Platform["iconUrl"] };

type ShowcaseItem = {
  id: number;
  title: string;
  coverImageUrl?: string;
  platforms: ShowcasePlatform[];
  price: number | null;
  discountPercentage?: number;
};

type ShowcaseData = {
  offers: ShowcaseItem[];
  games: ShowcaseItem[];
  catalogFailed: boolean;
  offersFailed: boolean;
};

const initialData: ShowcaseData = {
  offers: [],
  games: [],
  catalogFailed: false,
  offersFailed: false,
};

function collectPlatforms(listings: ListingItem[]): ShowcasePlatform[] {
  const platformsByName = new Map<string, ShowcasePlatform>();

  for (const listing of listings) {
    const name = getListingPlatformName(listing);
    if (!name) continue;

    const existing = platformsByName.get(name);
    platformsByName.set(name, {
      name,
      iconUrl: listing.platform?.iconUrl ?? existing?.iconUrl,
    });
  }

  return Array.from(platformsByName.values());
}

function mergePlatforms(platforms: ShowcasePlatform[], nextPlatforms: ShowcasePlatform[]) {
  const platformsByName = new Map(platforms.map((platform) => [platform.name, platform]));

  for (const platform of nextPlatforms) {
    const existing = platformsByName.get(platform.name);
    platformsByName.set(platform.name, {
      name: platform.name,
      iconUrl: platform.iconUrl ?? existing?.iconUrl,
    });
  }

  return Array.from(platformsByName.values());
}

function getLowestPrice(listings: ListingItem[]): number | null {
  return listings.reduce<number | null>((lowestPrice, listing) => {
    const price = getListingDisplayPrice(listing);
    if (!Number.isFinite(price) || price <= 0) return lowestPrice;
    return lowestPrice === null || price < lowestPrice ? price : lowestPrice;
  }, null);
}

function buildFeaturedGames(games: GameSummary[], listingByGame: Map<number, ListingItem[]>): ShowcaseItem[] {
  return games
    .map((game) => {
      const listings = listingByGame.get(game.id) ?? [];
      const soldCount = listings.reduce(
        (total, listing) => total + Math.max(0, Number(listing.stock?.sold ?? 0)),
        0,
      );
      const discountPercentage = listings.reduce(
        (largest, listing) => Math.max(largest, Math.round(getListingDiscountPercentage(listing))),
        0,
      );

      return {
        item: {
          id: game.id,
          title: game.title,
          coverImageUrl: game.coverImageUrl,
          platforms: collectPlatforms(listings),
          price: getLowestPrice(listings),
          discountPercentage: discountPercentage > 0 ? discountPercentage : undefined,
        },
        soldCount,
      };
    })
    .sort((first, second) => second.soldCount - first.soldCount || first.item.id - second.item.id)
    .slice(0, 10)
    .map(({ item }) => item);
}

function buildFeaturedOffers(promotions: OfferItem[]): ShowcaseItem[] {
  type OfferCandidate = ShowcaseItem & { soldCount: number };
  const bestByGame = new Map<number, OfferCandidate>();

  for (const promotion of promotions) {
    if (promotion.isActive === false) continue;

    for (const listing of promotion.listings ?? []) {
      if (listing.isActive === false) continue;

      const gameId = listing.game?.id ?? listing.gameId;
      const price = getListingDisplayPrice(listing);
      const discount = Math.round(
        Number(promotion.discountPercentage ?? getListingDiscountPercentage(listing)),
      );

      if (!gameId || !Number.isFinite(price) || price <= 0 || discount <= 0) continue;

      const current = bestByGame.get(gameId);
      const platforms = mergePlatforms(current?.platforms ?? [], collectPlatforms([listing]));
      const candidate: OfferCandidate = {
        id: gameId,
        title: listing.game?.title?.trim() || promotion.name?.trim() || "Jogo em oferta",
        coverImageUrl: listing.game?.coverImageUrl ?? promotion.coverImageUrl ?? undefined,
        platforms,
        price,
        discountPercentage: discount,
        soldCount: Math.max(0, Number(listing.stock?.sold ?? 0)),
      };
      const isBetter =
        !current ||
        candidate.discountPercentage! > current.discountPercentage! ||
        (candidate.discountPercentage === current.discountPercentage && candidate.price! < current.price!);

      bestByGame.set(gameId, isBetter ? candidate : { ...current, platforms });
    }
  }

  return Array.from(bestByGame.values())
    .sort(
      (first, second) =>
        (second.discountPercentage ?? 0) - (first.discountPercentage ?? 0) ||
        second.soldCount - first.soldCount ||
        first.id - second.id,
    )
    .slice(0, 10)
    .map(({ soldCount: _soldCount, ...item }) => item);
}

export default function HomeShowcase() {
  const [data, setData] = useState<ShowcaseData>(initialData);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    const loadShowcase = async () => {
      setLoading(true);
      const [catalogResult, offersResult] = await Promise.allSettled([
        loadCatalogData({ forceRefresh: attempt > 0 }),
        api.get<PaginatedResponse<OfferItem>>("/promotions?page=1&limit=100&activeNow=true"),
      ]);

      if (!isCurrent) return;

      const nextData: ShowcaseData = {
        ...initialData,
        catalogFailed: catalogResult.status === "rejected",
        offersFailed: offersResult.status === "rejected",
      };

      if (catalogResult.status === "fulfilled") {
        const activeListings = catalogResult.value.listings.filter((listing) => listing.isActive !== false);
        const catalog = buildCatalogState(catalogResult.value.games, activeListings);
        nextData.games = buildFeaturedGames(catalog.games, catalog.listingByGame);
      }

      if (offersResult.status === "fulfilled") {
        nextData.offers = buildFeaturedOffers(offersResult.value.items ?? []);
      }

      setData(nextData);
      setLoading(false);
    };

    const task = InteractionManager.runAfterInteractions(() => {
      void loadShowcase();
    });

    return () => {
      isCurrent = false;
      task.cancel();
    };
  }, [attempt]);

  const retry = () => setAttempt((current) => current + 1);
  const allRequestsFailed = data.catalogFailed && data.offersFailed;
  const hasContent = data.offers.length > 0 || data.games.length > 0;

  return (
    <View style={styles.section} accessibilityLabel="Destaques da loja">
      {loading ? <ShowcaseLoading /> : null}

      {!loading && allRequestsFailed ? (
        <View accessibilityRole="alert" style={styles.errorPanel}>
          <Ionicons name="cloud-offline-outline" size={25} color="#fda4af" />
          <View style={styles.errorCopy}>
            <Text style={styles.errorTitle}>Os destaques não carregaram</Text>
            <Text style={styles.errorText}>Verifique sua conexão e tente consultar a loja novamente.</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={retry} style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : null}

      {!loading && !allRequestsFailed && (data.catalogFailed || data.offersFailed) ? (
        <View accessibilityRole="alert" style={styles.warningPanel}>
          <Text style={styles.warningText}>
            {data.catalogFailed ? "Os jogos em destaque não carregaram agora." : "As ofertas em destaque não carregaram agora."}
          </Text>
          <Pressable accessibilityRole="button" onPress={retry} style={({ pressed }) => [styles.warningButton, pressed && styles.pressed]}>
            <Text style={styles.warningAction}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : null}

      {!loading && !data.catalogFailed && !data.offersFailed && !hasContent ? (
        <View style={styles.emptyPanel}>
          <Text style={styles.emptyTitle}>Novidades a caminho</Text>
          <Text style={styles.emptyText}>Ainda não há jogos ou ofertas disponíveis para destacar.</Text>
        </View>
      ) : null}

      {!loading && data.offers.length > 0 ? (
        <GameShelf title="Ofertas em destaque" items={data.offers} accent="offer" />
      ) : null}

      {!loading && data.games.length > 0 ? (
        <GameShelf title="Jogos em destaque" items={data.games} accent="game" />
      ) : null}
    </View>
  );
}

function ShowcaseLoading() {
  return (
    <View accessibilityRole="progressbar" accessibilityLabel="Carregando destaques da loja" style={styles.loadingPanel}>
      <ActivityIndicator color="#60a5fa" />
      <Text style={styles.loadingText}>Carregando destaques...</Text>
    </View>
  );
}

function GameShelf({ title, items, accent }: { title: string; items: ShowcaseItem[]; accent: "offer" | "game" }) {
  const { width } = useWindowDimensions();
  const cardWidth = width >= 700 ? 210 : width < 360 ? 152 : 166;
  const openStore = () => router.push("/(tabs)/loja" as never);
  const renderItem = useCallback<ListRenderItem<ShowcaseItem>>(
    ({ item }) => <ShowcaseCard item={item} width={cardWidth} accent={accent} />,
    [accent, cardWidth],
  );
  const keyExtractor = useCallback((item: ShowcaseItem) => `${accent}-${item.id}`, [accent]);

  return (
    <View style={styles.shelf}>
      <View style={styles.shelfHeader}>
        <Text accessibilityRole="header" style={styles.shelfTitle}>{title}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={`Ver todos em ${title.toLowerCase()}`} onPress={openStore} style={({ pressed }) => [styles.viewAllButton, pressed && styles.pressed]}>
          <Text style={styles.viewAllText}>Ver todos</Text>
          <Ionicons name="chevron-forward" size={17} color="#60a5fa" />
        </Pressable>
      </View>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={cardWidth + 12}
        contentContainerStyle={styles.cardList}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={3}
        removeClippedSubviews
        getItemLayout={(_, index) => ({ length: cardWidth + 12, offset: (cardWidth + 12) * index, index })}
      />
    </View>
  );
}

const ShowcaseCard = memo(function ShowcaseCard({ item, width, accent }: { item: ShowcaseItem; width: number; accent: "offer" | "game" }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = resolveAssetUrl(item.coverImageUrl, "");
  const openGame = () => router.push({ pathname: "/loja/[gameId]", params: { gameId: String(item.id) } } as never);
  const accessibilityLabel = [
    `Abrir detalhes de ${item.title}`,
    item.discountPercentage ? `${item.discountPercentage}% de desconto` : "",
    item.price !== null ? `a partir de ${toMoney(item.price)}` : "preço disponível nos detalhes",
    item.platforms.length > 0 ? `para ${item.platforms.map((platform) => platform.name).join(", ")}` : "",
  ].filter(Boolean).join(", ");

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={openGame}
      style={({ pressed }) => [styles.card, { width }, accent === "offer" && styles.offerCard, pressed && styles.cardPressed]}
    >
      <View style={styles.coverFrame}>
        {imageUrl && !imageFailed ? (
        <Image source={{ uri: imageUrl }} onError={() => setImageFailed(true)} resizeMethod="resize" fadeDuration={0} resizeMode="cover" style={styles.cover} />
        ) : (
          <View style={styles.coverFallback}>
            <Ionicons name="image-outline" size={30} color="#475569" />
            <Text style={styles.coverFallbackText}>Sem capa</Text>
          </View>
        )}
        {item.discountPercentage ? (
          <View style={styles.discountBadge}><Text style={styles.discountText}>-{item.discountPercentage}%</Text></View>
        ) : null}
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        {item.platforms.length > 0 ? (
          <View style={styles.platforms}>
            {item.platforms.map((platform) => (
              <View key={platform.name} style={styles.platformBadge}>
                <PlatformLogo platformName={platform.name} iconUrl={platform.iconUrl} size={14} dense style={styles.platformLogo} />
                <Text adjustsFontSizeToFit minimumFontScale={0.78} numberOfLines={1} style={styles.platformText}>{getPlatformDisplayName(platform.name)}</Text>
              </View>
            ))}
          </View>
        ) : null}
        <Text style={styles.priceHint}>A partir de</Text>
        <Text style={[styles.price, accent === "offer" && styles.offerPrice]}>
          {item.price !== null ? toMoney(item.price) : "Ver opções"}
        </Text>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  section: { paddingTop: 22, paddingBottom: 14, backgroundColor: "#020617" },
  shelf: { marginBottom: 33 },
  shelfHeader: { minHeight: 44, marginBottom: 11, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  shelfTitle: { flex: 1, color: "#ffffff", fontSize: 23, lineHeight: 28, fontWeight: "900", letterSpacing: -0.55 },
  viewAllButton: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 2, paddingLeft: 8 },
  viewAllText: { color: "#60a5fa", fontSize: 13, fontWeight: "800" },
  cardList: { paddingHorizontal: 20, paddingBottom: 4, gap: 12 },
  card: { overflow: "hidden", borderWidth: 1, borderColor: "#1e293b", borderRadius: 16, backgroundColor: "#081120" },
  offerCard: { borderColor: "#24443f" },
  cardPressed: { opacity: 0.8, transform: [{ scale: 0.985 }] },
  coverFrame: { position: "relative", aspectRatio: 16 / 9, overflow: "hidden", backgroundColor: "#0f172a" },
  cover: { width: "100%", height: "100%" },
  coverFallback: { flex: 1, alignItems: "center", justifyContent: "center", gap: 7 },
  coverFallbackText: { color: "#64748b", fontSize: 11, fontWeight: "700" },
  discountBadge: { position: "absolute", top: 10, left: 10, paddingHorizontal: 7, paddingVertical: 5, borderRadius: 8, backgroundColor: "#047857" },
  discountText: { color: "#ffffff", fontSize: 11, fontWeight: "900" },
  platforms: { marginTop: 8, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 5 },
  platformBadge: { width: "48%", minWidth: 0, paddingHorizontal: 6, paddingVertical: 4, flexDirection: "column", alignItems: "center", gap: 3, borderWidth: 1, borderColor: "#475569", borderRadius: 7, backgroundColor: "#0f1b30" },
  platformLogo: { borderColor: "#64748b" },
  platformText: { width: "100%", color: "#e2e8f0", fontSize: 9, lineHeight: 12, fontWeight: "800", textAlign: "center" },
  cardBody: { minHeight: 154, padding: 12 },
  cardTitle: { minHeight: 38, color: "#ffffff", fontSize: 14, lineHeight: 19, fontWeight: "800" },
  priceHint: { marginTop: 8, color: "#94a3b8", fontSize: 11 },
  price: { marginTop: 2, color: "#bfdbfe", fontSize: 16, fontWeight: "900" },
  offerPrice: { color: "#a7f3d0" },
  loadingPanel: { minHeight: 170, marginHorizontal: 20, marginBottom: 26, alignItems: "center", justifyContent: "center", gap: 12, borderRadius: 16, backgroundColor: "#081120" },
  loadingText: { color: "#cbd5e1", fontSize: 14 },
  errorPanel: { marginHorizontal: 20, marginBottom: 26, padding: 18, flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 12, borderWidth: 1, borderColor: "#5b2535", borderRadius: 16, backgroundColor: "#24101a" },
  errorCopy: { minWidth: 190, flex: 1 },
  errorTitle: { color: "#fff1f2", fontSize: 16, fontWeight: "900" },
  errorText: { marginTop: 4, color: "#fecdd3", fontSize: 13, lineHeight: 19 },
  retryButton: { minHeight: 48, alignItems: "center", justifyContent: "center", paddingHorizontal: 14, borderWidth: 1, borderColor: "#9f465f", borderRadius: 11 },
  retryText: { color: "#fff1f2", fontSize: 12, fontWeight: "800" },
  warningPanel: { marginHorizontal: 20, marginBottom: 28, padding: 14, borderWidth: 1, borderColor: "#624714", borderRadius: 14, backgroundColor: "#251b08" },
  warningText: { color: "#fde68a", fontSize: 13, lineHeight: 19 },
  warningButton: { minHeight: 48, alignSelf: "flex-start", justifyContent: "center" },
  warningAction: { color: "#fef3c7", fontSize: 13, fontWeight: "800", textDecorationLine: "underline" },
  emptyPanel: { marginHorizontal: 20, marginBottom: 26, padding: 20, borderRadius: 16, backgroundColor: "#081120" },
  emptyTitle: { color: "#ffffff", fontSize: 17, fontWeight: "900" },
  emptyText: { marginTop: 6, color: "#94a3b8", fontSize: 13, lineHeight: 19 },
  pressed: { opacity: 0.72 },
});
