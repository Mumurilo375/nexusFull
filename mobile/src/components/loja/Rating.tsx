import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "../../contexts/useAuth";
import api from "../../services/api";
import type { ReviewItem, ReviewsResponse } from "./store.types";
import { formatDate, getAverageRating, getRequestErrorMessage, hasUserReviewVote, REVIEW_COMMENT_MAX_LENGTH } from "./store.utils";

const ratingOptions = [5, 4, 3, 2, 1];

export default function Rating() {
  const { gameId } = useLocalSearchParams<{ gameId?: string | string[] }>();
  const { isAuthenticated, user } = useAuth();
  const authUserId = Number(user?.id ?? 0);
  const parsedGameId = Number(Array.isArray(gameId) ? gameId[0] : gameId);
  const validId = Number.isInteger(parsedGameId) && parsedGameId > 0;
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [busyVote, setBusyVote] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const loadReviews = useCallback(async () => {
    if (!validId) return [];
    const data = await api.get<ReviewsResponse>(`/reviews?gameId=${parsedGameId}&page=1&limit=20`);
    return data.items ?? [];
  }, [parsedGameId, validId]);

  useEffect(() => {
    let active = true;
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(validId ? "" : "Jogo inválido.");
        const items = await loadReviews();
        if (active) setReviews(items);
      } catch (loadError) {
        if (active) {
          setReviews([]);
          setError(getRequestErrorMessage(loadError, "Não foi possível carregar as avaliações."));
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    void fetchReviews();
    return () => { active = false; };
  }, [loadReviews, validId]);

  const askLogin = () => Alert.alert("Entre para continuar", "Essa ação exige login. Deseja entrar agora?", [{ text: "Agora não", style: "cancel" }, { text: "Entrar", onPress: () => router.push({ pathname: "/login", params: { from: `/loja/${parsedGameId}` } } as never) }]);

  const toggleVote = async (reviewId: number, voted: boolean) => {
    if (!isAuthenticated) { askLogin(); return; }
    try {
      setBusyVote(reviewId);
      setError("");
      if (voted) await api.delete(`/review-votes/${reviewId}`);
      else await api.post(`/review-votes/${reviewId}`, {});
      setReviews((current) => current.map((review) => review.id !== reviewId ? review : ({ ...review, votes: voted ? (review.votes ?? []).filter((vote) => Number(vote.userId ?? vote.user?.id ?? 0) !== authUserId) : [...(review.votes ?? []), { id: Date.now(), userId: authUserId }] })));
      setStatus(voted ? "Voto removido." : "Avaliação marcada como útil.");
    } catch (voteError) {
      setError(getRequestErrorMessage(voteError, "Não foi possível registrar o voto agora."));
    } finally {
      setBusyVote(null);
    }
  };

  const submitReview = async () => {
    if (!isAuthenticated) { askLogin(); return; }
    const trimmed = comment.trim();
    if (!trimmed) { setError("Escreva um comentário para enviar sua avaliação."); return; }
    if (trimmed.length > REVIEW_COMMENT_MAX_LENGTH) { setError(`A avaliação deve ter no máximo ${REVIEW_COMMENT_MAX_LENGTH} caracteres.`); return; }
    try {
      setSubmitting(true);
      setError("");
      await api.post("/reviews", { gameId: parsedGameId, rating, comment: trimmed });
      setComment("");
      setRating(5);
      setReviews(await loadReviews());
      setStatus("Avaliação publicada com sucesso.");
    } catch (submitError) {
      setStatus("");
      setError(getRequestErrorMessage(submitError, "Não foi possível enviar sua avaliação."));
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (value: number) => <View style={styles.stars}>{Array.from({ length: 5 }, (_, index) => <Ionicons key={index} name={index < Math.round(Math.max(0, Math.min(5, value))) ? "star" : "star-outline"} size={16} color={index < Math.round(value) ? "#facc15" : "#64748b"} />)}</View>;

  return (
    <View style={styles.section}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {status ? <Text style={styles.status}>{status}</Text> : null}
      <View style={styles.reviewPanel}>
        <View style={styles.reviewHeader}><View><Text style={styles.heading}>Avaliações</Text><Text style={styles.subheading}>{reviews.length} {reviews.length === 1 ? "avaliação" : "avaliações"}</Text></View>{renderStars(getAverageRating(reviews))}</View>
        {loading ? <View style={styles.loading}><ActivityIndicator color="#67e8f9" /><Text style={styles.subheading}>Carregando avaliações...</Text></View> : null}
        {!loading && reviews.length === 0 ? <Text style={styles.empty}>Ainda não existem avaliações para este jogo.</Text> : null}
        {reviews.map((review) => { const voted = hasUserReviewVote(review, authUserId); return <View key={review.id} style={styles.review}><View style={styles.reviewTop}><View><Text style={styles.userName}>{review.user?.username ?? "Usuário"}</Text><Text style={styles.date}>{formatDate(review.createdAt)}</Text></View>{renderStars(Number(review.rating ?? 0))}</View><Text style={styles.comment}>{review.comment || "Sem comentário."}</Text><Pressable disabled={busyVote === review.id} onPress={() => void toggleVote(review.id, voted)} style={[styles.voteButton, voted && styles.voteButtonActive, busyVote === review.id && styles.disabled]}><Ionicons name="thumbs-up-outline" size={15} color={voted ? "#86efac" : "#cbd5e1"} /><Text style={styles.voteText}>{voted ? "Voto registrado" : "Marcar como útil"} ({review.votes?.length ?? 0})</Text></Pressable></View>; })}
      </View>
      <View style={styles.writePanel}>
        <Text style={styles.heading}>Escrever avaliação</Text>
        <Text style={styles.subheading}>Compartilhe sua experiência para ajudar outros jogadores.</Text>
        <Text style={styles.label}>Nota</Text>
        <View style={styles.ratingOptions}>{ratingOptions.map((value) => <Pressable key={value} onPress={() => { setRating(value); setError(""); }} style={[styles.ratingOption, rating === value && styles.ratingOptionSelected]}><Ionicons name="star" size={15} color={rating === value ? "#facc15" : "#64748b"} /><Text style={styles.ratingOptionText}>{value}</Text></Pressable>)}</View>
        <Text style={styles.label}>Comentário</Text>
        <TextInput value={comment} onChangeText={(value) => { setComment(value); setError(""); }} multiline maxLength={REVIEW_COMMENT_MAX_LENGTH} placeholder="Escreva sua opinião sobre jogabilidade, desempenho e história." placeholderTextColor="#64748b" style={styles.textarea} />
        <Text style={styles.counter}>{comment.length}/{REVIEW_COMMENT_MAX_LENGTH}</Text>
        <Pressable disabled={submitting} onPress={() => void submitReview()} style={[styles.submitButton, submitting && styles.disabled]}><Text style={styles.submitText}>{submitting ? "Enviando..." : "Publicar avaliação"}</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 20, paddingBottom: 30 },
  error: { marginBottom: 10, padding: 12, borderWidth: 1, borderColor: "rgba(244,63,94,0.35)", borderRadius: 12, backgroundColor: "rgba(244,63,94,0.1)", color: "#fecdd3", fontSize: 13, lineHeight: 19 },
  status: { marginBottom: 10, padding: 12, borderWidth: 1, borderColor: "rgba(16,185,129,0.35)", borderRadius: 12, backgroundColor: "rgba(16,185,129,0.1)", color: "#a7f3d0", fontSize: 13 },
  reviewPanel: { padding: 18, borderWidth: 1, borderColor: "#1e293b", borderRadius: 20, backgroundColor: "#020617" },
  writePanel: { marginTop: 14, padding: 18, borderWidth: 1, borderColor: "#1e293b", borderRadius: 20, backgroundColor: "#0f172a" },
  reviewHeader: { marginBottom: 14, flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 },
  heading: { color: "#ffffff", fontSize: 21, fontWeight: "900" },
  subheading: { marginTop: 4, color: "#94a3b8", fontSize: 13, lineHeight: 19 },
  stars: { flexDirection: "row", gap: 3 },
  loading: { paddingVertical: 16, flexDirection: "row", alignItems: "center", gap: 10 },
  empty: { paddingTop: 15, borderTopWidth: 1, borderTopColor: "#1e293b", color: "#cbd5e1", fontSize: 14, lineHeight: 20 },
  review: { paddingVertical: 16, borderTopWidth: 1, borderTopColor: "#1e293b" },
  reviewTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 },
  userName: { color: "#f1f5f9", fontSize: 14, fontWeight: "800" },
  date: { marginTop: 3, color: "#64748b", fontSize: 11 },
  comment: { marginTop: 10, color: "#e2e8f0", fontSize: 14, lineHeight: 21 },
  voteButton: { minHeight: 42, alignSelf: "flex-start", marginTop: 10, paddingHorizontal: 11, borderWidth: 1, borderColor: "#334155", borderRadius: 11, backgroundColor: "#020617", flexDirection: "row", alignItems: "center", gap: 7 },
  voteButtonActive: { borderColor: "rgba(52,211,153,0.5)", backgroundColor: "rgba(16,185,129,0.15)" },
  voteText: { color: "#cbd5e1", fontSize: 12, fontWeight: "700" },
  label: { marginTop: 18, marginBottom: 8, color: "#cbd5e1", fontSize: 13, fontWeight: "800" },
  ratingOptions: { flexDirection: "row", gap: 8 },
  ratingOption: { minWidth: 42, minHeight: 40, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#334155", borderRadius: 10, backgroundColor: "#020617", flexDirection: "row", gap: 3 },
  ratingOptionSelected: { borderColor: "#facc15", backgroundColor: "rgba(250,204,21,0.12)" },
  ratingOptionText: { color: "#e2e8f0", fontSize: 13, fontWeight: "800" },
  textarea: { minHeight: 120, padding: 12, borderWidth: 1, borderColor: "#334155", borderRadius: 12, backgroundColor: "#020617", color: "#ffffff", fontSize: 14, lineHeight: 20, textAlignVertical: "top" },
  counter: { marginTop: 5, color: "#64748b", fontSize: 11, textAlign: "right" },
  submitButton: { minHeight: 50, marginTop: 14, alignItems: "center", justifyContent: "center", borderRadius: 13, backgroundColor: "#2563eb" },
  submitText: { color: "#ffffff", fontSize: 14, fontWeight: "900" },
  disabled: { opacity: 0.55 },
});
