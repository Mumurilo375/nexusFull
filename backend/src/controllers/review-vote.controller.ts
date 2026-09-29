import { Request, Response } from "express";
import {
  addReviewVote,
  listReviewVotes,
  removeReviewVote,
} from "../services/review-vote.service";
import { requireAuthenticatedUserId } from "../utils/auth-user";
import {
  validateListReviewVotesQuery,
  validateReviewIdParam,
} from "../validators/review-vote.validator";

class ReviewVoteController {
  static async list(req: Request, res: Response): Promise<void> {
    const query = validateListReviewVotesQuery(req.query);
    const votes = await listReviewVotes(query);
    res.status(200).json(votes);
  }

  static async add(req: Request, res: Response): Promise<void> {
    const reviewId = validateReviewIdParam(req.params.reviewId as string);
    const vote = await addReviewVote(requireAuthenticatedUserId(req), reviewId);
    res.status(201).json(vote);
  }

  static async remove(req: Request, res: Response): Promise<void> {
    const reviewId = validateReviewIdParam(req.params.reviewId as string);
    await removeReviewVote(requireAuthenticatedUserId(req), reviewId);
    res.status(204).send();
  }
}

export default ReviewVoteController;
