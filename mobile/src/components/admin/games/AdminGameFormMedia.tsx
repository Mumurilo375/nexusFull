import { Text } from "@/src/components/ui/Typography";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { resolvePreviewUrl } from "../../../services/assets";
import { getImageFileName } from "../../../services/image-upload";
import {
  AdminButton,
  AdminNotice,
  AdminTextField,
  adminColors,
  adminStyles,
} from "../shared/adminShared";
import type { GalleryItem, GameValues, UploadFile } from "../shared/admin.types";

type Props = {
  values: GameValues;
  coverFile: UploadFile | null;
  coverPreviewUrl: string;
  galleryItems: GalleryItem[];
  galleryUrlInput: string;
  onCoverFile: (file: UploadFile | null) => void;
  onClearCover: () => void;
  onSetCoverUrl: (value: string) => void;
  onGalleryUrlChange: (value: string) => void;
  onAddGalleryUrl: () => void;
  onAddGalleryFile: (file: UploadFile) => void;
  onMoveGallery: (key: string, direction: -1 | 1) => void;
  onRemoveGallery: (key: string) => void;
};

export default function AdminGameFormMedia({
  values,
  coverFile,
  coverPreviewUrl,
  galleryItems,
  galleryUrlInput,
  onCoverFile,
  onClearCover,
  onSetCoverUrl,
  onGalleryUrlChange,
  onAddGalleryUrl,
  onAddGalleryFile,
  onMoveGallery,
  onRemoveGallery,
}: Props) {
  const [picking, setPicking] = useState<"cover" | "gallery" | null>(null);
  const [mediaError, setMediaError] = useState("");

  const chooseImage = async (kind: "cover" | "gallery") => {
    try {
      setPicking(kind);
      setMediaError("");
      const file = await pickImage();
      if (!file) return;
      if (kind === "cover") onCoverFile(file);
      else onAddGalleryFile(file);
    } catch {
      setMediaError("Não foi possível abrir suas imagens. Verifique a permissão e tente novamente.");
    } finally {
      setPicking(null);
    }
  };

  return (
    <>
      <View style={[adminStyles.card, styles.section]}>
        <View style={styles.sectionHeader}>
          <Text style={adminStyles.sectionTitle}>Capa principal</Text>
          <Text style={styles.sectionDescription}>Use uma imagem horizontal ou vertical com boa leitura em tamanho reduzido.</Text>
        </View>
        <View style={styles.coverLayout}>
          <View style={styles.preview}>
            <Image source={{ uri: resolvePreviewUrl(coverPreviewUrl) }} style={styles.previewImage} resizeMode="contain" />
          </View>
          <View style={styles.coverControls}>
            <AdminButton tone="secondary" disabled={picking === "cover"} onPress={() => void chooseImage("cover")}>
              <View style={styles.buttonContent}><Ionicons name="cloud-upload-outline" size={18} color={adminColors.secondary} /><Text style={styles.buttonText}>{picking === "cover" ? "Abrindo imagens..." : "Escolher capa"}</Text></View>
            </AdminButton>
            {coverFile ? <View style={styles.fileRow}><Text style={styles.fileName} numberOfLines={1}>{coverFile.name}</Text><Pressable accessibilityRole="button" accessibilityLabel="Remover arquivo de capa" onPress={onClearCover} style={({ pressed }) => [styles.removeFile, pressed && styles.pressed]}><Ionicons name="trash-outline" size={17} color="#fda4af" /></Pressable></View> : null}
            <AdminTextField label="URL alternativa" value={values.coverImageUrl} onChangeText={onSetCoverUrl} placeholder="https://..." note="O arquivo escolhido tem prioridade sobre a URL." autoCapitalize="none" />
          </View>
        </View>
      </View>

      <View style={[adminStyles.card, styles.section]}>
        <View style={styles.sectionHeader}>
          <Text style={adminStyles.sectionTitle}>Galeria</Text>
          <Text style={styles.sectionDescription}>Adicione imagens extras e defina a ordem em que aparecem nos detalhes.</Text>
        </View>
        <AdminButton tone="secondary" disabled={picking === "gallery"} onPress={() => void chooseImage("gallery")}>
          <View style={styles.buttonContent}><Ionicons name="images-outline" size={18} color={adminColors.secondary} /><Text style={styles.buttonText}>{picking === "gallery" ? "Abrindo imagens..." : "Adicionar imagem"}</Text></View>
        </AdminButton>
        <View style={styles.urlRow}>
          <View style={styles.urlField}><AdminTextField label="Ou adicione por URL" value={galleryUrlInput} onChangeText={onGalleryUrlChange} placeholder="https://..." autoCapitalize="none" /></View>
          <AdminButton tone="secondary" disabled={!galleryUrlInput.trim()} onPress={onAddGalleryUrl} style={styles.urlButton}>Adicionar URL</AdminButton>
        </View>

        {mediaError ? <AdminNotice>{mediaError}</AdminNotice> : null}
        {galleryItems.length === 0 ? (
          <View style={styles.empty}><Ionicons name="image-outline" size={21} color="#64748b" /><Text style={styles.emptyText}>Nenhuma imagem extra. A galeria é opcional.</Text></View>
        ) : (
          <View style={styles.galleryList}>
            {galleryItems.map((item, index) => (
              <View key={item.key} style={styles.galleryItem}>
                <Image source={{ uri: resolvePreviewUrl(item.previewUrl) }} style={styles.galleryImage} resizeMode="cover" />
                <View style={styles.galleryCopy}>
                  <Text style={styles.galleryTitle} numberOfLines={1}>{item.kind === "file" ? item.file?.name : item.kind === "url" ? "Imagem por URL" : "Imagem atual"}</Text>
                  <Text style={styles.galleryMeta}>Posição {index + 1} de {galleryItems.length}</Text>
                </View>
                <View style={styles.galleryButtons}>
                  <IconButton label="Mover imagem para cima" icon="chevron-up" disabled={index === 0} onPress={() => onMoveGallery(item.key, -1)} />
                  <IconButton label="Mover imagem para baixo" icon="chevron-down" disabled={index === galleryItems.length - 1} onPress={() => onMoveGallery(item.key, 1)} />
                  <IconButton label="Remover imagem" icon="trash-outline" danger onPress={() => onRemoveGallery(item.key)} />
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </>
  );
}

function IconButton({ label, icon, disabled = false, danger = false, onPress }: { label: string; icon: "chevron-up" | "chevron-down" | "trash-outline"; disabled?: boolean; danger?: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.iconButton, danger && styles.iconButtonDanger, disabled && styles.disabled, pressed && styles.pressed]}><Ionicons name={icon} size={17} color={danger ? "#fda4af" : "#cbd5e1"} /></Pressable>;
}

async function pickImage(): Promise<UploadFile | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) throw new Error("Permissão de imagens negada");
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: false, quality: 0.85 });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if (!asset) return null;
  const type = asset.mimeType ?? "image/jpeg";
  const name = asset.fileName ?? getImageFileName("imagem", type);
  return { uri: asset.uri, name, type, file: asset.file };
}

const styles = StyleSheet.create({
  section: { gap: 16, padding: 18 },
  sectionHeader: { paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: "#1e293b" },
  sectionDescription: { marginTop: 4, color: "#94a3b8", fontSize: 12, lineHeight: 18 },
  coverLayout: { gap: 16 },
  preview: { width: 160, height: 240, alignSelf: "center", overflow: "hidden", borderWidth: 1, borderColor: "#1e293b", borderRadius: 16, backgroundColor: "#020617" },
  previewImage: { width: "100%", height: "100%" },
  coverControls: { minWidth: 240, flex: 1, gap: 12 },
  buttonContent: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  buttonText: { color: "#e2e8f0", fontSize: 13, lineHeight: 18, fontWeight: "700" },
  fileRow: { minHeight: 44, paddingLeft: 12, flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: "#334155", borderRadius: 12, backgroundColor: "#020617" },
  fileName: { flex: 1, color: "#cbd5e1", fontSize: 12 },
  removeFile: { width: 44, height: 42, alignItems: "center", justifyContent: "center" },
  urlRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "flex-end", gap: 10 },
  urlField: { minWidth: 220, flex: 1 },
  urlButton: { minWidth: 128 },
  empty: { minHeight: 74, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, borderWidth: 1, borderColor: "#1e293b", borderRadius: 14, backgroundColor: "#020617", padding: 14 },
  emptyText: { color: "#94a3b8", fontSize: 12, lineHeight: 18 },
  galleryList: { gap: 10 },
  galleryItem: { minHeight: 84, flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: "#1e293b", borderRadius: 14, backgroundColor: "#020617", padding: 10 },
  galleryImage: { width: 78, height: 58, borderRadius: 10, backgroundColor: "#020617" },
  galleryCopy: { flex: 1, minWidth: 0 },
  galleryTitle: { color: "#f1f5f9", fontSize: 12, lineHeight: 17, fontWeight: "600" },
  galleryMeta: { marginTop: 3, color: "#64748b", fontSize: 11 },
  galleryButtons: { flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-end", gap: 4, maxWidth: 92 },
  iconButton: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#334155", borderRadius: 10 },
  iconButtonDanger: { borderColor: "rgba(244,63,94,0.42)", backgroundColor: "rgba(244,63,94,0.08)" },
  disabled: { opacity: 0.35 },
  pressed: { opacity: 0.7 },
});
