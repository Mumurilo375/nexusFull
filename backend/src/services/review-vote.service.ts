import Review from "../models/Review";
import ReviewVote from "../models/ReviewVote";
import Users from "../models/Users";
import { requireFound } from "../utils/app-error";
import { buildPage, getPaginationOffset } from "../utils/pagination";
import { ListReviewVotesQuery } from "../validators/review-vote.validator";

const REVIEW_VOTE_INCLUDE = [
  { model: Review, as: "review" },
  { model: Users, as: "user", attributes: { exclude: ["passwordHash"] } },
];

export async function listReviewVotes(query: ListReviewVotesQuery) {
  const offset = getPaginationOffset(query.page, query.limit);

  const where = query.reviewId ? { reviewId: query.reviewId } : undefined;

  const result = await ReviewVote.findAndCountAll({
    where,
    limit: query.limit,
    offset,
    order: [["id", "DESC"]],
    include: REVIEW_VOTE_INCLUDE,
  });

  return buildPage(query, result);
}

export async function addReviewVote(userId: number, reviewId: number) {
  requireFound(await Review.findByPk(reviewId), "REVIEW_NOT_FOUND", "Review not found");

  const [vote] = await ReviewVote.findOrCreate({
    where: { userId, reviewId },
    defaults: { userId, reviewId },
  });

  return vote;
}

export async function removeReviewVote(userId: number, reviewId: number) {
  await ReviewVote.destroy({ where: { userId, reviewId } });
}
