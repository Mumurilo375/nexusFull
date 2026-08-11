import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import AuthRequiredModal from "../globals/AuthRequiredModal";
import api from "../../services/api";
import { getAuthUser, isAuthenticated } from "../../services/auth";
import type { ReviewItem, ReviewsResponse } from "./store.types";
import {
  REVIEW_COMMENT_MAX_LENGTH,
  formatDate,
  getAverageRating,
  getRequestErrorMessage,
  hasUserReviewVote,
} from "./store.utils";
import { Star, ThumbsUp } from "lucide-react";

export default function Rating() {
  const { gameId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const authUserId = Number(getAuthUser()?.id ?? 0);
  const isLoggedIn = isAuthenticated();
  const parsedGameId = Number(gameId);
  const gameIdIsValid = Number.isInteger(parsedGameId) && parsedGameId > 0;

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [busyVoteReviewId, setBusyVoteReviewId] = useState<number | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const reviewAverage = getAverageRating(reviews);

  const askLogin = () => setShowAuthModal(true);
  const closeAuthModal = () => setShowAuthModal(false);
  const goToLogin = () => {
    closeAuthModal();
    void navigate("/login", {
      state: { from: `${location.pathname}${location.search}` },
    });
  };

  const renderStars = (value: number) => {
    const safeValue = Math.round(Math.max(0, Math.min(5, value)));

    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={`review-star-${index}`}
        className={`h-4 w-4 ${index < safeValue ? "fill-yellow-400 text-yellow-400" : "text-zinc-500"}`}
      />
    ));
  };

  const loadReviews = async (targetGameId: number) => {
    const { data } = await api.get<ReviewsResponse>("/reviews", {
      params: { gameId: targetGameId, page: 1, limit: 20 },
    });

    return data.items ?? [];
  };

  useEffect(() => {
    if (!gameIdIsValid) {
      setReviews([]);
      setReviewError("Jogo inválido.");
      return;
    }

    let active = true;

    const fetchReviews = async () => {
      try {
        setLoadingReviews(true);
        setReviewError("");

        const items = await loadReviews(parsedGameId);
        if (active) {
          setReviews(items);
        }
      } catch (loadError) {
        if (active) {
          setReviews([]);
          setReviewError(
            getRequestErrorMessage(
              loadError,
              "Não foi possível carregar as avaliações.",
            ),
          );
        }
      } finally {
        if (active) {
          setLoadingReviews(false);
        }
      }
    };

    void fetchReviews();

    return () => {
      active = false;
    };
  }, [gameIdIsValid, parsedGameId]);

  const handleToggleVote = async (reviewId: number, voted: boolean) => {
    if (!isLoggedIn) {
      askLogin();
      return;
    }

    try {
      setBusyVoteReviewId(reviewId);

      if (voted) {
        await api.delete(`/review-votes/${reviewId}`);
      } else {
        await api.post(`/review-votes/${reviewId}`, {});
      }

      setReviews((current) =>
        current.map((review) => {
          if (review.id !== reviewId) {
            return review;
          }

          const votes = review.votes ?? [];
          return voted
            ? {
                ...review,
                votes: votes.filter(
                  (vote) => Number(vote.userId ?? vote.user?.id ?? 0) !== authUserId,
                ),
              }
            : {
                ...review,
                votes: [...votes, { id: Date.now(), userId: authUserId }],
              };
        }),
      );
    } finally {
      setBusyVoteReviewId(null);
    }
  };

  const submitReview = async () => {
    if (!isLoggedIn) {
      askLogin();
      return;
    }

    if (!parsedGameId) {
      return;
    }

    const trimmedComment = reviewComment.trim();
    if (!trimmedComment) {
      setReviewError("Escreva um comentário para enviar sua avaliação.");
      return;
    }

    if (trimmedComment.length > REVIEW_COMMENT_MAX_LENGTH) {
      setReviewError(
        `A avaliação deve ter no máximo ${REVIEW_COMMENT_MAX_LENGTH} caracteres.`,
      );
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewError("");

      await api.post("/reviews", {
        gameId: parsedGameId,
        rating: reviewRating,
        comment: trimmedComment,
      });

      setReviewComment("");
      setReviewRating(5);
      setReviews(await loadReviews(parsedGameId));
    } catch (submitError) {
      setReviewError(
        getRequestErrorMessage(
          submitError,
          "Não foi possível enviar sua avaliação.",
        ),
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <>
      <AuthRequiredModal
        open={showAuthModal}
        title="Entre para continuar"
        message="Essa ação exige login. Deseja entrar agora?"
        onClose={closeAuthModal}
        onConfirm={goToLogin}
      />

      <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <article className="nexus-card p-5 sm:p-6">
            <header className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Avaliações</h2>
                <p className="text-sm text-zinc-300">{reviews.length} avaliações</p>
              </div>
              <div className="flex items-center gap-1">{renderStars(reviewAverage)}</div>
            </header>

            {loadingReviews && <p className="text-zinc-300">Carregando avaliações...</p>}
            {!loadingReviews && reviewError && <p className="text-red-300">{reviewError}</p>}
            {!loadingReviews && !reviewError && reviews.length === 0 && (
              <p className="text-zinc-300">Ainda não existem avaliações para este jogo.</p>
            )}

            <div className="space-y-3">
              {reviews.map((review) => {
                const voted = hasUserReviewVote(review, authUserId);
                const votesCount = (review.votes ?? []).length;

                return (
                  <div key={`review-${review.id}`} className="nexus-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-zinc-100">
                          {review.user?.username || "Usuário"}
                        </p>
                        <p className="text-xs text-zinc-400">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {renderStars(Number(review.rating ?? 0))}
                      </div>
                    </div>

                    <p className="mt-3 whitespace-pre-wrap wrap-break-word text-sm leading-relaxed text-zinc-200">
                      {review.comment || "Sem comentário."}
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        void handleToggleVote(review.id, voted);
                      }}
                      disabled={busyVoteReviewId === review.id}
                      className={`mt-3 inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                        voted
                          ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-200"
                          : "border-white/10 bg-black/40 text-zinc-300 hover:border-blue-400/50"
                      } disabled:opacity-60`}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      {voted ? "Voto registrado" : "Marcar como útil"} ({votesCount})
                    </button>
                  </div>
                );
              })}
            </div>
          </article>

          <aside className="nexus-card p-5 sm:p-6">
            <h2 className="text-xl font-bold text-white">Escrever avaliação</h2>
            <p className="mt-1 text-sm text-zinc-300">
              Compartilhe sua experiência para ajudar outros jogadores.
            </p>

            <label className="mt-4 block text-sm text-zinc-300" htmlFor="rating-select">
              Nota
            </label>
            <select
              id="rating-select"
              value={reviewRating}
              onChange={(event) => setReviewRating(Number(event.target.value))}
              className="mt-1 w-full rounded-xl border border-white/12 bg-black/40 px-3 py-2 outline-none focus:border-blue-400"
            >
              <option value={5}>5 - Excelente</option>
              <option value={4}>4 - Muito bom</option>
              <option value={3}>3 - Bom</option>
              <option value={2}>2 - Regular</option>
              <option value={1}>1 - Fraco</option>
            </select>

            <label className="mt-4 block text-sm text-zinc-300" htmlFor="review-comment">
              Comentário
            </label>
            <textarea
              id="review-comment"
              value={reviewComment}
              onChange={(event) => setReviewComment(event.target.value)}
              rows={5}
              maxLength={REVIEW_COMMENT_MAX_LENGTH}
              className="mt-1 w-full rounded-xl border border-white/12 bg-black/40 px-3 py-2 outline-none focus:border-blue-400"
              placeholder="Escreva sua opinião sobre jogabilidade, desempenho e história."
            />

            <p className="mt-2 text-right text-xs text-zinc-400">
              {reviewComment.length}/{REVIEW_COMMENT_MAX_LENGTH}
            </p>

            {reviewError && <p className="mt-3 text-sm text-red-300">{reviewError}</p>}

            <button
              type="button"
              onClick={() => {
                void submitReview();
              }}
              disabled={submittingReview}
              className="mt-4 w-full rounded-xl bg-emerald-700 px-4 py-2.5 font-bold text-white transition hover:bg-emerald-600 disabled:opacity-60"
            >
              {submittingReview ? "Enviando..." : "Publicar avaliação"}
            </button>
          </aside>
        </div>
      </section>
    </>
  );
}
