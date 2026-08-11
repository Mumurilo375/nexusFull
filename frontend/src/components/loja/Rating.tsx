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
  const [reviewStatus, setReviewStatus] = useState("");
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
      setReviewError("");
      setReviewStatus("");
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
      setReviewStatus(voted ? "Voto removido." : "Avaliação marcada como útil.");
    } catch (voteError) {
      setReviewStatus("");
      setReviewError(
        getRequestErrorMessage(
          voteError,
          "Não foi possível registrar o voto agora. Tente novamente.",
        ),
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
      setReviewStatus("");
      setReviewError("Escreva um comentário para enviar sua avaliação.");
      return;
    }

    if (trimmedComment.length > REVIEW_COMMENT_MAX_LENGTH) {
      setReviewStatus("");
      setReviewError(
        `A avaliação deve ter no máximo ${REVIEW_COMMENT_MAX_LENGTH} caracteres.`,
      );
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewError("");
      setReviewStatus("");

      await api.post("/reviews", {
        gameId: parsedGameId,
        rating: reviewRating,
        comment: trimmedComment,
      });

      setReviewComment("");
      setReviewRating(5);
      setReviews(await loadReviews(parsedGameId));
      setReviewStatus("Avaliação publicada com sucesso.");
    } catch (submitError) {
      setReviewStatus("");
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

      <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8" aria-labelledby="reviews-title">
        {reviewError && (
          <p className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200" role="alert">
            {reviewError}
          </p>
        )}
        {reviewStatus && (
          <p className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200" role="status" aria-live="polite">
            {reviewStatus}
          </p>
        )}

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <article className="nexus-panel p-5 sm:p-6">
            <header className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 id="reviews-title" className="text-2xl font-black text-white">Avaliações</h2>
                <p className="mt-1 text-sm text-slate-400">
                  {reviews.length} {reviews.length === 1 ? "avaliação" : "avaliações"}
                </p>
              </div>
              <div className="flex items-center gap-1">{renderStars(reviewAverage)}</div>
            </header>

            {loadingReviews && <p className="text-slate-300">Carregando avaliações...</p>}
            {!loadingReviews && reviews.length === 0 && (
              <p className="border-t border-slate-800 pt-5 text-slate-300">
                Ainda não existem avaliações para este jogo.
              </p>
            )}

            <div>
              {reviews.map((review) => {
                const voted = hasUserReviewVote(review, authUserId);
                const votesCount = (review.votes ?? []).length;

                return (
                  <div key={`review-${review.id}`} className="border-t border-slate-800 py-5 first:border-t-0 first:pt-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-100">
                          {review.user?.username || "Usuário"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {renderStars(Number(review.rating ?? 0))}
                      </div>
                    </div>

                    <p className="mt-3 whitespace-pre-wrap wrap-break-word text-sm leading-6 text-slate-200">
                      {review.comment || "Sem comentário."}
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        void handleToggleVote(review.id, voted);
                      }}
                      disabled={busyVoteReviewId === review.id}
                      aria-pressed={voted}
                      aria-busy={busyVoteReviewId === review.id}
                      className={`mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                        voted
                          ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-200"
                          : "border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500 hover:text-white"
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

          <aside className="nexus-panel p-5 sm:p-6 lg:h-fit">
            <h2 className="text-xl font-black text-white">Escrever avaliação</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Compartilhe sua experiência para ajudar outros jogadores.
            </p>

            <label className="mt-5 block text-sm font-semibold text-slate-300" htmlFor="rating-select">
              Nota
            </label>
            <select
              id="rating-select"
              value={reviewRating}
              onChange={(event) => {
                setReviewRating(Number(event.target.value));
                setReviewError("");
              }}
              className="mt-2 min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none transition hover:border-slate-500 focus:border-blue-400"
            >
              <option value={5}>5 - Excelente</option>
              <option value={4}>4 - Muito bom</option>
              <option value={3}>3 - Bom</option>
              <option value={2}>2 - Regular</option>
              <option value={1}>1 - Fraco</option>
            </select>

            <label className="mt-4 block text-sm font-semibold text-slate-300" htmlFor="review-comment">
              Comentário
            </label>
            <textarea
              id="review-comment"
              value={reviewComment}
              onChange={(event) => {
                setReviewComment(event.target.value);
                setReviewError("");
              }}
              rows={5}
              maxLength={REVIEW_COMMENT_MAX_LENGTH}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none transition placeholder:text-slate-500 hover:border-slate-500 focus:border-blue-400"
              placeholder="Escreva sua opinião sobre jogabilidade, desempenho e história."
            />

            <p className="mt-2 text-right text-xs text-slate-500">
              {reviewComment.length}/{REVIEW_COMMENT_MAX_LENGTH}
            </p>

            <button
              type="button"
              onClick={() => {
                void submitReview();
              }}
              disabled={submittingReview}
              className="mt-4 min-h-12 w-full rounded-xl bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submittingReview ? "Enviando..." : "Publicar avaliação"}
            </button>
          </aside>
        </div>
      </section>
    </>
  );
}
