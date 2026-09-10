import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { useState, type ReactNode } from "react";
import { Image, Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { Text } from "@/src/components/ui/Typography";
import {
  AdminButton,
  AdminNotice,
  AdminSelectField,
  AdminTextField,
  AdminTextareaField,
  AdminToggleField,
  adminColors,
  adminStyles,
} from "../shared/adminShared";
import type { AdminOfferFormState, AdminOfferListingOption, UploadFile } from "../shared/admin.types";
import { resolvePreviewUrl } from "../../../services/assets";
import { getImageFileName } from "../../../services/image-upload";
import { buildListingLabel, normalizeDiscountInput } from "./adminOffers.helpers";

async function pickImage(onPick: (file: UploadFile | null) => void) {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return;
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: false, quality: 0.85 });
  if (result.canceled) return;
  const asset = result.assets[0];
  if (!asset) return;
  const type = asset.mimeType ?? "image/jpeg";
  const name = asset.fileName ?? getImageFileName("oferta", type);
  onPick({ uri: asset.uri, name, type, file: asset.file });
}

export default function AdminOffersForm({
  state,
  platformOptions,
  selectedListings,
  editing,
  error,
  message,
  saving,
  onField,
  onSubmit,
  onReset,
  onAddPlatform,
  onPickListings,
  onRemoveListing,
  coverFile,
  bannerFile,
  onCover,
  onBanner,
}: {
  state: AdminOfferFormState;
  platformOptions: { id: number; name: string }[];
  selectedListings: AdminOfferListingOption[];
  editing: boolean;
  error: string;
  message: string;
  saving: boolean;
  onField: (field: keyof AdminOfferFormState, value: string | boolean) => void;
  onSubmit: () => void;
  onReset: () => void;
  onAddPlatform: () => void;
  onPickListings: () => void;
  onRemoveListing: (id: number) => void;
  coverFile: UploadFile | null;
  bannerFile: UploadFile | null;
  onCover: (file: UploadFile | null) => void;
  onBanner: (file: UploadFile | null) => void;
}) {
  const { width } = useWindowDimensions();
  const compact = width < 520;
  const [picking, setPicking] = useState<"cover" | "banner" | null>(null);

  const choose = async (kind: "cover" | "banner") => {
    try {
      setPicking(kind);
      await pickImage(kind === "cover" ? onCover : onBanner);
    } finally {
      setPicking(null);
    }
  };

  return (
    <View style={adminStyles.card}>
      <FormSection title="Informações básicas" description="Dê contexto para a campanha aparecer com clareza na loja.">
        <AdminTextField label="Nome da oferta" value={state.name} onChangeText={(value) => onField("name", value)} placeholder="Ex.: Semana do terror" note="Use um nome curto e fácil de reconhecer no catálogo." />
        <AdminTextareaField label="Descrição" value={state.description} onChangeText={(value) => onField("description", value)} placeholder="Apresente a promoção em uma frase" note="Opcional. Explique o destaque ou o período da campanha." />
      </FormSection>

      <FormSection title="Desconto e período" description="Essas informações controlam quando a campanha fica válida.">
        <View style={[styles.two, compact && styles.stack]}>
          <View style={styles.flexField}><AdminTextField label="Desconto (%)" value={state.discountPercentage} onChangeText={(value) => onField("discountPercentage", normalizeDiscountInput(value))} keyboardType="numeric" placeholder="25" note="De 1 a 100%." /></View>
          <View style={styles.flexField}><AdminToggleField label="Oferta ativa" checked={state.isActive} onChange={(value) => onField("isActive", value)} /></View>
        </View>
        <View style={[styles.two, compact && styles.stack]}>
          <View style={styles.flexField}><AdminTextField label="Data inicial" value={state.startDate} onChangeText={(value) => onField("startDate", value)} placeholder="AAAA-MM-DD" /></View>
          <View style={styles.flexField}><AdminTextField label="Data final" value={state.endDate} onChangeText={(value) => onField("endDate", value)} placeholder="AAAA-MM-DD" /></View>
        </View>
      </FormSection>

      <FormSection title="Jogos vinculados" description="Escolha as ofertas por plataforma que receberão o desconto.">
        <View style={[styles.platformRow, compact && styles.stack]}>
          <View style={styles.flexField}>
            <AdminSelectField label="Adicionar por plataforma" value={state.platformId} options={[{ label: "Selecione uma plataforma", value: "" }, ...platformOptions.map((item) => ({ label: item.name, value: String(item.id) }))]} onChange={(value) => onField("platformId", value)} note="Isso adiciona todas as ofertas dessa plataforma." />
          </View>
          <AdminButton tone="secondary" disabled={!state.platformId} onPress={onAddPlatform} style={styles.addButton}>Adicionar plataforma</AdminButton>
        </View>

        <View style={styles.selectedHeader}>
          <View style={styles.selectedCopy}><Text style={adminStyles.sectionTitle}>Seleção atual</Text><Text style={adminStyles.muted}>{selectedListings.length ? `${selectedListings.length} oferta(s) vinculada(s)` : "Nenhum jogo selecionado"}</Text></View>
          <AdminButton tone="secondary" onPress={onPickListings}>Escolher jogos</AdminButton>
        </View>

        {selectedListings.length ? <View style={styles.listingList}>{selectedListings.map((listing) => <View key={listing.id} style={styles.listing}>
          <View style={styles.listingIcon}><Ionicons name="game-controller-outline" size={18} color={adminColors.cyan} /></View>
          <Text style={styles.listingText} numberOfLines={2}>{buildListingLabel(listing)}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={`Remover ${buildListingLabel(listing)}`} onPress={() => onRemoveListing(listing.id)} style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}><Ionicons name="close" size={19} color="#fecdd3" /></Pressable>
        </View>)}</View> : <View style={styles.selectionEmpty}><Ionicons name="albums-outline" size={22} color={adminColors.muted} /><Text style={adminStyles.muted}>A campanha precisa de pelo menos um jogo para ser salva.</Text></View>}
      </FormSection>

      <FormSection title="Imagens da campanha" description="Use imagens consistentes para capa e banner. URLs https:// também são aceitas.">
        <MediaField label="Capa principal" url={state.coverImageUrl} file={coverFile} onUrl={(value) => onField("coverImageUrl", value)} onChoose={() => void choose("cover")} picking={picking === "cover"} compact={compact} />
        <MediaField label="Banner da página" url={state.bannerImageUrl} file={bannerFile} onUrl={(value) => onField("bannerImageUrl", value)} onChoose={() => void choose("banner")} picking={picking === "banner"} compact={compact} />
      </FormSection>

      {error ? <AdminNotice>{error}</AdminNotice> : null}
      {message ? <AdminNotice tone="success">{message}</AdminNotice> : null}
      <View style={styles.footer}>
        <AdminButton disabled={saving} onPress={onSubmit} style={styles.submitButton}>{saving ? "Salvando..." : editing ? "Salvar alterações" : "Criar oferta"}</AdminButton>
        <AdminButton tone="secondary" disabled={saving} onPress={onReset} style={styles.resetButton}>Limpar formulário</AdminButton>
      </View>
    </View>
  );
}

function FormSection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <View style={styles.section}><View style={styles.sectionHeader}><Text style={adminStyles.sectionTitle}>{title}</Text><Text style={adminStyles.muted}>{description}</Text></View><View style={styles.sectionContent}>{children}</View></View>;
}

function MediaField({ label, url, file, onUrl, onChoose, picking, compact }: { label: string; url: string; file: UploadFile | null; onUrl: (value: string) => void; onChoose: () => void; picking: boolean; compact: boolean }) {
  const preview = file?.uri || resolvePreviewUrl(url);
  return <View style={[styles.media, compact && styles.mediaCompact]}>
    <View style={styles.mediaPreview}>{preview ? <Image source={{ uri: preview }} style={styles.mediaImage} resizeMode="cover" /> : <Ionicons name="image-outline" size={24} color={adminColors.muted} />}</View>
    <View style={styles.mediaFields}><Text style={adminStyles.label}>{label}</Text><Pressable accessibilityRole="button" accessibilityLabel={`Escolher imagem para ${label}`} onPress={onChoose} style={({ pressed }) => [styles.upload, pressed && styles.pressed]}><Ionicons name="image-outline" size={17} color={adminColors.cyan} /><Text style={styles.uploadText}>{picking ? "Abrindo fotos..." : "Escolher da galeria"}</Text></Pressable>{file ? <Text style={adminStyles.muted} numberOfLines={1}>{file.name}</Text> : null}<AdminTextField label="URL da imagem" value={url} onChangeText={onUrl} placeholder="https://..." autoCapitalize="none" /></View>
  </View>;
}

const styles = StyleSheet.create({
  section: { paddingTop: 2 },
  sectionHeader: { gap: 5, paddingBottom: 13, borderBottomWidth: 1, borderBottomColor: adminColors.softBorder },
  sectionContent: { gap: 14, paddingTop: 15 },
  two: { flexDirection: "row", gap: 12 },
  stack: { flexDirection: "column" },
  flexField: { flex: 1, minWidth: 0 },
  platformRow: { flexDirection: "row", alignItems: "flex-end", gap: 10 },
  addButton: { marginBottom: 1 },
  selectedHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  selectedCopy: { flex: 1, minWidth: 0, gap: 4 },
  listingList: { gap: 7 },
  listing: { minHeight: 56, flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: adminColors.softBorder, borderRadius: 12, backgroundColor: adminColors.deep, paddingLeft: 10, paddingRight: 4 },
  listingIcon: { width: 32, height: 32, alignItems: "center", justifyContent: "center", borderRadius: 9, backgroundColor: adminColors.primarySoft },
  listingText: { flex: 1, color: adminColors.white, fontSize: 13, lineHeight: 18, fontWeight: "600" },
  removeButton: { minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
  selectionEmpty: { minHeight: 66, flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderStyle: "dashed", borderColor: adminColors.border, borderRadius: 12, padding: 13 },
  media: { flexDirection: "row", gap: 13, borderWidth: 1, borderColor: adminColors.softBorder, borderRadius: 14, backgroundColor: adminColors.deep, padding: 11 },
  mediaCompact: { flexDirection: "column" },
  mediaPreview: { width: 104, height: 104, alignItems: "center", justifyContent: "center", borderRadius: 11, backgroundColor: adminColors.surface, overflow: "hidden" },
  mediaImage: { width: "100%", height: "100%" },
  mediaFields: { flex: 1, minWidth: 0, gap: 9 },
  upload: { minHeight: 44, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 7, borderWidth: 1, borderColor: adminColors.border, borderRadius: 12, paddingHorizontal: 12 },
  uploadText: { color: adminColors.secondary, fontSize: 13, fontWeight: "700" },
  footer: { gap: 9, paddingTop: 4 },
  submitButton: { width: "100%" },
  resetButton: { width: "100%" },
  pressed: { opacity: 0.7 },
});
