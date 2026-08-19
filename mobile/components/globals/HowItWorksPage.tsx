import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Image,
  type ImageSourcePropType,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Footer from "./Footer";

type PlatformGuide = {
  id: "playstation" | "xbox" | "steam" | "nintendo";
  label: string;
  shortLabel: string;
  accent: string;
  tint: string;
  image: ImageSourcePropType;
  routes: { title: string; steps: string[] }[];
};

const purchaseFlow = [
  {
    icon: "bag-handle-outline" as const,
    title: "Escolha o jogo e a plataforma",
    description:
      "Cada versão pode ter preço e estoque diferentes. Confira onde você joga antes de adicionar ao carrinho.",
  },
  {
    icon: "card-outline" as const,
    title: "Finalize o pedido",
    description:
      "Revise o pedido e escolha uma forma de pagamento para concluir o checkout.",
  },
  {
    icon: "key-outline" as const,
    title: "Encontre sua key",
    description:
      "Depois da aprovação, o código fica disponível em Meus pedidos e na sua Biblioteca para consulta.",
  },
] as const;

const platformGuides: PlatformGuide[] = [
  {
    id: "playstation",
    label: "PlayStation",
    shortLabel: "PS",
    accent: "#60a5fa",
    tint: "#0b1d42",
    image: require("../../assets/home/platforms/playstationConsole.png"),
    routes: [
      {
        title: "No console",
        steps: [
          "Abra a PlayStation Store.",
          'Acesse o menu e escolha "Resgatar códigos".',
          "Digite a key, confira os dados e confirme.",
        ],
      },
      {
        title: "No site",
        steps: [
          "Entre em store.playstation.com com a sua conta.",
          'Abra o menu do perfil e escolha "Resgatar códigos".',
          "Cole a key e conclua o resgate.",
        ],
      },
    ],
  },
  {
    id: "xbox",
    label: "Xbox",
    shortLabel: "Xbox",
    accent: "#4ade80",
    tint: "#072b1a",
    image: require("../../assets/home/platforms/xboxConsole.png"),
    routes: [
      {
        title: "No console",
        steps: [
          "Pressione o botão Xbox para abrir o guia.",
          'Entre na Store e escolha "Resgatar código".',
          "Digite o código de 25 caracteres e confirme.",
        ],
      },
      {
        title: "Na Microsoft Store",
        steps: [
          "Abra a Microsoft Store no PC e faça login.",
          'No menu de opções, selecione "Resgatar código".',
          "Cole a key e avance para finalizar.",
        ],
      },
    ],
  },
  {
    id: "steam",
    label: "Steam",
    shortLabel: "Steam",
    accent: "#22d3ee",
    tint: "#073042",
    image: require("../../assets/home/platforms/computador2.png"),
    routes: [
      {
        title: "No aplicativo Steam",
        steps: [
          "Faça login na sua conta.",
          'Abra o menu "Jogos" e escolha "Ativar um produto no Steam".',
          "Aceite os termos, cole a key e conclua.",
        ],
      },
    ],
  },
  {
    id: "nintendo",
    label: "Nintendo Switch",
    shortLabel: "Switch",
    accent: "#fb7185",
    tint: "#3b0a1b",
    image: require("../../assets/home/platforms/nintendoconsole.png"),
    routes: [
      {
        title: "No console",
        steps: [
          "Abra a Nintendo eShop no Switch.",
          "Selecione o usuário que receberá o jogo.",
          'Escolha "Inserir código", digite a key e confirme.',
        ],
      },
      {
        title: "No site",
        steps: [
          "Entre na sua conta Nintendo.",
          "Abra a área de resgate de código.",
          "Cole a key e confirme para liberar o jogo.",
        ],
      },
    ],
  },
];

const reminders = [
  {
    icon: "game-controller-outline" as const,
    title: "Plataforma correta",
    text: "Uma key da Steam não pode ser ativada no Xbox ou no PlayStation.",
  },
  {
    icon: "person-circle-outline" as const,
    title: "Conta certa",
    text: "Confira o perfil conectado antes de confirmar: o jogo fica vinculado a essa conta.",
  },
  {
    icon: "shield-checkmark-outline" as const,
    title: "Uso único",
    text: "Uma key válida normalmente só pode ser resgatada uma vez.",
  },
] as const;

const faqItems = [
  {
    question: "O que são keys de jogos?",
    answer:
      "São códigos alfanuméricos usados para liberar jogos digitais em plataformas como Steam, Xbox, PlayStation e Nintendo.",
  },
  {
    question: "Quando minha key fica disponível?",
    answer:
      "Após a confirmação do pedido, abra Meus pedidos ou Biblioteca e selecione o jogo para consultar o código entregue.",
  },
  {
    question: "Onde encontro a key depois do pedido?",
    answer:
      "Abra Meus pedidos ou Biblioteca e selecione o jogo para consultar o código entregue.",
  },
  {
    question: "Posso usar a mesma key em várias contas?",
    answer:
      "Não. Cada key é de uso único e fica vinculada à conta em que foi resgatada.",
  },
];

export default function HowItWorksPage() {
  const { width } = useWindowDimensions();
  const isExpanded = width >= 720;
  const [selectedPlatformId, setSelectedPlatformId] =
    useState<PlatformGuide["id"]>("playstation");
  const [openFaq, setOpenFaq] = useState<string | null>(faqItems[0].question);
  const selectedPlatform =
    platformGuides.find((platform) => platform.id === selectedPlatformId) ?? platformGuides[0];

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/mobile" as never);
  };

  const openStore = () => router.push("/(tabs)/loja" as never);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >
        <View style={styles.topBar}>
          <View style={styles.topBarInner}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Voltar"
              onPress={goBack}
              hitSlop={6}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            >
              <Ionicons name="arrow-back" size={22} color="#f8fafc" />
            </Pressable>
            <Text accessibilityRole="header" style={styles.topBarTitle}>
              Como funciona
            </Text>
            <View style={styles.topBarSpacer} />
          </View>
        </View>

        <View style={[styles.page, isExpanded && styles.pageExpanded]}>
          <View style={[styles.hero, isExpanded && styles.heroExpanded]}>
            <View style={[styles.heroCopy, isExpanded && styles.heroCopyExpanded]}>
              <View style={styles.heroIcon}>
                <Ionicons name="key-outline" size={25} color="#bfdbfe" />
              </View>
              <Text accessibilityRole="header" style={[styles.heroTitle, isExpanded && styles.heroTitleExpanded]}>
                Do jogo escolhido à key na sua conta
              </Text>
              <Text style={styles.heroText}>
                Uma key é um código digital que libera o jogo na plataforma correspondente. Escolha a plataforma certa e acompanhe cada etapa do pedido.
              </Text>
            </View>

            <View style={[styles.keyPreview, isExpanded && styles.keyPreviewExpanded]}>
              <View style={styles.keyPreviewTop}>
                <View>
                  <Text style={styles.keyPreviewLabel}>Exemplo de key digital</Text>
                  <Text style={styles.keyPreviewGame}>Seu jogo</Text>
                </View>
                <View style={styles.availableBadge}>
                  <View style={styles.availableDot} />
                  <Text style={styles.availableText}>Disponível</Text>
                </View>
              </View>
              <View style={styles.codeLine}>
                <Text style={styles.codeText}>NEXUS •••• ••••</Text>
                <View style={styles.copyIcon}>
                  <Ionicons name="copy-outline" size={19} color="#93c5fd" />
                </View>
              </View>
              <Text style={styles.keyPreviewHelp}>
                O código aparece após a confirmação do pedido.
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>
              Da escolha ao resgate
            </Text>
            <Text style={styles.sectionDescription}>
              Três momentos conectam o catálogo à sua biblioteca.
            </Text>

            <View style={[styles.flow, isExpanded && styles.flowExpanded]}>
              {purchaseFlow.map((item, index) => (
                <View key={item.title} style={[styles.flowItem, isExpanded && styles.flowItemExpanded]}>
                  <View style={[styles.flowRail, isExpanded && styles.flowRailExpanded]}>
                    <View style={styles.flowIcon}>
                      <Ionicons name={item.icon} size={22} color="#bfdbfe" />
                    </View>
                    {index < purchaseFlow.length - 1 ? (
                      <View style={[styles.flowConnector, isExpanded && styles.flowConnectorExpanded]} />
                    ) : null}
                  </View>
                  <View style={styles.flowCopy}>
                    <Text style={styles.flowStep}>Passo {index + 1}</Text>
                    <Text style={styles.flowTitle}>{item.title}</Text>
                    <Text style={styles.flowText}>{item.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>
              Como resgatar sua key
            </Text>
            <Text style={styles.sectionDescription}>
              Selecione a plataforma para ver onde inserir o código.
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.platformTabsScroll}
              contentContainerStyle={styles.platformTabs}
            >
              {platformGuides.map((platform) => {
                const isSelected = platform.id === selectedPlatform.id;

                return (
                  <Pressable
                    key={platform.id}
                    accessibilityRole="tab"
                    accessibilityLabel={platform.label}
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => setSelectedPlatformId(platform.id)}
                    style={({ pressed }) => [
                      styles.platformTab,
                      isSelected && {
                        borderColor: platform.accent,
                        backgroundColor: platform.tint,
                      },
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={[styles.platformTabText, isSelected && styles.platformTabTextSelected]}>
                      {platform.shortLabel}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View
              style={[
                styles.platformGuide,
                { backgroundColor: selectedPlatform.tint },
                isExpanded && styles.platformGuideExpanded,
              ]}
            >
              <View style={[styles.platformIntro, isExpanded && styles.platformIntroExpanded]}>
                <View>
                  <Text style={styles.platformGuideLabel}>Resgate em</Text>
                  <Text style={styles.platformGuideTitle}>{selectedPlatform.label}</Text>
                </View>
                <Image
                  source={selectedPlatform.image}
                  resizeMode="contain"
                  accessibilityLabel={`Dispositivo ${selectedPlatform.label}`}
                  style={[styles.platformImage, isExpanded && styles.platformImageExpanded]}
                />
              </View>

              <View style={[styles.guideRoutes, isExpanded && styles.guideRoutesExpanded]}>
                {selectedPlatform.routes.map((route) => (
                  <View key={`${selectedPlatform.id}-${route.title}`} style={styles.guideRoute}>
                    <Text style={styles.guideRouteTitle}>{route.title}</Text>
                    {route.steps.map((step, index) => (
                      <View key={step} style={styles.guideStep}>
                        <View
                          style={[
                            styles.guideStepNumber,
                            { borderColor: selectedPlatform.accent },
                          ]}
                        >
                          <Text style={styles.guideStepNumberText}>{index + 1}</Text>
                        </View>
                        <Text style={styles.guideStepText}>{step}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>
              Antes de confirmar
            </Text>
            <Text style={styles.sectionDescription}>
              Estes detalhes ajudam a ativar o jogo na conta certa.
            </Text>

            <View style={[styles.reminders, isExpanded && styles.remindersExpanded]}>
              {reminders.map((reminder) => (
                <View key={reminder.title} style={[styles.reminder, isExpanded && styles.reminderExpanded]}>
                  <View style={styles.reminderIcon}>
                    <Ionicons name={reminder.icon} size={21} color="#67e8f9" />
                  </View>
                  <View style={styles.reminderCopy}>
                    <Text style={styles.reminderTitle}>{reminder.title}</Text>
                    <Text style={styles.reminderText}>{reminder.text}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>
              Perguntas frequentes
            </Text>
            <Text style={styles.sectionDescription}>
              O essencial para navegar pela loja com confiança.
            </Text>

            <View style={styles.faqList}>
              {faqItems.map((item) => {
                const isOpen = item.question === openFaq;

                return (
                  <View key={item.question} style={styles.faqItem}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ expanded: isOpen }}
                      onPress={() => setOpenFaq(isOpen ? null : item.question)}
                      style={({ pressed }) => [styles.faqButton, pressed && styles.pressed]}
                    >
                      <Text style={styles.faqQuestion}>{item.question}</Text>
                      <Ionicons
                        name={isOpen ? "remove" : "add"}
                        size={21}
                        color={isOpen ? "#60a5fa" : "#94a3b8"}
                      />
                    </Pressable>
                    {isOpen ? <Text style={styles.faqAnswer}>{item.answer}</Text> : null}
                  </View>
                );
              })}
            </View>
          </View>

          <View style={[styles.finalCta, isExpanded && styles.finalCtaExpanded]}>
            <View style={styles.finalCtaCopy}>
              <Text style={styles.finalCtaTitle}>Pronto para conhecer o fluxo?</Text>
              <Text style={styles.finalCtaText}>
                Explore o catálogo, escolha uma plataforma e acompanhe a jornada completa.
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Explorar a loja"
              onPress={openStore}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            >
              <Ionicons name="game-controller-outline" size={20} color="#ffffff" />
              <Text style={styles.primaryButtonText}>Explorar a loja</Text>
              <Ionicons name="arrow-forward" size={18} color="#ffffff" />
            </Pressable>
          </View>
        </View>

        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#020617" },
  screen: { flex: 1, backgroundColor: "#020617" },
  scrollContent: { paddingBottom: 16 },
  topBar: { zIndex: 20, borderBottomWidth: 1, borderBottomColor: "#1e293b", backgroundColor: "#020617" },
  topBarInner: { width: "100%", maxWidth: 1040, minHeight: 64, alignSelf: "center", paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backButton: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: 24 },
  topBarTitle: { color: "#f8fafc", fontSize: 17, fontWeight: "800" },
  topBarSpacer: { width: 48, height: 48 },
  page: { width: "100%", paddingHorizontal: 20 },
  pageExpanded: { maxWidth: 1040, alignSelf: "center", paddingHorizontal: 28 },
  hero: { paddingTop: 36, paddingBottom: 28 },
  heroExpanded: { minHeight: 430, paddingTop: 56, paddingBottom: 48, flexDirection: "row", alignItems: "center", gap: 52 },
  heroCopy: { maxWidth: 610 },
  heroCopyExpanded: { flex: 1 },
  heroIcon: { width: 52, height: 52, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: "#172554" },
  heroTitle: { maxWidth: 620, marginTop: 22, color: "#ffffff", fontSize: 38, lineHeight: 41, fontWeight: "900", letterSpacing: -1.1 },
  heroTitleExpanded: { fontSize: 52, lineHeight: 55, letterSpacing: -1.5 },
  heroText: { maxWidth: 620, marginTop: 16, color: "#cbd5e1", fontSize: 16, lineHeight: 25 },
  keyPreview: { marginTop: 30, padding: 20, borderWidth: 1, borderColor: "#26344d", borderRadius: 16, backgroundColor: "#07101f" },
  keyPreviewExpanded: { width: 385, marginTop: 0 },
  keyPreviewTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  keyPreviewLabel: { color: "#94a3b8", fontSize: 12, fontWeight: "700" },
  keyPreviewGame: { marginTop: 5, color: "#ffffff", fontSize: 18, fontWeight: "800" },
  availableBadge: { minHeight: 30, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 15, backgroundColor: "#0b2f24" },
  availableDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#34d399" },
  availableText: { color: "#a7f3d0", fontSize: 11, fontWeight: "800" },
  codeLine: { minHeight: 58, marginTop: 20, paddingLeft: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: "#334155", borderRadius: 12, backgroundColor: "#0f172a" },
  codeText: { color: "#dbeafe", fontSize: 16, fontWeight: "800", letterSpacing: 0.5 },
  copyIcon: { width: 52, height: 56, alignItems: "center", justifyContent: "center" },
  keyPreviewHelp: { marginTop: 13, color: "#94a3b8", fontSize: 13, lineHeight: 20 },
  section: { paddingTop: 56 },
  sectionTitle: { maxWidth: 660, color: "#ffffff", fontSize: 29, lineHeight: 34, fontWeight: "900", letterSpacing: -0.7 },
  sectionDescription: { maxWidth: 660, marginTop: 10, color: "#94a3b8", fontSize: 15, lineHeight: 23 },
  flow: { marginTop: 28 },
  flowExpanded: { flexDirection: "row", gap: 26 },
  flowItem: { minHeight: 148, flexDirection: "row", gap: 16 },
  flowItemExpanded: { minHeight: 0, flex: 1, flexDirection: "column", gap: 15 },
  flowRail: { width: 48, alignItems: "center" },
  flowRailExpanded: { width: "100%", flexDirection: "row", alignItems: "center" },
  flowIcon: { zIndex: 1, width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: "#172554" },
  flowConnector: { width: 1, flex: 1, backgroundColor: "#26344d" },
  flowConnectorExpanded: { width: "auto", height: 1, flex: 1 },
  flowCopy: { flex: 1, paddingBottom: 26 },
  flowStep: { color: "#60a5fa", fontSize: 12, fontWeight: "800" },
  flowTitle: { marginTop: 5, color: "#ffffff", fontSize: 19, lineHeight: 24, fontWeight: "800" },
  flowText: { marginTop: 7, color: "#cbd5e1", fontSize: 14, lineHeight: 22 },
  platformTabsScroll: { marginTop: 24, marginHorizontal: -20 },
  platformTabs: { paddingHorizontal: 20, gap: 8 },
  platformTab: { minHeight: 48, justifyContent: "center", paddingHorizontal: 16, borderWidth: 1, borderColor: "#334155", borderRadius: 12, backgroundColor: "#0f172a" },
  platformTabText: { color: "#94a3b8", fontSize: 14, fontWeight: "800" },
  platformTabTextSelected: { color: "#ffffff" },
  platformGuide: { marginTop: 14, padding: 20, borderRadius: 16 },
  platformGuideExpanded: { minHeight: 390, flexDirection: "row", gap: 36, padding: 30 },
  platformIntro: { minHeight: 172, overflow: "hidden", flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 },
  platformIntroExpanded: { width: "35%", minHeight: 0, flexDirection: "column" },
  platformGuideLabel: { color: "#cbd5e1", fontSize: 13, fontWeight: "700" },
  platformGuideTitle: { maxWidth: 180, marginTop: 5, color: "#ffffff", fontSize: 28, lineHeight: 32, fontWeight: "900", letterSpacing: -0.6 },
  platformImage: { width: 150, height: 158, marginTop: -2 },
  platformImageExpanded: { width: "100%", height: 205, marginTop: 18 },
  guideRoutes: { gap: 26 },
  guideRoutesExpanded: { flex: 1, justifyContent: "center" },
  guideRoute: { gap: 12 },
  guideRouteTitle: { color: "#ffffff", fontSize: 17, fontWeight: "800" },
  guideStep: { minHeight: 34, flexDirection: "row", alignItems: "flex-start", gap: 11 },
  guideStepNumber: { width: 26, height: 26, flexShrink: 0, alignItems: "center", justifyContent: "center", borderWidth: 1, borderRadius: 13, backgroundColor: "rgba(2,6,23,0.42)" },
  guideStepNumberText: { color: "#ffffff", fontSize: 12, fontWeight: "800" },
  guideStepText: { flex: 1, paddingTop: 2, color: "#e2e8f0", fontSize: 14, lineHeight: 21 },
  reminders: { marginTop: 24, borderTopWidth: 1, borderTopColor: "#1e293b" },
  remindersExpanded: { flexDirection: "row", gap: 28 },
  reminder: { minHeight: 106, paddingVertical: 20, flexDirection: "row", alignItems: "flex-start", gap: 14, borderBottomWidth: 1, borderBottomColor: "#1e293b" },
  reminderExpanded: { flex: 1, borderTopWidth: 1, borderBottomWidth: 0 },
  reminderIcon: { width: 44, height: 44, flexShrink: 0, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: "#083344" },
  reminderCopy: { flex: 1 },
  reminderTitle: { color: "#ffffff", fontSize: 16, fontWeight: "800" },
  reminderText: { marginTop: 6, color: "#cbd5e1", fontSize: 14, lineHeight: 21 },
  faqList: { marginTop: 24, borderTopWidth: 1, borderTopColor: "#26344d" },
  faqItem: { borderBottomWidth: 1, borderBottomColor: "#26344d" },
  faqButton: { minHeight: 64, paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16 },
  faqQuestion: { flex: 1, color: "#f8fafc", fontSize: 16, lineHeight: 22, fontWeight: "800" },
  faqAnswer: { maxWidth: 720, paddingBottom: 20, color: "#cbd5e1", fontSize: 14, lineHeight: 22 },
  finalCta: { marginTop: 60, padding: 24, gap: 22, borderRadius: 16, backgroundColor: "#0f172a" },
  finalCtaExpanded: { padding: 32, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  finalCtaCopy: { flex: 1, maxWidth: 560 },
  finalCtaTitle: { color: "#ffffff", fontSize: 24, lineHeight: 29, fontWeight: "900", letterSpacing: -0.5 },
  finalCtaText: { marginTop: 8, color: "#cbd5e1", fontSize: 14, lineHeight: 22 },
  primaryButton: { minHeight: 52, paddingHorizontal: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, borderRadius: 12, backgroundColor: "#2563eb" },
  primaryButtonText: { color: "#ffffff", fontSize: 15, fontWeight: "800" },
  pressed: { opacity: 0.72 },
});
