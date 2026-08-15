import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type DetailsGalleryProps = {
  gameTitle: string;
  galleryImages: string[];
  selectedImage: string;
  onSelectImage: (imageUrl: string) => void;
  onStepImage: (direction: -1 | 1) => void;
};

export default function DetailsGallery({ gameTitle, galleryImages, selectedImage, onSelectImage, onStepImage }: DetailsGalleryProps) {
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const activeImageFailed = failedImages.includes(selectedImage);
  const selectedIndex = Math.max(0, galleryImages.findIndex((image) => image === selectedImage));
  const markFailed = (image: string) => setFailedImages((current) => current.includes(image) ? current : [...current, image]);

  return (
    <View accessibilityLabel={`Galeria de ${gameTitle}`} style={styles.gallery}>
      <View style={styles.mainImageWrap}>
        {selectedImage && !activeImageFailed ? <Image source={{ uri: selectedImage }} onError={() => markFailed(selectedImage)} style={styles.mainImage} resizeMode="cover" accessibilityLabel={`${gameTitle}, imagem ${selectedIndex + 1}`} /> : <View style={styles.imageFallback}><Ionicons name="image-outline" size={44} color="#475569" /><Text style={styles.fallbackText}>A imagem deste jogo não está disponível.</Text></View>}
        {galleryImages.length > 1 ? <View style={styles.controls}><Pressable accessibilityLabel="Imagem anterior" onPress={() => onStepImage(-1)} style={styles.controlButton}><Ionicons name="chevron-back" size={22} color="#ffffff" /></Pressable><Text style={styles.counter}>{selectedIndex + 1} / {galleryImages.length}</Text><Pressable accessibilityLabel="Próxima imagem" onPress={() => onStepImage(1)} style={styles.controlButton}><Ionicons name="chevron-forward" size={22} color="#ffffff" /></Pressable></View> : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnails}>
        {galleryImages.length > 0 ? galleryImages.map((image, index) => {
          const selected = image === selectedImage;
          const failed = failedImages.includes(image);
          return <Pressable key={`${image}-${index}`} accessibilityLabel={`Abrir imagem ${index + 1} de ${galleryImages.length}`} accessibilityState={{ selected }} onPress={() => onSelectImage(image)} style={[styles.thumbnail, selected && styles.thumbnailSelected]}>{failed ? <Ionicons name="image-outline" size={20} color="#64748b" /> : <Image source={{ uri: image }} onError={() => markFailed(image)} style={styles.thumbnailImage} resizeMode="cover" />}</Pressable>;
        }) : <Text style={styles.fallbackText}>Sem imagens.</Text>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  gallery: { overflow: "hidden", borderWidth: 1, borderColor: "#1e293b", borderRadius: 20, backgroundColor: "#020617" },
  mainImageWrap: { width: "100%", aspectRatio: 16 / 9, position: "relative", backgroundColor: "#050b18" },
  mainImage: { width: "100%", height: "100%" },
  imageFallback: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: 24 },
  fallbackText: { color: "#64748b", fontSize: 13, lineHeight: 19, textAlign: "center" },
  controls: { position: "absolute", left: 12, right: 12, bottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  controlButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", borderRadius: 12, backgroundColor: "rgba(0,0,0,0.65)" },
  counter: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: "rgba(0,0,0,0.65)", color: "#e2e8f0", fontSize: 12, fontWeight: "800" },
  thumbnails: { gap: 8, padding: 12 },
  thumbnail: { width: 82, height: 58, alignItems: "center", justifyContent: "center", overflow: "hidden", borderWidth: 2, borderColor: "#334155", borderRadius: 10, backgroundColor: "#0f172a" },
  thumbnailSelected: { borderColor: "#67e8f9" },
  thumbnailImage: { width: "100%", height: "100%" },
});
